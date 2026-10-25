export const numeric = (v) => {
  if (v === null || v === undefined || (typeof v === 'string' && (!v.trim() || ['unknown', 'unavailable'].includes(v.trim().toLowerCase())))) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

export const WATER_FLOW_DOMAIN = 'water_flow_scheduler';
export const MAX_SLOTS = 50;
export const MAX_DURATION_MINUTES = 1440;
export const MAX_FREQUENCY_DAYS = 31;
export const CARD_SURFACES = ['default', 'elevated', 'blend'];
export const CARD_ACTIONS = ['toggle', 'more-info', 'none'];
export const HAPTIC_STYLES = ['light', 'medium', 'heavy'];
export const ANIMATION_DURATION_DEFAULT = 220;

// Card UI strings. The active language follows hass.locale.language; languages
// other than Italian fall back to English.
const STRINGS = {
  en: {
    unavailable: 'Unavailable',
    entityUnavailable: 'Entity unavailable',
    running: 'Watering',
    stopped: 'Off',
    pausedByAuto: 'Auto off',
    flow: (value) => `Flow ${value}`,
    volume: (value) => `Volume ${value}`,
    session: (minutes) => `Running for ${minutes} min`,
    openDetails: (label) => `${label}. Open details`,
    togglePump: 'Tap card background to toggle the pump',
    actionMoreInfo: 'Tap card background to open the entity details',
    actionNone: 'Irrigation card, no background action',
    close: 'Close',
    closeSchedule: 'Close schedule editor',
    auto: 'Auto',
    autoOn: 'Auto mode on',
    autoOff: 'Auto mode off',
    noAuto: 'No auto helper configured',
    windows: 'Windows',
    windowsAria: 'Watering windows',
    frequency: 'Frequency',
    frequencyHelp: 'Water every N days, counted from the anchor date below. 1 waters on every scheduled day.',
    nextWindow: 'Next: ',
    none: 'none',
    everyDays: (days) => (days === 1 ? 'Every day' : `Every ${days} days`),
    anchor: 'Starting from',
    scheduleTitle: 'Irrigation schedule',
    scheduleEnabled: 'Program active',
    scheduleEnabledHelp: 'While the program is active the scheduler owns the pump switch.',
    autoHelp: 'input_boolean handed to the scheduler: while it is on the program drives the pump, while it is off the pump stays yours.',
    backendMissing: 'Water Flow Scheduler is not installed. Install and configure it to edit a program (integration domain: water_flow_scheduler).',
    noProgram: 'No program saved yet',
    lastError: 'Last error: ',
    saveProgram: 'Save program',
    deleteProgram: 'Delete program',
    deleteConfirm: 'Delete this program?',
    cancel: 'Cancel',
    addWindow: '+ Add window',
    removeWindow: (index) => `Remove window ${index}`,
    window: (index) => `Window ${index}`,
    start: 'Start',
    duration: 'Duration (minutes)',
    liters: 'Liters',
    litersHelp: 'Optional target shown by the card.',
    invalidDraft: 'Invalid schedule.',
    emptyDraft: 'The program is empty. Add at least one watering window.',
    serviceError: (message) => `Service failed: ${message}`,
    programSaved: 'Program saved',
    programDeleted: 'Program deleted',
    dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    dayPills: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    // Backend last_error carries {code, context, message}; keys are the
    // machine-readable codes from the scheduler backend, {placeholders}
    // are substituted from the error context (plus its message).
    errors: {
      invalid_program: '{message}',
      invalid_time: 'Times must use the HH:MM 24-hour format.',
      invalid_duration: 'Duration must be a whole number of minutes between 1 and {max}.',
      invalid_liters: 'Liters must be a finite number greater than zero.',
      invalid_frequency: 'Frequency must be a whole number of days between 1 and {max}.',
      invalid_start_date: 'The anchor date must use the YYYY-MM-DD format.',
      frequency_needs_anchor: 'A frequency above one day needs a start date.',
      invalid_auto_entity: 'The auto helper must be an input_boolean entity.',
      entity_validation_failed: 'The entity does not accept this program: {message}',
      no_program: 'No schedule exists for this switch entity.',
      invalid_enabled: 'enabled must be boolean.',
      invalid_slots: 'slots must be a list.',
      too_many_slots: 'A program may contain at most {max} windows.',
      empty_enabled_program: 'An enabled program needs at least one window.',
      invalid_slot_schema: 'Each window needs id, days, start, duration, and optionally liters.',
      invalid_slot_id: 'Window ids must start alphanumeric and use letters, digits, dots, underscores, or hyphens.',
      duplicate_slot_id: 'Duplicate window id: {id}.',
      invalid_days: 'days must be a non-empty list of ISO weekdays 1..7.',
      duplicate_days: 'days cannot contain duplicates.',
      slots_overlap: 'Windows {a} and {b} overlap.',
      unknown_water_entity: 'Unknown switch entity: {entity}.',
      unknown_auto_entity: 'Unknown auto entity: {entity}.',
      entity_unavailable: 'The switch entity is unavailable; the pump command is pending.',
      service_call_failed: 'The switch service call failed: {message}',
      unexpected_failure: 'Scheduler error: {message}',
    },
    sections: {
      identity: 'Identity and appearance',
      entities: 'Entities',
      visible: 'Visible elements',
      controls: 'Controls',
    },
    fields: {
      entity: 'Pump switch', name: 'Name', icon: 'Icon', layout: 'Layout',
      accent_color: 'Accent colour', surface: 'Card surface', language: 'Language',
      auto_entity: 'Auto helper', flow_entity: 'Flow sensor', volume_entity: 'Volume sensor',
      program_entity: 'Programs sensor',
      show_state_chip: 'Show pump state', show_flow_chip: 'Show flow',
      show_volume_chip: 'Show volume', show_next_change_chip: 'Show next window',
      show_unavailable_badge: 'Show unavailable badge', show_auto_button: 'Show auto button',
      show_schedule_button: 'Show schedule buttons',
      tap_action: 'Tap action', hold_action: 'Hold action', double_tap_action: 'Double tap action',
      haptics: 'Haptics', haptics_style: 'Haptic style', animations: 'Animations',
      animation_duration: 'Animation duration',
    },
    themeColor: 'Theme',
    help: {
      entity: 'Switch entity that powers the irrigation pump or valve.',
      name: 'Card title; defaults to the entity name.',
      icon: 'Overrides the status icon.',
      layout: 'pill is the horizontal pill card; compact stacks the status over the buttons.',
      accent_color: 'Overrides the accent colour used by the icon, chips and buttons. Empty follows the theme colour.',
      surface: 'Card background: default follows the theme, elevated adds contrast and depth, blend drops the background for dark dashboards.',
      language: 'Card language; auto follows the Home Assistant interface language.',
      auto_entity: 'input_boolean that hands the pump to the scheduler while it is on.',
      flow_entity: 'Sensor reporting the current flow, shown as a chip.',
      volume_entity: 'Sensor reporting the water volume, shown as a chip.',
      program_entity: 'Diagnostic sensor created by the integration. Leave empty to find it automatically.',
      show_state_chip: 'Watering or off state in the status line.',
      show_flow_chip: 'Current flow chip.',
      show_volume_chip: 'Volume chip.',
      show_next_change_chip: 'Next watering window in the status line.',
      show_unavailable_badge: 'Indicator when the entity is unavailable.',
      show_auto_button: 'Show the Auto sub-button that toggles the auto helper.',
      show_schedule_button: 'Show the Windows and Frequency sub-buttons that open the scheduler.',
      tap_action: 'What a tap on the card background does.',
      hold_action: 'What a long press on the card background does.',
      double_tap_action: 'What a double tap on the card background does.',
      haptics: 'Vibrate briefly on a button or card action; browsers without vibration support stay silent.',
      haptics_style: 'Vibration pattern: light, medium or heavy.',
      animations: 'Play the value and button animations; switch it off for a completely static card.',
      animation_duration: 'Duration of the value animation in milliseconds (0 falls back to the default).',
    },
  },
  it: {
    unavailable: 'Non disponibile',
    entityUnavailable: 'Entità non disponibile',
    running: 'In irrigazione',
    stopped: 'Spenta',
    pausedByAuto: 'Auto disattivata',
    flow: (value) => `Portata ${value}`,
    volume: (value) => `Volume ${value}`,
    session: (minutes) => `Attiva da ${minutes} min`,
    openDetails: (label) => `${label}. Apri dettagli`,
    togglePump: 'Tocca lo sfondo della scheda per attivare o spegnere la pompa',
    actionMoreInfo: 'Tocca lo sfondo della scheda per aprire i dettagli',
    actionNone: 'Card irrigazione, nessuna azione sullo sfondo',
    close: 'Chiudi',
    closeSchedule: 'Chiudi editor pianificazione',
    auto: 'Auto',
    autoOn: 'Modalità automatica attiva',
    autoOff: 'Modalità automatica disattiva',
    noAuto: 'Nessuna entità Auto configurata',
    windows: 'Orari',
    windowsAria: 'Finestre di irrigazione',
    frequency: 'Frequenza',
    frequencyHelp: 'Irriga ogni N giorni, contati dalla data di partenza qui sotto. 1 irriga in tutti i giorni programmati.',
    nextWindow: 'Prossimo: ',
    none: 'nessuno',
    everyDays: (days) => (days === 1 ? 'Ogni giorno' : `Ogni ${days} giorni`),
    anchor: 'A partire dal',
    scheduleTitle: 'Pianificazione irrigazione',
    scheduleEnabled: 'Programma attivo',
    scheduleEnabledHelp: 'Mentre il programma è attivo il pianificatore comanda lo switch della pompa.',
    autoHelp: 'input_boolean affidata al pianificatore: accesa il programma comanda la pompa, spenta la pompa resta tua.',
    backendMissing: 'Water Flow Scheduler non è installato. Installa e configura l’integrazione per modificare un programma (dominio: water_flow_scheduler).',
    noProgram: 'Nessun programma salvato',
    lastError: 'Ultimo errore: ',
    saveProgram: 'Salva programma',
    deleteProgram: 'Elimina programma',
    deleteConfirm: 'Eliminare questo programma?',
    cancel: 'Annulla',
    addWindow: '+ Aggiungi finestra',
    removeWindow: (index) => `Rimuovi finestra ${index}`,
    window: (index) => `Finestra ${index}`,
    start: 'Inizio',
    duration: 'Durata (minuti)',
    liters: 'Litri',
    litersHelp: 'Obiettivo facoltativo mostrato dalla card.',
    invalidDraft: 'Pianificazione non valida.',
    emptyDraft: 'Il programma è vuoto. Aggiungi almeno una finestra di irrigazione.',
    serviceError: (message) => `Servizio non riuscito: ${message}`,
    programSaved: 'Programma salvato',
    programDeleted: 'Programma eliminato',
    dayNames: ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'],
    dayPills: ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'],
    errors: {
      invalid_program: '{message}',
      invalid_time: 'Gli orari devono usare il formato HH:MM su 24 ore.',
      invalid_duration: 'La durata deve essere un numero intero di minuti tra 1 e {max}.',
      invalid_liters: 'I litri devono essere un numero finito maggiore di zero.',
      invalid_frequency: 'La frequenza deve essere un numero intero di giorni tra 1 e {max}.',
      invalid_start_date: 'La data di partenza deve usare il formato AAAA-MM-GG.',
      frequency_needs_anchor: 'Una frequenza maggiore di un giorno richiede una data di partenza.',
      invalid_auto_entity: 'L’entità Auto deve essere un input_boolean.',
      entity_validation_failed: 'L’entità non accetta questo programma: {message}',
      no_program: 'Non esiste nessun programma per questa entità switch.',
      invalid_enabled: 'enabled deve essere booleano.',
      invalid_slots: 'slots deve essere una lista.',
      too_many_slots: 'Un programma può contenere al massimo {max} finestre.',
      empty_enabled_program: 'Un programma attivo richiede almeno una finestra.',
      invalid_slot_schema: 'Ogni finestra richiede id, days, start, duration e facoltativamente liters.',
      invalid_slot_id: 'L’id della finestra deve iniziare con un carattere alfanumerico e usare lettere, cifre, punti, trattini o underscore.',
      duplicate_slot_id: 'Id finestra duplicato: {id}.',
      invalid_days: 'days deve essere una lista non vuota di giorni ISO da 1 a 7.',
      duplicate_days: 'days non può contenere duplicati.',
      slots_overlap: 'Le finestre {a} e {b} si sovrappongono.',
      unknown_water_entity: 'Entità switch sconosciuta: {entity}.',
      unknown_auto_entity: 'Entità auto sconosciuta: {entity}.',
      entity_unavailable: 'L’entità switch non è disponibile; il comando alla pompa è in attesa.',
      service_call_failed: 'La chiamata al servizio switch non è riuscita: {message}',
      unexpected_failure: 'Errore del pianificatore: {message}',
    },
    sections: {
      identity: 'Identità e aspetto',
      entities: 'Entità',
      visible: 'Elementi visibili',
      controls: 'Controlli',
    },
    fields: {
      entity: 'Switch pompa', name: 'Nome', icon: 'Icona', layout: 'Layout',
      accent_color: 'Colore accento', surface: 'Sfondo card', language: 'Lingua',
      auto_entity: 'Entità Auto', flow_entity: 'Sensore di portata', volume_entity: 'Sensore di volume',
      program_entity: 'Sensore programmi',
      show_state_chip: 'Mostra stato pompa', show_flow_chip: 'Mostra portata',
      show_volume_chip: 'Mostra volume', show_next_change_chip: 'Mostra prossimo orario',
      show_unavailable_badge: 'Mostra badge non disponibile', show_auto_button: 'Mostra pulsante Auto',
      show_schedule_button: 'Mostra pulsanti pianificazione',
      tap_action: 'Azione al tocco', hold_action: 'Azione alla pressione lunga', double_tap_action: 'Azione al doppio tocco',
      haptics: 'Feedback tattile', haptics_style: 'Stile feedback', animations: 'Animazioni',
      animation_duration: 'Durata animazione',
    },
    themeColor: 'Tema',
    help: {
      entity: 'Entità switch che alimenta la pompa o la valvola di irrigazione.',
      name: 'Titolo della card; per impostazione predefinita è il nome dell’entità.',
      icon: 'Sostituisce l’icona di stato.',
      layout: 'pill è la card orizzontale; compact impila lo stato sopra i pulsanti.',
      accent_color: 'Sostituisce il colore accento usato da icone, chip e pulsanti. Vuoto segue il tema.',
      surface: 'Sfondo della card: default segue il tema, elevated aggiunge contrasto, blend elimina lo sfondo per dashboard scure.',
      language: 'Lingua della card; auto segue la lingua dell’interfaccia Home Assistant.',
      auto_entity: 'input_boolean che affida la pompa al pianificatore quando è attiva.',
      flow_entity: 'Sensore con la portata corrente, mostrato come chip.',
      volume_entity: 'Sensore con il volume d’acqua, mostrato come chip.',
      program_entity: 'Sensore diagnostico creato dall’integrazione. Lascia vuoto per trovarlo automaticamente.',
      show_state_chip: 'Stato in irrigazione o spenta nella riga di stato.',
      show_flow_chip: 'Chip della portata attuale.',
      show_volume_chip: 'Chip del volume.',
      show_next_change_chip: 'Prossima finestra di irrigazione nella riga di stato.',
      show_unavailable_badge: 'Indicatore quando l’entità non è disponibile.',
      show_auto_button: 'Mostra il sotto-pulsante Auto che commuta l’entità Auto.',
      show_schedule_button: 'Mostra i sotto-pulsanti Orari e Frequenza che aprono la pianificazione.',
      tap_action: 'Cosa fa un tocco sullo sfondo della card.',
      hold_action: 'Cosa fa una pressione lunga sullo sfondo della card.',
      double_tap_action: 'Cosa fa un doppio tocco sullo sfondo della card.',
      haptics: 'Vibra brevemente su un pulsante o un’azione; i browser senza vibrazione restano silenziosi.',
      haptics_style: 'Pattern di vibrazione: light, medium o heavy.',
      animations: 'Riproduce le animazioni di valore e pulsanti; disattivale per una card statica.',
      animation_duration: 'Durata dell’animazione del valore in millisecondi (0 usa il valore predefinito).',
    },
  },
};

export const resolveLanguage = (hass, configured) => {
  if (configured === 'en' || configured === 'it') return configured;
  const candidate = hass?.locale?.language ?? hass?.language;
  return typeof candidate === 'string' && candidate.toLowerCase().startsWith('it') ? 'it' : 'en';
};

export const cardLanguage = (config, hass) => resolveLanguage(hass, config?.language);

export const cardStrings = (language) => STRINGS[language] || STRINGS.en;

export const fieldLabel = (strings, name) => strings.fields?.[name] ?? name;

// Backend codes keep the English message as the fallback; the card
// localizes the code and substitutes its context, and falls back to the raw
// message when the code is unknown to this release.
export const errorLabel = (error, strings) => {
  if (!error) return '';
  const code = typeof error === 'string' ? error : error.code;
  const context = (typeof error === 'string' ? null : error.context) || {};
  const template = strings.errors?.[code];
  const message = (typeof error === 'string' ? null : error.message) || '';
  if (!template) return message || String(code || '');
  const filled = template.replace(/\{(\w+)\}/g, (match, key) => {
    if (key === 'message') return message;
    return Object.hasOwn(context, key) ? String(context[key]) : match;
  });
  if (!/\{\w+\}/.test(filled)) return filled;
  // A placeholder the context cannot fill would read as raw YAML to the user:
  // prefer the English backend message, then the template minus placeholders.
  return message || template.replace(/\{\w+\}/g, '').replace(/\s+/g, ' ').trim();
};

export const normalizeAccentColor = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  if (!/^#[0-9a-fA-F]{6}$/.test(text)) return null;
  return text.toLowerCase();
};

export const normalizeSurface = (value) => (CARD_SURFACES.includes(value) ? value : 'default');

export const normalizeLayout = (value) => (value === 'compact' ? 'compact' : 'pill');

export const normalizeCardAction = (value) => (CARD_ACTIONS.includes(value) ? value : null);

export const normalizeHapticStyle = (value) => (HAPTIC_STYLES.includes(value) ? value : 'medium');

export const normalizeAnimationDuration = (value) => {
  const duration = numeric(value);
  if (duration === null || duration < 0) return ANIMATION_DURATION_DEFAULT;
  return Math.round(duration);
};

export const formatNumber = (value, locale, digits = 1) => {
  const number = numeric(value);
  if (number === null) return null;
  try {
    return new Intl.NumberFormat(locale || 'en', { maximumFractionDigits: digits }).format(number);
  } catch {
    return String(number);
  }
};

export const entityUnit = (state) => (typeof state?.attributes?.unit_of_measurement === 'string' ? state.attributes.unit_of_measurement : '');

export const chipValue = (state, locale) => {
  const number = formatNumber(state?.state, locale);
  if (number === null) return null;
  const unit = entityUnit(state);
  return unit ? `${number} ${unit}` : number;
};

export const formatDuration = (minutes, strings) => {
  const total = numeric(minutes);
  if (total === null || total < 1) return strings?.none || '';
  const hours = Math.floor(total / 60);
  const rest = Math.round(total % 60);
  if (!hours) return `${rest} min`;
  if (!rest) return `${hours} h`;
  return `${hours} h ${rest} min`;
};

export const sessionMinutes = (nowMs, startedMs) => {
  if (!Number.isFinite(startedMs) || !Number.isFinite(nowMs) || nowMs < startedMs) return null;
  return Math.max(1, Math.floor((nowMs - startedMs) / 60000));
};

// Frequency rhythm: run only on days whose distance from the anchor is a
// multiple of frequency_days, exactly like frequency_allows() in the backend.
export const frequencyAllows = (program, nowMs = Date.now()) => {
  const days = numeric(program?.frequency_days) ?? 1;
  if (days <= 1) return true;
  const anchor = program?.start_date;
  if (!isValidDate(anchor)) return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(anchor);
  const now = new Date(nowMs);
  const anchorMs = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const todayMs = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const distance = Math.round((todayMs - anchorMs) / 86400000);
  return distance >= 0 && distance % days === 0;
};

const isoWeekday = (date) => (date.getDay() === 0 ? 7 : date.getDay());

export const activeSlotFor = (slots, weekday, minute) => {
  for (const slot of Array.isArray(slots) ? slots : []) {
    const start = timeMinutes(slot?.start);
    if (start === null || !Array.isArray(slot.days)) continue;
    const duration = numeric(slot.duration) ?? 0;
    // Before the start time the window that covers this minute began yesterday.
    const coveringWeekday = minute >= start ? weekday : (weekday - 2 + 7) % 7 + 1;
    if (!slot.days.includes(coveringWeekday)) continue;
    if (((minute - start) % 1440 + 1440) % 1440 < duration) return slot;
  }
  return null;
};

export const timeMinutes = (value) => {
  if (typeof value !== 'string') return null;
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

// Date.parse rolls impossible dates over (2026-02-30 becomes 2 March), so the
// round trip through the Date constructor is the only reliable check here.
export const isValidDate = (value) => {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;
};

export const nextWindowMs = (slots, nowMs = Date.now()) => {
  const list = Array.isArray(slots) ? slots : [];
  if (!list.length) return null;
  const now = new Date(nowMs);
  const candidates = [];
  for (let offset = -1; offset <= 8; offset += 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const weekday = isoWeekday(day);
    for (const slot of list) {
      const start = timeMinutes(slot?.start);
      const duration = numeric(slot.duration) ?? 0;
      if (start === null || !Array.isArray(slot.days) || !slot.days.includes(weekday)) continue;
      candidates.push(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, start).getTime());
      candidates.push(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, start + duration).getTime());
    }
  }
  const future = candidates.filter((candidate) => candidate > nowMs);
  return future.length ? Math.min(...future) : null;
};

export const activeProgram = (program, nowMs = Date.now()) => {
  if (!program || program.enabled === false) {
    return { enabled: false, running: false, slot: null, slotId: null, frequencyOk: false, nextChangeMs: null };
  }
  const now = new Date(nowMs);
  const frequencyOk = frequencyAllows(program, nowMs);
  const slot = frequencyOk ? activeSlotFor(program.slots, isoWeekday(now), now.getHours() * 60 + now.getMinutes()) : null;
  return {
    enabled: true,
    running: Boolean(slot),
    slot,
    slotId: slot ? slot.id : null,
    frequencyOk,
    nextChangeMs: frequencyOk ? nextWindowMs(program.slots, nowMs) : null,
  };
};

export const programOf = (hass, config) => {
  const programs = programSensor(hass, config)?.attributes?.programs;
  if (!programs || typeof programs !== 'object') return null;
  return programs[config?.entity] ?? null;
};

// The diagnostic sensor is found by the marker attribute it publishes, so the
// card works without hard-coding the entity id; program_entity overrides it.
export const programSensor = (hass, config) => {
  const states = hass?.states;
  if (!states || typeof states !== 'object') return null;
  // An explicit entity id wins over discovery: pointing it at a missing
  // sensor must show an empty card instead of silently reading another one.
  if (typeof config?.program_entity === 'string' && config.program_entity) {
    return states[config.program_entity] ?? null;
  }
  return Object.values(states).find((state) => state?.attributes?.scheduler_domain === WATER_FLOW_DOMAIN) ?? null;
};

export const cardTitle = (config, hass) => {
  if (config?.name) return config.name;
  const state = hass?.states?.[config?.entity];
  return state?.attributes?.friendly_name || config?.entity || 'Irrigation';
};

export const pumpStateLabel = (state, strings) => {
  const value = typeof state === 'object' ? state?.state : state;
  if (value === 'on') return strings.running;
  if (value === 'off') return strings.stopped;
  if (value === 'unavailable' || value === 'unknown' || value === undefined || value === null) return strings.unavailable;
  return String(value);
};

export const emptyScheduleDraft = () => ({
  enabled: false,
  frequency_days: 1,
  start_date: '',
  auto_entity: '',
  slots: [slotDraft()],
});

export const slotDraft = (index = 0) => ({ id: `window-${index + 1}`, days: [1, 3, 5], start: '05:30', duration: 30, liters: '' });

export const scheduleDraft = (program) => {
  if (!program || typeof program !== 'object') return emptyScheduleDraft();
  const slots = Array.isArray(program.slots) && program.slots.length
    ? program.slots.map((slot, index) => ({
        id: slot?.id || `window-${index + 1}`,
        days: Array.isArray(slot?.days) ? [...slot.days] : [],
        start: typeof slot?.start === 'string' ? slot.start : '05:30',
        duration: numeric(slot?.duration) ?? 30,
        liters: slot?.liters === undefined || slot?.liters === null ? '' : String(slot.liters),
      }))
    : [slotDraft()];
  return {
    enabled: program.enabled === true,
    frequency_days: numeric(program.frequency_days) ?? 1,
    start_date: typeof program.start_date === 'string' && program.start_date ? program.start_date : '',
    auto_entity: typeof program.auto_entity === 'string' ? program.auto_entity : '',
    slots,
  };
};

// Client-side validation mirrors schedule.validate_program() in the backend
// code-for-code, so a rejected save shows the same localized message as the
// service error. It returns {ok, code, context} for the first failure.
export const validateScheduleDraft = (draft) => {
  const fail = (code, context = {}) => ({ ok: false, code, context });
  if (!draft || typeof draft !== 'object') return fail('invalid_program');
  if (typeof draft.enabled !== 'boolean') return fail('invalid_enabled');
  if (!Array.isArray(draft.slots)) return fail('invalid_slots');
  if (draft.slots.length > MAX_SLOTS) return fail('too_many_slots', { max: MAX_SLOTS });
  if (draft.enabled && !draft.slots.length) return fail('empty_enabled_program');
  const frequency = numeric(draft.frequency_days);
  if (frequency === null || !Number.isInteger(frequency) || frequency < 1 || frequency > MAX_FREQUENCY_DAYS) {
    return fail('invalid_frequency', { max: MAX_FREQUENCY_DAYS });
  }
  if (frequency > 1 && !isValidDate(draft.start_date)) return fail('invalid_start_date');
  if (draft.auto_entity && !/^input_boolean\.[A-Za-z0-9_]+$/.test(draft.auto_entity)) return fail('invalid_auto_entity');
  const ids = new Set();
  const occupied = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
  for (const slot of draft.slots) {
    if (!slot || typeof slot !== 'object') return fail('invalid_slot_schema');
    const hasLiters = Object.hasOwn(slot, 'liters');
    const keys = new Set(Object.keys(slot));
    const shape = new Set(['id', 'days', 'start', 'duration']);
    if (hasLiters) shape.add('liters');
    if (keys.size !== shape.size || [...shape].some((key) => !keys.has(key))) return fail('invalid_slot_schema');
    if (typeof slot.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(slot.id)) return fail('invalid_slot_id');
    if (ids.has(slot.id)) return fail('duplicate_slot_id', { id: slot.id });
    ids.add(slot.id);
    if (!Array.isArray(slot.days) || !slot.days.length || slot.days.some((day) => !Number.isInteger(day) || day < 1 || day > 7)) {
      return fail('invalid_days');
    }
    if (new Set(slot.days).size !== slot.days.length) return fail('duplicate_days');
    if (timeMinutes(slot.start) === null) return fail('invalid_time');
    const duration = numeric(slot.duration);
    if (duration === null || !Number.isInteger(duration) || duration < 1 || duration > MAX_DURATION_MINUTES) {
      return fail('invalid_duration', { max: MAX_DURATION_MINUTES });
    }
    if (hasLiters && slot.liters !== '' && slot.liters !== null && slot.liters !== undefined) {
      const liters = numeric(slot.liters);
      if (liters === null || liters <= 0) return fail('invalid_liters');
    }
    const start = timeMinutes(slot.start);
    for (const day of [...new Set(slot.days)]) {
      const intervals = start + duration > 1440
        ? [[day, start, 1440], [day === 7 ? 1 : day + 1, 0, start + duration - 1440]]
        : [[day, start, start + duration]];
      for (const [targetDay, low, high] of intervals) {
        for (const [oldLow, oldHigh, oldId] of occupied[targetDay]) {
          if (low < oldHigh && oldLow < high) return fail('slots_overlap', { a: oldId, b: slot.id });
        }
        occupied[targetDay].push([low, high, slot.id]);
      }
    }
  }
  return { ok: true, code: null, context: {} };
};

export const programPayload = (waterEntity, draft) => {
  const slots = (draft.slots || []).map((slot, index) => {
    const payload = {
      id: slot.id || `window-${index + 1}`,
      days: [...slot.days],
      start: slot.start,
      duration: Number(slot.duration),
    };
    const liters = numeric(slot.liters);
    if (liters !== null && liters > 0) payload.liters = liters;
    return payload;
  });
  return {
    water_entity: waterEntity,
    enabled: draft.enabled === true,
    slots,
    frequency_days: Number(draft.frequency_days) || 1,
    ...(draft.frequency_days > 1 || draft.start_date ? { start_date: draft.start_date || null } : {}),
    ...(draft.auto_entity ? { auto_entity: draft.auto_entity } : {}),
  };
};

export const deleteProgramPayload = (waterEntity) => ({ water_entity: waterEntity });

export const actionCall = (action, entityId) => {
  if (action === 'toggle') return { domain: entityId.split('.')[0], service: 'toggle', data: { entity_id: entityId } };
  if (action === 'more-info') return { domain: 'more', service: 'more-info', data: { entity_id: entityId } };
  return null;
};

export const toggleAutoCall = (autoEntity) => ({ domain: 'input_boolean', service: 'toggle', data: { entity_id: autoEntity } });

export const hapticPattern = (style) => (style === 'light' ? [12] : style === 'heavy' ? [40] : [24]);

export const vibrateSupported = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

export const fireHaptic = (enabled, style, vibrate = vibrateSupported()) => {
  if (!enabled || !vibrate) return false;
  try {
    navigator.vibrate(hapticPattern(normalizeHapticStyle(style)));
    return true;
  } catch {
    return false;
  }
};

const defaultCardConfig = (entity = 'switch.irrigazione') => ({
  entity,
  layout: 'pill',
  show_state_chip: true,
  show_flow_chip: true,
  show_volume_chip: true,
  show_next_change_chip: true,
  show_unavailable_badge: true,
  show_auto_button: true,
  show_schedule_button: true,
});
export { defaultCardConfig };

// Home Assistant reads suggestion.config, so the suggestion must nest it.
export const getEntitySuggestion = (_hass, entityId) => (typeof entityId === 'string' && entityId.startsWith('switch.')
  ? { config: { type: 'custom:water-flow-card', ...defaultCardConfig(entityId) } }
  : null);

export const CARD_OPTION_DEFAULTS = {
  language: 'auto', surface: 'default',
  tap_action: 'toggle', hold_action: 'none', double_tap_action: 'none',
  haptics: true, haptics_style: 'medium', animations: true, animation_duration: ANIMATION_DURATION_DEFAULT,
};

export const cardDefault = (name, entity) => {
  const base = defaultCardConfig(entity);
  return Object.hasOwn(base, name) ? base[name] : CARD_OPTION_DEFAULTS[name];
};

// The editor keeps the user's YAML clean: any value equal to its default is
// dropped, empty optional values are dropped too, and `entity` is never
// removable (a config without it would be rejected by setConfig).
export const stripCardDefaults = (config) => {
  const next = { ...config };
  for (const key of Object.keys(next)) {
    if (key === 'entity' || key === 'type') continue;
    const fallback = cardDefault(key, next.entity);
    if (fallback === undefined) {
      if (next[key] === '' || next[key] === null || next[key] === undefined) delete next[key];
      continue;
    }
    if (next[key] === fallback) delete next[key];
  }
  return next;
};

export const sameCardConfig = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) if (a[key] !== b[key]) return false;
  return true;
};

const field = (name, selector) => ({ name, selector });
const grid = (name, schema) => ({ type: 'grid', name, schema });
const expandable = (name, schema, collapsed = true) => ({ type: 'expandable', name, collapsed, schema });

export const configSchema = [
  grid('identity', [
    field('entity', { entity: { filter: { domain: ['switch'] } } }),
    field('name', { text: {} }),
    field('icon', { icon: {} }),
    field('layout', { select: { mode: 'dropdown', options: ['pill', 'compact'] } }),
    field('accent_color', { color: {} }),
    field('surface', { select: { mode: 'dropdown', options: CARD_SURFACES } }),
    field('language', { select: { mode: 'dropdown', options: ['auto', 'en', 'it'] } }),
  ]),
  grid('entities', [
    field('auto_entity', { entity: { filter: { domain: ['input_boolean'] } } }),
    field('flow_entity', { entity: { filter: { domain: ['sensor'] } } }),
    field('volume_entity', { entity: { filter: { domain: ['sensor'] } } }),
    field('program_entity', { entity: { filter: { domain: ['sensor'] } } }),
  ]),
  grid('visible', [
    ...['show_state_chip', 'show_flow_chip', 'show_volume_chip', 'show_next_change_chip', 'show_unavailable_badge', 'show_auto_button', 'show_schedule_button']
      .map((name) => field(name, { boolean: {} })),
  ]),
  expandable('controls', [
    field('tap_action', { select: { mode: 'dropdown', options: CARD_ACTIONS } }),
    field('hold_action', { select: { mode: 'dropdown', options: CARD_ACTIONS } }),
    field('double_tap_action', { select: { mode: 'dropdown', options: CARD_ACTIONS } }),
    field('haptics', { boolean: {} }),
    field('haptics_style', { select: { mode: 'dropdown', options: HAPTIC_STYLES } }),
    field('animations', { boolean: {} }),
    field('animation_duration', { number: { min: 0, max: 2000, step: 10, mode: 'box' } }),
  ]),
];

export const configSchemaFields = () => {
  const flatten = (items) => items.flatMap((item) => (Array.isArray(item?.schema) ? flatten(item.schema) : [item]));
  return flatten(configSchema).filter((item) => item.name);
};

const HTMLElementBase = globalThis.HTMLElement ?? class {};

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]
));

const CARD_CSS = `
  :host{display:block}
  ha-card{--water-flow-accent-color:var(--primary-color);position:relative;overflow:hidden;cursor:pointer;transition:box-shadow .2s}
  ha-card[data-surface="elevated"]{box-shadow:0 6px 22px rgba(0,0,0,.28);border-color:color-mix(in srgb, var(--water-flow-accent-color) 35%, transparent)}
  ha-card[data-surface="blend"]{background:transparent;border-color:transparent;box-shadow:none}
  .row{display:flex;align-items:center;gap:14px;padding:14px 16px}
  .compact .row{padding:12px 14px;gap:12px}
  .icon{flex:0 0 auto;width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb, var(--water-flow-accent-color) 18%, transparent);color:var(--water-flow-accent-color)}
  .compact .icon{width:38px;height:38px}
  .icon ha-icon{--mdc-icon-size:24px}
  .main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px}
  .title{font-size:16px;font-weight:600;color:var(--primary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .status-line{font-size:13px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;overflow-x:auto;overscroll-behavior-inline:contain;scrollbar-width:none}
  .status-line::-webkit-scrollbar{display:none}
  .status-line span+span:before{content:' · '}
  .status-line .live{color:var(--water-flow-accent-color);font-weight:600}
  .status-line ha-icon{--mdc-icon-size:14px;vertical-align:-2px}
  .badge{display:inline-flex;align-items:center;gap:4px;color:var(--error-color)}
  .side{flex:0 0 auto;display:flex;align-items:center;gap:8px}
  .round{width:38px;height:38px;border-radius:50%;border:1px solid var(--divider-color);background:var(--secondary-background-color);color:var(--primary-text-color);display:flex;align-items:center;justify-content:center;cursor:pointer}
  .round:hover{border-color:var(--water-flow-accent-color);color:var(--water-flow-accent-color)}
  .subrow{display:flex;gap:8px;padding:0 14px 14px}
  .compact .subrow{padding:0 12px 12px}
  .sub{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 8px;border-radius:12px;border:1px solid var(--divider-color);background:var(--secondary-background-color);color:var(--primary-text-color);font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sub ha-icon{--mdc-icon-size:16px;flex:0 0 auto}
  .sub .sub-label{overflow:hidden;text-overflow:ellipsis}
  .sub[data-active="true"]{background:color-mix(in srgb, var(--water-flow-accent-color) 22%, transparent);border-color:color-mix(in srgb, var(--water-flow-accent-color) 55%, transparent);color:var(--water-flow-accent-color)}
  .sub:focus-visible,.round:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .error{margin:0 14px 12px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb, var(--error-color) 15%, transparent);color:var(--error-color);font-size:12px;line-height:1.35}
  .unavailable{opacity:.6}
  @keyframes wf-pulse{0%{transform:scale(1)}45%{transform:scale(1.12)}100%{transform:scale(1)}}
  ha-card[data-animations="true"][data-running="true"] .icon{animation:wf-pulse 1.6s ease-in-out infinite}
  ha-card[data-animations="false"] .icon{animation:none}
  dialog{color:var(--primary-text-color);background:var(--card-background-color,var(--ha-card-background));border:0;border-radius:18px;padding:0;max-width:min(460px,calc(100vw - 32px));width:100%;box-shadow:0 12px 40px rgba(0,0,0,.35)}
  dialog::backdrop{background:rgba(0,0,0,.55)}
  .dlg-head{display:flex;align-items:center;gap:12px;padding:16px 16px 10px}
  .dlg-icon{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb, var(--water-flow-accent-color) 18%, transparent);color:var(--water-flow-accent-color)}
  .dlg-titles{flex:1 1 auto;min-width:0}
  .dlg-titles h2{margin:0;font-size:16px}
  .dlg-sub{font-size:12px;color:var(--secondary-text-color)}
  .close{width:32px;height:32px;border-radius:50%;border:0;background:transparent;color:var(--secondary-text-color);cursor:pointer}
  .close:hover{background:var(--secondary-background-color);color:var(--primary-text-color)}
  .dlg-body{padding:0 16px 16px;display:flex;flex-direction:column;gap:12px;max-height:min(70vh,560px);overflow-y:auto}
  .row-field{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .row-field label{font-size:14px;font-weight:500}
  .row-field .hint{font-size:12px;color:var(--secondary-text-color);line-height:1.35;margin-top:2px}
  .input{font:inherit;font-size:14px;color:var(--primary-text-color);background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:10px;padding:8px 10px;min-width:0}
  .input:focus-visible{outline:2px solid var(--primary-color);outline-offset:1px}
  .input.num{width:96px;text-align:right}
  .field-stack{display:flex;flex-direction:column;gap:6px;padding:10px 0;border-top:1px solid var(--divider-color)}
  .field-stack:first-child{border-top:0;padding-top:0}
  .section-title{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--secondary-text-color);margin-top:4px}
  .switch{position:relative;width:42px;height:24px;flex:0 0 auto}
  .switch input{appearance:none;-webkit-appearance:none;position:absolute;inset:0;margin:0;border-radius:999px;background:var(--divider-color);border:0;cursor:pointer;transition:background .2s}
  .switch input:after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:var(--text-primary-color,#fff);transition:transform .2s}
  .switch input:checked{background:var(--water-flow-accent-color)}
  .switch input:checked:after{transform:translateX(18px)}
  .slot{border:1px solid var(--divider-color);border-radius:14px;padding:10px;display:flex;flex-direction:column;gap:8px;background:var(--secondary-background-color)}
  .slot-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
  .slot-head strong{font-size:13px}
  .slot-remove{border:0;background:transparent;color:var(--error-color);font:inherit;font-size:12px;cursor:pointer}
  .days{display:flex;gap:4px}
  .day{flex:1 1 0;border:1px solid var(--divider-color);background:var(--card-background-color,var(--ha-card-background));color:var(--secondary-text-color);border-radius:8px;padding:6px 0;font:inherit;font-size:12px;font-weight:600;cursor:pointer}
  .day[aria-pressed="true"]{background:var(--water-flow-accent-color);border-color:var(--water-flow-accent-color);color:var(--text-primary-color,#fff)}
  .slot-grid{display:flex;gap:8px;flex-wrap:wrap}
  .slot-grid label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--secondary-text-color)}
  .add{border:1px dashed var(--divider-color);background:transparent;color:var(--primary-text-color);border-radius:12px;padding:9px;font:inherit;font-size:13px;cursor:pointer}
  .add:hover{border-color:var(--water-flow-accent-color);color:var(--water-flow-accent-color)}
  .dlg-error{min-height:1.3em;margin:0;font-size:12px;color:var(--error-color)}
  .dlg-foot{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;padding-top:4px;border-top:1px solid var(--divider-color)}
  .btn{font:inherit;font-size:13px;font-weight:600;border-radius:999px;padding:9px 16px;cursor:pointer;border:1px solid var(--divider-color);background:var(--secondary-background-color);color:var(--primary-text-color)}
  .btn.primary{background:var(--water-flow-accent-color);border-color:var(--water-flow-accent-color);color:var(--text-primary-color,#fff)}
  .btn.danger{color:var(--error-color);border-color:color-mix(in srgb, var(--error-color) 45%, transparent);background:transparent}
  .btn:focus-visible,.day:focus-visible,.slot-remove:focus-visible,.close:focus-visible,.add:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .preview{pointer-events:none}
`;

export class WaterFlowCard extends HTMLElementBase {
  set hass(value) {
    const previousState = this._hass?.states?.[this.config?.entity]?.state;
    const previousSession = this._sessionStartMs;
    this._hass = value;
    const nextState = value?.states?.[this.config?.entity]?.state;
    // Session tracking: the pump turning on stamps the clock, anything but
    // "on" clears it, so the elapsed chip survives re-renders but not a stop.
    if (nextState === 'on' && previousState !== 'on') this._sessionStartMs = Date.now();
    if (nextState !== 'on') this._sessionStartMs = null;
    if (previousSession !== this._sessionStartMs) this._sessionMinute = null;
    this._renderIfChanged();
  }

  setConfig(config) {
    if (!config || typeof config !== 'object') throw new Error('Invalid configuration');
    if (typeof config.entity !== 'string' || !config.entity.startsWith('switch.')) {
      throw new Error('entity must be a switch entity, for example switch.irrigazione');
    }
    const next = { ...config };
    if (Object.hasOwn(next, 'accent_color')) {
      const accent = normalizeAccentColor(next.accent_color);
      if (accent === null && String(next.accent_color ?? '').trim()) throw new Error('accent_color must be a hex colour');
      if (accent === null) delete next.accent_color;
      else next.accent_color = accent;
    }
    for (const key of ['tap_action', 'hold_action', 'double_tap_action']) {
      if (!Object.hasOwn(next, key)) continue;
      const action = normalizeCardAction(next[key]);
      if (action === null) throw new Error(`${key} must be one of ${CARD_ACTIONS.join(', ')}`);
      next[key] = action;
    }
    if (Object.hasOwn(next, 'surface')) {
      if (next.surface === '' || next.surface === null || next.surface === undefined) delete next.surface;
      else if (!CARD_SURFACES.includes(next.surface)) throw new Error(`surface must be one of ${CARD_SURFACES.join(', ')}`);
      else if (next.surface === 'default') delete next.surface;
    }
    if (Object.hasOwn(next, 'layout')) {
      if (!['pill', 'compact'].includes(next.layout)) throw new Error('layout must be pill or compact');
      next.layout = normalizeLayout(next.layout);
    }
    if (Object.hasOwn(next, 'haptics_style')) {
      if (!HAPTIC_STYLES.includes(next.haptics_style)) throw new Error(`haptics_style must be one of ${HAPTIC_STYLES.join(', ')}`);
    }
    if (Object.hasOwn(next, 'animation_duration')) next.animation_duration = normalizeAnimationDuration(next.animation_duration);
    this.config = next;
    this._render();
  }

  getCardSize() { return normalizeLayout(this.config?.layout) === 'compact' ? 2 : 3; }

  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states || {}).find((id) => id.startsWith('switch.')) || 'switch.example';
    return defaultCardConfig(entity);
  }

  static getConfigElement() { return document.createElement('water-flow-card-editor'); }

  _strings() { return cardStrings(cardLanguage(this.config, this._hass)); }

  _entity() { return this._hass?.states?.[this.config?.entity] ?? null; }

  _autoState() {
    const auto = this.config?.auto_entity;
    return auto ? this._hass?.states?.[auto] ?? null : null;
  }

  _program() { return programOf(this._hass, this.config); }

  _service(domain, service, data) {
    if (!this._hass?.callService) {
      this._showServiceError(new Error(this._strings().backendMissing));
      return Promise.resolve();
    }
    return Promise.resolve(this._hass.callService(domain, service, data)).catch((error) => {
      this._showServiceError(error);
      return undefined;
    });
  }

  _showServiceError(error) {
    const strings = this._strings();
    const message = strings.serviceError(error?.message || String(error));
    this._dialogError = message;
    if (this._errorBox) this._errorBox.textContent = message;
    else this._renderCardError(message);
  }

  _renderCardError(message) {
    const box = this.shadowRoot?.querySelector?.('.error');
    if (box) box.textContent = message;
  }

  _renderKey() {
    const state = this._entity();
    const program = this._program();
    const auto = this._autoState();
    return JSON.stringify([
      this.config,
      state?.state,
      state?.attributes?.friendly_name,
      this._hass?.locale?.language ?? this._hass?.language ?? null,
      auto?.state,
      program,
      this._sessionMinute,
      this._dialogError,
    ]);
  }

  _renderIfChanged() {
    // The dialog owns the interaction while it is open: rebuilding the card
    // body underneath it would drop the draft, so the close event invalidates
    // the cached key and the next tick repaints from fresh state.
    if (this._dialog?.open || !this.config) return;
    const key = this._renderKey();
    if (key === this._lastRenderKey) return;
    this._lastRenderKey = key;
    this._render();
  }

  _render() {
    if (!this.config) return;
    if (!this.attachShadow) return;
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    if (!this.shadowRoot) return;
    const key = this._renderKey();
    if (key === this._lastRenderKey && this.shadowRoot.querySelector?.('ha-card')) return;
    this._lastRenderKey = key;
    this.shadowRoot.innerHTML = `<style>${CARD_CSS}</style>${this._cardMarkup()}`;
    this._bindCardEvents();
    if (this._dialog) {
      // A re-render rebuilds the card body only: the open dialog element is
      // kept alive and re-attached so its draft and scroll position survive.
      this.shadowRoot.appendChild(this._dialog);
      this._fillDialog();
    }
  }

  _cardMarkup() {
    const strings = this._strings();
    const config = this.config;
    const state = this._entity();
    const program = this._program();
    const auto = this._autoState();
    const status = state?.state;
    const unavailable = status === 'unavailable' || status === 'unknown';
    const statusView = activeProgram(program, Date.now());
    const running = status === 'on';
    const accent = normalizeAccentColor(config.accent_color);
    const surface = normalizeSurface(config.surface);
    const layout = normalizeLayout(config.layout);
    const locale = cardLanguage(config, this._hass) === 'it' ? 'it-IT' : 'en-US';
    const chips = [];
    if (config.show_state_chip !== false) {
      chips.push(`<span class="${running ? 'live' : ''}">${esc(unavailable ? strings.unavailable : pumpStateLabel(status, strings))}</span>`);
    }
    if (unavailable && config.show_unavailable_badge !== false) {
      // The badge is separate from the state chip: it stays visible even when
      // the state chip is switched off, which is the point of the option.
      chips.push(`<span class="badge" role="img" aria-label="${esc(strings.entityUnavailable)}"><ha-icon icon="mdi:alert-outline"></ha-icon></span>`);
    }
    if (running && this._sessionStartMs) {
      const minutes = sessionMinutes(Date.now(), this._sessionStartMs);
      if (minutes) chips.push(`<span class="live">${esc(strings.session(minutes))}</span>`);
    }
    if (config.show_flow_chip !== false && config.flow_entity) {
      const value = chipValue(this._hass?.states?.[config.flow_entity], locale);
      if (value !== null) chips.push(`<span>${esc(strings.flow(value))}</span>`);
    }
    if (config.show_volume_chip !== false && config.volume_entity) {
      const value = chipValue(this._hass?.states?.[config.volume_entity], locale);
      if (value !== null) chips.push(`<span>${esc(strings.volume(value))}</span>`);
    }
    if (config.show_next_change_chip !== false && program) {
      const next = statusView.nextChangeMs ? new Date(statusView.nextChangeMs) : null;
      chips.push(`<span>${esc(strings.nextWindow + (next ? `${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}` : strings.none))}</span>`);
    }
    const error = program?.last_error ? errorLabel(program.last_error, strings) : '';
    const title = esc(cardTitle(config, this._hass));
    const icon = esc(config.icon || 'mdi:water-pump');
    const autoLabel = auto ? (auto.state === 'on' ? strings.autoOn : strings.autoOff) : strings.noAuto;
    const frequency = program ? frequencyLabel(program.frequency_days, strings) : strings.none;
    const windowLabel = program?.active_slot_id || statusView.slotId
      ? String(program?.active_slot_id || statusView.slotId)
      : program && statusView.nextChangeMs
        ? (() => { const next = new Date(statusView.nextChangeMs); return `${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}`; })()
        : strings.none;
    const subRow = [];
    if (config.show_auto_button !== false && config.auto_entity) {
      subRow.push(`<button class="sub" type="button" data-act="auto" data-active="${auto?.state === 'on'}" aria-pressed="${auto?.state === 'on'}" title="${esc(autoLabel)}"><ha-icon icon="mdi:calendar-check"></ha-icon><span class="sub-label">${esc(strings.auto)}</span></button>`);
    }
    if (config.show_schedule_button !== false) {
      subRow.push(`<button class="sub" type="button" data-act="schedule" data-focus="slots" title="${esc(strings.windowsAria)}"><ha-icon icon="mdi:clock-outline"></ha-icon><span class="sub-label">${esc(`${strings.windows}: ${windowLabel}`)}</span></button>`);
      subRow.push(`<button class="sub" type="button" data-act="schedule" data-focus="frequency" title="${esc(strings.frequency)}"><ha-icon icon="mdi:calendar-sync"></ha-icon><span class="sub-label">${esc(frequency)}</span></button>`);
    }
    const ariaAction = config.tap_action === 'more-info' ? strings.actionMoreInfo
      : config.tap_action === 'none' ? strings.actionNone : strings.togglePump;
    const backdrop = state ? strings.openDetails(cardTitle(config, this._hass)) : strings.unavailable;
    return `
      <ha-card class="${layout}" data-surface="${surface}" data-running="${running}" data-animations="${config.animations !== false}" style="${accent ? `--water-flow-accent-color:${accent};` : ''}" aria-label="${esc(backdrop)}" title="${esc(ariaAction)}">
        <div class="row" data-act="card">
          <div class="icon ${unavailable ? 'unavailable' : ''}"><ha-icon icon="${icon}"></ha-icon></div>
          <div class="main">
            <div class="title">${title}</div>
            <div class="status-line">${chips.join('')}</div>
          </div>
          <div class="side">
            ${config.show_schedule_button !== false ? `<button class="round" type="button" data-act="schedule" data-focus="slots" aria-label="${esc(strings.windowsAria)}"><ha-icon icon="mdi:calendar-clock"></ha-icon></button>` : ''}
          </div>
        </div>
        ${subRow.length ? `<div class="subrow">${subRow.join('')}</div>` : ''}
        ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ''}
      </ha-card>`;
  }

  _bindCardEvents() {
    const root = this.shadowRoot;
    if (!root?.addEventListener) return;
    if (root.__bound) return;
    root.__bound = true;
    root.addEventListener('click', (event) => {
      const target = event.target?.closest?.('[data-act]');
      if (!target) return;
      const act = target.dataset.act;
      if (act === 'card') { this._cardAction(); return; }
      if (act === 'auto') { this._toggleAuto(); return; }
      if (act === 'schedule') { this.openSchedule(target.dataset.focus || 'slots'); return; }
    });
    root.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const target = event.target?.closest?.('[data-act="card"]');
      if (!target) return;
      event.preventDefault();
      this._cardAction();
    });
  }

  _cardAction() {
    const strings = this._strings();
    const call = actionCall(this.config?.tap_action ?? 'toggle', this.config.entity);
    if (!call) return;
    fireHaptic(this.config.haptics !== false, this.config.haptics_style);
    this._service(call.domain, call.service, call.data);
  }

  _toggleAuto() {
    const auto = this.config?.auto_entity;
    if (!auto) {
      this.openSchedule('slots');
      return;
    }
    fireHaptic(this.config.haptics !== false, this.config.haptics_style);
    const call = toggleAutoCall(auto);
    this._service(call.domain, call.service, call.data);
  }

  // --- Schedule dialog -------------------------------------------------

  openSchedule(focus = 'slots') {
    const strings = this._strings();
    if (!this.shadowRoot) return;
    if (!this._dialog) {
      const dialog = document.createElement('dialog');
      dialog.setAttribute('aria-label', strings.scheduleTitle);
      dialog.addEventListener('close', () => { this._lastRenderKey = null; });
      dialog.addEventListener('click', (event) => {
        const target = event.target?.closest?.('[data-act]');
        if (!target) return;
        this._dialogAction(target.dataset.act, target);
      });
      dialog.addEventListener('input', (event) => this._dialogInput(event.target));
      dialog.addEventListener('change', (event) => this._dialogInput(event.target));
      dialog.addEventListener('keydown', (event) => { if (event.key === 'Enter' && event.target?.tagName === 'INPUT') event.preventDefault(); });
      this._dialog = dialog;
      this.shadowRoot.appendChild(dialog);
    }
    this._dialogError = null;
    this._draft = scheduleDraft(this._program());
    if (this.config?.auto_entity && !this._draft.auto_entity) this._draft.auto_entity = this.config.auto_entity;
    this._fillDialog();
    if (!this._dialog.open) {
      if (typeof this._dialog.showModal === 'function') this._dialog.showModal();
      else this._dialog.setAttribute('open', '');
    }
    if (focus === 'frequency') {
      const input = this._dialog.querySelector('[data-field="frequency_days"]');
      input?.focus?.();
      input?.select?.();
    }
  }

  _fillDialog() {
    const dialog = this._dialog;
    if (!dialog) return;
    const strings = this._strings();
    const draft = this._draft || (this._draft = scheduleDraft(this._program()));
    const program = this._program();
    dialog.innerHTML = `
      <style>${CARD_CSS}</style>
      <div class="dlg-head">
        <span class="dlg-icon"><ha-icon icon="mdi:water-pump"></ha-icon></span>
        <div class="dlg-titles"><h2>${esc(strings.scheduleTitle)}</h2><div class="dlg-sub">${esc(program ? cardTitle(this.config, this._hass) : strings.noProgram)}</div></div>
        <button class="close" type="button" data-act="close" aria-label="${esc(strings.closeSchedule)}"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>
      <div class="dlg-body">
        <div class="field-stack">
          <div class="row-field">
            <div><label for="wf-enabled">${esc(strings.scheduleEnabled)}</label><div class="hint">${esc(strings.scheduleEnabledHelp)}</div></div>
            <span class="switch"><input id="wf-enabled" type="checkbox" role="switch" data-field="enabled" ${draft.enabled ? 'checked' : ''}></span>
          </div>
          <div class="row-field">
            <div><label for="wf-frequency">${esc(strings.frequency)}</label><div class="hint">${esc(strings.frequencyHelp)}</div></div>
            <input class="input num" id="wf-frequency" type="number" min="1" max="${MAX_FREQUENCY_DAYS}" step="1" data-field="frequency_days" value="${esc(draft.frequency_days)}">
          </div>
          <div class="row-field">
            <label for="wf-anchor">${esc(strings.anchor)}</label>
            <input class="input" id="wf-anchor" type="date" data-field="start_date" value="${esc(draft.start_date)}">
          </div>
          <div class="row-field">
            <div><label for="wf-auto">${esc(strings.auto)}</label><div class="hint">${esc(strings.autoHelp)}</div></div>
            <input class="input" id="wf-auto" type="text" list="wf-auto-list" data-field="auto_entity" placeholder="input_boolean.irrigazione_attiva" value="${esc(draft.auto_entity)}">
          </div>
        </div>
        <div class="section-title" id="wf-windows">${esc(strings.windowsAria)}</div>
        <div class="slots">${draft.slots.map((slot, index) => this._slotMarkup(slot, index, strings)).join('')}</div>
        <button class="add" type="button" data-act="add-slot">${esc(strings.addWindow)}</button>
        <p class="dlg-error" role="alert" aria-live="assertive">${esc(this._dialogError || '')}</p>
        <div class="dlg-foot">
          ${program ? `<button class="btn danger" type="button" data-act="delete">${esc(strings.deleteProgram)}</button>` : ''}
          <button class="btn" type="button" data-act="close">${esc(strings.cancel)}</button>
          <button class="btn primary" type="button" data-act="save">${esc(strings.saveProgram)}</button>
        </div>
      </div>`;
    dialog.__listBound = false;
    this._errorBox = dialog.querySelector('.dlg-error');
    this._bindAutoList();
  }

  _bindAutoList() {
    const dialog = this._dialog;
    if (!dialog || dialog.__listBound) return;
    const states = this._hass?.states || {};
    const options = Object.keys(states).filter((id) => id.startsWith('input_boolean.'));
    if (!options.length) return;
    const list = document.createElement('datalist');
    list.id = 'wf-auto-list';
    list.innerHTML = options.map((id) => `<option value="${esc(id)}"></option>`).join('');
    dialog.__listBound = true;
    dialog.appendChild(list);
  }

  _slotMarkup(slot, index, strings) {
    return `
      <div class="slot" data-slot="${index}">
        <div class="slot-head">
          <strong>${esc(strings.window(index + 1))}</strong>
          <button class="slot-remove" type="button" data-act="remove-slot" data-slot="${index}" aria-label="${esc(strings.removeWindow(index + 1))}">${esc(strings.removeWindow(index + 1))}</button>
        </div>
        <div class="days" role="group" aria-label="${esc(strings.dayNames.join(', '))}">
          ${strings.dayPills.map((label, dayIndex) => {
            const day = dayIndex + 1;
            const pressed = slot.days.includes(day);
            return `<button class="day" type="button" data-act="toggle-day" data-slot="${index}" data-day="${day}" aria-pressed="${pressed}" aria-label="${esc(strings.dayNames[dayIndex])}">${esc(label)}</button>`;
          }).join('')}
        </div>
        <div class="slot-grid">
          <label>${esc(strings.start)}<input class="input" type="time" data-slot="${index}" data-slot-field="start" value="${esc(slot.start)}"></label>
          <label>${esc(strings.duration)}<input class="input num" type="number" min="1" max="${MAX_DURATION_MINUTES}" step="1" data-slot="${index}" data-slot-field="duration" value="${esc(slot.duration)}"></label>
          <label>${esc(strings.liters)}<input class="input num" type="number" min="0" step="1" data-slot="${index}" data-slot-field="liters" value="${esc(slot.liters)}" title="${esc(strings.litersHelp)}" placeholder="0"></label>
        </div>
      </div>`;
  }

  _dialogInput(target) {
    const draft = this._draft;
    if (!draft || !target) return;
    const field = target.dataset?.field;
    if (field === 'enabled') { draft.enabled = Boolean(target.checked); return; }
    if (field === 'frequency_days') { draft.frequency_days = target.value === '' ? '' : Number(target.value); return; }
    if (field === 'start_date') { draft.start_date = target.value; return; }
    if (field === 'auto_entity') { draft.auto_entity = target.value.trim(); return; }
    const slotIndex = Number(target.dataset?.slot);
    const slotField = target.dataset?.slotField;
    if (Number.isInteger(slotIndex) && draft.slots[slotIndex] && slotField) {
      draft.slots[slotIndex][slotField] = slotField === 'duration' && target.value !== '' ? Number(target.value) : target.value;
    }
  }

  _dialogAction(action, target) {
    const strings = this._strings();
    const draft = this._draft;
    if (action === 'close') { this._closeDialog(); return; }
    if (action === 'add-slot') {
      draft.slots.push(slotDraft(draft.slots.length));
      this._refreshSlots();
      return;
    }
    if (action === 'remove-slot') {
      draft.slots.splice(Number(target.dataset.slot), 1);
      this._refreshSlots();
      return;
    }
    if (action === 'toggle-day') {
      const index = Number(target.dataset.slot);
      const day = Number(target.dataset.day);
      const days = draft.slots[index].days;
      draft.slots[index].days = days.includes(day) ? days.filter((value) => value !== day) : [...days, day].sort((a, b) => a - b);
      this._refreshSlots();
      return;
    }
    if (action === 'save') { this._saveDraft(); return; }
    if (action === 'delete') { this._deleteDraft(); return; }
  }

  _refreshSlots() {
    const container = this._dialog?.querySelector('.slots');
    if (!container) return;
    container.innerHTML = this._draft.slots.map((slot, index) => this._slotMarkup(slot, index, this._strings())).join('');
  }

  _setDialogError(message) {
    this._dialogError = message;
    if (this._errorBox) this._errorBox.textContent = message || '';
  }

  _saveDraft() {
    const strings = this._strings();
    const result = validateScheduleDraft(this._draft);
    if (!result.ok) {
      this._setDialogError(errorLabel(result, strings) || strings.invalidDraft);
      return;
    }
    const payload = programPayload(this.config.entity, this._draft);
    fireHaptic(this.config.haptics !== false, this.config.haptics_style);
    this._setDialogError('');
    this._service(WATER_FLOW_DOMAIN, 'save_program', payload).then(() => {
      if (this._dialogError) return;
      this._closeDialog();
    });
  }

  _deleteDraft() {
    const strings = this._strings();
    if (typeof globalThis.confirm === 'function' && !globalThis.confirm(strings.deleteConfirm)) return;
    this._setDialogError('');
    this._service(WATER_FLOW_DOMAIN, 'delete_program', deleteProgramPayload(this.config.entity)).then(() => {
      if (this._dialogError) return;
      this._closeDialog();
    });
  }

  _closeDialog() {
    const dialog = this._dialog;
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
    this._setDialogError('');
  }
}

export const frequencyLabel = (days, strings) => strings.everyDays(numeric(days) ?? 1);

const EDITOR_CSS = `
  :host{display:block;color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family,inherit)}
  .ed{display:flex;flex-direction:column;gap:12px;padding:4px 2px 8px}
  .ed-sec{background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:16px;padding:10px 16px 14px}
  .ed-sec h3{margin:8px 0 2px;font-size:14px;font-weight:600}
  .ed-row{display:flex;align-items:center;justify-content:space-between;gap:10px 16px;flex-wrap:wrap;padding:9px 0;border-top:1px solid var(--divider-color)}
  .ed-sec h3 + .ed-row{border-top:0}
  .ed-txt{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 180px}
  .ed-lbl{font-size:14px;font-weight:500}
  .ed-help{font-size:12px;color:var(--secondary-text-color);line-height:1.35}
  .ed-input{flex:1 1 160px;max-width:260px;min-width:0;font:inherit;font-size:14px;color:var(--primary-text-color);background:var(--card-background-color,var(--ha-card-background));border:1px solid var(--divider-color);border-radius:10px;padding:9px 10px}
  .ed-input::placeholder{color:var(--secondary-text-color)}
  .ed-input:focus-visible{outline:2px solid var(--primary-color);outline-offset:1px;border-color:transparent}
  ha-entity-picker{flex:1 1 200px;max-width:320px;min-width:0}
  .sw{appearance:none;-webkit-appearance:none;flex:0 0 auto;position:relative;width:42px;height:24px;border-radius:999px;background:var(--divider-color);border:0;margin:0;cursor:pointer;transition:background .2s}
  .sw:after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:var(--text-primary-color,#fff);transition:transform .2s}
  .sw:checked{background:var(--water-flow-accent-color,var(--primary-color))}
  .sw:checked:after{transform:translateX(18px)}
  .sw:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .ed-seg{display:inline-flex;gap:3px;background:var(--card-background-color,var(--ha-card-background));border:1px solid var(--divider-color);border-radius:999px;padding:3px;flex:0 0 auto}
  .ed-seg button{font:inherit;font-size:13px;font-weight:600;color:var(--secondary-text-color);background:transparent;border:0;border-radius:999px;padding:6px 14px;cursor:pointer}
  .ed-seg button[aria-pressed="true"]{background:var(--water-flow-accent-color,var(--primary-color));color:var(--text-primary-color,#fff)}
  .ed-seg button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .ed-color{display:flex;align-items:center;gap:10px;flex:0 0 auto}
  .ed-color input[type=color]{width:46px;height:32px;padding:2px;border:1px solid var(--divider-color);border-radius:10px;background:var(--card-background-color,var(--ha-card-background));cursor:pointer}
  .ed-color button{font:inherit;font-size:12px;font-weight:600;padding:7px 12px;border-radius:999px;border:1px solid var(--divider-color);background:var(--card-background-color,var(--ha-card-background));color:var(--primary-text-color);cursor:pointer}
  .ed-color button:disabled{opacity:.45;cursor:default}
  @media(max-width:520px){.ed-row{flex-direction:column;align-items:stretch}.ed-input,ha-entity-picker{max-width:none}}
`;

export class WaterFlowCardEditor extends HTMLElementBase {
  set hass(value) {
    this._hass = value;
    // Forward to the live pickers instead of rebuilding them: recreating the
    // form on every hass tick dropped keyboard focus while typing.
    for (const picker of this._pickers || []) picker.hass = value;
  }

  setConfig(config) {
    this._config = { ...config };
    if (!this.shadowRoot) this.attachShadow?.({ mode: 'open' });
    if (!this.shadowRoot || this.shadowRoot.__built) {
      this._renderValues();
      return;
    }
    this._build();
  }

  _build() {
    const strings = cardStrings(cardLanguage(this._config, this._hass));
    const rows = configSchema.map((section) => {
      const fields = section.schema.map((entry) => this._rowMarkup(entry, strings)).join('');
      return `<section class="ed-sec"><h3>${esc(strings.sections?.[section.name] || section.name)}</h3>${fields}</section>`;
    }).join('');
    this.shadowRoot.innerHTML = `<style>${EDITOR_CSS}</style><div class="ed">${rows}</div>`;
    this.shadowRoot.__built = true;
    this._pickers = [];
    this._bindRows();
    this._renderValues();
  }

  _rowMarkup(entry, strings) {
    const name = entry.name;
    const label = esc(fieldLabel(strings, name));
    const help = esc(strings.help?.[name] || '');
    const selector = entry.selector;
    let control = '';
    if (selector.entity) {
      control = `<ha-entity-picker data-field="${name}" allow-custom-entity></ha-entity-picker>`;
    } else if (selector.boolean) {
      control = `<input class="sw" type="checkbox" role="switch" data-field="${name}">`;
    } else if (selector.select) {
      control = `<div class="ed-seg" role="group" data-field="${name}">${selector.select.options.map((option) => `<button type="button" data-value="${esc(option)}" aria-pressed="false">${esc(option)}</button>`).join('')}</div>`;
    } else if (selector.color) {
      control = `<div class="ed-color" data-field="${name}"><input type="color" data-role="color"><button type="button" data-role="clear" disabled>${esc(strings.themeColor)}</button></div>`;
    } else if (selector.number) {
      control = `<input class="ed-input" type="number" data-field="${name}" min="${selector.number.min}" max="${selector.number.max}" step="${selector.number.step}">`;
    } else {
      control = `<input class="ed-input" type="text" data-field="${name}">`;
    }
    return `<div class="ed-row"><div class="ed-txt"><span class="ed-lbl">${label}</span><span class="ed-help">${help}</span></div>${control}</div>`;
  }

  _bindRows() {
    const root = this.shadowRoot;
    root.addEventListener('input', (event) => {
      const target = event.target;
      const name = target?.dataset?.field;
      if (!name) return;
      this._updateField(name, target.type === 'checkbox' ? target.checked : target.value);
    });
    root.addEventListener('change', (event) => {
      const target = event.target;
      if (target?.tagName === 'HA-ENTITY-PICKER') this._updateField(target.dataset.field, target.value || '');
      if (target?.type === 'color') {
        const wrap = target.closest('[data-field]');
        if (wrap) this._updateField(wrap.dataset.field, target.value);
      }
    });
    root.addEventListener('click', (event) => {
      const segment = event.target?.closest?.('.ed-seg button');
      if (segment) {
        const wrap = segment.closest('.ed-seg');
        this._updateField(wrap.dataset.field, segment.dataset.value);
        this._renderValues();
        return;
      }
      const clear = event.target?.closest?.('[data-role="clear"]');
      if (clear) {
        const wrap = clear.closest('[data-field]');
        this._updateField(wrap.dataset.field, '');
        this._renderValues();
      }
    });
  }

  _updateField(name, value) {
    const next = { ...this._config, [name]: value };
    const stripped = stripCardDefaults(next);
    if (sameCardConfig(this._config, stripped)) return;
    this._config = stripped;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: stripped },
      bubbles: true,
      composed: true,
    }));
  }

  _renderValues() {
    if (!this.shadowRoot?.querySelector) return;
    const config = this._config;
    for (const entry of configSchemaFields()) {
      const name = entry.name;
      const control = this.shadowRoot.querySelector(`[data-field="${name}"]`);
      if (!control) continue;
      const value = Object.hasOwn(config, name) ? config[name] : cardDefault(name, config.entity);
      if (entry.selector.boolean) control.checked = Boolean(value);
      else if (entry.selector.entity) {
        control.hass = this._hass;
        control.value = typeof value === 'string' && value ? value : null;
        if (!this._pickers.includes(control)) this._pickers.push(control);
      } else if (entry.selector.select) {
        for (const button of control.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.value === String(value)));
      } else if (entry.selector.color) {
        const color = control.querySelector('[data-role="color"]');
        const clear = control.querySelector('[data-role="clear"]');
        const accent = normalizeAccentColor(config.accent_color);
        color.value = accent || '#3f9cf4';
        clear.disabled = !accent;
      } else if (entry.selector.number) {
        control.value = value ?? '';
      } else {
        control.value = value ?? '';
      }
    }
  }
}

export const WATER_FLOW_CARD_TAG = 'water-flow-card';
export const WATER_FLOW_CARD_EDITOR_TAG = 'water-flow-card-editor';
// Element defined by the HA frontend app bundle itself: its presence in the
// live registry proves the scoped customElements registry has been installed.
const FRONTEND_READY_TAG = 'home-assistant';
const REREGISTER_POLL_MS = 100;
const REREGISTER_MAX_ATTEMPTS = 300;

const ensureWaterFlowCardList = () => {
  if (!globalThis.window) return;
  const scope = globalThis.window;
  scope.customCards = scope.customCards || [];
  if (!scope.customCards.some((card) => card?.type === WATER_FLOW_CARD_TAG)) {
    scope.customCards.push({
      type: WATER_FLOW_CARD_TAG,
      name: 'Water Flow Card',
      description: 'Irrigation pump card with a weekly schedule and water readouts',
      preview: true,
      documentationURL: 'https://github.com/kerdx/water-flow-card',
      getEntitySuggestion,
    });
  }
};

export const isWaterFlowElementsRegistered = () => {
  try {
    const registry = globalThis.customElements;
    return registry?.get?.(WATER_FLOW_CARD_TAG) === WaterFlowCard
      && registry?.get?.(WATER_FLOW_CARD_EDITOR_TAG) === WaterFlowCardEditor;
  } catch {
    return false;
  }
};

export const registerWaterFlowElements = () => {
  // Keep the card-picker entry independent of element registration: it must
  // be added idempotently even when customElements/HTMLElement is missing.
  ensureWaterFlowCardList();
  // Read the registry afresh on every call: HA replaces window.customElements
  // when the scoped polyfill takes over, so a captured reference could point
  // to the stale native registry where the first define() was lost.
  const registry = globalThis.customElements;
  if (!registry?.define || !registry?.get || !globalThis.HTMLElement) return false;
  for (const [tag, ctor] of [[WATER_FLOW_CARD_TAG, WaterFlowCard], [WATER_FLOW_CARD_EDITOR_TAG, WaterFlowCardEditor]]) {
    if (!registry.get(tag)) {
      try {
        registry.define(tag, ctor);
      } catch (error) {
        // Benign only when another copy raced us and the tag is now defined.
        if (!registry.get(tag)) throw error;
      }
    }
  }
  return isWaterFlowElementsRegistered();
};

export const isHomeAssistantFrontendReady = () => {
  try {
    return Boolean(globalThis.customElements?.get?.(FRONTEND_READY_TAG));
  } catch {
    return false;
  }
};

export const scheduleWaterFlowReregistration = ({ intervalMs = REREGISTER_POLL_MS, maxAttempts = REREGISTER_MAX_ATTEMPTS, schedule = (fn, ms) => setTimeout(fn, ms), clear = (timerId) => clearTimeout(timerId), warn = (message) => globalThis.console?.warn?.(message) } = {}) => {
  let attempts = 0;
  let timer = null;
  const cancel = () => {
    if (timer !== null) {
      clear(timer);
      timer = null;
    }
  };
  const giveUp = () => {
    try {
      warn?.(`water-flow-card: frontend not ready or card missing from the active registry after ${attempts} attempt(s).`);
    } catch { /* a missing console must not mask the exhaustion */ }
  };
  const poll = () => {
    timer = null;
    if (isHomeAssistantFrontendReady()) {
      try {
        registerWaterFlowElements();
      } catch (error) {
        // Deterministic failure path: a real define() error must surface once
        // instead of escaping this timer callback as an uncaught exception.
        try {
          warn?.(`water-flow-card: failed to register custom elements: ${error?.message || error}`);
        } catch { /* ignore */ }
        return;
      }
      if (isWaterFlowElementsRegistered()) return;
    }
    attempts += 1;
    if (attempts >= maxAttempts) {
      giveUp();
      return;
    }
    timer = schedule(poll, intervalMs);
  };
  registerWaterFlowElements();
  if (isHomeAssistantFrontendReady() && isWaterFlowElementsRegistered()) return cancel;
  if (maxAttempts <= 0) {
    giveUp();
    return cancel;
  }
  timer = schedule(poll, intervalMs);
  return cancel;
};

if (globalThis.window && typeof setTimeout === 'function') {
  scheduleWaterFlowReregistration();
} else {
  registerWaterFlowElements();
}
