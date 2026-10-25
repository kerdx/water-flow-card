# Water Flow Scheduler

**Irrigation scheduling and a dedicated Lovelace card for Home Assistant.**

[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2025.1%2B-41BDF5?logo=homeassistant)](https://www.home-assistant.io/)
[![HACS integration](https://img.shields.io/badge/HACS-Integration-18BCF2?logo=homeassistantcommunitystore)](https://www.hacs.xyz/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Water Flow Scheduler is a Home Assistant integration that includes **Water Flow Card**, a configurable Lovelace card for one `switch` entity, and an optional backend scheduler for recurring irrigation programs. The integration stores schedules across Home Assistant restarts, controls the pump or valve when automation is enabled, and exposes schedule diagnostics.

## Features

- **Purpose-built irrigation card** with `pill` and `compact` layouts.
- **At-a-glance status** for the switch, elapsed watering time, next schedule change, flow rate, and volume.
- **Schedule editor** in the card for weekly watering windows, frequency, and automatic control.
- **Persistent scheduler** with one program per pump or valve switch.
- **Optional Auto helper** (`input_boolean`) to hand control between the scheduler and the user.
- **Diagnostic sensor** reporting program state and the latest error.
- **Automatic frontend registration** — no manual Lovelace JavaScript resource is required.
- **English and Italian** card and editor text, with automatic language selection.

## Requirements

- Home Assistant **2025.1.0 or later**.
- A Home Assistant `switch` entity for the irrigation pump or valve.
- The scheduler is optional. The card can display switch and sensor information without a saved schedule.

## Installation

### HACS

1. In HACS, open **Integrations** and search for **Water Flow Scheduler**.
2. Download the integration and restart Home Assistant.
3. Go to **Settings → Devices & services → Add integration**.
4. Search for and add **Water Flow Scheduler**.
5. Add **Water Flow Card** to a dashboard using the card picker, or configure it manually as shown below.

The integration registers the card when it is set up. Do not add a separate Lovelace resource for the card.

### Manual installation

1. Copy `custom_components/water_flow_scheduler` into `<config>/custom_components/`.
2. Restart Home Assistant.
3. Add **Water Flow Scheduler** from **Settings → Devices & services → Add integration**.
4. Add the card to a dashboard.

### Verify frontend registration

If **Water Flow Card** does not appear in the card picker:

1. Confirm **Water Flow Scheduler** is configured and loaded under **Settings → Devices & services**. Installing the files alone does not load the integration.
2. Hard-refresh the Home Assistant page (`Ctrl`/`Cmd` + `Shift` + `R`).
3. Open `https://<your-home-assistant>/water_flow_scheduler/water-flow-card.js` in a browser. A `404` usually means the integration is not loaded.
4. In the dashboard browser console, check that `window.customCards` contains an entry with `type: "water-flow-card"`.

## Dashboard card

The card editor is available in the visual dashboard editor. The following is a minimal manual configuration:

```yaml
type: custom:water-flow-card
entity: switch.garden_pump
```

Here is an example with optional entities and presentation settings:

```yaml
type: custom:water-flow-card
entity: switch.garden_pump
name: Garden irrigation
icon: mdi:water-pump
auto_entity: input_boolean.garden_irrigation_auto
flow_entity: sensor.garden_water_flow
volume_entity: sensor.garden_water_volume
# program_entity: sensor.water_flow_scheduler_programs # discovered automatically when omitted
layout: pill # pill | compact
surface: elevated # default | elevated | blend
accent_color: "#3f9cf4"
language: auto # auto | en | it
```

### Card options

| Option | Description | Default |
| --- | --- | --- |
| `entity` | Required pump or valve entity (`switch`). | — |
| `name`, `icon` | Override the displayed name or icon. | Entity values |
| `layout` | Card layout: `pill` or `compact`. | `pill` |
| `auto_entity` | Optional `input_boolean` used for scheduler ownership and the Auto button. | — |
| `flow_entity`, `volume_entity` | Optional sensors displayed as flow and volume readouts. | — |
| `program_entity` | Optional scheduler diagnostic sensor. Automatically discovered when omitted. | Automatic |
| `accent_color` | Accent color for the icon, chips, and controls. | Home Assistant theme |
| `surface` | Card background: `default`, `elevated`, or `blend`. | `default` |
| `language` | Card language: `auto`, `en`, or `it`. `auto` follows the Home Assistant locale, with English as the fallback. | `auto` |
| `show_state_chip` | Show the watering/off state. | `true` |
| `show_flow_chip`, `show_volume_chip` | Show the configured flow and volume sensors. | `true` |
| `show_next_change_chip` | Show the next schedule change. | `true` |
| `show_unavailable_badge` | Show an unavailable-state indicator. | `true` |
| `show_auto_button`, `show_schedule_button` | Show the Auto and schedule controls. | `true` |
| `tap_action`, `hold_action`, `double_tap_action` | Background action: `toggle`, `more-info`, or `none`. | `toggle`, `none`, `none` |
| `haptics`, `haptics_style` | Enable supported vibration feedback and choose `light`, `medium`, or `heavy`. | `true`, `medium` |
| `animations`, `animation_duration` | Enable value animations and set their duration in milliseconds. | `true`, `220` |

The **Auto** button toggles `auto_entity`. **Windows** opens the schedule editor at the watering windows, and **Frequency** opens it at the frequency setting. These controls are available when the corresponding card options are enabled.

## Irrigation scheduler

The scheduler is optional and stores one program per switch. A program contains one or more non-overlapping weekly watering windows. Each window has an identifier, weekdays, a local start time, and a duration. An optional `liters` value is informational: it can be displayed by the card, but it is **not measured or enforced** by the scheduler.

### Schedule rules and pump ownership

- Weekdays use ISO numbering: `1` is Monday and `7` is Sunday. Times use Home Assistant's local timezone and 24-hour `HH:MM` format.
- Windows may cross midnight. For example, a Sunday window starting at `23:00` with a duration of 180 minutes continues until Monday at `02:00`.
- `frequency_days` sets the interval from 1 to 31 days. A value of `1` runs on every scheduled weekday. Values above `1` require `start_date`, the anchor date for the interval; dates before the anchor are skipped.
- When a program is enabled and automatic control is active, the scheduler turns the switch on during an eligible window and off outside one—including on a skipped frequency day.
- With `auto_entity` configured, the scheduler controls the switch only while that helper is `on`. When it is `off`, `unknown`, or `unavailable`, the scheduler does not command the switch. Without an `auto_entity`, an enabled program always owns the switch.
- Manual switch changes are not saved as schedule changes. While the scheduler owns the switch, it re-applies the program's desired state on its next evaluation.
- If the switch is unavailable or a service call fails, the command is retried on a later state change or scheduled evaluation.
- Programs are stored by the integration and restored after Home Assistant restarts.

### Configure a program in the card

Enable the schedule button in the card and open **Windows** or **Frequency**. The editor lets you configure the program, its active state, frequency and anchor date, optional Auto helper, and each window's weekdays, start time, duration, and optional liters value. Save or delete the program from the editor.

### Configure a program with a service

The integration provides three services in the `water_flow_scheduler` domain:

| Service | Purpose |
| --- | --- |
| `water_flow_scheduler.save_program` | Create or replace a program for a switch. |
| `water_flow_scheduler.set_enabled` | Enable or disable an existing program. |
| `water_flow_scheduler.delete_program` | Delete a program. |

Example service data for `water_flow_scheduler.save_program`:

```yaml
service: water_flow_scheduler.save_program
data:
  water_entity: switch.garden_pump
  enabled: true
  frequency_days: 2
  start_date: "2026-05-01"
  auto_entity: input_boolean.garden_irrigation_auto
  slots:
    - id: weekday_morning
      days: [1, 2, 3, 4, 5]
      start: "05:30"
      duration: 30
      liters: 120
```

`start_date` is only required when `frequency_days` is greater than `1`. To enable or disable a saved program:

```yaml
service: water_flow_scheduler.set_enabled
data:
  water_entity: switch.garden_pump
  enabled: false
```

To remove it:

```yaml
service: water_flow_scheduler.delete_program
data:
  water_entity: switch.garden_pump
```

### Diagnostics

The integration creates a diagnostic sensor, normally `sensor.water_flow_scheduler_programs`. Its `programs` attribute contains each configured program, including the active window, next change, frequency eligibility, Auto state, and last error. The card discovers this sensor automatically unless `program_entity` is set explicitly.

## Development

Run the test suites from the repository root:

```bash
npm test
python3 -m unittest discover -s tests_backend
```

## Support

- [Report a bug or request a feature](https://github.com/kerdx/water-flow-card/issues)
- [View the changelog](CHANGELOG.md)
- [MIT License](LICENSE)
