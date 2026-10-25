# Changelog

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
