"""Independent weekly irrigation scheduler for Home Assistant switch entities."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from typing import Any

import voluptuous as vol
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.event import async_track_time_change
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import DOMAIN, FRONTEND_URL, PLATFORMS, STORAGE_KEY, STORE_VERSION, STORAGE_VERSION, CONFIG_ENTRY_VERSION
from .schedule import (
    ScheduleError,
    apply_key,
    availability_action,
    entity_config_changed,
    error_entry,
    frequency_allows,
    migrate_storage_data,
    program_status,
    restore_entity_state,
    snapshot_entity_state,
    structured_error,
    validate_program,
)

_LOGGER = logging.getLogger(__name__)

# The integration is configured only through its config entry and services:
# hassfest expects one of the canonical empty schemas here. Home Assistant
# calls CONFIG_SCHEMA with the full configuration container, so the
# cv.empty_config_schema factory must be invoked with the domain; assigning
# the factory itself would make setup receive a function instead of the
# configuration mapping and abort before the static path is registered.
CONFIG_SCHEMA = cv.empty_config_schema(DOMAIN)

SERVICE_SAVE_PROGRAM = "save_program"
SERVICE_SET_ENABLED = "set_enabled"
SERVICE_DELETE_PROGRAM = "delete_program"
SERVICES = (SERVICE_SAVE_PROGRAM, SERVICE_SET_ENABLED, SERVICE_DELETE_PROGRAM)


class ScheduleValidationError(HomeAssistantError):
    """Invalid schedule request, distinct from failed persistent writes."""

    def __init__(self, message: str, *args: Any, code: str | None = None, context: dict[str, Any] | None = None) -> None:
        """Keep the readable English message and the machine-readable code."""
        super().__init__(message, *args)
        self.code = code or "invalid_program"
        self.context = dict(context or {})
        self.translation_domain = DOMAIN
        self.translation_key = self.code
        self.translation_placeholders = {key: str(value) for key, value in self.context.items()}


class Scheduler:
    """Own persisted irrigation programs and their runtime state."""

    def __init__(self, hass: HomeAssistant, store: Store) -> None:
        self.hass = hass
        self.store = store
        self.programs: dict[str, dict[str, Any]] = {}
        self.errors: dict[str, Any] = {}
        self.pending: set[str] = set()
        # The pump state the scheduler last asked for: "on", "off", or absent
        # when the scheduler is not in control of that pump.
        self.applied: dict[str, str] = {}
        self._evaluation_lock = asyncio.Lock()
        self._last_logged_error: dict[str, str] = {}
        self.refresh: Any = None
        self.unsub_state: Any = None
        self.sensor: Any = None

    async def async_load(self) -> None:
        stored = await self.store.async_load()
        if not isinstance(stored, dict):
            self.programs = {}
            return
        stored_version = stored.get("schema_version")
        if not isinstance(stored_version, int):
            _LOGGER.warning("Ignoring stored schedules written without a schema version")
            self.programs = {}
            return
        if stored_version != STORAGE_VERSION:
            migrated = migrate_storage_data(stored, stored_version, STORAGE_VERSION)
            if migrated is None:
                _LOGGER.warning(
                    "Discarding stored schedules: schema version %s cannot be migrated to %s",
                    stored_version,
                    STORAGE_VERSION,
                )
                self.programs = {}
                return
            stored = migrated
        raw_programs = stored.get("programs", {})
        if not isinstance(raw_programs, dict):
            return
        for entity_id, raw in raw_programs.items():
            try:
                if not isinstance(entity_id, str) or not entity_id.startswith("switch."):
                    continue
                program = validate_program(
                    raw["slots"],
                    raw.get("enabled", False),
                    raw.get("frequency_days", 1),
                    raw.get("start_date"),
                    raw.get("auto_entity"),
                )
                self.programs[entity_id] = program
                self.errors[entity_id] = raw.get("last_error")
            except (KeyError, ScheduleError, TypeError):
                _LOGGER.warning("Ignoring invalid stored schedule for %s", entity_id)

    async def async_save(self) -> None:
        await self.store.async_save({
            "schema_version": STORAGE_VERSION,
            "programs": {
                entity_id: {**program, "last_error": self.errors.get(entity_id)}
                for entity_id, program in self.programs.items()
            },
        })
        self._update_sensor()

    def _update_sensor(self) -> None:
        if self.sensor:
            self.sensor.async_write_ha_state()

    def _snapshot_entity(self, entity_id: str) -> tuple[Any, ...]:
        return snapshot_entity_state(
            entity_id,
            (self.programs, self.errors, self.applied, self._last_logged_error),
            (self.pending,),
        )

    def _rollback_entity(self, snapshot: tuple[Any, ...]) -> None:
        restore_entity_state(snapshot)
        self._update_sensor()

    def sensor_programs(self) -> dict[str, dict[str, Any]]:
        now = dt_util.now()
        result: dict[str, dict[str, Any]] = {}
        for entity_id, program in self.programs.items():
            slot, boundary = program_status(program["slots"], program["enabled"], now)
            result[entity_id] = {
                **program,
                "active_slot_id": slot["id"] if slot else None,
                "next_change": boundary.isoformat() if boundary else None,
                "frequency_ok": frequency_allows(program, now),
                "auto_on": self._auto_is_on(program),
                "last_error": self.errors.get(entity_id),
            }
        return result

    def _auto_is_on(self, program: dict[str, Any]) -> bool:
        """Whether the auto helper says the scheduler owns the pump.

        A program without an auto helper is always automatic; a helper in
        unavailable/unknown state counts as off, so a broken helper never
        makes the scheduler command the pump.
        """
        auto_entity = program.get("auto_entity")
        if not auto_entity:
            return True
        state = self.hass.states.get(auto_entity)
        return state is not None and state.state == "on"

    def _in_control(self, entity_id: str) -> bool:
        program = self.programs.get(entity_id)
        if not program or not program["enabled"]:
            return False
        if not self._auto_is_on(program):
            # Auto is off: the pump belongs to the user, hands off entirely.
            self.applied.pop(entity_id, None)
            return False
        return True

    async def async_set_program(
        self,
        entity_id: str,
        enabled: bool,
        slots: list[dict[str, Any]],
        frequency_days: Any = 1,
        start_date: Any = None,
        auto_entity: Any = None,
    ) -> None:
        try:
            program = validate_program(slots, enabled, frequency_days, start_date, auto_entity)
            if enabled:
                state = self.hass.states.get(entity_id)
                if state is None:
                    raise ScheduleError(
                        f"Unknown switch entity: {entity_id}", "unknown_water_entity", entity=entity_id
                    )
                if auto_entity:
                    auto_state = self.hass.states.get(auto_entity)
                    if auto_state is None:
                        raise ScheduleError(
                            f"Unknown auto entity: {auto_entity}", "unknown_auto_entity", entity=auto_entity
                        )
        except ScheduleError as err:
            raise ScheduleValidationError(str(err), code=err.code, context=err.context) from err
        async with self._evaluation_lock:
            snapshot = self._snapshot_entity(entity_id)
            try:
                previous = self.programs.get(entity_id)
                self.programs[entity_id] = program
                if previous != program:
                    # A replaced program starts from an unknown pump command,
                    # so the next evaluation re-asserts what it wants.
                    self.applied.pop(entity_id, None)
                self.errors[entity_id] = None
                self._last_logged_error.pop(entity_id, None)
                if not enabled:
                    self.pending.discard(entity_id)
                    self.applied.pop(entity_id, None)
                await self.async_save()
            except BaseException:
                self._rollback_entity(snapshot)
                raise
        if enabled:
            await self.async_evaluate(entity_id)

    async def async_enable(self, entity_id: str, enabled: bool) -> None:
        async with self._evaluation_lock:
            if entity_id not in self.programs:
                raise ScheduleValidationError("No schedule exists for this switch entity", code="no_program")
            snapshot = self._snapshot_entity(entity_id)
            try:
                self.programs[entity_id]["enabled"] = enabled
                self.errors[entity_id] = None
                self._last_logged_error.pop(entity_id, None)
                self.applied.pop(entity_id, None)
                if not enabled:
                    self.pending.discard(entity_id)
                await self.async_save()
            except BaseException:
                self._rollback_entity(snapshot)
                raise
        if enabled:
            await self.async_evaluate(entity_id)

    async def async_delete(self, entity_id: str) -> None:
        async with self._evaluation_lock:
            snapshot = self._snapshot_entity(entity_id)
            try:
                self.programs.pop(entity_id, None)
                self.errors.pop(entity_id, None)
                self.pending.discard(entity_id)
                self.applied.pop(entity_id, None)
                self._last_logged_error.pop(entity_id, None)
                await self.async_save()
            except BaseException:
                self._rollback_entity(snapshot)
                raise

    def _set_error(self, entity_id: str, code: str, message: str, *, log: bool = False) -> None:
        self.errors[entity_id] = error_entry(code, message)
        if log and self._last_logged_error.get(entity_id) != message:
            _LOGGER.warning("Could not apply schedule to %s: %s", entity_id, message)
            self._last_logged_error[entity_id] = message

    def _clear_error(self, entity_id: str) -> None:
        """Drop a resolved error together with its log deduplication marker."""
        self.errors[entity_id] = None
        self._last_logged_error.pop(entity_id, None)

    async def async_report_error(self, entity_id: str, error: HomeAssistantError) -> None:
        async with self._evaluation_lock:
            self.errors[entity_id] = structured_error(error)
            self._update_sensor()

    async def async_evaluate(self, only: str | None = None) -> None:
        async with self._evaluation_lock:
            now = dt_util.now()
            entities = [only] if only else list(self.programs)
            for entity_id in entities:
                program = self.programs.get(entity_id)
                if not program:
                    continue
                if not self._in_control(entity_id):
                    self.pending.discard(entity_id)
                    continue
                state = self.hass.states.get(entity_id)
                if state is None:
                    self.errors[entity_id] = None
                    continue
                key = apply_key(program, now)
                desired = "on" if key not in ("off", "blocked") else "off"
                if state.state in ("unavailable", "unknown"):
                    self.pending.add(entity_id)
                    self._set_error(entity_id, "entity_unavailable", "Switch entity is unavailable; the pump command is pending")
                    continue
                already_asked = self.applied.get(entity_id) == desired
                if state.state == desired or already_asked:
                    # Either the pump already matches, or the command was sent
                    # and a state event has not caught up yet; recording the
                    # desired state keeps the minute tick from repeating it.
                    self.applied[entity_id] = desired
                    self.pending.discard(entity_id)
                    self._clear_error(entity_id)
                    continue
                try:
                    await self.hass.services.async_call(
                        "switch", "turn_on" if desired == "on" else "turn_off",
                        {"entity_id": entity_id}, blocking=True,
                    )
                    self.applied[entity_id] = desired
                    self.pending.discard(entity_id)
                    self._clear_error(entity_id)
                except Exception as err:
                    # A service call may fail transiently. Keep it pending for
                    # the minute tick/availability event; suppress log spam.
                    self.pending.add(entity_id)
                    self._set_error(entity_id, "service_call_failed", str(err) or "Switch service call failed", log=True)
            self._update_sensor()

    async def async_state_changed(self, event: Any) -> None:
        entity_id = event.data.get("entity_id")
        old, new = event.data.get("old_state"), event.data.get("new_state")
        if not new:
            return
        if entity_id not in self.programs:
            # A helper that gates a program (the Auto toggle) can change the
            # outcome without any change to the switch itself.
            affected = [
                program_id
                for program_id, program in self.programs.items()
                if program.get("auto_entity") == entity_id
            ]
            for program_id in affected:
                await self.async_evaluate(program_id)
            return
        retry = False
        config_retry = False
        async with self._evaluation_lock:
            program = self.programs.get(entity_id)
            if not program:
                return
            now = dt_util.now()
            in_control = program["enabled"] and self._auto_is_on(program)
            key = apply_key(program, now) if in_control else "blocked"
            desired = "on" if key not in ("off", "blocked") else "off"
            old_state = old.state if old else None
            action = availability_action(program["enabled"], in_control, old_state, new.state)
            if action == "pending":
                self.pending.add(entity_id)
                self._set_error(entity_id, "entity_unavailable", "Switch entity is unavailable; the pump command is pending")
                self._update_sensor()
            elif action == "retry":
                self.pending.add(entity_id)
                retry = True
            elif in_control and new.state not in ("unavailable", "unknown") and new.state != desired:
                # The pump drifted from what the program wants (a manual
                # toggle, or a command the switch ignored): forget the last
                # command so the next evaluation re-asserts it.
                self.applied.pop(entity_id, None)
                retry = True
            config_changed = entity_config_changed(
                old.attributes if old is not None else None,
                new.attributes,
                old.state if old is not None else None,
                new.state,
            )
            validation_blocked = bool(self.errors.get(entity_id)) and entity_id not in self.pending
            if config_changed and validation_blocked:
                self.applied.pop(entity_id, None)
                self._last_logged_error.pop(entity_id, None)
                config_retry = True
        if retry or config_retry:
            await self.async_evaluate(entity_id)


def _strict_bool(value: Any) -> bool:
    if not isinstance(value, bool):
        raise vol.Invalid("enabled must be boolean")
    return value


@callback
def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Migrate a saved config entry version without changing its title or data."""
    if entry.version > CONFIG_ENTRY_VERSION:
        _LOGGER.error(
            "Config entry for Water Flow Scheduler was saved by a newer version; update the integration"
        )
        return False
    if entry.version != CONFIG_ENTRY_VERSION:
        hass.config_entries.async_update_entry(
            entry,
            version=CONFIG_ENTRY_VERSION,
        )
    return True


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    hass.data.setdefault(DOMAIN, {})
    www_path = Path(__file__).parent / "www"
    await hass.http.async_register_static_paths([
        StaticPathConfig("/water_flow_scheduler", str(www_path), cache_headers=False)
    ])
    # Load the card as soon as the integration is loaded, not at the end of the
    # config entry setup: the dashboard resource must not depend on the
    # scheduler, sensor and services wiring, and it must survive an entry
    # reload (a reload does not re-run async_setup, so removing the URL on
    # unload would hide the card until the next Home Assistant restart).
    add_extra_js_url(hass, FRONTEND_URL)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: Any) -> bool:
    store = Store(hass, STORE_VERSION, STORAGE_KEY)
    scheduler = Scheduler(hass, store)
    await scheduler.async_load()
    hass.data[DOMAIN][entry.entry_id] = scheduler
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    schema_entity = vol.All(cv.entity_id, vol.Match(r"^switch\."))
    program_schema = vol.Schema({
        vol.Required("water_entity"): schema_entity,
        vol.Required("enabled"): _strict_bool,
        vol.Required("slots"): list,
        vol.Optional("frequency_days", default=1): int,
        vol.Optional("start_date"): vol.Any(None, str),
        vol.Optional("auto_entity"): vol.Any(None, str),
    })
    enabled_schema = vol.Schema({vol.Required("water_entity"): schema_entity, vol.Required("enabled"): _strict_bool})
    delete_schema = vol.Schema({vol.Required("water_entity"): schema_entity})

    async def save(call: ServiceCall) -> None:
        try:
            await scheduler.async_set_program(
                call.data["water_entity"],
                call.data["enabled"],
                call.data["slots"],
                call.data.get("frequency_days", 1),
                call.data.get("start_date"),
                call.data.get("auto_entity"),
            )
        except ScheduleValidationError as err:
            entity = call.data.get("water_entity")
            if entity:
                await scheduler.async_report_error(entity, err)
            raise HomeAssistantError(str(err)) from err

    async def enable(call: ServiceCall) -> None:
        try:
            await scheduler.async_enable(call.data["water_entity"], call.data["enabled"])
        except ScheduleValidationError as err:
            await scheduler.async_report_error(call.data["water_entity"], err)
            raise

    async def delete(call: ServiceCall) -> None:
        await scheduler.async_delete(call.data["water_entity"])

    for name, handler, schema in (
        (SERVICE_SAVE_PROGRAM, save, program_schema),
        (SERVICE_SET_ENABLED, enable, enabled_schema),
        (SERVICE_DELETE_PROGRAM, delete, delete_schema),
    ):
        if not hass.services.has_service(DOMAIN, name):
            hass.services.async_register(DOMAIN, name, handler, schema=schema)
    scheduler.refresh = async_track_time_change(
        hass,
        lambda _: hass.async_create_task(scheduler.async_evaluate()),
        second=0,
    )
    scheduler.unsub_state = hass.bus.async_listen("state_changed", scheduler.async_state_changed)
    await scheduler.async_evaluate()
    return True


async def async_unload_entry(hass: HomeAssistant, entry: Any) -> bool:
    scheduler: Scheduler = hass.data[DOMAIN][entry.entry_id]
    if not await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        return False
    if scheduler.refresh:
        scheduler.refresh()
    if scheduler.unsub_state:
        scheduler.unsub_state()
    for name in SERVICES:
        hass.services.async_remove(DOMAIN, name)
    hass.data[DOMAIN].pop(entry.entry_id, None)
    return True
