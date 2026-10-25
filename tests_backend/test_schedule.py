"""Pure validation and evaluation tests for the irrigation schedule module."""

import importlib.util
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

_MODULE = Path(__file__).parents[1] / "custom_components/water_flow_scheduler/schedule.py"
_SPEC = importlib.util.spec_from_file_location("pure_schedule", _MODULE)
schedule = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(schedule)

ScheduleError = schedule.ScheduleError
active_slot = schedule.active_slot
apply_key = schedule.apply_key
DATA_MIGRATIONS = schedule.DATA_MIGRATIONS
MAX_DURATION_MINUTES = schedule.MAX_DURATION_MINUTES
MAX_FREQUENCY_DAYS = schedule.MAX_FREQUENCY_DAYS
MAX_SLOTS = schedule.MAX_SLOTS
SLOT_KEYS = schedule.SLOT_KEYS
SLOT_KEYS_WITH_LITERS = schedule.SLOT_KEYS_WITH_LITERS
availability_action_fn = schedule.availability_action
entity_config_changed = schedule.entity_config_changed
error_entry = schedule.error_entry
frequency_allows = schedule.frequency_allows
migrate_storage_data = schedule.migrate_storage_data
next_boundary = schedule.next_boundary
program_status = schedule.program_status
restore_entity_state = schedule.restore_entity_state
snapshot_entity_state = schedule.snapshot_entity_state
structured_error = schedule.structured_error
validate_program = schedule.validate_program


def window(slot_id="morning", days=None, start="05:30", duration=30, liters=None):
    # `days` stays explicit so a test can pass an empty or invalid list.
    slot = {"id": slot_id, "days": [1, 3, 5] if days is None else days, "start": start, "duration": duration}
    if liters is not None:
        slot["liters"] = liters
    return slot


def utc(*parts):
    return datetime(*parts, tzinfo=timezone.utc)


class ValidateProgramTests(unittest.TestCase):
    def test_valid_program_is_normalized_and_defaults_are_applied(self):
        program = validate_program([window(liters=120)], True, 2, "2026-05-01", "input_boolean.irrigazione_attiva")
        self.assertEqual(program, {
            "enabled": True,
            "slots": [{"id": "morning", "days": [1, 3, 5], "start": "05:30", "duration": 30, "liters": 120.0}],
            "frequency_days": 2,
            "start_date": "2026-05-01",
            "auto_entity": "input_boolean.irrigazione_attiva",
        })
        default = validate_program([], False)
        self.assertEqual(default, {
            "enabled": False, "slots": [], "frequency_days": 1, "start_date": None, "auto_entity": None,
        })

    def test_slot_key_shapes_are_exact(self):
        self.assertEqual(SLOT_KEYS, frozenset({"id", "days", "start", "duration"}))
        self.assertEqual(SLOT_KEYS_WITH_LITERS, SLOT_KEYS | {"liters"})
        with self.assertRaisesRegex(ScheduleError, "Each slot") as raised:
            validate_program([{**window(), "extra": 1}], True)
        self.assertEqual(raised.exception.code, "invalid_slot_schema")
        with self.assertRaisesRegex(ScheduleError, "Each slot"):
            validate_program([{key: value for key, value in window().items() if key != "duration"}], True)
        with self.assertRaisesRegex(ScheduleError, "Each slot"):
            validate_program(["not-a-slot"], True)

    def test_enabled_must_be_boolean_and_slots_a_list(self):
        with self.assertRaises(ScheduleError) as raised:
            validate_program([], "yes")
        self.assertEqual(raised.exception.code, "invalid_enabled")
        with self.assertRaises(ScheduleError) as raised:
            validate_program({"a": 1}, False)
        self.assertEqual(raised.exception.code, "invalid_slots")

    def test_enabled_program_needs_at_least_one_window(self):
        with self.assertRaises(ScheduleError) as raised:
            validate_program([], True)
        self.assertEqual(raised.exception.code, "empty_enabled_program")
        # A disabled program may be empty: it is just not ready to run.
        self.assertEqual(validate_program([], False)["slots"], [])

    def test_too_many_windows_are_rejected_with_the_limit_in_context(self):
        slots = [window(f"w{index}", days=[1], start="05:30", duration=1) for index in range(MAX_SLOTS + 1)]
        with self.assertRaises(ScheduleError) as raised:
            validate_program(slots, True)
        self.assertEqual(raised.exception.code, "too_many_slots")
        self.assertEqual(raised.exception.context, {"max": MAX_SLOTS})

    def test_slot_id_rules(self):
        with self.assertRaises(ScheduleError) as raised:
            validate_program([window(slot_id="bad id")], True)
        self.assertEqual(raised.exception.code, "invalid_slot_id")
        with self.assertRaises(ScheduleError):
            validate_program([window(slot_id="")], True)
        with self.assertRaises(ScheduleError):
            validate_program([window(slot_id="_leading")], True)
        with self.assertRaises(ScheduleError):
            validate_program([window(slot_id="x" * 65)], True)
        with self.assertRaises(ScheduleError) as raised:
            validate_program([window("a"), window("a", days=[2], start="12:00")], True)
        self.assertEqual(raised.exception.code, "duplicate_slot_id")
        self.assertEqual(raised.exception.context, {"id": "a"})
        self.assertEqual(validate_program([window("zone-1.b")], False)["slots"][0]["id"], "zone-1.b")

    def test_days_must_be_iso_weekdays_without_duplicates(self):
        with self.assertRaises(ScheduleError) as raised:
            validate_program([window(days=[])], True)
        self.assertEqual(raised.exception.code, "invalid_days")
        for days in ([0], [8], [1.5], ["1"], "1", True):
            with self.assertRaises(ScheduleError) as raised:
                validate_program([window(days=days)], True)
            self.assertEqual(raised.exception.code, "invalid_days")
        with self.assertRaises(ScheduleError) as raised:
            validate_program([{**window(), "days": None}], True)
        self.assertEqual(raised.exception.code, "invalid_days")
        with self.assertRaises(ScheduleError) as raised:
            validate_program([window(days=[1, 1])], True)
        self.assertEqual(raised.exception.code, "duplicate_days")

    def test_start_must_use_hh_mm_and_duration_whole_minutes(self):
        for start in ("5:30", "24:00", "12:60", 330, None, "noon"):
            with self.assertRaises(ScheduleError) as raised:
                validate_program([window(start=start)], True)
            self.assertEqual(raised.exception.code, "invalid_time")
        for duration in (0, MAX_DURATION_MINUTES + 1, 30.5, "30", True, None):
            with self.assertRaises(ScheduleError) as raised:
                validate_program([window(duration=duration)], True)
            self.assertEqual(raised.exception.code, "invalid_duration")
        with self.assertRaises(ScheduleError) as raised:
            validate_program([window(duration=0)], True)
        self.assertEqual(raised.exception.context, {"max": MAX_DURATION_MINUTES})
        # The full day is a legal window.
        self.assertEqual(validate_program([window(duration=1440)], False)["slots"][0]["duration"], 1440)

    def test_liters_is_optional_but_must_be_positive_and_finite(self):
        for liters in (0, -1, "120", True, float("nan"), float("inf")):
            with self.assertRaises(ScheduleError) as raised:
                validate_program([window(liters=liters)], True)
            self.assertEqual(raised.exception.code, "invalid_liters")
        program = validate_program([window(liters=120)], False)
        self.assertEqual(program["slots"][0]["liters"], 120.0)
        self.assertNotIn("liters", validate_program([window()], False)["slots"][0])

    def test_overlapping_windows_are_rejected(self):
        with self.assertRaises(ScheduleError) as raised:
            validate_program([window("a"), window("b", days=[1], start="05:45")], True)
        self.assertEqual(raised.exception.code, "slots_overlap")
        self.assertEqual(raised.exception.context, {"a": "a", "b": "b"})
        # Windows on different days never clash.
        self.assertEqual(
            [slot["id"] for slot in validate_program([window("a"), window("b", days=[2])], True)["slots"]],
            ["a", "b"],
        )

    def test_touching_windows_are_allowed_but_overlapping_midnight_wraps_are_not(self):
        # 05:30 + 30 ends exactly when the next window starts.
        touching = [window("a"), window("b", days=[1], start="06:00")]
        self.assertEqual([slot["id"] for slot in validate_program(touching, True)["slots"]], ["a", "b"])
        overnight = [window("night", days=[7], start="23:00", duration=180)]
        validate_program(overnight, True)
        clash = overnight + [window("early", days=[1], start="00:30", duration=30)]
        with self.assertRaises(ScheduleError) as raised:
            validate_program(clash, True)
        self.assertEqual(raised.exception.code, "slots_overlap")
        self.assertEqual(raised.exception.context, {"a": "night", "b": "early"})
        # A window that starts before the wrap does not clash with it.
        self.assertEqual(
            validate_program(overnight + [window("early", days=[1], start="03:00", duration=30)], True)["slots"][1]["id"],
            "early",
        )

    def test_frequency_and_anchor_validation(self):
        for frequency in (0, -1, 32, 1.5, "2", True):
            with self.assertRaises(ScheduleError) as raised:
                validate_program([window()], False, frequency)
            self.assertEqual(raised.exception.code, "invalid_frequency")
            self.assertEqual(raised.exception.context, {"max": MAX_FREQUENCY_DAYS})
        with self.assertRaises(ScheduleError) as raised:
            validate_program([window()], True, 2)
        self.assertEqual(raised.exception.code, "frequency_needs_anchor")
        for anchor in ("2026-5-1", "01-05-2026", "2026-02-30", "yesterday", 20260501):
            with self.assertRaises(ScheduleError) as raised:
                validate_program([window()], True, 2, anchor)
            self.assertEqual(raised.exception.code, "invalid_start_date")
        self.assertIsNone(validate_program([window()], False, 1, None)["start_date"])

    def test_auto_entity_must_be_an_input_boolean(self):
        for auto in ("light.living_room", "input_number.x", "", 42, "input_boolean."):
            with self.assertRaises(ScheduleError) as raised:
                validate_program([window()], False, 1, None, auto)
            self.assertEqual(raised.exception.code, "invalid_auto_entity")
        self.assertEqual(
            validate_program([window()], False, 1, None, "input_boolean.irrigazione_attiva")["auto_entity"],
            "input_boolean.irrigazione_attiva",
        )


class EvaluationTests(unittest.TestCase):
    slots = [
        {"id": "morning", "days": [1, 3, 5], "start": "05:30", "duration": 30},
        {"id": "night", "days": [7], "start": "23:00", "duration": 180},
    ]

    def test_active_slot_is_start_inclusive_and_end_exclusive(self):
        self.assertEqual(active_slot(self.slots, utc(2026, 5, 4, 5, 30))["id"], "morning")
        self.assertEqual(active_slot(self.slots, utc(2026, 5, 4, 5, 59))["id"], "morning")
        self.assertIsNone(active_slot(self.slots, utc(2026, 5, 4, 6, 0)))
        self.assertIsNone(active_slot(self.slots, utc(2026, 5, 5, 5, 40)))
        self.assertIsNone(active_slot(self.slots, utc(2026, 5, 4, 12, 0)))
        self.assertIsNone(active_slot([], utc(2026, 5, 4, 12, 0)))

    def test_active_slot_follows_a_window_past_midnight(self):
        # Sunday 23:00 + 3h still waters on Monday at 00:30.
        self.assertEqual(active_slot(self.slots, utc(2026, 5, 11, 0, 30))["id"], "night")
        self.assertIsNone(active_slot(self.slots, utc(2026, 5, 12, 0, 30)))

    def test_full_day_window_is_always_active_on_its_day(self):
        daily = [{"id": "all", "days": [4], "start": "00:00", "duration": 1440}]
        self.assertEqual(active_slot(daily, utc(2026, 5, 7, 0, 0))["id"], "all")
        self.assertEqual(active_slot(daily, utc(2026, 5, 7, 23, 59))["id"], "all")
        self.assertIsNone(active_slot(daily, utc(2026, 5, 8, 23, 59)))

    def test_frequency_allows_the_rhythm_from_its_anchor(self):
        anchor = datetime(2026, 5, 1, tzinfo=timezone.utc)
        program = {"frequency_days": 1}
        self.assertTrue(frequency_allows(program, anchor))
        program = {"frequency_days": 2, "start_date": "2026-05-01"}
        self.assertTrue(frequency_allows(program, anchor))
        self.assertFalse(frequency_allows(program, anchor + timedelta(days=1)))
        self.assertTrue(frequency_allows(program, anchor + timedelta(days=2)))
        program = {"frequency_days": 7, "start_date": "2026-05-01"}
        self.assertFalse(frequency_allows(program, anchor + timedelta(days=6)))
        self.assertTrue(frequency_allows(program, anchor + timedelta(days=7)))
        # Days before the anchor never water, and a broken anchor blocks too.
        self.assertFalse(frequency_allows(program, anchor - timedelta(days=7)))
        self.assertFalse(frequency_allows({"frequency_days": 3, "start_date": "bad"}, anchor))
        self.assertFalse(frequency_allows({"frequency_days": 3}, anchor))

    def test_apply_key_identifies_the_pump_command(self):
        program = validate_program(self.slots, True)
        now = utc(2026, 5, 4, 5, 45)
        self.assertEqual(apply_key(program, now), "morning")
        self.assertEqual(apply_key(program, utc(2026, 5, 4, 12, 0)), "off")
        self.assertEqual(apply_key(program, utc(2026, 5, 5, 5, 45)), "off")
        skipped = validate_program(self.slots, True, 2, "2026-05-05")
        self.assertEqual(apply_key(skipped, utc(2026, 5, 4, 5, 45)), "blocked")
        self.assertEqual(apply_key(validate_program(self.slots, False), now), "blocked")

    def test_program_status_is_empty_for_a_disabled_program(self):
        self.assertEqual(program_status(self.slots, False, utc(2026, 5, 4, 5, 45)), (None, None))
        slot, boundary = program_status(self.slots, True, utc(2026, 5, 4, 5, 45))
        self.assertEqual(slot["id"], "morning")
        self.assertIsInstance(boundary, datetime)

    def test_next_boundary_returns_the_next_local_change(self):
        now = utc(2026, 5, 4, 5, 45)
        boundary = next_boundary(self.slots, now)
        self.assertEqual(boundary, utc(2026, 5, 4, 6, 0))
        # The next start comes after the end of the running window.
        self.assertEqual(next_boundary(self.slots, utc(2026, 5, 4, 6, 0)), utc(2026, 5, 6, 5, 30))
        # Yesterday's overnight window contributes its end boundary.
        self.assertEqual(next_boundary(self.slots, utc(2026, 5, 11, 0, 30)), utc(2026, 5, 11, 2, 0))
        self.assertIsNone(next_boundary([], now))

    def test_next_boundary_resolves_a_dst_gap_forward(self):
        rome = ZoneInfo("Europe/Rome")
        slots = [{"id": "night", "days": [7], "start": "02:30", "duration": 30}]
        now = datetime(2026, 3, 28, 12, 0, tzinfo=rome)
        boundary = next_boundary(slots, now)
        # 02:30 does not exist on 29 March 2026: the boundary moves forward.
        self.assertEqual(boundary.utcoffset(), timedelta(hours=2))
        self.assertEqual((boundary.hour, boundary.minute), (3, 0))
        self.assertGreater(boundary, now)

    def test_availability_action_only_matters_during_a_running_window(self):
        self.assertIsNone(availability_action_fn(False, True, "on", "unavailable"))
        self.assertIsNone(availability_action_fn(True, False, "on", "unavailable"))
        self.assertEqual(availability_action_fn(True, True, "on", "unavailable"), "pending")
        self.assertEqual(availability_action_fn(True, True, "unavailable", "on"), "retry")
        self.assertIsNone(availability_action_fn(True, True, "off", "on"))
        self.assertIsNone(availability_action_fn(True, True, "on", None))

    def test_entity_config_change_retries_only_on_first_sight_or_restore(self):
        self.assertTrue(entity_config_changed(None, {"friendly_name": "Pompa"}))
        self.assertFalse(entity_config_changed({"friendly_name": "Pompa"}, {"friendly_name": "Pompa 2"}))
        self.assertFalse(entity_config_changed({"x": 1}, None))
        self.assertTrue(entity_config_changed({"state": "unavailable"}, {"state": "off"}, "unavailable", "off"))
        self.assertFalse(entity_config_changed({"state": "off"}, {"state": "on"}, "off", "on"))


class ErrorAndSnapshotTests(unittest.TestCase):
    def test_error_entry_and_structured_error_share_one_shape(self):
        self.assertEqual(error_entry("slots_overlap", "overlap", a="x", b="y"), {
            "code": "slots_overlap", "context": {"a": "x", "b": "y"}, "message": "overlap",
        })
        error = ScheduleError("bad days", "invalid_days")
        self.assertEqual(structured_error(error), {"code": "invalid_days", "context": {}, "message": "bad days"})
        context = ScheduleError("overlap", "slots_overlap", a="x", b="y")
        self.assertEqual(structured_error(context)["context"], {"a": "x", "b": "y"})
        self.assertEqual(structured_error(ValueError("boom")), {
            "code": "unexpected_failure", "context": {}, "message": "boom",
        })

    def test_snapshot_restores_only_the_given_entity(self):
        programs = {"switch.a": {"enabled": True}}
        errors = {"switch.a": None}
        pending = {"switch.a", "switch.b"}
        snapshot = snapshot_entity_state("switch.a", (programs, errors), (pending,))
        programs["switch.a"] = {"enabled": False}
        errors["switch.a"] = "boom"
        programs["switch.b"] = {"enabled": True}
        pending.discard("switch.a")
        restore_entity_state(snapshot)
        self.assertEqual(programs, {"switch.a": {"enabled": True}, "switch.b": {"enabled": True}})
        self.assertEqual(errors, {"switch.a": None})
        # The snapshot is entity-scoped: other entities keep whatever happened.
        self.assertEqual(pending, {"switch.a", "switch.b"})

    def test_restore_drops_a_key_that_did_not_exist(self):
        programs = {}
        snapshot = snapshot_entity_state("switch.a", (programs,), ())
        programs["switch.a"] = {"enabled": True}
        restore_entity_state(snapshot)
        self.assertEqual(programs, {})


class MigrationTests(unittest.TestCase):
    def test_same_version_is_an_identity_copy_with_its_version_set(self):
        payload = {"schema_version": 1, "programs": {"switch.a": {}}}
        migrated = migrate_storage_data(payload, 1, 1)
        self.assertEqual(migrated, {"schema_version": 1, "programs": {"switch.a": {}}})
        self.assertIsNot(migrated, payload)

    def test_unmigratable_payloads_are_rejected_never_downgraded(self):
        self.assertIsNone(migrate_storage_data({"schema_version": 2}, 2, 1))
        self.assertIsNone(migrate_storage_data({"schema_version": 1}, "1", 1))
        self.assertIsNone(migrate_storage_data({"schema_version": 1}, 0, 1))
        self.assertIsNone(migrate_storage_data(None, 1, 1))
        self.assertIsNone(migrate_storage_data(["nope"], 1, 1))
        # A missing step in the chain must fail loudly instead of guessing.
        self.assertIsNone(migrate_storage_data({"schema_version": 1}, 1, 2))
        self.assertEqual(DATA_MIGRATIONS, {})

    def test_migration_does_not_mutate_the_stored_payload(self):
        payload = {"schema_version": 1, "programs": {}}
        migrate_storage_data(payload, 1, 1)
        self.assertEqual(payload, {"schema_version": 1, "programs": {}})


if __name__ == "__main__":
    unittest.main()
