# Water Flow Scheduler

**Irrigation scheduling and a dedicated Lovelace card for Home Assistant.**

[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2025.1%2B-41BDF5?logo=homeassistant)](https://www.home-assistant.io/)
[![HACS integration](https://img.shields.io/badge/HACS-Integration-18BCF2)](https://www.hacs.xyz/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Water Flow Scheduler is a Home Assistant integration that includes **Water Flow Card** and an optional backend scheduler for irrigation pumps and valves. The card displays switch status and optional flow and volume sensors. The scheduler saves programs across restarts and controls the switch when automatic mode is active.

## Features

- Lovelace card with `pill` and `compact` layouts.
- Optional flow and volume readouts, schedule editor, and Auto control.
- Persistent weekly schedules with configurable frequency and watering windows.
- Diagnostic sensor for program status and errors.
- Automatic card registration; no manual Lovelace resource is needed.
- English and Italian interface. Requires Home Assistant **2025.1.0 or later**.

## Installation

### HACS

1. In HACS, open **Integrations** and install **Water Flow Scheduler**.
2. Restart Home Assistant.
3. Add the integration from **Settings → Devices & services → Add integration**.
4. Add **Water Flow Card** to a dashboard.

### Manual

Copy `custom_components/water_flow_scheduler` into `<config>/custom_components/`, restart Home Assistant, and add the integration from **Settings → Devices & services**.

## Card configuration

```yaml
type: custom:water-flow-card
entity: switch.garden_pump
flow_entity: sensor.garden_flow       # optional
volume_entity: sensor.garden_volume   # optional
auto_entity: input_boolean.garden_auto # optional
layout: pill                          # pill | compact
```

Use the visual card editor or YAML to customize the name, icon, colors, language, visible controls, and tap actions. The scheduler sensor is discovered automatically; set `program_entity` only if you want to select it explicitly.

## Scheduler

Programs are configured in the card's schedule editor or with the integration services. Each switch can have one program with non-overlapping weekly windows.

- Weekdays use ISO numbering (`1` = Monday, `7` = Sunday); times use Home Assistant's local timezone and `HH:MM` format. Windows can cross midnight.
- `frequency_days` supports intervals from 1 to 31 days. Values above 1 require a `start_date` anchor.
- With an `auto_entity` helper, the scheduler controls the switch only while the helper is on. Without one, an enabled program owns the switch.
- The scheduler turns the switch on during eligible windows and off outside them. Optional `liters` values are informational and are not enforced.

Available services: `water_flow_scheduler.save_program`, `water_flow_scheduler.set_enabled`, and `water_flow_scheduler.delete_program`.

Example `save_program` service data:

```yaml
service: water_flow_scheduler.save_program
data:
  water_entity: switch.garden_pump
  enabled: true
  frequency_days: 2
  start_date: "2026-05-01"
  slots:
    - id: weekday_morning
      days: [1, 2, 3, 4, 5]
      start: "05:30"
      duration: 30
```

The diagnostic sensor, normally `sensor.water_flow_scheduler_programs`, exposes configured programs, their next change, frequency status, Auto state, and the latest error.

## Development

```bash
npm test
python3 -m unittest discover -s tests_backend
```

## Support

[Report an issue or request a feature](https://github.com/kerdx/water-flow-card/issues) · [Changelog](CHANGELOG.md) · [MIT License](LICENSE)
