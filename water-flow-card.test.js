import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  WaterFlowCard, WaterFlowCardEditor, WATER_FLOW_CARD_TAG, WATER_FLOW_CARD_EDITOR_TAG,
  registerWaterFlowElements, isWaterFlowElementsRegistered, isHomeAssistantFrontendReady,
  scheduleWaterFlowReregistration, cardStrings, cardLanguage, resolveLanguage, fieldLabel, errorLabel,
  defaultCardConfig, CARD_OPTION_DEFAULTS, cardDefault, stripCardDefaults, sameCardConfig,
  configSchema, configSchemaFields, getEntitySuggestion, normalizeAccentColor, normalizeSurface,
  normalizeLayout, normalizeCardAction, normalizeHapticStyle, normalizeAnimationDuration,
  CARD_SURFACES, CARD_ACTIONS, HAPTIC_STYLES, ANIMATION_DURATION_DEFAULT, MAX_SLOTS, MAX_DURATION_MINUTES,
  MAX_FREQUENCY_DAYS, WATER_FLOW_DOMAIN, numeric, formatNumber, formatDuration, chipValue, sessionMinutes,
  pumpStateLabel, cardTitle, frequencyAllows, activeSlotFor, activeProgram, nextWindowMs, timeMinutes,
  programSensor, programOf, scheduleDraft, emptyScheduleDraft, validateScheduleDraft, programPayload,
  deleteProgramPayload, actionCall, toggleAutoCall, hapticPattern, fireHaptic,
} from './custom_components/water_flow_scheduler/www/water-flow-card.js';

const SOURCE_PATH = './custom_components/water_flow_scheduler/www/water-flow-card.js';
const cardSource = () => readFileSync(new URL(SOURCE_PATH, import.meta.url), 'utf8');

const states = {
  'switch.irrigazione': { state: 'on', attributes: { friendly_name: 'Irrigazione' } },
  'input_boolean.irrigazione_attiva': { state: 'on', attributes: {} },
  'sensor.portata_irrigazione': { state: '12.5', attributes: { unit_of_measurement: 'L/min' } },
  'sensor.volume_irrigazione': { state: '3.2', attributes: { unit_of_measurement: 'm³' } },
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
  assert.deepEqual(fields.find((entry) => entry.name === 'layout').selector, { select: { mode: 'dropdown', options: ['pill', 'compact'] } });
  assert.deepEqual(fields.find((entry) => entry.name === 'surface').selector, { select: { mode: 'dropdown', options: CARD_SURFACES } });
  assert.deepEqual(fields.find((entry) => entry.name === 'tap_action').selector, { select: { mode: 'dropdown', options: CARD_ACTIONS } });
  for (const name of ['name', 'icon', 'accent_color', 'language', 'program_entity', 'show_state_chip', 'show_flow_chip',
    'show_volume_chip', 'show_next_change_chip', 'show_unavailable_badge', 'show_auto_button', 'show_schedule_button',
    'hold_action', 'double_tap_action', 'haptics', 'haptics_style', 'animations', 'animation_duration']) {
    assert.ok(names.includes(name), name);
  }
});

test('defaults, suggestion and stub config nest the card type', () => {
  assert.deepEqual(defaultCardConfig('switch.irrigazione'), {
    entity: 'switch.irrigazione', layout: 'pill',
    show_state_chip: true, show_flow_chip: true, show_volume_chip: true, show_next_change_chip: true,
    show_unavailable_badge: true, show_auto_button: true, show_schedule_button: true,
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

  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), accent_color: 'red' }), /hex colour/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), surface: 'glass' }), /surface must be one of/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), tap_action: 'call-service' }), /tap_action must be one of/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), layout: 'wide' }), /layout must be pill or compact/);
  assert.throws(() => configuredCard({ ...defaultCardConfig('switch.irrigazione'), haptics_style: 'strong' }), /haptics_style must be one of/);
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
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30 }], { frequency_days: 0 }), 'invalid_frequency', { max: MAX_FREQUENCY_DAYS });
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30 }], { frequency_days: 99 }), 'invalid_frequency', { max: MAX_FREQUENCY_DAYS });
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30 }], { frequency_days: 2, start_date: '' }), 'invalid_start_date');
  expect(withSlots([{ id: 'a', days: [1], start: '05:30', duration: 30 }], { frequency_days: 2, start_date: '2026-02-30' }), 'invalid_start_date');
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
    water_entity: 'switch.irrigazione', enabled: true,
    slots: [
      { id: 'morning', days: [1, 3, 5], start: '05:30', duration: 30, liters: 120 },
      { id: 'evening', days: [2, 4], start: '19:00', duration: 45 },
    ],
    frequency_days: 3, start_date: '2026-06-01', auto_entity: 'input_boolean.irrigazione_attiva',
  });
  const daily = scheduleDraft({ enabled: false, slots: [{ id: 'a', days: [1], start: '05:30', duration: 30 }] });
  const payload = programPayload('switch.irrigazione', daily);
  assert.equal(payload.frequency_days, 1);
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
  assert.equal(draft.frequency_days, 2);
  assert.equal(draft.start_date, '2026-05-01');
  assert.equal(draft.auto_entity, 'input_boolean.irrigazione_attiva');
  assert.deepEqual(draft.slots[0], { id: 'morning', days: [1, 3, 5], start: '05:30', duration: 30, liters: '120' });
  assert.equal(validateScheduleDraft(draft).ok, true);
  assert.deepEqual(emptyScheduleDraft().slots.length, 1);
  assert.equal(scheduleDraft(null).enabled, false);
  // A stored program without a program sensor still produces an editable draft.
  assert.equal(scheduleDraft(undefined).slots[0].days.length, 3);
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

test('card markup renders state, readouts and the three sub-buttons', () => {
  const card = configuredCard({ ...defaultCardConfig('switch.irrigazione'), flow_entity: 'sensor.portata_irrigazione', volume_entity: 'sensor.volume_irrigazione', auto_entity: 'input_boolean.irrigazione_attiva' });
  card._hass = fakeHass();
  const html = card._cardMarkup();
  assert.match(html, /Irrigazione/);
  assert.match(html, /In irrigazione/);
  assert.match(html, /Portata 12,5 L\/min/);
  assert.match(html, /Volume 3,2 m³/);
  assert.match(html, /data-act="auto"/);
  assert.match(html, /data-act="schedule" data-focus="slots"/);
  assert.match(html, /data-act="schedule" data-focus="frequency"/);
  assert.match(html, /Ogni 2 giorni/);
  assert.match(html, /mdi:water-pump/);
  // The card never injects unescaped entity names.
  assert.ok(!html.includes('<script'));
  const english = configuredCard({ ...defaultCardConfig('switch.irrigazione'), language: 'en', show_flow_chip: false, show_volume_chip: false, show_next_change_chip: false, show_auto_button: false });
  english._hass = fakeHass({ locale: { language: 'en-US' } });
  const englishHtml = english._cardMarkup();
  assert.match(englishHtml, /Watering/);
  assert.ok(!englishHtml.includes('data-act="auto"'));
  assert.ok(!englishHtml.includes('Ogni'));
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
  assert.match(source, /strings\.frequencyHelp/);
  assert.match(source, /strings\.autoHelp/);
  assert.match(source, /strings\.scheduleEnabledHelp/);
  assert.match(source, /\.status-line span\+span:before\{content:' · '\}/);
  assert.doesNotMatch(source, /globalThis\.prompt|window\.prompt/);
  assert.doesNotMatch(source, /eval\(/);
  // The card owns the pump through the switch domain only: the tap action
  // resolves the domain from the configured switch entity.
  assert.match(source, /entityId\.split\('\.'\)\[0\]/);
  assert.doesNotMatch(source, /climate\./);
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
