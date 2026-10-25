"""Packaging checks for the integration, its frontend asset and its translations."""

import ast
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).parents[1]
INTEGRATION = ROOT / "custom_components/water_flow_scheduler"
CARD = INTEGRATION / "www/water-flow-card.js"


def schedule_error_codes(*relative_paths):
    """Collect every machine-readable code the backend raises as ScheduleError."""
    codes = set()
    for relative in relative_paths:
        tree = ast.parse((ROOT / relative).read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Name):
                continue
            if node.func.id != "ScheduleError" or len(node.args) < 2:
                continue
            if isinstance(node.args[1], ast.Constant) and isinstance(node.args[1].value, str):
                codes.add(node.args[1].value)
    return codes


def card_error_codes():
    """Read the card's English error map straight out of the shipped source."""
    source = CARD.read_text(encoding="utf-8")
    english = source.split("  en: {", 1)[1].split("  it: {", 1)[0]
    block = english.split("errors: {", 1)[1].split("\n    },", 1)[0]
    return set(re.findall(r"^\s{6}([a-z_]+): '", block, re.MULTILINE))


class PackageTests(unittest.TestCase):
    def test_hacs_manifest_and_integration_domain_match(self):
        hacs = json.loads((ROOT / "hacs.json").read_text(encoding="utf-8"))
        manifest = json.loads((INTEGRATION / "manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["domain"], "water_flow_scheduler")
        self.assertEqual(manifest["name"], "Water Flow Scheduler")
        self.assertEqual(hacs["name"], "Water Flow Scheduler")
        self.assertEqual(manifest["documentation"], "https://github.com/kerdx/water-flow-card")
        self.assertEqual(manifest["issue_tracker"], "https://github.com/kerdx/water-flow-card/issues")
        self.assertEqual(hacs["homeassistant"], "2025.1.0")
        self.assertNotIn("category", hacs)
        self.assertRegex(str(manifest["version"]), r"^\d+\.\d+\.\d+$")
        self.assertTrue(manifest["config_flow"])
        self.assertTrue(manifest["single_config_entry"])
        self.assertEqual(manifest["integration_type"], "service")
        files = {path.name for path in INTEGRATION.iterdir()}
        self.assertIn("services.yaml", files)
        self.assertIn("sensor.py", files)
        self.assertIn("schedule.py", files)

    def test_services_documentation_covers_registered_services(self):
        text = (INTEGRATION / "services.yaml").read_text(encoding="utf-8")
        integration = (INTEGRATION / "__init__.py").read_text(encoding="utf-8")
        # The registration tuple is written with SERVICE_* constants: resolve
        # them so the check cannot drift from the names that reach Home Assistant.
        constants = dict(re.findall(r'^SERVICE_([A-Z_]+) = "([a-z_]+)"$', integration, re.MULTILINE))
        names = tuple(name.strip() for name in re.search(r"SERVICES = \((.*?)\)", integration, re.DOTALL).group(1).split(",") if name.strip())
        registered = tuple(constants[name.removeprefix("SERVICE_")] for name in names)
        self.assertEqual(registered, ("save_program", "set_enabled", "delete_program"))
        for service in registered:
            self.assertIn(f"{service}:", text)
        # Every service field the schema accepts is documented.
        for field in ("water_entity", "enabled", "slots", "schedule_mode", "frequency_days", "start_date", "auto_entity"):
            self.assertIn(field, text)
        self.assertIn('domain: switch', text)
        self.assertIn('domain: input_boolean', text)

    def test_card_source_has_no_duplicate_copies(self):
        """Guard against reintroducing a second copy of the card source."""
        self.assertTrue(CARD.is_file())
        copies = sorted(
            path for path in ROOT.rglob("water-flow-card.js")
            if ".git" not in path.parts and "__pycache__" not in path.parts
        )
        self.assertEqual([CARD.relative_to(ROOT)], [path.relative_to(ROOT) for path in copies])

    def test_card_tests_import_the_shipped_source(self):
        """The JavaScript tests must read the shipped card, not a stray copy."""
        test_source = (ROOT / "water-flow-card.test.js").read_text(encoding="utf-8").replace("\\", "/")
        served = "custom_components/water_flow_scheduler/www/water-flow-card.js"
        self.assertIn(served, test_source)
        self.assertNotIn("'./water-flow-card.js'", test_source)
        self.assertNotIn('"./water-flow-card.js"', test_source)

    def test_versions_and_storage_migrations_are_wired(self):
        const = (INTEGRATION / "const.py").read_text(encoding="utf-8")
        flow = (INTEGRATION / "config_flow.py").read_text(encoding="utf-8")
        integration = (INTEGRATION / "__init__.py").read_text(encoding="utf-8")
        schedule = (INTEGRATION / "schedule.py").read_text(encoding="utf-8")
        self.assertIn("STORE_VERSION = 1", const)
        self.assertIn("STORAGE_VERSION = 1", const)
        self.assertIn("Store(hass, STORE_VERSION, STORAGE_KEY)", integration)
        self.assertIn("CONFIG_ENTRY_VERSION = 1", const)
        self.assertIn("VERSION = CONFIG_ENTRY_VERSION", flow)
        self.assertIn("def async_migrate_entry", integration)
        self.assertIn("entry.version", integration)
        self.assertIn("version=CONFIG_ENTRY_VERSION", integration)
        self.assertNotIn("title=", integration)
        # Stored payloads must migrate or fail loudly, never silently vanish.
        self.assertIn("def migrate_storage_data", schedule)
        self.assertIn("migrate_storage_data(stored, stored_version, STORAGE_VERSION)", integration)
        # The card ships from the integration static path with a versioned URL.
        self.assertIn('"/water_flow_scheduler"', integration)
        self.assertIn("water-flow-card.js?v=", const)
        self.assertIn("add_extra_js_url(hass, FRONTEND_URL)", integration)

    def test_manifest_version_matches_changelog(self):
        manifest = json.loads((INTEGRATION / "manifest.json").read_text(encoding="utf-8"))
        changelog = (ROOT / "CHANGELOG.md").read_text(encoding="utf-8")
        headings = [line for line in changelog.splitlines() if line.startswith("## ")]
        match = re.fullmatch(r"## v([0-9]+\.[0-9]+\.[0-9]+)\s*", headings[0]) if headings else None
        self.assertIsNotNone(match, f"CHANGELOG must start with '## vX.Y.Z', found: {headings[0] if headings else None!r}")
        self.assertEqual(match.group(1), manifest["version"])

    def test_backend_codes_reach_both_translations_and_the_card(self):
        """Every code the backend can raise is localizable and labelable."""
        raised = schedule_error_codes(
            "custom_components/water_flow_scheduler/schedule.py",
            "custom_components/water_flow_scheduler/__init__.py",
        )
        english = json.loads((INTEGRATION / "translations/en.json").read_text(encoding="utf-8"))
        italian = json.loads((INTEGRATION / "translations/it.json").read_text(encoding="utf-8"))
        self.assertTrue(raised)
        self.assertEqual(set(english["exceptions"]), set(italian["exceptions"]))
        self.assertTrue(raised <= set(english["exceptions"]), raised - set(english["exceptions"]))
        # The card ships the same dictionary, so a service error always renders.
        self.assertEqual(card_error_codes(), set(english["exceptions"]))

    def test_translations_describe_the_config_flow_and_its_error_placeholders(self):
        for language in ("en", "it"):
            data = json.loads((INTEGRATION / f"translations/{language}.json").read_text(encoding="utf-8"))
            self.assertEqual(data["config"]["step"]["user"]["title"], "Water Flow Scheduler")
            self.assertIn("single_instance_allowed", data["config"]["abort"])
            self.assertEqual(data["exceptions"]["slots_overlap"]["message"].count("{a}"), 1)
            self.assertIn("{max}", data["exceptions"]["too_many_slots"]["message"])
            self.assertIn("{id}", data["exceptions"]["duplicate_slot_id"]["message"])
            self.assertIn("{entity}", data["exceptions"]["unknown_water_entity"]["message"])

    def test_card_and_translations_share_the_pump_vocabulary(self):
        """The card drives the switch and its auto helper, nothing else."""
        source = CARD.read_text(encoding="utf-8")
        self.assertIn("'switch'", source)
        self.assertIn("'input_boolean'", source)
        self.assertIn("'water_flow_scheduler'", source)
        self.assertNotIn("climate.", source)
        self.assertNotIn("homeassistant.", source)
        manifest = json.loads((INTEGRATION / "manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["dependencies"], ["frontend", "http"])


if __name__ == "__main__":
    unittest.main()
