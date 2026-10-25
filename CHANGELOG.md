# Changelog

## v1.3.0

- Refine schedule frequency and repeat-mode controls with localized day units and accessible increment/decrement buttons bounded to 1–31 days.
- Give pump selection a polished, accessible presentation while keeping Home Assistant's entity picker and restricting it to switch entities.

## v1.2.10

- Make the card, schedule dialog, and configuration editor mobile-first with larger touch targets, wrapping status chips, responsive window controls, and desktop layouts restored on wider screens.

## v1.2.9

- Fix schedule evaluation and next-change forecasts across spring and autumn daylight-saving transitions, including overnight windows on skipped frequency days.
- Use backend-calculated schedule status and the Home Assistant timezone in the card; refresh after closing the editor and keep the anchor date input synchronized with its draft.
- Simplify the schedule editor by removing the clickable weekly overview; weekday selectors remain in each watering window.

## v1.2.8

- Match Climate Flow Card's active schedule accent and add theme-aware whole-card hover and press feedback.

## v1.2.7

- Unify schedule editing with mutually exclusive weekday and every-N-days modes while preserving the combined behavior of existing programs until they are changed.
- Add configurable valve/device/mode status, daily and real-time volume, duration and irrigation-time readouts, plus dedicated valve and water-shortage protection controls.

## v1.2.6

- Fix card rendering so new Home Assistant states are reflected instead of leaving stale unavailable values on screen.

## v1.2.5

- Show battery readings as percentages when the sensor does not provide a unit of measurement.

## v1.2.4

- Improve hover and pressed feedback for the battery button.
- Open battery and card entity details through Home Assistant's `hass-more-info` event.

## v1.2.3

- Automatically detect flow, volume, and battery sensors; manual selections take precedence, and ambiguous matches are left unselected.
- Add a localized battery button that displays the sensor value and opens its details; it can be hidden from the card editor.

## v1.2.2

- Align pump-state colors with Climate Flow Card: inactive icons stay neutral, active state uses Home Assistant's switch-on accent, and an explicit `accent_color` remains the override.
- Add a subtle active-card tint and a clearer state badge while preserving the `default`, `elevated`, and `blend` surfaces.

## v1.2.1

- Replace hard-to-see native number spinners with accessible, theme-aware duration and liters steppers; isolate the keyboard action from neighboring controls.
- Turn off scheduler-owned pumps before disabling, deleting, or handing a program to Auto-off control; keep Auto-off manual behavior unchanged.
- Align active-window status and next-change forecasts with the frequency cycle, surface manual service errors, and keep the elapsed watering timer accurate and updating.
- Localize the new scheduler-control release error in English and Italian.

## v1.2.0

- Redesign the irrigation schedule editor with a weekly overview, clearer frequency and watering-window sections, conditional anchor dates, and an entity picker for the Auto helper.
- Protect unsaved changes with inline confirmations and show saving/deleting progress while preventing duplicate service calls.
- Improve window limits and unique IDs, focus validation errors, and show scheduler errors in the editor; refine English and Italian copy.

## v1.1.1

- Fix card editor configuration updates by sending `config-changed` events with Home Assistant's expected `detail.config` payload.

## v1.1.0

- Add the integration brand icon and repository metadata for HACS validation.
- Streamline the README with concise installation, card configuration, and scheduler guidance.

## v1.0.0

- First release: the `water_flow_scheduler` integration and `custom:water-flow-card`, mirroring the structure of Climate Flow Card.
- The card drives one pump or valve switch with `pill` and `compact` layouts: a circular status icon, a status line with the pump state, the elapsed watering time and the next window, plus chips for an optional flow sensor (`flow_entity`, e.g. L/min) and an optional volume sensor (`volume_entity`, e.g. m³). A tap on the card background toggles the pump (`tap_action`, `hold_action` and `double_tap_action` accept `toggle`, `more-info` and `none`), and `accent_color`, `surface` (`default`, `elevated`, `blend`), `name`, `icon` and `language` (`auto`, `en`, `it`) cover the look, all of them editable from the card editor.
- Three sub-buttons mirror the scheduler: **Auto** toggles the configured `auto_entity` (for example `input_boolean.irrigazione_attiva`), **Windows** opens the schedule dialog on the windows editor and **Frequency** opens it on the frequency field. The dialog edits the program end to end (active switch, frequency, anchor date, auto helper, per-window weekdays, start, duration and optional liters) and saves or deletes it through the backend services; validation runs client-side first and reuses the backend error codes, so a rejected program shows the same localized message as the service error.
- The optional scheduler persists one program per switch entity: non-overlapping weekly windows (ISO weekdays 1..7, local HH:MM start, duration in minutes, optional `liters` shown by the card), an every-N-days rhythm anchored on `start_date` (required above one day, days before the anchor never water), and an `auto_entity` gate. While the helper is on the program owns the switch, turning the pump on inside a window and off outside it (including on a skipped frequency day); while it is off the scheduler sends no command at all. A window may run past midnight, unavailable switches are marked pending and retried on the next state change or minute tick, and manual pump toggles are corrected on the next evaluation.
- Services: `water_flow_scheduler.save_program`, `water_flow_scheduler.set_enabled`, `water_flow_scheduler.delete_program`. The integration also creates a diagnostic `Programs` sensor listing every program with its active window, next change, frequency outcome, auto state and last error, and serves the card as a static asset with a versioned URL, so no Lovelace resource is needed.
- Card and backend share one error vocabulary: the codes raised by the scheduler are localized in both translation files and in the card strings, and an unknown code falls back to the backend message instead of leaking a placeholder.
