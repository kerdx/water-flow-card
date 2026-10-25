import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  WaterFlowCard, WaterFlowCardEditor, WATER_FLOW_CARD_TAG, WATER_FLOW_CARD_EDITOR_TAG,
  registerWaterFlowElements, isWaterFlowElementsRegistered, isHomeAssistantFrontendReady,
  scheduleWaterFlowReregistration, cardStrings, cardLanguage, resolveLanguage, fieldLabel, errorLabel,
  defaultCardConfig, CARD_OPTION_DEFAULTS, cardDefault, stripCardDefaults, sameCardConfig, nextSlotId,
  configSchema, configSchemaFields, getEntitySuggestion, normalizeAccentColor, normalizeSurface,
  normalizeLayout, normalizeCardAction, normalizeHapticStyle, normalizeAnimationDuration,
  CARD_SURFACES, CARD_ACTIONS, HAPTIC_STYLES, ANIMATION_DURATION_DEFAULT, MAX_SLOTS, MAX_DURATION_MINUTES,
  MAX_FREQUENCY_DAYS, WATER_FLOW_DOMAIN, numeric, formatNumber, formatDuration, chipValue, sessionMinutes,
   pumpStateLabel, workStateLabel, deviceStatusLabel, cardTitle, frequencyAllows, activeSlotFor, activeProgram, nextWindowMs, timeMinutes, timestampClock, localDateString, stepScheduleValue,
  programSensor, programOf, discoverSensorEntity, scheduleDraft, emptyScheduleDraft, validateScheduleDraft, programPayload,
  deleteProgramPayload, actionCall, toggleAutoCall, hapticPattern, fireHaptic,
} from './custom_components/water_flow_scheduler/www/water-flow-card.js';

const SOURCE_PATH = './custom_components/water_flow_scheduler/www/water-flow-card.js';
const cardSource = () => readFileSync(new URL(SOURCE_PATH, import.meta.url), 'utf8');

const states = {
  'switch.irrigazione': { state: 'on', attributes: { friendly_name: 'Irrigazione' } },
  'input_boolean.irrigazione_attiva': { state: 'on', attributes: {} },
  'sensor.portata_irrigazione': { state: '12.5', attributes: { unit_of_measurement: 'L/min' } },
  'sensor.volume_irrigazione': { state: '3.2', attributes: { unit_of_measurement: 'm³' } },
  'sensor.batteria_irrigazione': { state: '87', attributes: { unit_of_measurement: '%' } },
  'binary_sensor.irrigazione_valve_work_state': { state: 'off', attributes: { friendly_name: 'Irrigazione Valve work state' } },
  'sensor.irrigazione_current_device_status': { state: 'normal_state', attributes: { friendly_name: 'Irrigazione Current device status' } },
  'sensor.irrigazione_cyclic_quantitative_irrigation': { state: 'irrigazione', attributes: { friendly_name: 'Irrigazione Cyclic quantitative irrigation' } },
  'sensor.irrigazione_cyclic_timed_irrigation': { state: 'irrigazione', attributes: { friendly_name: 'Irrigazione Cyclic timed irrigation' } },
  'sensor.irrigazione_daily_irrigation_volume': { state: '5', attributes: { unit_of_measurement: 'L' } },
  'sensor.irrigazione_flow': { state: '0', attributes: { unit_of_measurement: 'm³/h', device_class: 'volume_flow_rate', state_class: 'measurement' } },
  'sensor.irrigazione_irrigation_start_time': { state: '1792957393', attributes: {} },
  'sensor.irrigazione_irrigation_end_time': { state: '1792957395', attributes: {} },
  'sensor.irrigazione_real_time_irrigation_duration': { state: '15', attributes: { unit_of_measurement: 's' } },
  'sensor.irrigazione_real_time_irrigation_volume': { state: '3745', attributes: { unit_of_measurement: 'L' } },
  'switch.irrigazione_auto_close_when_water_shortage': { state: 'on', attributes: { friendly_name: 'Auto close when water shortage' } },
  'sensor.water_flow_scheduler_programs': {
    state: 'ready',
    attributes: {
      scheduler_domain: WATER_FLOW_DOMAIN,
      programs: {
        'switch.irrigazione': {
          enabled: true,
          frequency_days: 2,
          start_date: '2026-05-01',
          auto_entity: 'input_boolean.irrigazione_attiva',
          active_slot_id: null,
          next_change: null,
          slots: [{ id: 'morning', days: [1, 3, 5], start: '05:30', duration: 30, liters: 120 }],
        },
      },
    },
  },
};

const fakeHass = (overrides = {}) => ({ states, locale: { language: 'it-IT' }, callService: async () => {}, ...overrides });

const configuredCard = (config) => {
  const card = new WaterFlowCard();
  card.attachShadow = () => {};
  card.setConfig(config);
  return card;
};

test('module imports without a browser DOM and exports the card class', () => {
  assert.equal(typeof WaterFlowCard, 'function');
  assert.equal(typeof WaterFlowCardEditor, 'function');
  assert.equal(WATER_FLOW_CARD_TAG, 'water-flow-card');
  assert.equal(WATER_FLOW_CARD_EDITOR_TAG, 'water-flow-card-editor');
  assert.equal(typeof WaterFlowCard.getStubConfig, 'function');
  assert.equal(typeof WaterFlowCard.getConfigElement, 'function');
});

test('language resolution follows hass and falls back to English', () => {
  assert.equal(resolveLanguage({ locale: { language: 'it-IT' } }), 'it');
  assert.equal(resolveLanguage({ language: 'it' }), 'it');
  assert.equal(resolveLanguage({ locale: { language: 'de-DE' } }), 'en');
  assert.equal(resolveLanguage(undefined), 'en');
  assert.equal(resolveLanguage({ locale: { language: 'de' } }, 'it'), 'it');
  assert.equal(cardLanguage({ language: 'en' }, { locale: { language: 'it-IT' } }), 'en');
  assert.equal(cardLanguage({}, { locale: { language: 'it-IT' } }), 'it');
  for (const language of ['en', 'it']) {
    const strings = cardStrings(language);
    assert.ok(strings.scheduleTitle && strings.saveProgram && strings.everyDays(2));
    assert.equal(strings.everyDays(1), language === 'it' ? 'Ogni giorno' : 'Every day');
    assert.deepEqual(strings.dayPills.length, 7);
    assert.deepEqual(strings.dayNames.length, 7);
  }
  assert.equal(cardStrings('de').scheduleTitle, cardStrings('en').scheduleTitle);
});

// A localized dictionary must expose exactly the fields the editor renders,
// in both languages, so a missing translation cannot blank a label.

test('editor schema groups the options into localized sections', () => {
  assert.deepEqual(configSchema.map((entry) => entry.type), ['grid', 'grid', 'grid', 'expandable']);
  assert.deepEqual(configSchema.map((entry) => entry.name), ['identity', 'entities', 'visible', 'controls']);
  assert.equal(configSchema[3].collapsed, true);
  for (const lang of ['en', 'it']) {
    const strings = cardStrings(lang);
    assert.deepEqual(Object.keys(strings.sections), ['identity', 'entities', 'visible', 'controls']);
    const names = configSchemaFields().map((entry) => entry.name).sort();
    assert.deepEqual(Object.keys(strings.help).sort(), names);
    assert.deepEqual(Object.keys(strings.fields).sort(), names);
  }
});

test('schema selectors describe the water entities and card options', () => {
  const fields = configSchemaFields();
  const names = fields.map((entry) => entry.name);
  assert.deepEqual(fields.find((entry) => entry.name === 'entity').selector.entity, { filter: { domain: ['switch'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'auto_entity').selector.entity, { filter: { domain: ['input_boolean'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'flow_entity').selector.entity, { filter: { domain: ['sensor'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'battery_entity').selector.entity, { filter: { domain: ['sensor'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'work_state_entity').selector.entity, { filter: { domain: ['binary_sensor'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'device_status_entity').selector.entity, { filter: { domain: ['sensor'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'irrigation_mode_entity').selector.entity, { filter: { domain: ['sensor'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'timed_irrigation_entity').selector.entity, { filter: { domain: ['sensor'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'daily_volume_entity').selector.entity, { filter: { domain: ['sensor'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'real_time_volume_entity').selector.entity, { filter: { domain: ['sensor'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'real_time_duration_entity').selector.entity, { filter: { domain: ['sensor'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'irrigation_start_time_entity').selector.entity, { filter: { domain: ['sensor'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'irrigation_end_time_entity').selector.entity, { filter: { domain: ['sensor'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'shortage_protection_entity').selector.entity, { filter: { domain: ['switch'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'layout').selector, { select: { mode: 'dropdown', options: ['pill', 'compact'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'surface').selector, { select: { mode: 'dropdown', options: CARD_SURFACES } });
  assert.deepEqual(fields.find((entry) => entry.name === 'tap_action').selector, { select: { mode: 'dropdown', options: CARD_ACTIONS } });
  for (const name of ['name', 'icon', 'accent_color', 'language', 'program_entity', 'battery_entity', 'work_state_entity', 'device_status_entity', 'irrigation_mode_entity', 'timed_irrigation_entity', 'daily_volume_entity', 'real_time_volume_entity', 'real_time_duration_entity', 'irrigation_start_time_entity', 'irrigation_end_time_entity', 'shortage_protection_entity', 'show_state_chip', 'show_flow_chip',
    'show_volume_chip', 'show_battery_button', 'show_next_change_chip', 'show_unavailable_badge', 'show_auto_button', 'show_schedule_button', 'show_work_state_button', 'show_device_status_chip', 'show_irrigation_mode_chip', 'show_timed_irrigation_chip', 'show_daily_volume_chip', 'show_real_time_volume_chip', 'show_real_time_duration_chip', 'show_irrigation_time_chips', 'show_shortage_protection_button',
    'hold_action', 'double_tap_action', 'haptics', 'haptics_style', 'animations', 'animation_duration']) {
    assert.ok(names.includes(name), name);
  }
});

test('defaults, suggestion and stub config nest the card type', () => {
  assert.deepEqual(defaultCardConfig('switch.irrigazione'), {
    entity: 'switch.irrigazione', layout: 'pill',
    show_state_chip: true, show_flow_chip: true, show_volume_chip: true, show_battery_button: true, show_next_change_chip: true,
    show_unavailable_badge: true, show_auto_button: true, show_schedule_button: true, show_work_state_button: true,
    show_device_status_chip: true, show_irrigation_mode_chip: true, show_timed_irrigation_chip: true,
    show_daily_volume_chip: true, show_real_time_volume_chip: true, show_real_time_duration_chip: true,
    show_irrigation_time_chips: true, show_shortage_protection_button: true,
  });
  assert.deepEqual(getEntitySuggestion({}, 'switch.irrigazione'), {
    config: { type: 'custom:water-flow-card', ...defaultCardConfig('switch.irrigazione') },
  });
  assert.equal(getEntitySuggestion({}, 'light.living_room'), null);
  const stub = WaterFlowCard.getStubConfig({ states });
  assert.equal(stub.entity, 'switch.irrigazione');
  assert.equal(Object.hasOwn(stub, 'type'), false);
  assert.equal(WaterFlowCard.getStubConfig({ states: {} }).entity, 'switch.example');
  assert.equal(cardDefault('haptics', 'switch.irrigazione'), true);
  assert.equal(cardDefault('surface', 'switch.irrigazione'), 'default');
  assert.equal(cardDefault('show_flow_chip', 'switch.irrigazione'), true);
  assert.equal(cardDefault('show_battery_button', 'switch.irrigazione'), true);
  assert.deepEqual(CARD_OPTION_DEFAULTS.animation_duration, ANIMATION_DURATION_DEFAULT);
});

test('stripCardDefaults and sameCardConfig keep the YAML minimal', () => {
  const config = defaultCardConfig('switch.irrigazione');
  assert.deepEqual(stripCardDefaults({ ...config, layout: 'pill', name: '' }), { entity: 'switch.irrigazione' });
  assert.deepEqual(stripCardDefaults({ ...config, layout: 'compact', accent_color: '#3f9cf4' }), {
    entity: 'switch.irrigazione', layout: 'compact', accent_color: '#3f9cf4',
  });
  assert.equal(Object.hasOwn(stripCardDefaults({ entity: 'switch.irrigazione', auto_entity: null }), 'auto_entity'), false);
  assert.equal(sameCardConfig(config, { ...config }), true);
  assert.equal(sameCardConfig(config, { ...config, name: 'Sala' }), false);
  assert.equal(sameCardConfig({ step: 0.5 }, { step: '0.5' }), false);
  assert.equal(sameCardConfig(undefined, config), false);
  assert.equal(sameCardConfig(null, null), true);
  assert.equal(sameCardConfig(config, { ...config, extra: undefined }), true);
});

test('option normalizers validate loudly on hand-written YAML', () => {
  assert.equal(normalizeAccentColor('#3F9CF4'), '#3f9cf4');
  assert.equal(normalizeAccentColor(' #abc '), null);
  assert.equal(normalizeAccentColor('#12345'), null);
  assert.equal(normalizeAccentColor('red'), null);
  assert.equal(normalizeAccentColor(''), null);
  assert.deepEqual(CARD_SURFACES, ['default', 'elevated', 'blend']);
  assert.equal(normalizeSurface('blend'), 'blend');
  assert.equal(normalizeSurface('glass'), 'default');
  assert.equal(normalizeLayout('compact'), 'compact');
  assert.equal(normalizeLayout('circular'), 'pill');
  assert.equal(normalizeCardAction('more-info'), 'more-info');
  assert.equal(normalizeCardAction('call-service'), null);
  assert.equal(normalizeHapticStyle('heavy'), 'heavy');
  assert.equal(normalizeHapticStyle('strong'), 'medium');
  assert.equal(normalizeAnimationDuration(0), 0);
  assert.equal(normalizeAnimationDuration('bad'), ANIMATION_DURATION_DEFAULT);
  assert.equal(normalizeAnimationDuration(-5), ANIMATION_DURATION_DEFAULT);
  assert.deepEqual(HAPTIC_STYLES, ['light', 'medium', 'heavy']);

  assert.equal(workStateLabel('on', cardStrings('it')), 'Attiva');
  assert.equal(workStateLabel('off', cardStrings('it')), 'Spenta');
  assert.equal(workStateLabel('unavailable', cardStrings('it')), 'Non disponibile');
  assert.equal(deviceStatusLabel('normal_state', cardStrings('it')), 'Normale');
  assert.equal(deviceStatusLabel('fault', cardStrings('it')), 'fault');
  assert.match(timestampClock(1792957393, 'it-IT'), /^\d{1,2}:\d{2}$/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), accent_color: 'red' }), /hex colour/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), surface: 'glass' }), /surface must be one of/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), tap_action: 'call-service' }), /tap_action must be one of/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), layout: 'wide' }), /layout must be pill or compact/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), haptics_style: 'strong' }), /haptics_style must be one of/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), work_state_entity: 'sensor.irrigazione' }), /work_state_entity must be a binary_sensor/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), device_status_entity: 'binary_sensor.irrigazione' }), /device_status_entity must be a sensor/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), irrigation_mode_entity: 'binary_sensor.irrigazione' }), /irrigation_mode_entity must be a sensor/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), timed_irrigation_entity: 'binary_sensor.irrigazione' }), /timed_irrigation_entity must be a sensor/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), daily_volume_entity: 'binary_sensor.irrigazione' }), /daily_volume_entity must be a sensor/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), shortage_protection_entity: 'input_boolean.irrigazione' }), /shortage_protection_entity must be a switch/);
  assert.throws(() => configuredCard({ entity: 'light.living_room' }), /switch entity/);
  assert.throws(() => configuredCard({}), /switch entity/);
  assert.equal(configuredCard({ ...defaultCardConfig('switch.irrigazione'), accent_color: '#ABCDEF' }).config.accent_color, '#abcdef');
  const emptied = configuredCard({ ...defaultCardConfig('switch.irrigazione'), accent_color: '', surface: '' });
  assert.equal(Object.hasOwn(emptied.config, 'accent_color'), false);
  assert.equal(Object.hasOwn(emptied.config, 'surface'), false);
  assert.equal(configuredCard({ ...defaultCardConfig('switch.irrigazione'), surface: 'blend' }).config.surface, 'blend');
  assert.equal(configuredCard({ ...defaultCardConfig('switch.irrigazione'), animation_duration: '300' }).config.animation_duration, 300);
  const card = configuredCard(defaultCardConfig('switch.irrigazione'));
  assert.equal(card.getCardSize(), 3);
  card.setConfig({ ...defaultCardConfig('switch.irrigazione'), layout: 'compact' });
  assert.equal(card.getCardSize(), 2);
});

test('client validation mirrors the backend codes', () => {
  const base = () => scheduleDraft({
    enabled: true, frequency_days: 1, start_date: null, auto_entity: 'input_boolean.irrigazione_attiva',
    slots: [{ id: 'morning', days: [1, 3, 5], start: '05:30', duration: 30 }],
  });
  assert.deepEqual(validateScheduleDraft(base()), { ok: true, code: null, context: {} });

  const withSlots = (slots, extra = {}) => ({ ...base(), ...extra, slots });
  const expect = (draft, code, context = {}) => assert.deepEqual(validateScheduleDraft(draft), { ok: false, code, context });

  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30 }], { schedule_mode: 'unknown' }), 'invalid_schedule_mode');
  expect(withSlots([{ id: 'a', days: [1], start: '5:30', duration: 30 }]), 'invalid_time');
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 0 }]), 'invalid_duration', { max: MAX_DURATION_MINUTES });
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 1441 }]), 'invalid_duration', { max: MAX_DURATION_MINUTES });
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30.5 }]), 'invalid_duration', { max: MAX_DURATION_MINUTES });
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30, liters: -2 }]), 'invalid_liters');
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30, liters: 'x' }]), 'invalid_liters');
  expect(withSlots([{ id: 'a b', days: [1], start: '05:30', duration: 30 }]), 'invalid_slot_id');
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30 }, { id: 'a', days: [2], start: '06:30', duration: 30 }]), 'duplicate_slot_id', { id: 'a' });
  expect(withSlots([{ id: 'a', days: [], start: '05:30', duration: 30 }]), 'invalid_days');
  expect(withSlots([{ id: 'a', days: [1, 1], start: '05:30', duration: 30 }]), 'duplicate_days');
  expect(withSlots([{ id: 'a', days: [1], start: '05:30' }]), 'invalid_slot_schema');
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30, extra: 1 }]), 'invalid_slot_schema');
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 60 }, { id: 'b', days: [1], start: '06:00', duration: 30 }]), 'slots_overlap', { a: 'a', b: 'b' });
  expect(withSlots([]), 'empty_enabled_program');
  expect(withSlots(Array.from({ length: MAX_SLOTS + 1 }, (_, index) => ({ id: `s${index}`, days: [1], start: '05:30', duration: 1 }))), 'too_many_slots', { max: MAX_SLOTS });
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30 }], { schedule_mode: 'interval', frequency_days: 0 }), 'invalid_frequency', { max: MAX_FREQUENCY_DAYS });
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30 }], { schedule_mode: 'interval', frequency_days: 99 }), 'invalid_frequency', { max: MAX_FREQUENCY_DAYS });
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30 }], { schedule_mode: 'interval', frequency_days: 2, start_date: '' }), 'frequency_needs_anchor');
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30 }], { schedule_mode: 'interval', frequency_days: 2, start_date: '2026-02-30' }), 'invalid_start_date');
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30 }], { auto_entity: 'light.living_room' }), 'invalid_auto_entity');
  expect(withSlots('nope'), 'invalid_slots');
  expect({ ...base(), enabled: 'yes' }, 'invalid_enabled');
  // A window that runs past midnight must also detect the following day.
  expect(withSlots([
    { id: 'a', days: [1], start: '23:30', duration: 90 },
    { id: 'b', days: [2], start: '00:30', duration: 30 },
  ]), 'slots_overlap', { a: 'a', b: 'b' });
  // Empty liters stay accepted and are dropped from the payload.
  assert.deepEqual(validateScheduleDraft(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30, liters: '' }])), { ok: true, code: null, context: {} });
  assert.deepEqual(validateScheduleDraft(withSlots([{ id: 'a', days: [], start: '05:30', duration: 30 }], { schedule_mode: 'interval' })), { ok: true, code: null, context: {} });
  expect(withSlots([{ id: 'a', days: [], start: '05:30', duration: 30 }], { schedule_mode: 'weekdays' }), 'invalid_days');
});

test('service payloads carry exactly what the backend schema accepts', () => {
  const draft = scheduleDraft({
    enabled: true, frequency_days: 3, start_date: '2026-06-01', auto_entity: 'input_boolean.irrigazione_attiva',
    slots: [
      { id: 'morning', days: [1, 3, 5], start: '05:30', duration: 30, liters: 120 },
      { id: 'evening', days: [2, 4], start: '19:00', duration: 45, liters: '' },
    ],
  });
  assert.deepEqual(programPayload('switch.irrigazione', draft), {
    water_entity: 'switch.irrigazione', enabled: true, schedule_mode: 'legacy',
    slots: [
      { id: 'morning', days: [1, 3, 5], start: '05:30', duration: 30, liters: 120 },
      { id: 'evening', days: [2, 4], start: '19:00', duration: 45 },
    ],
    frequency_days: 3, start_date: '2026-06-01', auto_entity: 'input_boolean.irrigazione_attiva',
  });
  const daily = scheduleDraft({ enabled: false, slots: [{ id: 'a', days: [1], start: '05:30', duration: 30 }] });
  const payload = programPayload('switch.irrigazione', daily);
  assert.equal(payload.frequency_days, 1);
  assert.equal(payload.schedule_mode, 'weekdays');
  assert.equal(Object.hasOwn(payload, 'start_date'), false);
  assert.equal(Object.hasOwn(payload, 'auto_entity'), false);
  assert.deepEqual(deleteProgramPayload('switch.irrigazione'), { water_entity: 'switch.irrigazione' });
  assert.deepEqual(actionCall('toggle', 'switch.irrigazione'), { domain: 'switch', service: 'toggle', data: { entity_id: 'switch.irrigazione' } });
  assert.deepEqual(actionCall('more-info', 'switch.irrigazione'), { domain: 'more', service: 'more-info', data: { entity_id: 'switch.irrigazione' } });
  assert.equal(actionCall('none', 'switch.irrigazione'), null);
  assert.deepEqual(toggleAutoCall('input_boolean.irrigazione_attiva'), { domain: 'input_boolean', service: 'toggle', data: { entity_id: 'input_boolean.irrigazione_attiva' } });
});

test('drafts round-trip a stored program without losing fields', () => {
  const program = states['sensor.water_flow_scheduler_programs'].attributes.programs['switch.irrigazione'];
  const draft = scheduleDraft(program);
  assert.equal(draft.enabled, true);
  assert.equal(draft.schedule_mode, 'legacy');
  assert.equal(draft.frequency_days, 2);
  assert.equal(draft.start_date, '2026-05-01');
  assert.equal(draft.auto_entity, 'input_boolean.irrigazione_attiva');
  assert.deepEqual(draft.slots[0], { id: 'morning', days: [1, 3, 5], start: '05:30', duration: 30, liters: '120' });
  assert.equal(validateScheduleDraft(draft).ok, true);
  assert.deepEqual(emptyScheduleDraft().slots.length, 1);
  assert.deepEqual(emptyScheduleDraft().slots[0].days, []);
  assert.equal(scheduleDraft(null).enabled, false);
  // A stored program without a program sensor still produces an editable draft.
  assert.deepEqual(scheduleDraft(undefined).slots[0].days, []);
  assert.equal(scheduleDraft({ enabled: false, slots: [] }).slots.length, 0);
  assert.equal(nextSlotId([{ id: 'window-1' }, { id: 'window-3' }]), 'window-2');
  assert.equal(nextSlotId([{ id: 'weekday_morning' }]), 'window-1');
});

test('frequency rhythm follows the anchor date', () => {
  const anchor = Date.UTC(2026, 4, 1); // 1 May 2026
  assert.equal(frequencyAllows({ frequency_days: 1 }, anchor), true);
  assert.equal(frequencyAllows({ frequency_days: 2, start_date: '2026-05-01' }, anchor), true);
  assert.equal(frequencyAllows({ frequency_days: 2, start_date: '2026-05-01' }, anchor + 86400000), false);
  assert.equal(frequencyAllows({ frequency_days: 7, start_date: '2026-05-01' }, anchor + 6 * 86400000), false);
  assert.equal(frequencyAllows({ frequency_days: 7, start_date: '2026-05-01' }, anchor + 7 * 86400000), true);
  assert.equal(frequencyAllows({ frequency_days: 2 }, anchor), false);
  assert.equal(frequencyAllows({ frequency_days: 2, start_date: 'not-a-date' }, anchor), false);
  assert.equal(frequencyAllows(null, anchor), true);
});

test('schedule date and clock formatting use the Home Assistant timezone', () => {
  const instant = new Date('2026-03-29T23:30:00.000Z');
  assert.equal(localDateString(instant, 'Europe/Rome'), '2026-03-30');
  assert.equal(timestampClock('2026-06-01T04:30:00.000Z', 'en-GB', 'Europe/Rome'), '06:30');
});

test('card schedule status and next time come from the backend in its timezone', () => {
  const storedSensor = states['sensor.water_flow_scheduler_programs'];
  const storedProgram = storedSensor.attributes.programs['switch.irrigazione'];
  const program = {
    ...storedProgram,
    active_slot_id: 'morning',
    next_change: '2026-06-01T04:30:00.000Z',
    frequency_ok: true,
  };
  const card = configuredCard({ ...defaultCardConfig('switch.irrigazione'), language: 'en' });
  card._hass = fakeHass({
    config: { time_zone: 'Europe/Rome' },
    locale: { language: 'en-US' },
    states: {
      ...states,
      'sensor.water_flow_scheduler_programs': {
        ...storedSensor,
        attributes: { ...storedSensor.attributes, programs: { 'switch.irrigazione': program } },
      },
    },
  });
  const html = card._cardMarkup();
  assert.match(html, /Next: 06:30/);
  assert.match(html, /Windows: Window 1/);
});

test('interval mode ignores weekdays and lets eligible windows finish after midnight', () => {
  const program = {
    enabled: true, schedule_mode: 'interval', frequency_days: 2, start_date: '2026-05-04',
    slots: [{ id: 'cycle', days: [], start: '23:00', duration: 120 }],
  };
  const at = (year, month, day, hour, minute) => new Date(year, month, day, hour, minute).getTime();
  assert.equal(activeProgram(program, at(2026, 4, 4, 23, 30)).slotId, 'cycle');
  assert.equal(activeProgram(program, at(2026, 4, 5, 0, 30)).slotId, 'cycle');
  assert.equal(activeProgram(program, at(2026, 4, 5, 1, 0)).slotId, null);
  assert.equal(activeProgram(program, at(2026, 4, 5, 23, 30)).slotId, null);
  assert.equal(activeProgram(program, at(2026, 4, 6, 23, 30)).slotId, 'cycle');
});

test('frequency-aware status and forecast skip off-cycle windows', () => {
  const slots = [
    { id: 'tuesday', days: [2], start: '05:00', duration: 30 },
    { id: 'wednesday', days: [3], start: '05:00', duration: 30 },
  ];
  const program = { enabled: true, frequency_days: 2, start_date: '2026-05-04', slots };
  const monday = new Date(2026, 4, 4, 6, 0).getTime();
  const tuesday = new Date(2026, 4, 5, 5, 15).getTime();
  assert.equal(activeProgram(program, tuesday).running, false);
  assert.equal(activeProgram(program, tuesday).slotId, null);
  assert.equal(new Date(nextWindowMs(slots, monday, program)).getTime(), new Date(2026, 4, 6, 5, 0).getTime());
});

test('duration and liters steppers clamp and preserve optional liters', () => {
  assert.equal(stepScheduleValue(30, 'duration', 1), 31);
  assert.equal(stepScheduleValue(30.5, 'duration', 1), 31);
  assert.equal(stepScheduleValue(1, 'duration', -1), 1);
  assert.equal(stepScheduleValue(MAX_DURATION_MINUTES, 'duration', 1), MAX_DURATION_MINUTES);
  assert.equal(stepScheduleValue('120.5', 'liters', 1), '121.5');
  assert.equal(stepScheduleValue('1', 'liters', -1), '');
  assert.equal(stepScheduleValue('', 'liters', 1), '1');
  assert.equal(stepScheduleValue('4', 'other', 1), '4');
});

test('active window detection covers normal and past-midnight windows', () => {
  assert.equal(timeMinutes('05:30'), 330);
  assert.equal(timeMinutes('23:59'), 1439);
  assert.equal(timeMinutes('24:00'), null);
  assert.equal(timeMinutes(530), null);
  const slots = [
    { id: 'morning', days: [1, 3, 5], start: '05:30', duration: 30 },
    { id: 'overnight', days: [7], start: '23:00', duration: 180 },
  ];
  assert.equal(activeSlotFor(slots, 1, 330)?.id, 'morning');
  assert.equal(activeSlotFor(slots, 1, 360), null); // ends at 06:00
  assert.equal(activeSlotFor(slots, 2, 340), null); // not on Tuesday
  assert.equal(activeSlotFor(slots, 7, 1400)?.id, 'overnight');
  // Sunday 23:00 + 3h still waters on Monday at 00:30.
  assert.equal(activeSlotFor(slots, 1, 30)?.id, 'overnight');
  assert.equal(activeSlotFor(slots, 2, 30), null);
  assert.equal(activeSlotFor([], 1, 30), null);

  const daily = { enabled: true, slots };
  const now = new Date(2026, 4, 4, 5, 45).getTime(); // Monday 04 May, 05:45
  const running = activeProgram(daily, now);
  assert.equal(running.running, true);
  assert.equal(running.slotId, 'morning');
  assert.equal(running.enabled, true);
  assert.equal(running.frequencyOk, true);
  const idle = activeProgram(daily, new Date(2026, 4, 4, 12, 0).getTime());
  assert.equal(idle.running, false);
  assert.equal(idle.slotId, null);
  assert.ok(idle.nextChangeMs > now);
  const disabled = activeProgram({ enabled: false, slots }, now);
  assert.equal(disabled.running, false);
  assert.equal(disabled.frequencyOk, false);
  const blocked = activeProgram({ enabled: true, frequency_days: 2, start_date: '2026-05-05', slots }, now);
  assert.equal(blocked.frequencyOk, false);
  assert.equal(blocked.running, false);
  assert.equal(activeProgram(null, now).running, false);
  assert.equal(nextWindowMs([], now), null);
  assert.ok(nextWindowMs(slots, now) > now);
});

test('status strings and readouts stay readable in both languages', () => {
  assert.equal(pumpStateLabel('on', cardStrings('it')), 'In irrigazione');
  assert.equal(pumpStateLabel('off', cardStrings('en')), 'Off');
  assert.equal(pumpStateLabel('unavailable', cardStrings('it')), 'Non disponibile');
  assert.equal(pumpStateLabel(undefined, cardStrings('en')), 'Unavailable');
  assert.equal(cardTitle({ entity: 'switch.irrigazione' }, fakeHass()), 'Irrigazione');
  assert.equal(cardTitle({ entity: 'switch.irrigazione', name: 'Giardino' }, fakeHass()), 'Giardino');
  assert.equal(cardTitle({ entity: 'switch.x' }, fakeHass({ states: {} })), 'switch.x');
  assert.equal(chipValue(states['sensor.portata_irrigazione'], 'it-IT'), '12,5 L/min');
  assert.equal(chipValue({ state: 'unavailable', attributes: {} }, 'it-IT'), null);
  assert.equal(chipValue({ state: '12.5', attributes: {} }, 'it-IT'), '12,5');
  assert.equal(formatNumber('bad', 'it-IT'), null);
  assert.equal(numeric('unknown'), null);
  assert.equal(formatDuration(90, cardStrings('en')), '1 h 30 min');
  assert.equal(formatDuration(45, cardStrings('en')), '45 min');
  assert.equal(formatDuration(120, cardStrings('en')), '2 h');
  assert.equal(formatDuration(null, cardStrings('en')), 'none');
  assert.equal(sessionMinutes(Date.now() + 5 * 60000, Date.now()), 5);
  assert.equal(sessionMinutes(Date.now(), null), null);
  assert.equal(sessionMinutes(null, Date.now()), null);
});

test('program sensor discovery prefers the explicit entity and falls back to the marker', () => {
  const hass = fakeHass();
  assert.equal(programSensor(hass, {}), states['sensor.water_flow_scheduler_programs']);
  assert.equal(programSensor(hass, { program_entity: 'sensor.other' }), null);
  assert.equal(programSensor(hass, { program_entity: 'sensor.water_flow_scheduler_programs' }).state, 'ready');
  assert.equal(programSensor(null, {}), null);
  assert.equal(programSensor({ states: { 'sensor.x': { state: 'ok', attributes: {} } } }, {}), null);
  const program = programOf(hass, { entity: 'switch.irrigazione' });
  assert.equal(program.enabled, true);
  assert.equal(programOf(hass, { entity: 'switch.altro' }), null);
});

test('readout sensors are detected from measurement type and matched to the pump when needed', () => {
  const hass = fakeHass({ states: {
    'switch.irrigazione': states['switch.irrigazione'],
    'sensor.portata_irrigazione': states['sensor.portata_irrigazione'],
    'sensor.volume_irrigazione': states['sensor.volume_irrigazione'],
    'sensor.batteria_irrigazione': states['sensor.batteria_irrigazione'],
  } });
  assert.equal(discoverSensorEntity(hass, 'switch.irrigazione', 'flow'), 'sensor.portata_irrigazione');
  assert.equal(discoverSensorEntity(hass, 'switch.irrigazione', 'volume'), 'sensor.volume_irrigazione');
  assert.equal(discoverSensorEntity(hass, 'switch.irrigazione', 'battery'), 'sensor.batteria_irrigazione');

  const multipleBatteries = fakeHass({ states: {
    'switch.pompa_serra': { state: 'off', attributes: { friendly_name: 'Serra pompa' } },
    'sensor.batteria_serra': { state: '80', attributes: { device_class: 'battery', unit_of_measurement: '%' } },
    'sensor.batteria_soggiorno': { state: '60', attributes: { device_class: 'battery', unit_of_measurement: '%' } },
  } });
  assert.equal(discoverSensorEntity(multipleBatteries, 'switch.pompa_serra', 'battery'), 'sensor.batteria_serra');
  assert.equal(discoverSensorEntity(multipleBatteries, 'switch.altro', 'battery'), null);
});

test('card markup renders state, readouts and optional valve feedback control', () => {
  assert.match(cardSource(), /\.battery-button:hover\{background:var\(--water-flow-accent-color\)/);
  assert.match(cardSource(), /\.battery-button:active\{transform:scale/);
  const card = configuredCard({
    ...defaultCardConfig('switch.irrigazione'),
    flow_entity: 'sensor.irrigazione_flow',
    volume_entity: 'sensor.volume_irrigazione',
    battery_entity: 'sensor.batteria_irrigazione',
    work_state_entity: 'binary_sensor.irrigazione_valve_work_state',
    device_status_entity: 'sensor.irrigazione_current_device_status',
    irrigation_mode_entity: 'sensor.irrigazione_cyclic_quantitative_irrigation',
    timed_irrigation_entity: 'sensor.irrigazione_cyclic_timed_irrigation',
    daily_volume_entity: 'sensor.irrigazione_daily_irrigation_volume',
    real_time_volume_entity: 'sensor.irrigazione_real_time_irrigation_volume',
    real_time_duration_entity: 'sensor.irrigazione_real_time_irrigation_duration',
    irrigation_start_time_entity: 'sensor.irrigazione_irrigation_start_time',
    irrigation_end_time_entity: 'sensor.irrigazione_irrigation_end_time',
    shortage_protection_entity: 'switch.irrigazione_auto_close_when_water_shortage',
    auto_entity: 'input_boolean.irrigazione_attiva',
  });
  card._hass = fakeHass();
  const html = card._cardMarkup();
  assert.match(html, /Irrigazione/);
  assert.match(html, /In irrigazione/);
  assert.match(html, /Portata 0 m³\/h/);
  assert.match(html, /Volume 3,2 m³/);
  assert.match(html, /data-act="battery" aria-label="Batteria 87 %"/);
  assert.match(html, /icon="mdi:battery"><\/ha-icon><span class="battery-value">87 %/);
  assert.match(html, /data-act="auto"/);
  assert.match(html, /data-act="work-toggle" data-active="false" aria-pressed="false"/);
  assert.match(html, /aria-label="Valvola spenta\. Tocca per attivarla\."/);
  assert.match(html, /Valvola · Spenta/);
  assert.match(html, /Stato dispositivo · Normale/);
  assert.match(html, /Modalità · irrigazione/);
  assert.match(html, /Ciclo temporizzato · irrigazione/);
  assert.match(html, /Oggi · 5 L/);
  assert.match(html, /Volume attuale · 3745 L/);
  assert.match(html, /Durata · 15 s/);
  assert.match(html, /class="irrigation-start-chip">Inizio · /);
  assert.match(html, /class="irrigation-end-chip">Fine · /);
  assert.match(html, /data-act="shortage-protection" data-active="true" aria-pressed="true"/);
  assert.match(html, /Protezione acqua · Attiva/);
  assert.match(html, /data-act="schedule" data-active="true" data-focus="slots"/);
  assert.match(html, /data-act="schedule" data-active="true" data-focus="frequency"/);
  assert.match(html, /class="round" type="button" data-act="schedule" data-active="true"/);
  assert.match(html, /Ogni 2 giorni/);
  assert.match(html, /data-running="true"/);
  assert.match(html, /class="state-chip live" data-state="on">In irrigazione/);
  assert.match(html, /aria-label="Irrigazione · In irrigazione"/);
  assert.match(html, /role="button" tabindex="0" data-act="card"/);
  assert.match(html, /data-act="schedule" data-active="true" data-focus="slots" aria-label=/);
  assert.match(html, /class="row-content"[^]*<\/div>\s*<div class="side">/);
  assert.match(html, /mdi:water-pump/);
  // The card never injects unescaped entity names.
  assert.ok(!html.includes('<script'));
  const english = configuredCard({ ...defaultCardConfig('switch.irrigazione'), language: 'en', show_flow_chip: false, show_volume_chip: false, show_next_change_chip: false, show_auto_button: false });
  english._hass = fakeHass({ locale: { language: 'en-US' } });
  const englishHtml = english._cardMarkup();
  assert.match(englishHtml, /Watering/);
  assert.ok(!englishHtml.includes('data-act="auto"'));
  assert.ok(!englishHtml.includes('Ogni'));

  const off = configuredCard(defaultCardConfig('switch.irrigazione'));
  off._hass = fakeHass({ states: { ...states, 'switch.irrigazione': { ...states['switch.irrigazione'], state: 'off' } } });
  const offHtml = off._cardMarkup();
  assert.match(offHtml, /data-running="false"/);
  assert.match(offHtml, /class="state-chip" data-state="off">Spenta/);
  assert.match(offHtml, /aria-label="Irrigazione · Spenta"/);
  const disabledSchedule = configuredCard(defaultCardConfig('switch.irrigazione'));
  disabledSchedule._hass = fakeHass({ states: {
    ...states,
    'sensor.water_flow_scheduler_programs': {
      ...states['sensor.water_flow_scheduler_programs'],
      attributes: {
        ...states['sensor.water_flow_scheduler_programs'].attributes,
        programs: { 'switch.irrigazione': { ...states['sensor.water_flow_scheduler_programs'].attributes.programs['switch.irrigazione'], enabled: false } },
      },
    },
  } });
  assert.match(disabledSchedule._cardMarkup(), /data-act="schedule" data-active="false"/);
  assert.match(cardSource(), /ha-card\[data-running="true"\]\{--water-flow-accent-color:var\(--state-switch-on-color,var\(--primary-color\)\)\}/);
  assert.match(cardSource(), /ha-card\[data-running="true"\] \.icon\{background:var\(--water-flow-accent-color\)/);
  assert.match(cardSource(), /ha-card\[data-running="true"\]:not\(\[data-surface="blend"\]\).*background-color:color-mix/);
  assert.match(cardSource(), /ha-card\[data-running="true"\]\[data-surface="blend"\].*box-shadow:inset/);
  assert.match(cardSource(), /ha-card:not\(\[data-surface="blend"\]\):hover\{background-color:color-mix\(in srgb,var\(--water-flow-accent-color\) 5%/);
  assert.match(cardSource(), /ha-card\[data-surface="blend"\]:hover\{background-color:color-mix\(in srgb,var\(--water-flow-accent-color\) 5%,transparent\)\}/);
  assert.match(cardSource(), /ha-card:not\(\[data-surface="blend"\]\)\.card-press-feedback\{background-color:color-mix\(in srgb,var\(--water-flow-accent-color\) 9%/);
  assert.match(cardSource(), /ha-card\[data-surface="blend"\]\.card-press-feedback\{background-color:color-mix\(in srgb,var\(--water-flow-accent-color\) 9%,transparent\)\}/);
  assert.match(cardSource(), /\.sub\[data-act="schedule"\]\[data-active="true"\],\.round\[data-active="true"\]\{background:var\(--water-flow-accent-color\);border-color:var\(--water-flow-accent-color\);color:var\(--text-primary-color,#fff\)\}/);
  const customAccent = configuredCard({ ...defaultCardConfig('switch.irrigazione'), accent_color: '#ff8800' });
  customAccent._hass = fakeHass();
  assert.match(customAccent._cardMarkup(), /style="--water-flow-accent-color:#ff8800;"/);
  const noBatteryButton = configuredCard({ ...defaultCardConfig('switch.irrigazione'), battery_entity: 'sensor.batteria_irrigazione', show_battery_button: false });
  noBatteryButton._hass = fakeHass();
  assert.ok(!noBatteryButton._cardMarkup().includes('data-act="battery"'));
  const noWorkStateButton = configuredCard({ ...defaultCardConfig('switch.irrigazione'), work_state_entity: 'binary_sensor.irrigazione_valve_work_state', show_work_state_button: false });
  noWorkStateButton._hass = fakeHass();
  assert.ok(!noWorkStateButton._cardMarkup().includes('data-act="work-toggle"'));
  const noModeChip = configuredCard({ ...defaultCardConfig('switch.irrigazione'), irrigation_mode_entity: 'sensor.irrigazione_cyclic_quantitative_irrigation', show_irrigation_mode_chip: false });
  noModeChip._hass = fakeHass();
  assert.ok(!noModeChip._cardMarkup().includes('class="irrigation-mode-chip"'));
  const noTimedChip = configuredCard({ ...defaultCardConfig('switch.irrigazione'), timed_irrigation_entity: 'sensor.irrigazione_cyclic_timed_irrigation', show_timed_irrigation_chip: false });
  noTimedChip._hass = fakeHass();
  assert.ok(!noTimedChip._cardMarkup().includes('class="timed-irrigation-chip"'));
  const noProtectionButton = configuredCard({ ...defaultCardConfig('switch.irrigazione'), shortage_protection_entity: 'switch.irrigazione_auto_close_when_water_shortage', show_shortage_protection_button: false });
  noProtectionButton._hass = fakeHass();
  assert.ok(!noProtectionButton._cardMarkup().includes('data-act="shortage-protection"'));
});

test('card surface press feedback responds to primary pointer and click and survives rerender', () => {
  const card = configuredCard(defaultCardConfig('switch.irrigazione'));
  const createSurface = () => {
    const listeners = {};
    const classes = new Set();
    return {
      listeners,
      classes,
      classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) },
      addEventListener: (name, callback) => { listeners[name] = callback; },
    };
  };
  let surface = createSurface();
  card.shadowRoot = { querySelector: () => surface };
  card._bindCardSurfaceFeedback(surface);
  surface.listeners.pointerdown({ button: 2 });
  assert.equal(card._cardPressFeedback, undefined, 'non-primary pointer presses are ignored');
  surface.listeners.pointerdown({ button: 0 });
  assert.ok(surface.classes.has('card-press-feedback'));

  const rerenderedSurface = createSurface();
  surface = rerenderedSurface;
  card._bindCardSurfaceFeedback(surface);
  assert.ok(surface.classes.has('card-press-feedback'), 'feedback is restored on the replacement card surface');
  surface.listeners.click();
  assert.ok(surface.classes.has('card-press-feedback'), 'click keeps the pressed tint visible');
  card.disconnectedCallback();
  assert.equal(card._cardPressFeedback, false, 'disconnect clears the feedback timer and state');
  assert.ok(!surface.classes.has('card-press-feedback'), 'disconnect clears the pressed visual state');
});

test('valve feedback button toggles the configured switch and follows sensor updates', async () => {
  const calls = [];
  const config = {
    ...defaultCardConfig('switch.irrigazione'),
    work_state_entity: 'binary_sensor.irrigazione_valve_work_state',
    device_status_entity: 'sensor.irrigazione_current_device_status',
    irrigation_mode_entity: 'sensor.irrigazione_cyclic_quantitative_irrigation',
    timed_irrigation_entity: 'sensor.irrigazione_cyclic_timed_irrigation',
    shortage_protection_entity: 'switch.irrigazione_auto_close_when_water_shortage',
  };
  const card = configuredCard(config);
  card._hass = fakeHass({ callService: async (...args) => calls.push(args) });
  const before = card._renderKey();
  card._hass = fakeHass({
    states: {
      ...states,
      'binary_sensor.irrigazione_valve_work_state': { state: 'on', attributes: {} },
      'sensor.irrigazione_current_device_status': { state: 'flow_alarm', attributes: {} },
      'sensor.irrigazione_cyclic_quantitative_irrigation': { state: 'manual_mode', attributes: {} },
      'sensor.irrigazione_cyclic_timed_irrigation': { state: 'timer_running', attributes: {} },
      'switch.irrigazione_auto_close_when_water_shortage': { state: 'off', attributes: {} },
    },
    callService: async (...args) => calls.push(args),
  });
  assert.notEqual(card._renderKey(), before);
  assert.match(card._cardMarkup(), /data-act="work-toggle" data-active="true" aria-pressed="true"/);
  assert.match(card._cardMarkup(), /Stato dispositivo · flow_alarm/);
  assert.match(card._cardMarkup(), /Modalità · manual_mode/);
  assert.match(card._cardMarkup(), /Ciclo temporizzato · timer_running/);
  assert.match(card._cardMarkup(), /Protezione acqua · Disattiva/);
  await card._toggleWorkState();
  await card._toggleShortageProtection();
  assert.deepEqual(calls, [
    ['switch', 'toggle', { entity_id: 'switch.irrigazione' }],
    ['switch', 'toggle', { entity_id: 'switch.irrigazione_auto_close_when_water_shortage' }],
  ]);
});

test('battery button opens the configured sensor details and follows sensor updates', async () => {
  const calls = [];
  const card = configuredCard({ ...defaultCardConfig('switch.irrigazione'), battery_entity: 'sensor.batteria_irrigazione' });
  card._hass = fakeHass({ callService: async (...args) => calls.push(args) });
  const events = [];
  card.dispatchEvent = (event) => { events.push(event); return true; };
  const before = card._renderKey();
  card._hass = fakeHass({
    states: { ...states, 'sensor.batteria_irrigazione': { state: '42', attributes: { unit_of_measurement: '%' } } },
    callService: async (...args) => calls.push(args),
  });
  assert.notEqual(card._renderKey(), before);
  await card._batteryAction();
  assert.deepEqual(calls, []);
  assert.equal(events[0].type, 'hass-more-info');
  assert.deepEqual(events[0].detail, { entityId: 'sensor.batteria_irrigazione' });
  assert.equal(events[0].bubbles, true);
  assert.equal(events[0].composed, true);

  const autoEvents = [];
  const autoDetectedCard = configuredCard(defaultCardConfig('switch.irrigazione'));
  autoDetectedCard._hass = fakeHass();
  autoDetectedCard.dispatchEvent = (event) => { autoEvents.push(event); return true; };
  await autoDetectedCard._batteryAction();
  assert.equal(autoEvents[0].detail.entityId, 'sensor.batteria_irrigazione');
});

test('battery sensor without a unit still displays its percentage', () => {
  const card = configuredCard({ ...defaultCardConfig('switch.irrigazione'), battery_entity: 'sensor.irrigazione_battery' });
  card._hass = fakeHass({ states: {
    ...states,
    'sensor.irrigazione_battery': { state: '100', attributes: { device_class: 'battery' } },
  } });
  const html = card._cardMarkup();
  assert.match(html, /aria-label="Batteria 100 %"/);
  assert.match(html, /<span class="battery-value">100 %<\/span>/);
});

test('card rerenders when Home Assistant states arrive and change after configuration', () => {
  const card = new WaterFlowCard();
  const root = {
    innerHTML: '',
    __bound: false,
    addEventListener() {},
    querySelector(selector) {
      return selector === 'ha-card' && this.innerHTML.includes('<ha-card') ? {} : null;
    },
  };
  card.shadowRoot = root;
  card.attachShadow = () => {};
  card.setConfig({ ...defaultCardConfig('switch.irrigazione'), battery_entity: 'sensor.irrigazione_battery' });

  card.hass = fakeHass({ states: {
    ...states,
    'sensor.irrigazione_battery': { state: '100', attributes: { unit_of_measurement: '%', device_class: 'battery' } },
  } });
  assert.match(root.innerHTML, /class="state-chip live" data-state="on">In irrigazione/);
  assert.match(root.innerHTML, /<span class="battery-value">100 %<\/span>/);

  card.hass = fakeHass({ states: {
    ...states,
    'switch.irrigazione': { state: 'off', attributes: { friendly_name: 'Irrigazione' } },
    'sensor.irrigazione_battery': { state: '42', attributes: { unit_of_measurement: '%', device_class: 'battery' } },
  } });
  assert.match(root.innerHTML, /class="state-chip" data-state="off">Spenta/);
  assert.match(root.innerHTML, /<span class="battery-value">42 %<\/span>/);
});

test('more-info card action uses the Home Assistant event instead of a service call', () => {
  const calls = [];
  const events = [];
  const card = configuredCard({ ...defaultCardConfig('switch.irrigazione'), tap_action: 'more-info' });
  card._hass = fakeHass({ callService: async (...args) => calls.push(args) });
  card.dispatchEvent = (event) => { events.push(event); return true; };
  card._cardAction();
  assert.deepEqual(calls, []);
  assert.equal(events[0].type, 'hass-more-info');
  assert.deepEqual(events[0].detail, { entityId: 'switch.irrigazione' });
});

test('schedule duration and liters use visible, localized accessible steppers', () => {
  const card = configuredCard(defaultCardConfig('switch.irrigazione'));
  card._hass = fakeHass();
  card._draft = scheduleDraft({ slots: [{ id: 'morning', days: [1], start: '05:30', duration: 30, liters: '120' }] });
  const english = card._slotMarkup(card._draft.slots[0], 0, cardStrings('en'));
  assert.match(english, /class="days" role="group"[^]*data-act="toggle-day"[^]*aria-pressed="true"/);
  assert.doesNotMatch(cardSource(), /week-overview|focus-day|_focusScheduleDay/);
  assert.match(english, /data-slot-field="duration" data-direction="1" aria-label="Increase Duration \(minutes\) for window 1"/);
  assert.match(english, /data-slot-field="liters" data-direction="-1" aria-label="Decrease Liters for window 1"/);
  assert.match(english, /aria-controls="wf-slot-0-duration"/);
  assert.match(english, /aria-controls="wf-slot-0-liters"/);
  const italian = card._slotMarkup(card._draft.slots[0], 0, cardStrings('it'));
  assert.match(italian, /Aumenta Durata \(minuti\) per la fascia 1/);
  assert.match(italian, /Riduci Litri per la fascia 1/);
});

test('anchor date input stays synchronized when frequency clears its draft value', () => {
  const card = configuredCard(defaultCardConfig('switch.irrigazione'));
  card._draft = scheduleDraft({
    enabled: false,
    schedule_mode: 'interval',
    frequency_days: 2,
    start_date: '2026-06-01',
    slots: [],
  });
  const anchor = { value: '2026-06-01' };
  card._dialog = { querySelector: (selector) => selector === '[data-field="start_date"]' ? anchor : null };
  card._clearDialogValidation = () => {};
  card._renderDialogState = () => {};

  const frequency = { dataset: { field: 'frequency_days' }, value: '1' };
  card._dialogInput(frequency);
  assert.equal(card._draft.start_date, '');
  assert.equal(anchor.value, '');
  frequency.value = '2';
  card._dialogInput(frequency);
  assert.equal(card._draft.start_date, '');
  assert.equal(anchor.value, '');
  assert.equal(validateScheduleDraft(card._draft).code, 'frequency_needs_anchor');
});

test('frequency stepper clamps to 1–31 days and localizes unit and accessible labels', () => {
  const card = configuredCard(defaultCardConfig('switch.irrigazione'));
  card._hass = fakeHass();
  card._draft = scheduleDraft({ schedule_mode: 'interval', frequency_days: 1, start_date: '2026-06-01', slots: [] });
  const frequency = { dataset: { field: 'frequency_days' }, value: '1', focus() {} };
  card._dialog = { querySelector: (selector) => selector === '[data-field="frequency_days"]' ? frequency : null };
  card._clearDialogValidation = () => {};
  card._renderDialogState = () => {};

  card._dialogAction('step-frequency', { dataset: { direction: '-1' } });
  assert.equal(card._draft.frequency_days, 1);
  card._dialogAction('step-frequency', { dataset: { direction: '1' } });
  assert.equal(card._draft.frequency_days, 2);
  card._draft.frequency_days = MAX_FREQUENCY_DAYS;
  frequency.value = String(MAX_FREQUENCY_DAYS);
  card._dialogAction('step-frequency', { dataset: { direction: '1' } });
  assert.equal(card._draft.frequency_days, MAX_FREQUENCY_DAYS);

  assert.equal(cardStrings('en').frequencyUnit(1), 'day');
  assert.equal(cardStrings('en').frequencyUnit(2), 'days');
  assert.equal(cardStrings('it').frequencyUnit(1), 'giorno');
  assert.equal(cardStrings('it').frequencyUnit(2), 'giorni');
  assert.equal(cardStrings('en').increaseFrequency, 'Increase interval by one day');
  assert.equal(cardStrings('it').decreaseFrequency, 'Riduci l’intervallo di un giorno');
  assert.equal(cardStrings('en').pumpSelectorLabel, 'Pump connection');
  assert.equal(cardStrings('it').pumpSelectorLabel, 'Collegamento pompa');
  assert.equal(cardStrings('en').pumpPlaceholder, 'Choose the switch that controls the pump');
  assert.equal(cardStrings('it').pumpPlaceholder, 'Scegli lo switch che controlla la pompa');
});

test('schedule dialog renders the localized bounded frequency stepper', () => {
  const config = { ...defaultCardConfig('switch.irrigazione'), language: 'it' };
  const card = configuredCard(config);
  card._hass = fakeHass();
  card._draft = scheduleDraft({ schedule_mode: 'interval', frequency_days: 2, start_date: '2026-06-01', slots: [] });
  card._renderDialogState = () => {};
  card._dialog = {
    setAttribute() {},
    querySelector: () => null,
  };

  card._fillDialog();

  assert.match(card._dialog.innerHTML, /class="frequency-control"/);
  assert.match(card._dialog.innerHTML, /class="frequency-stepper"/);
  assert.match(card._dialog.innerHTML, /data-act="step-frequency" data-direction="-1" aria-label="Riduci l’intervallo di un giorno"[^]*icon="mdi:chevron-down"/);
  assert.match(card._dialog.innerHTML, /data-act="step-frequency" data-direction="1" aria-label="Aumenta l’intervallo di un giorno"[^]*icon="mdi:chevron-up"/);
  assert.match(card._dialog.innerHTML, /id="wf-frequency" type="number" min="1" max="31" step="1"/);
  assert.match(card._dialog.innerHTML, /class="frequency-unit" data-role="frequency-unit">giorni/);
  assert.match(cardSource(), /\.frequency-control \.input\.num\{[^}]*appearance:textfield;-moz-appearance:textfield;-webkit-appearance:none/);
  assert.match(cardSource(), /frequency-control input\[type="number"\]::-webkit-inner-spin-button[^}]*display:none/);
});

test('frequency unit and stepper disabled states follow the selected bounds', () => {
  const card = configuredCard({ ...defaultCardConfig('switch.irrigazione'), language: 'it' });
  card._hass = fakeHass();
  card._draft = scheduleDraft({ schedule_mode: 'interval', frequency_days: 1, start_date: '2026-06-01', slots: [] });
  card._isScheduleDraftDirty = () => false;
  const unit = { textContent: '' };
  const decrease = { disabled: false };
  const increase = { disabled: false };
  const controls = new Map([
    ['[data-role="frequency-unit"]', unit],
    ['[data-act="step-frequency"][data-direction="-1"]', decrease],
    ['[data-act="step-frequency"][data-direction="1"]', increase],
  ]);
  card._dialog = {
    querySelector: (selector) => controls.get(selector) || null,
    querySelectorAll: () => [],
    removeAttribute() {},
  };

  card._renderDialogState();
  assert.equal(unit.textContent, 'giorno');
  assert.equal(decrease.disabled, true);
  assert.equal(increase.disabled, false);

  card._draft.frequency_days = MAX_FREQUENCY_DAYS;
  card._renderDialogState();
  assert.equal(unit.textContent, 'giorni');
  assert.equal(decrease.disabled, false);
  assert.equal(increase.disabled, true);
});

test('closing the schedule dialog immediately refreshes the card from current hass state', () => {
  const card = configuredCard(defaultCardConfig('switch.irrigazione'));
  let refreshes = 0;
  card._lastRenderKey = 'stale';
  card._renderIfChanged = () => { refreshes += 1; };
  card._onDialogClose();
  assert.equal(card._lastRenderKey, null);
  assert.equal(refreshes, 1);
});

test('card keyboard action is isolated from sibling schedule controls', () => {
  const card = configuredCard(defaultCardConfig('switch.irrigazione'));
  const listeners = {};
  card.shadowRoot = { addEventListener: (name, callback) => { listeners[name] = callback; } };
  let actions = 0;
  let schedules = 0;
  card._cardAction = () => { actions += 1; };
  card.openSchedule = () => { schedules += 1; };
  card._bindCardEvents();

  const scheduleButton = {
    dataset: { act: 'schedule', focus: 'slots' },
    closest: (selector) => selector === '[data-act]' ? scheduleButton : null,
  };
  listeners.click({ target: scheduleButton });
  let prevented = false;
  listeners.keydown({
    key: 'Enter', target: scheduleButton,
    preventDefault: () => { prevented = true; },
  });
  assert.equal(schedules, 1);
  assert.equal(actions, 0);
  assert.equal(prevented, false);

  const cardButton = {
    dataset: { act: 'card' },
    closest: (selector) => selector === '[data-act="card"]' ? cardButton : null,
  };
  listeners.keydown({ key: ' ', target: cardButton, preventDefault: () => { prevented = true; } });
  assert.equal(actions, 1);
  assert.equal(prevented, true);
});

test('unavailable badge follows its own option and never hides the state line', () => {
  const withBadge = configuredCard({ ...defaultCardConfig('switch.irrigazione') });
  withBadge._hass = fakeHass({
    states: { ...states, 'switch.irrigazione': { state: 'unavailable', attributes: {} } },
  });
  const badgeHtml = withBadge._cardMarkup();
  assert.match(badgeHtml, /mdi:alert-outline/);
  assert.match(badgeHtml, /Non disponibile/);
  const withoutBadge = configuredCard({ ...defaultCardConfig('switch.irrigazione'), show_unavailable_badge: false, show_state_chip: false });
  withoutBadge._hass = withBadge._hass;
  const hidden = withoutBadge._cardMarkup();
  assert.ok(!hidden.includes('mdi:alert-outline'));
  assert.ok(!hidden.includes('Non disponibile'));
});

test('hass arriving before setConfig never renders an unconfigured card', () => {
  const card = new WaterFlowCard();
  assert.doesNotThrow(() => { card.hass = fakeHass(); });
  assert.equal(typeof card._renderKey(), 'string');
  assert.equal(card.getCardSize(), 3);
  assert.doesNotThrow(() => card.setConfig(defaultCardConfig('switch.irrigazione')));
  // Once configured, the same state key repaints the card.
  card._hass = fakeHass();
  assert.doesNotThrow(() => card._renderIfChanged());
});

test('card markup surfaces the backend last_error with a localized message', () => {
  const hass = fakeHass();
  const programs = hass.states['sensor.water_flow_scheduler_programs'].attributes.programs;
  programs['switch.irrigazione'] = {
    ...programs['switch.irrigazione'],
    last_error: { code: 'slots_overlap', context: { a: 'morning', b: 'evening' }, message: 'overlap' },
  };
  const card = configuredCard(defaultCardConfig('switch.irrigazione'));
  card._hass = hass;
  assert.match(card._cardMarkup(), /Le finestre morning e evening si sovrappongono\./);
  programs['switch.irrigazione'].last_error = { code: 'brand_new_code', context: {}, message: 'raw failure' };
  assert.match(card._cardMarkup(), /raw failure/);
});

test('manual service failures render an accessible card error without a prior backend error', async () => {
  const card = configuredCard(defaultCardConfig('switch.irrigazione'));
  card._hass = fakeHass({ callService: async () => { throw new Error('pump command failed'); } });
  await card._service('switch', 'turn_on', { entity_id: 'switch.irrigazione' });
  assert.match(card._cardMarkup(), /role="alert">Servizio non riuscito: pump command failed/);
});

test('session duration uses last_changed and advances on its ticker', () => {
  const previous = {
    window: Object.getOwnPropertyDescriptor(globalThis, 'window'),
    setInterval: Object.getOwnPropertyDescriptor(globalThis, 'setInterval'),
    clearInterval: Object.getOwnPropertyDescriptor(globalThis, 'clearInterval'),
    now: Object.getOwnPropertyDescriptor(Date, 'now'),
  };
  let now = 1_120_000;
  let tick;
  let intervalMs;
  let cleared;
  Object.defineProperty(globalThis, 'window', { value: {}, configurable: true });
  Object.defineProperty(globalThis, 'setInterval', { value: (callback, ms) => { tick = callback; intervalMs = ms; return 17; }, configurable: true });
  Object.defineProperty(globalThis, 'clearInterval', { value: (id) => { cleared = id; }, configurable: true });
  Object.defineProperty(Date, 'now', { value: () => now, configurable: true });
  try {
    const card = configuredCard(defaultCardConfig('switch.irrigazione'));
    card._renderIfChanged = () => {};
    const lastChanged = new Date(1_000_000).toISOString();
    card.hass = fakeHass({ states: { ...states, 'switch.irrigazione': { state: 'on', last_changed: lastChanged, attributes: {} } } });
    assert.equal(card._sessionStartMs, Date.parse(lastChanged));
    assert.equal(card._sessionMinute, 2);
    assert.equal(intervalMs, 15000);
    now += 60_000;
    tick();
    assert.equal(card._sessionMinute, 3);
    card.disconnectedCallback();
    assert.equal(cleared, 17);
  } finally {
    for (const [key, descriptor] of Object.entries(previous)) {
      if (key === 'now') {
        if (descriptor) Object.defineProperty(Date, 'now', descriptor);
        else delete Date.now;
      } else if (descriptor) Object.defineProperty(globalThis, key === 'window' ? 'window' : key, descriptor);
      else delete globalThis[key];
    }
  }
});

test('service wrapper consumes rejections and reports them accessibly', async () => {
  const card = configuredCard(defaultCardConfig('switch.irrigazione'));
  const reported = [];
  card._hass = { callService: async () => { throw new Error('service unavailable'); } };
  card._showServiceError = (error) => reported.push(error.message);
  await assert.doesNotReject(card._service('switch', 'toggle', { entity_id: 'switch.irrigazione' }));
  assert.deepEqual(reported, ['service unavailable']);
  const missing = configuredCard(defaultCardConfig('switch.irrigazione'));
  missing._hass = undefined;
  const errors = [];
  missing._showServiceError = (error) => errors.push(error.message);
  await missing._service('switch', 'toggle', { entity_id: 'switch.irrigazione' });
  assert.equal(errors.length, 1);
  assert.match(errors[0], /water_flow_scheduler/);
});

test('haptics only vibrate when enabled and supported', () => {
  assert.deepEqual(hapticPattern('light'), [12]);
  assert.deepEqual(hapticPattern('medium'), [24]);
  assert.deepEqual(hapticPattern('heavy'), [40]);
  assert.equal(fireHaptic(false, 'medium', true), false);
  assert.equal(fireHaptic(true, 'medium', false), false);
  const calls = [];
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { value: { vibrate: (pattern) => { calls.push(pattern); return true; } }, configurable: true });
  try {
    assert.equal(fireHaptic(true, 'heavy'), true);
    assert.deepEqual(calls, [[40]]);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'navigator', previous);
    else delete globalThis.navigator;
  }
});

test('error labels localize codes and fall back to the raw message', () => {
  for (const language of ['en', 'it']) {
    const strings = cardStrings(language);
    assert.ok(strings.errors.invalid_time);
    assert.ok(strings.errors.slots_overlap);
    assert.equal(errorLabel(null, strings), '');
    assert.equal(errorLabel({ code: 'invalid_time', context: {}, message: 'raw' }, strings), strings.errors.invalid_time);
    assert.match(errorLabel({ code: 'slots_overlap', context: { a: 'x', b: 'y' }, message: 'raw' }, strings), /x/);
    assert.equal(errorLabel('invalid_time', strings), strings.errors.invalid_time);
    assert.equal(errorLabel({ code: 'brand_new', context: {}, message: 'raw text' }, strings), 'raw text');
    // An unfilled placeholder must never leak into the visible message.
    assert.equal(errorLabel({ code: 'duplicate_slot_id', context: {}, message: 'raw' }, strings), 'raw');
    assert.match(errorLabel({ code: 'duplicate_slot_id', context: { id: 'morning' }, message: 'raw' }, strings), /morning/);
    assert.doesNotMatch(errorLabel({ code: 'duplicate_slot_id', context: {}, message: 'raw' }, strings), /\{id\}/);
  }
});

test('every localized error code exists in both translations', async () => {
  const { readFileSync: read } = await import('node:fs');
  const root = new URL('./custom_components/water_flow_scheduler/', import.meta.url);
  const en = JSON.parse(read(new URL('translations/en.json', root), 'utf8'));
  const it = JSON.parse(read(new URL('translations/it.json', root), 'utf8'));
  const jsCodes = Object.keys(cardStrings('en').errors).sort();
  assert.deepEqual(Object.keys(cardStrings('it').errors).sort(), jsCodes);
  assert.deepEqual(Object.keys(en.exceptions).sort(), jsCodes);
  assert.deepEqual(Object.keys(it.exceptions).sort(), jsCodes);
});

test('editor row markup binds every selector to a localized label', () => {
  const editor = new WaterFlowCardEditor();
  const strings = cardStrings('it');
  const row = (name) => editor._rowMarkup(configSchemaFields().find((entry) => entry.name === name), strings);
  assert.match(row('entity'), /ha-entity-picker/);
  assert.match(row('entity'), /class="pump-picker"/);
  assert.match(row('entity'), /icon="mdi:water-pump"/);
  assert.match(row('entity'), /Collegamento pompa/);
  assert.match(row('entity'), /aria-label="Switch pompa"/);
  assert.match(row('entity'), /placeholder="Scegli lo switch che controlla la pompa"/);
  assert.match(editor._rowMarkup(configSchemaFields().find((entry) => entry.name === 'entity'), cardStrings('en')), /placeholder="Choose the switch that controls the pump"/);
  assert.match(row('auto_entity'), /data-field="auto_entity"/);
  assert.match(row('show_flow_chip'), /role="switch"/);
  assert.match(row('layout'), /data-value="pill"/);
  assert.match(row('accent_color'), /type="color"/);
  assert.match(row('animation_duration'), /type="number"/);
  assert.match(row('name'), /type="text"/);
  for (const entry of configSchemaFields()) {
    const markup = editor._rowMarkup(entry, strings);
    assert.ok(markup.includes(fieldLabel(strings, entry.name)) || entry.name === 'entity');
    assert.ok(markup.includes(strings.help[entry.name]));
  }
});

test('pump entity picker keeps its switch-only domain filter', () => {
  const pump = configSchemaFields().find((entry) => entry.name === 'entity');
  assert.deepEqual(pump.selector.entity.filter.domain, ['switch']);

  const editor = new WaterFlowCardEditor();
  editor._config = defaultCardConfig('switch.irrigazione');
  editor._hass = fakeHass();
  editor._pickers = [];
  const picker = {};
  editor.shadowRoot = {
    querySelector: (selector) => selector === '[data-field="entity"]' ? picker : null,
  };
  editor._renderValues();

  assert.deepEqual(picker.includeDomains, ['switch']);
  assert.equal(picker.value, 'switch.irrigazione');
});

test('editor sends config-changed using the Home Assistant event contract', () => {
  const editor = new WaterFlowCardEditor();
  editor._config = defaultCardConfig('switch.irrigazione');
  let received;
  editor.dispatchEvent = (event) => { received = event; };

  editor._updateField('layout', 'compact');

  assert.equal(received.type, 'config-changed');
  assert.equal(received.bubbles, true);
  assert.equal(received.composed, true);
  assert.deepEqual(received.detail, {
    config: { entity: 'switch.irrigazione', layout: 'compact' },
  });
});

test('editor builds its sections once and forwards hass ticks without rebuilding', () => {
  const source = cardSource();
  const start = source.indexOf('export class WaterFlowCardEditor');
  const end = source.indexOf('export const WATER_FLOW_CARD_TAG');
  assert.ok(start !== -1 && end !== -1 && start < end);
  const editor = source.slice(start, end);
  // The shadow root is reset exactly once, when the sections are built.
  assert.equal((editor.match(/this\.shadowRoot\.innerHTML = /g) || []).length, 1);
  assert.match(editor, /for \(const picker of this\._pickers \|\| \[\]\) picker\.hass = value;/);
  assert.match(editor, /if \(sameCardConfig\(this\._config, stripped\)\) return;/);
  assert.match(editor, /dispatchEvent\(new CustomEvent\('config-changed'/);
  assert.match(editor, /control\.hass = this\._hass;/);
});

test('card source keeps the dialog, the scheduler services and no prompts', () => {
  const source = cardSource();
  assert.match(source, /dialog\.showModal\(\)/);
  assert.match(source, /save_program/);
  assert.match(source, /delete_program/);
  assert.match(source, /water_flow_scheduler/);
  assert.match(source, /input_boolean/);
  // The dialog explains the rhythm and the auto helper with localized hints.
  assert.match(source, /strings\.intervalFrequencyHelp/);
  assert.match(source, /strings\.legacyFrequencyHelp/);
  assert.match(source, /strings\.autoHelp/);
  assert.match(source, /strings\.scheduleEnabledHelp/);
  assert.match(source, /\.status-line span\+span:before\{content:' · '\}/);
  assert.doesNotMatch(source, /globalThis\.prompt|window\.prompt/);
  assert.doesNotMatch(source, /globalThis\.confirm/);
  assert.doesNotMatch(source, /eval\(/);
  // The card owns the pump through the switch domain only: the tap action
  // resolves the domain from the configured switch entity.
  assert.match(source, /entityId\.split\('\.'\)\[0\]/);
  assert.doesNotMatch(source, /climate\./);
});

test('card and editors use mobile-first layouts with desktop-width enhancements', () => {
  const source = cardSource();
  const desktopBreakpoint = source.indexOf('@media(min-width:521px)');
  assert.ok(desktopBreakpoint > 0);
  assert.ok(source.indexOf('.status-line{display:flex;flex-wrap:wrap') < desktopBreakpoint);
  assert.match(source, /\.round\{width:44px;height:44px/);
  assert.match(source, /\.sub\{[^}]*min-height:44px/);
  assert.match(source, /\.days\{display:grid;grid-template-columns:repeat\(4,minmax\(44px,1fr\)\)/);
  assert.match(source, /\.day\{min-width:44px;min-height:44px/);
  assert.match(source, /\.dlg-actions-right \.btn\{flex:1 1 0;min-height:44px\}/);
  assert.match(source, /\.ed-row\{display:flex;flex-direction:column;align-items:stretch/);
  assert.match(source, /@media\(min-width:521px\)\{\s*\.ed-row\{flex-direction:row;align-items:center\}/);
  assert.doesNotMatch(source, /@media\(max-width:520px\)/);
});

test('card-picker entry is added without a DOM and registers both elements', () => {
  const win = { customCards: [] };
  const previousWindow = globalThis.window;
  const previousElements = globalThis.customElements;
  const previousHTMLElement = globalThis.HTMLElement;
  globalThis.window = win;
  // The module captured its base class at import time (no HTMLElement in
  // Node); registration still requires a live global to mirror the browser.
  globalThis.HTMLElement = class {};
  try {
    delete globalThis.customElements;
    assert.equal(registerWaterFlowElements(), false);
    assert.equal(win.customCards.filter((card) => card?.type === WATER_FLOW_CARD_TAG).length, 1);
    const [entry] = win.customCards;
    assert.equal(entry.type, 'water-flow-card');
    assert.equal(entry.name, 'Water Flow Card');
    assert.match(entry.documentationURL, /water-flow-card/);
    assert.deepEqual(typeof entry.getEntitySuggestion, 'function');
    assert.equal(registerWaterFlowElements(), false);
    assert.equal(win.customCards.length, 1, 'the picker entry is added exactly once');
    assert.equal(isWaterFlowElementsRegistered(), false);
    assert.equal(isHomeAssistantFrontendReady(), false);
    assert.equal(isHomeAssistantFrontendReady(), false);

    const registry = new Map();
    const defined = [];
    globalThis.customElements = {
      define: (tag, ctor) => {
        if (registry.has(tag)) throw new Error('duplicate');
        registry.set(tag, ctor);
        defined.push(tag);
      },
      get: (tag) => registry.get(tag),
    };
    assert.equal(registerWaterFlowElements(), true);
    assert.deepEqual(defined, [WATER_FLOW_CARD_TAG, WATER_FLOW_CARD_EDITOR_TAG]);
    assert.equal(isWaterFlowElementsRegistered(), true);
    // A second call is idempotent and must not redefine anything.
    assert.equal(registerWaterFlowElements(), true);
    assert.deepEqual(defined, [WATER_FLOW_CARD_TAG, WATER_FLOW_CARD_EDITOR_TAG]);
    assert.equal(win.customCards.length, 1);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousElements === undefined) delete globalThis.customElements;
    else globalThis.customElements = previousElements;
    if (previousHTMLElement === undefined) delete globalThis.HTMLElement;
    else globalThis.HTMLElement = previousHTMLElement;
  }
});

test('registration poll waits for the frontend, verifies the registry and gives up loudly', () => {
  const win = { customCards: [] };
  const previousWindow = globalThis.window;
  const previousElements = globalThis.customElements;
  const previousHTMLElement = globalThis.HTMLElement;
  globalThis.window = win;
  globalThis.HTMLElement = class {};
  const warnings = [];
  const scheduled = [];
  try {
    const registry = new Map();
    globalThis.customElements = {
      define: (tag, ctor) => registry.set(tag, ctor),
      get: (tag) => registry.get(tag),
    };
    // The frontend bundle is not loaded yet: the poll keeps rescheduling.
    const cancel = scheduleWaterFlowReregistration({
      intervalMs: 5,
      maxAttempts: 3,
      schedule: (fn) => { scheduled.push(fn); return scheduled.length; },
      clear: () => {},
      warn: (message) => warnings.push(message),
    });
    assert.equal(typeof cancel, 'function');
    assert.equal(scheduled.length, 1);
    // Frontend ready + both tags present: the first poll stops for good.
    registry.set('home-assistant', class {});
    scheduled.shift()();
    assert.equal(scheduled.length, 0);
    assert.equal(isWaterFlowElementsRegistered(), true);
    assert.equal(warnings.length, 0);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousElements === undefined) delete globalThis.customElements;
    else globalThis.customElements = previousElements;
    if (previousHTMLElement === undefined) delete globalThis.HTMLElement;
    else globalThis.HTMLElement = previousHTMLElement;
  }

  // Frontend never becomes ready: bounded attempts end with one warning.
  globalThis.window = win;
  const warnings2 = [];
  const queue = [];
  try {
    globalThis.customElements = { define: () => {}, get: () => undefined };
    scheduleWaterFlowReregistration({
      intervalMs: 1,
      maxAttempts: 2,
      schedule: (fn) => { queue.push(fn); return queue.length; },
      clear: () => {},
      warn: (message) => warnings2.push(message),
    });
    while (queue.length) queue.shift()();
    assert.equal(warnings2.length, 1);
    assert.match(warnings2[0], /2 attempt/);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousElements === undefined) delete globalThis.customElements;
    else globalThis.customElements = previousElements;
    if (previousHTMLElement === undefined) delete globalThis.HTMLElement;
    else globalThis.HTMLElement = previousHTMLElement;
  }
});

test('registration survives a define() failure only when the tag exists', () => {
  const previousWindow = globalThis.window;
  const previousElements = globalThis.customElements;
  const previousHTMLElement = globalThis.HTMLElement;
  globalThis.window = { customCards: [] };
  globalThis.HTMLElement = class {};
  try {
    let attempts = 0;
    globalThis.customElements = {
      define: () => { attempts += 1; throw new Error('invalid name'); },
      get: () => undefined,
    };
    assert.throws(() => registerWaterFlowElements(), /invalid name/);
    assert.equal(attempts, 1);
    // Another copy won the race: the tag resolves, so no error escapes.
    globalThis.customElements = {
      define: () => { throw new Error('duplicate'); },
      get: (tag) => (tag === WATER_FLOW_CARD_TAG ? WaterFlowCard : tag === WATER_FLOW_CARD_EDITOR_TAG ? WaterFlowCardEditor : undefined),
    };
    assert.equal(registerWaterFlowElements(), true);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousElements === undefined) delete globalThis.customElements;
    else globalThis.customElements = previousElements;
    if (previousHTMLElement === undefined) delete globalThis.HTMLElement;
    else globalThis.HTMLElement = previousHTMLElement;
  }
});
