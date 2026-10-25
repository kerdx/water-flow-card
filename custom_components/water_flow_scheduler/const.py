"""Integration constants."""

import json
from pathlib import Path

DOMAIN = "water_flow_scheduler"

# manifest.json is the single source of truth for the version (config flow,
# HACS, release workflow), so the frontend URL follows it automatically.
VERSION = json.loads((Path(__file__).with_name("manifest.json")).read_text(encoding="utf-8"))["version"]

# The static path is registered with cache_headers=False, so the browser is
# free to keep the previous module after an upgrade. The version in the query
# string changes on every release, which makes the URL itself change and forces
# a fresh download of the card without any manual cache clearing.
FRONTEND_URL = f"/water_flow_scheduler/water-flow-card.js?v={VERSION}"
PLATFORMS = ("sensor",)
STORAGE_KEY = "water_flow_scheduler.programs"

# Home Assistant Store envelope version must remain stable; payload schema
# migrations are managed separately by STORAGE_VERSION.
STORE_VERSION = 1
STORAGE_VERSION = 1

# Config-entry version, shared between config_flow.ConfigFlow.VERSION and the
# async_migrate_entry hook.
CONFIG_ENTRY_VERSION = 1
