"""Pure irrigation schedule validation and weekly evaluation (no HA imports)."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from copy import deepcopy
from collections.abc import Callable
import math
import re
from typing import Any

_TIME = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d$")
_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_SLOT_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")
_OBJECT_ID = re.compile(r"^[A-Za-z0-9_]+\.[A-Za-z0-9_]+$")
# Entities the scheduler itself may gate on: the auto switch lives in an
# input_boolean helper, exactly like the "Auto" sub-button of the card.
AUTO_ENTITY_DOMAINS = ("input_boolean",)
# One slot runs for at most a full day, so a program never spans more than
# the two calendar days a single slot can cover.
MAX_SLOTS = 50
MAX_DURATION_MINUTES = 1440
MAX_FREQUENCY_DAYS = 31
# Every slot key is exact, like every other slot rule below: the card and the
# service must agree on one shape.
SLOT_KEYS = frozenset({"id", "days", "start", "duration"})
SLOT_KEYS_WITH_LITERS = frozenset({"id", "days", "start", "duration", "liters"})


class ScheduleError(ValueError):
    """Invalid or conflicting irrigation program."""

    def __init__(self, message: str, code: str = "invalid_program", **context: Any) -> None:
        """Carry a machine-readable ``code`` with substitution ``context``.

        The message stays a human-readable English fallback (for service
        callers and logs); the card translates ``code`` with ``context``.
        """
        super().__init__(message)
        self.code = code
        self.context = dict(context)


def error_entry(code: str, message: str, **context: Any) -> dict[str, Any]:
    """Build the canonical stored error shape {code, context, message}."""
    return {"code": code, "context": dict(context), "message": message}


def structured_error(error: Any) -> dict[str, Any]:
    """Normalize any exception into :func:`error_entry` storage form."""
    code = getattr(error, "code", None) or "unexpected_failure"
    context = getattr(error, "context", None)
    return error_entry(code, str(error), **dict(context or {}))


def availability_action(enabled: bool, has_active_slot: bool, old_state: Any, new_state: Any) -> str | None:
    """Return pending/retry only for availability transitions during an active slot."""
    if not enabled or not has_active_slot or new_state is None:
        return None
    unavailable = ("unavailable", "unknown")
    if new_state in unavailable:
        return "pending"
    if old_state in unavailable:
        return "retry"
    return None


def entity_config_changed(old_attributes: Any, new_attributes: Any, old_state: Any = None, new_state: Any = None) -> bool:
    """Whether a state event may unblock a validation-rejected program.

    A switch exposes no scheduling configuration, so the only useful retry
    triggers are the first event of an entity (the entity showed up) and a
    transition out of unavailable/unknown (the entity became usable). Other
    attribute churn must not re-run a rejected program on every event.
    """
    if old_attributes is None:
        return True
    if new_attributes is None:
        return False
    if old_state in ("unavailable", "unknown") and new_state not in ("unavailable", "unknown"):
        return True
    return False


def snapshot_entity_state(entity_id: str, mappings: tuple[dict[str, Any], ...], sets: tuple[set[str], ...] = ()) -> tuple[Any, ...]:
    """Capture entity-scoped mutable state for rollback after failed persistence."""
    return (
        tuple((mapping, entity_id in mapping, deepcopy(mapping.get(entity_id))) for mapping in mappings),
        tuple((members, entity_id in members) for members in sets),
        entity_id,
    )


def restore_entity_state(snapshot: tuple[Any, ...]) -> None:
    """Restore a snapshot made by :func:`snapshot_entity_state`."""
    mappings, sets, entity_id = snapshot
    for mapping, existed, value in mappings:
        if existed:
            mapping[entity_id] = value
        else:
            mapping.pop(entity_id, None)
    for members, existed in sets:
        if existed:
            members.add(entity_id)
        else:
            members.discard(entity_id)


def _minute(value: str) -> int:
    if not isinstance(value, str) or not _TIME.fullmatch(value):
        raise ScheduleError("Time must use HH:MM in 24-hour format", "invalid_time")
    hour, minute = map(int, value.split(":"))
    return hour * 60 + minute


def _duration(value: Any) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise ScheduleError("duration must be a whole number of minutes", "invalid_duration")
    if value < 1 or value > MAX_DURATION_MINUTES:
        raise ScheduleError(
            f"duration must be between 1 and {MAX_DURATION_MINUTES} minutes", "invalid_duration", max=MAX_DURATION_MINUTES
        )
    return value


def _liters(value: Any) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ScheduleError("liters must be a finite number", "invalid_liters")
    result = float(value)
    if not math.isfinite(result) or result <= 0:
        raise ScheduleError("liters must be a finite number greater than zero", "invalid_liters")
    return result


def _frequency(value: Any) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise ScheduleError(
            "frequency_days must be a whole number of days", "invalid_frequency", max=MAX_FREQUENCY_DAYS
        )
    if value < 1 or value > MAX_FREQUENCY_DAYS:
        raise ScheduleError(
            f"frequency_days must be between 1 and {MAX_FREQUENCY_DAYS}", "invalid_frequency", max=MAX_FREQUENCY_DAYS
        )
    return value


def _anchor(value: Any) -> date | None:
    if value is None:
        return None
    if not isinstance(value, str) or not _DATE.fullmatch(value):
        raise ScheduleError("start_date must use the YYYY-MM-DD format", "invalid_start_date")
    try:
        return date.fromisoformat(value)
    except ValueError as err:
        raise ScheduleError("start_date must use the YYYY-MM-DD format", "invalid_start_date") from err


def _auto_entity(value: Any) -> str | None:
    if value is None:
        return None
    if (
        not isinstance(value, str)
        or not _OBJECT_ID.fullmatch(value)
        or value.rsplit(".", 1)[0] not in AUTO_ENTITY_DOMAINS
    ):
        raise ScheduleError(
            "auto_entity must be an input_boolean entity", "invalid_auto_entity", domains=", ".join(AUTO_ENTITY_DOMAINS)
        )
    return value


def validate_program(
    slots: Any,
    enabled: Any = False,
    frequency_days: Any = 1,
    start_date: Any = None,
    auto_entity: Any = None,
) -> dict[str, Any]:
    """Validate one irrigation program and return its normalized form."""
    if not isinstance(enabled, bool):
        raise ScheduleError("enabled must be boolean", "invalid_enabled")
    if not isinstance(slots, list):
        raise ScheduleError("slots must be a list", "invalid_slots")
    if len(slots) > MAX_SLOTS:
        raise ScheduleError(f"A program may contain at most {MAX_SLOTS} slots", "too_many_slots", max=MAX_SLOTS)
    if enabled and not slots:
        raise ScheduleError("An enabled program must contain at least one slot", "empty_enabled_program")
    frequency = _frequency(frequency_days)
    anchor = _anchor(start_date)
    if frequency > 1 and anchor is None:
        raise ScheduleError(
            "A frequency above one day needs a start_date anchor", "frequency_needs_anchor"
        )
    auto = _auto_entity(auto_entity)
    result: list[dict[str, Any]] = []
    ids: set[str] = set()
    occupied: dict[int, list[tuple[int, int, str]]] = {day: [] for day in range(1, 8)}
    for slot in slots:
        if not isinstance(slot, dict):
            raise ScheduleError(
                "Each slot requires exactly id, days, start, duration, and optionally liters", "invalid_slot_schema"
            )
        keys = set(slot)
        has_liters = keys == set(SLOT_KEYS_WITH_LITERS)
        if not has_liters and keys != set(SLOT_KEYS):
            raise ScheduleError(
                "Each slot requires exactly id, days, start, duration, and optionally liters", "invalid_slot_schema"
            )
        slot_id = slot["id"]
        if not isinstance(slot_id, str) or not _SLOT_ID.fullmatch(slot_id):
            raise ScheduleError(
                "Slot id must be 1..64 ASCII letters, digits, dots, underscores, or hyphens; it must start alphanumeric",
                "invalid_slot_id",
            )
        if slot_id in ids:
            raise ScheduleError(f"Duplicate slot id: {slot_id}", "duplicate_slot_id", id=slot_id)
        ids.add(slot_id)
        days = slot["days"]
        if not isinstance(days, list) or not days or any(type(day) is not int or day not in range(1, 8) for day in days):
            raise ScheduleError("days must be a non-empty list of ISO weekdays 1..7", "invalid_days")
        if len(set(days)) != len(days):
            raise ScheduleError("days cannot contain duplicates", "duplicate_days")
        start = _minute(slot["start"])
        duration = _duration(slot["duration"])
        liters = _liters(slot["liters"]) if has_liters else None
        clean: dict[str, Any] = {"id": slot_id, "days": list(days), "start": slot["start"], "duration": duration}
        if liters is not None:
            clean["liters"] = liters
        result.append(clean)
        for day in sorted(set(days)):
            for target_day, lo, hi in _slot_intervals(day, start, duration):
                for old_lo, old_hi, old_id in occupied[target_day]:
                    if lo < old_hi and old_lo < hi:
                        raise ScheduleError(f"Slots {old_id} and {slot_id} overlap", "slots_overlap", a=old_id, b=slot_id)
                occupied[target_day].append((lo, hi, slot_id))
    return {
        "enabled": enabled,
        "slots": result,
        "frequency_days": frequency,
        "start_date": anchor.isoformat() if anchor else None,
        "auto_entity": auto,
    }


def _slot_intervals(day: int, start: int, duration: int) -> list[tuple[int, int, int]]:
    """Split one day's watering window into (day, lo, hi) intervals."""
    end = start + duration
    if end > MAX_DURATION_MINUTES:
        return [(day, start, MAX_DURATION_MINUTES), (day % 7 + 1, 0, end - MAX_DURATION_MINUTES)]
    return [(day, start, end)]


def active_slot(slots: list[dict[str, Any]], now: datetime) -> dict[str, Any] | None:
    """The slot whose watering window covers ``now``, or ``None``.

    A window that runs past midnight also covers the early minutes of the
    following day, so the previous day's weekday is consulted as well.
    """
    weekday = now.isoweekday()
    minute = now.hour * 60 + now.minute
    for slot in slots:
        start = _minute(slot["start"])
        if minute < start:
            # The window that covers this minute started yesterday.
            if ((weekday - 2) % 7 + 1) not in slot["days"]:
                continue
        elif weekday not in slot["days"]:
            continue
        if (minute - start) % 1440 < slot["duration"]:
            return slot
    return None


def frequency_allows(program: dict[str, Any], now: datetime) -> bool:
    """Whether the every-N-days rhythm lands on ``now``'s local date."""
    frequency = int(program.get("frequency_days") or 1)
    if frequency <= 1:
        return True
    anchor = program.get("start_date")
    if not isinstance(anchor, str):
        return False
    try:
        anchor_date = date.fromisoformat(anchor)
    except ValueError:
        return False
    distance = (now.date() - anchor_date).days
    # Days before the anchor never water: the rhythm starts on it.
    return distance >= 0 and distance % frequency == 0


def release_action(program: dict[str, Any] | None, switch_state: str | None, auto_on: bool) -> str | None:
    """Return the safety command needed before the scheduler releases a pump."""
    if not program or not program.get("enabled") or not auto_on:
        return None
    if switch_state is None or switch_state in ("unavailable", "unknown"):
        raise ScheduleError(
            "Cannot safely release scheduler control while the switch is unavailable",
            "cannot_release_control",
        )
    return "turn_off" if switch_state == "on" else None


def program_status(
    slots: list[dict[str, Any]],
    enabled: bool,
    now: datetime,
    frequency_days: int = 1,
    start_date: str | None = None,
) -> tuple[dict[str, Any] | None, datetime | None]:
    """Return the actionable slot and next pump-state change."""
    if not enabled:
        return None, None
    program = {"enabled": enabled, "slots": slots, "frequency_days": frequency_days, "start_date": start_date}
    slot = active_slot(slots, now) if frequency_allows(program, now) else None
    return slot, next_boundary(slots, now, frequency_days, start_date)


def apply_key(program: dict[str, Any], now: datetime) -> str:
    """Identity of the pump command the program wants right now.

    ``off`` is the scheduled stop, a slot id the running window, and
    ``blocked`` the day the frequency rhythm skips (or a paused program).
    """
    if not program.get("enabled"):
        return "blocked"
    if not frequency_allows(program, now):
        return "blocked"
    slot = active_slot(program["slots"], now)
    return slot["id"] if slot else "off"


def next_boundary(
    slots: list[dict[str, Any]],
    now: datetime,
    frequency_days: int = 1,
    start_date: str | None = None,
) -> datetime | None:
    """The next local time the schedule changes whether the pump should run."""
    frequency = int(frequency_days or 1)
    program = {
        "enabled": True,
        "slots": slots,
        "frequency_days": frequency,
        "start_date": start_date,
    }
    anchor = None
    if frequency > 1:
        try:
            anchor = date.fromisoformat(start_date) if isinstance(start_date, str) else None
        except ValueError:
            return None
        if anchor is None:
            return None
    midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
    first_delta = (anchor - now.date()).days if anchor and anchor > now.date() else -1
    horizon = math.lcm(7, frequency) + 8 if frequency > 1 else 8
    last_delta = first_delta + horizon
    candidates: dict[datetime, tuple[datetime, bool]] = {}

    def add_candidates(boundaries: list[datetime], *, shifted_start: bool = False) -> None:
        for boundary in boundaries:
            utc_boundary = _as_utc(boundary)
            existing = candidates.get(utc_boundary)
            candidates[utc_boundary] = (boundary, shifted_start or bool(existing and existing[1]))

    # Include each midnight because the every-N-days gate can switch the
    # scheduler between a runnable day and a forced-off day there.
    for delta in range(first_delta, last_delta + 1):
        day = midnight + timedelta(days=delta)
        weekday = day.isoweekday()
        add_candidates(_valid_local_boundaries(day))
        for slot in slots:
            if weekday in slot["days"]:
                start = _minute(slot["start"])
                start_boundary = day + timedelta(minutes=start)
                resolved_starts = _valid_local_boundaries(start_boundary)
                shifted_start = any(
                    boundary.replace(tzinfo=None) != start_boundary.replace(tzinfo=None)
                    for boundary in resolved_starts
                )
                add_candidates(resolved_starts, shifted_start=shifted_start)
                add_candidates(_valid_local_boundaries(day + timedelta(minutes=start + slot["duration"])))
    now_utc = _as_utc(now)
    future = sorted(
        (entry for utc_candidate, entry in candidates.items() if utc_candidate > now_utc),
        key=lambda entry: _as_utc(entry[0]),
    )
    for candidate, shifted_start in future:
        before_utc = _as_utc(candidate) - timedelta(minutes=1)
        before = before_utc.astimezone(candidate.tzinfo) if candidate.tzinfo else candidate - timedelta(minutes=1)
        was_running = frequency_allows(program, before) and active_slot(slots, before) is not None
        will_run = frequency_allows(program, candidate) and active_slot(slots, candidate) is not None
        if was_running != will_run:
            return candidate
        # A scheduled start inside a DST gap is moved to the first valid local
        # minute even if the original wall-time duration ends at that same
        # boundary. Keep that real start visible as the next schedule change.
        if shifted_start and frequency_allows(program, candidate):
            return candidate
    return None


def _valid_local_boundaries(candidate: datetime) -> list[datetime]:
    """Resolve gaps forward and return both physical occurrences in a fold."""
    if candidate.tzinfo is None:
        return [candidate]
    for offset in range(181):
        current = candidate + timedelta(minutes=offset)
        wall = current.replace(tzinfo=None)
        valid = []
        for fold in (0, 1):
            occurrence = wall.replace(tzinfo=candidate.tzinfo, fold=fold)
            round_trip = occurrence.astimezone(timezone.utc).astimezone(candidate.tzinfo)
            if round_trip.replace(tzinfo=None) == wall:
                valid.append(occurrence)
        if valid:
            return list({_as_utc(value): value for value in valid}.values())
    return [candidate]


def _as_utc(value: datetime) -> datetime:
    return value.astimezone(timezone.utc) if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)


# Storage schema migrations, keyed by the schema version a payload is being
# upgraded *from*. To introduce a new storage layout: bump STORAGE_VERSION in
# const.py, register a callable that rewrites a payload of the previous
# version into the next one, and keep the chain complete so every stored
# version can reach the current one. Payloads written by a newer version are
# rejected, never silently downgraded.
DATA_MIGRATIONS: dict[int, Callable[[dict[str, Any]], dict[str, Any]]] = {}


def migrate_storage_data(data: Any, from_version: Any, to_version: int) -> dict[str, Any] | None:
    """Return ``data`` upgraded from ``from_version`` to ``to_version``.

    Steps come from :data:`DATA_MIGRATIONS` and are applied in order; the
    returned payload is a copy with ``schema_version`` set to ``to_version``
    (the input mapping is never mutated). ``None`` marks a payload that
    cannot be migrated, so the caller must discard it and log.
    """
    if not isinstance(data, dict) or not isinstance(from_version, int) or from_version < 1 or from_version > to_version:
        return None
    result: Any = deepcopy(data)
    for version in range(from_version, to_version):
        migration = DATA_MIGRATIONS.get(version)
        if migration is None:
            return None
        result = migration(result)
        if not isinstance(result, dict):
            return None
    return {**result, "schema_version": to_version}
