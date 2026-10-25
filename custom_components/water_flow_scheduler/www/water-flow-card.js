export const numeric = (v) => {
  if (v === null || v === undefined || (typeof v === 'string' && (!v.trim() || ['unknown', 'unavailable'].includes(v.trim().toLowerCase())))) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

export const WATER_FLOW_DOMAIN = 'water_flow_scheduler';
export const MAX_SLOTS = 50;
export const MAX_DURATION_MINUTES = 1440;
export const MAX_FREQUENCY_DAYS = 31;
export const SCHEDULE_MODES = ['weekdays', 'interval', 'legacy'];
export const CARD_SURFACES = ['default', 'elevated', 'blend'];
export const CARD_ACTIONS = ['toggle', 'more-info', 'none'];
export const HAPTIC_STYLES = ['light', 'medium', 'heavy'];
export const ANIMATION_DURATION_DEFAULT = 220;

export const stepScheduleValue = (value, field, direction) => {
  if (!Number.isFinite(direction) || ![-1, 1].includes(direction)) return value;
  const current = numeric(value);
  if (field === 'duration') {
    const base = Number.isInteger(current) ? current : Math.trunc(current ?? 0);
    return Math.max(1, Math.min(MAX_DURATION_MINUTES, base + direction));
  }
  if (field === 'liters') {
    if (current === null) return direction > 0 ? '1' : '';
    const next = current + direction;
    return next <= 0 ? '' : String(Number(next.toFixed(6)));
  }
  return value;
};

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
    valve: 'Valve',
    valveOn: 'Active',
    valveOff: 'Off',
    toggleValve: (state) => state === 'on' ? 'Valve active. Tap to turn it off.' : state === 'off' ? 'Valve off. Tap to turn it on.' : 'Valve state unavailable. Tap to toggle the switch.',
    deviceStatus: 'Device status',
    deviceStatusNormal: 'Normal',
    irrigationMode: 'Mode',
    timedIrrigation: 'Timed cycle',
    dailyVolume: 'Today',
    realTimeVolume: 'Current volume',
    realTimeDuration: 'Duration',
    irrigationStart: 'Start',
    irrigationEnd: 'End',
    shortageProtection: 'Water protection',
    shortageProtectionOn: 'Enabled',
    shortageProtectionOff: 'Disabled',
    toggleShortageProtection: (state) => state === 'on' ? 'Water-shortage protection enabled. Tap to disable.' : state === 'off' ? 'Water-shortage protection disabled. Tap to enable.' : 'Water-shortage protection unavailable. Tap to toggle the switch.',
    scheduleMode: 'Repeat pattern',
    weekdayMode: 'Specific weekdays',
    weekdayModeHelp: 'Water on the selected weekdays every week.',
    intervalMode: 'Every N days',
    intervalModeHelp: 'Repeat each watering window on a continuous cycle from a start date.',
    intervalFrequencyHelp: 'Repeat every watering window every N days from the start date.',
    legacyFrequencyHelp: 'The schedule checks your selected weekdays on a repeating N-day cycle.',
    legacyMode: 'Existing combined schedule',
    legacyModeHelp: 'This saved program combines selected weekdays with an N-day cycle. Choose either new mode to simplify it.',
    weeklySummary: 'Selected weekdays',
    legacySummary: (frequency) => `Existing · ${frequency}`,
    weekdayWindowHelp: 'Choose the weekdays, start time and duration for each window.',
    intervalWindowHelp: 'Each window repeats on every eligible day in the cycle.',
    legacyWindowHelp: 'This existing schedule combines selected weekdays with its N-day cycle.',
    battery: (value) => `Battery ${value}`,
    anchorHelp: 'The cycle starts on this date; required when frequency exceeds one day.',
    nextWindow: 'Next: ',
    none: 'none',
    everyDays: (days) => (days === 1 ? 'Every day' : `Every ${days} days`),
    anchor: 'Starting from',
    scheduleTitle: 'Irrigation schedule',
    scheduleEnabled: 'Program active',
    scheduleEnabledHelp: 'When enabled, the schedule can control the pump during its watering windows.',
    autoHelp: 'When Auto is on, this schedule controls the pump. When it is off, the pump remains under your control.',
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
    increaseValue: (field, index) => `Increase ${field} for window ${index}`,
    decreaseValue: (field, index) => `Decrease ${field} for window ${index}`,
    windowCount: (count) => `${count} ${count === 1 ? 'window' : 'windows'}`,
    windowCountLimit: (count, max) => `${count} / ${max} windows`,
    windowSectionHelp: 'Choose when and how long each watering run lasts.',
    selectWindowDays: (index) => `Watering days for window ${index}`,
    emptyWindowsTitle: 'No watering windows yet',
    emptyWindowsHelp: 'Add a window, then choose the days and time for watering.',
    activeProgram: 'Enabled',
    pausedProgram: 'Paused',
    unsavedChanges: 'You have unsaved changes.',
    discardPrompt: 'Discard your unsaved changes?',
    discardChanges: 'Discard changes',
    keepEditing: 'Keep editing',
    deletePrompt: 'Delete the saved irrigation program? This cannot be undone.',
    deleteNow: 'Delete program',
    keepProgram: 'Keep program',
    savingProgram: 'Saving…',
    deletingProgram: 'Deleting…',
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
      invalid_schedule_mode: 'Choose either specific weekdays or an every-N-days schedule.',
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
      cannot_release_control: 'Scheduler control could not be released because the switch is unavailable.',
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
      auto_entity: 'Auto helper', flow_entity: 'Flow sensor', volume_entity: 'Volume sensor', battery_entity: 'Battery sensor',
      work_state_entity: 'Valve work-state sensor',
      device_status_entity: 'Device status sensor',
      irrigation_mode_entity: 'Irrigation mode sensor',
      timed_irrigation_entity: 'Timed irrigation sensor',
      daily_volume_entity: 'Daily volume sensor',
      real_time_volume_entity: 'Real-time volume sensor',
      real_time_duration_entity: 'Real-time duration sensor',
      irrigation_start_time_entity: 'Irrigation start-time sensor',
      irrigation_end_time_entity: 'Irrigation end-time sensor',
      shortage_protection_entity: 'Water-shortage protection switch',
      program_entity: 'Programs sensor',
      show_state_chip: 'Show pump state', show_flow_chip: 'Show flow',
      show_volume_chip: 'Show volume', show_battery_button: 'Show battery button', show_next_change_chip: 'Show next window',
      show_unavailable_badge: 'Show unavailable badge', show_auto_button: 'Show auto button',
      show_schedule_button: 'Show schedule buttons',
      show_work_state_button: 'Show valve status and control',
      show_device_status_chip: 'Show device status',
      show_irrigation_mode_chip: 'Show irrigation mode',
      show_timed_irrigation_chip: 'Show timed irrigation status',
      show_daily_volume_chip: 'Show daily volume',
      show_real_time_volume_chip: 'Show real-time volume',
      show_real_time_duration_chip: 'Show real-time duration',
      show_irrigation_time_chips: 'Show irrigation start and end',
      show_shortage_protection_button: 'Show water-shortage protection control',
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
      flow_entity: 'Flow sensor override; if empty, a matching sensor is detected automatically.',
      volume_entity: 'Volume sensor override; if empty, a matching sensor is detected automatically.',
      battery_entity: 'Battery sensor override; if empty, a matching sensor is detected automatically.',
      work_state_entity: 'Read-only binary sensor showing whether the valve is working. Its button controls the pump switch.',
      device_status_entity: 'Optional text sensor that reports the device status.',
      irrigation_mode_entity: 'Optional text sensor that reports the current irrigation mode.',
      timed_irrigation_entity: 'Optional text sensor that reports the timed irrigation cycle state.',
      daily_volume_entity: 'Optional sensor for the total irrigation volume today.',
      real_time_volume_entity: 'Optional sensor for the current irrigation volume.',
      real_time_duration_entity: 'Optional sensor for the current irrigation duration.',
      irrigation_start_time_entity: 'Optional sensor containing the irrigation start timestamp.',
      irrigation_end_time_entity: 'Optional sensor containing the irrigation end timestamp.',
      shortage_protection_entity: 'Switch that enables or disables automatic closure when water is scarce.',
      program_entity: 'Diagnostic sensor created by the integration. Leave empty to find it automatically.',
      show_state_chip: 'Watering or off state in the status line.',
      show_flow_chip: 'Current flow chip.',
      show_volume_chip: 'Volume chip.',
      show_battery_button: 'Battery sensor button; opens more-info for the selected sensor.',
      show_next_change_chip: 'Next watering window in the status line.',
      show_unavailable_badge: 'Indicator when the entity is unavailable.',
      show_auto_button: 'Show the Auto sub-button that toggles the auto helper.',
      show_schedule_button: 'Show the Windows and Frequency sub-buttons that open the scheduler.',
      show_work_state_button: 'Show the configured valve sensor state and a button that toggles the pump switch.',
      show_device_status_chip: 'Show the configured device status sensor in the status line.',
      show_irrigation_mode_chip: 'Show the configured irrigation mode sensor in the status line.',
      show_timed_irrigation_chip: 'Show the configured timed irrigation sensor in the status line.',
      show_daily_volume_chip: 'Show the configured daily irrigation volume.',
      show_real_time_volume_chip: 'Show the configured current irrigation volume.',
      show_real_time_duration_chip: 'Show the configured current irrigation duration.',
      show_irrigation_time_chips: 'Show start and end times from their timestamp sensors.',
      show_shortage_protection_button: 'Show a button for the water-shortage protection switch.',
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
    valve: 'Valvola',
    valveOn: 'Attiva',
    valveOff: 'Spenta',
    toggleValve: (state) => state === 'on' ? 'Valvola attiva. Tocca per disattivarla.' : state === 'off' ? 'Valvola spenta. Tocca per attivarla.' : 'Stato valvola non disponibile. Tocca per commutare lo switch.',
    deviceStatus: 'Stato dispositivo',
    deviceStatusNormal: 'Normale',
    irrigationMode: 'Modalità',
    timedIrrigation: 'Ciclo temporizzato',
    dailyVolume: 'Oggi',
    realTimeVolume: 'Volume attuale',
    realTimeDuration: 'Durata',
    irrigationStart: 'Inizio',
    irrigationEnd: 'Fine',
    shortageProtection: 'Protezione acqua',
    shortageProtectionOn: 'Attiva',
    shortageProtectionOff: 'Disattiva',
    toggleShortageProtection: (state) => state === 'on' ? 'Protezione carenza acqua attiva. Tocca per disattivarla.' : state === 'off' ? 'Protezione carenza acqua disattiva. Tocca per attivarla.' : 'Protezione carenza acqua non disponibile. Tocca per commutare lo switch.',
    scheduleMode: 'Modalità di ripetizione',
    weekdayMode: 'Giorni della settimana',
    weekdayModeHelp: 'Irriga nei giorni selezionati, ogni settimana.',
    intervalMode: 'Ogni N giorni',
    intervalModeHelp: 'Ripete ogni fascia con un ciclo continuo a partire da una data.',
    intervalFrequencyHelp: 'Ripete ogni fascia ogni N giorni a partire dalla data iniziale.',
    legacyFrequencyHelp: 'Il programma verifica i giorni selezionati seguendo un ciclo di N giorni.',
    legacyMode: 'Programma precedente combinato',
    legacyModeHelp: 'Questo programma combina i giorni selezionati con un ciclo ogni N giorni. Scegli una modalità per semplificarlo.',
    weeklySummary: 'Giorni selezionati',
    legacySummary: (frequency) => `Esistente · ${frequency}`,
    weekdayWindowHelp: 'Scegli i giorni della settimana, l’orario e la durata di ogni fascia.',
    intervalWindowHelp: 'Ogni fascia si ripete nei giorni previsti dal ciclo.',
    legacyWindowHelp: 'Questo programma precedente combina i giorni selezionati con il ciclo ogni N giorni.',
    battery: (value) => `Batteria ${value}`,
    anchorHelp: 'Il ciclo inizia da questa data; richiesta quando la frequenza supera un giorno.',
    nextWindow: 'Prossimo: ',
    none: 'nessuno',
    everyDays: (days) => (days === 1 ? 'Ogni giorno' : `Ogni ${days} giorni`),
    anchor: 'A partire dal',
    scheduleTitle: 'Pianificazione irrigazione',
    scheduleEnabled: 'Programma attivo',
    scheduleEnabledHelp: 'Quando è attivo, il programma può controllare la pompa durante le finestre di irrigazione.',
    autoHelp: 'Con Auto attiva, il programma controlla la pompa. Con Auto disattiva, la pompa resta sotto il tuo controllo.',
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
    increaseValue: (field, index) => `Aumenta ${field} per la fascia ${index}`,
    decreaseValue: (field, index) => `Riduci ${field} per la fascia ${index}`,
    windowCount: (count) => `${count} ${count === 1 ? 'fascia' : 'fasce'}`,
    windowCountLimit: (count, max) => `${count} / ${max} fasce`,
    windowSectionHelp: 'Scegli quando e per quanto tempo irrigare.',
    selectWindowDays: (index) => `Giorni di irrigazione della fascia ${index}`,
    emptyWindowsTitle: 'Nessuna fascia impostata',
    emptyWindowsHelp: 'Aggiungi una fascia e scegli i giorni e l’orario di irrigazione.',
    activeProgram: 'Attivo',
    pausedProgram: 'In pausa',
    unsavedChanges: 'Ci sono modifiche non salvate.',
    discardPrompt: 'Vuoi scartare le modifiche non salvate?',
    discardChanges: 'Scarta modifiche',
    keepEditing: 'Continua a modificare',
    deletePrompt: 'Eliminare il programma salvato? L’azione non può essere annullata.',
    deleteNow: 'Elimina programma',
    keepProgram: 'Mantieni programma',
    savingProgram: 'Salvataggio…',
    deletingProgram: 'Eliminazione…',
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
      invalid_schedule_mode: 'Scegli i giorni della settimana oppure la modalità ogni N giorni.',
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
      cannot_release_control: 'Impossibile cedere il controllo del pianificatore perché lo switch non è disponibile.',
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
      battery_entity: 'Sensore batteria',
      work_state_entity: 'Sensore stato di lavoro valvola',
      device_status_entity: 'Sensore stato dispositivo',
      irrigation_mode_entity: 'Sensore modalità irrigazione',
      timed_irrigation_entity: 'Sensore irrigazione temporizzata',
      daily_volume_entity: 'Sensore volume giornaliero',
      real_time_volume_entity: 'Sensore volume in tempo reale',
      real_time_duration_entity: 'Sensore durata in tempo reale',
      irrigation_start_time_entity: 'Sensore orario inizio irrigazione',
      irrigation_end_time_entity: 'Sensore orario fine irrigazione',
      shortage_protection_entity: 'Switch protezione carenza acqua',
      program_entity: 'Sensore programmi',
      show_state_chip: 'Mostra stato pompa', show_flow_chip: 'Mostra portata',
      show_volume_chip: 'Mostra volume', show_battery_button: 'Mostra pulsante batteria', show_next_change_chip: 'Mostra prossimo orario',
      show_unavailable_badge: 'Mostra badge non disponibile', show_auto_button: 'Mostra pulsante Auto',
      show_schedule_button: 'Mostra pulsanti pianificazione',
      show_work_state_button: 'Mostra stato e controllo valvola',
      show_device_status_chip: 'Mostra stato dispositivo',
      show_irrigation_mode_chip: 'Mostra modalità irrigazione',
      show_timed_irrigation_chip: 'Mostra stato irrigazione temporizzata',
      show_daily_volume_chip: 'Mostra volume giornaliero',
      show_real_time_volume_chip: 'Mostra volume in tempo reale',
      show_real_time_duration_chip: 'Mostra durata in tempo reale',
      show_irrigation_time_chips: 'Mostra inizio e fine irrigazione',
      show_shortage_protection_button: 'Mostra controllo protezione carenza acqua',
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
      flow_entity: 'Sensore di portata da preferire; se vuoto, viene rilevato automaticamente.',
      volume_entity: 'Sensore del volume da preferire; se vuoto, viene rilevato automaticamente.',
      battery_entity: 'Sensore batteria da preferire; se vuoto, viene rilevato automaticamente.',
      work_state_entity: 'Sensore binario di sola lettura che segnala se la valvola è in funzione. Il pulsante comanda lo switch della pompa.',
      device_status_entity: 'Sensore testuale facoltativo che riporta lo stato del dispositivo.',
      irrigation_mode_entity: 'Sensore testuale facoltativo che riporta la modalità di irrigazione corrente.',
      timed_irrigation_entity: 'Sensore testuale facoltativo che riporta lo stato del ciclo di irrigazione temporizzato.',
      daily_volume_entity: 'Sensore facoltativo del volume totale irrigato oggi.',
      real_time_volume_entity: 'Sensore facoltativo del volume dell’irrigazione corrente.',
      real_time_duration_entity: 'Sensore facoltativo della durata dell’irrigazione corrente.',
      irrigation_start_time_entity: 'Sensore facoltativo con timestamp di inizio irrigazione.',
      irrigation_end_time_entity: 'Sensore facoltativo con timestamp di fine irrigazione.',
      shortage_protection_entity: 'Switch che attiva o disattiva la chiusura automatica in caso di carenza d’acqua.',
      program_entity: 'Sensore diagnostico creato dall’integrazione. Lascia vuoto per trovarlo automaticamente.',
      show_state_chip: 'Stato in irrigazione o spenta nella riga di stato.',
      show_flow_chip: 'Chip della portata attuale.',
      show_volume_chip: 'Chip del volume.',
      show_battery_button: 'Pulsante batteria; apre i dettagli del sensore selezionato.',
      show_next_change_chip: 'Prossima finestra di irrigazione nella riga di stato.',
      show_unavailable_badge: 'Indicatore quando l’entità non è disponibile.',
      show_auto_button: 'Mostra il sotto-pulsante Auto che commuta l’entità Auto.',
      show_schedule_button: 'Mostra i sotto-pulsanti Orari e Frequenza che aprono la pianificazione.',
      show_work_state_button: 'Mostra lo stato del sensore valvola configurato e un pulsante che commuta lo switch della pompa.',
      show_device_status_chip: 'Mostra il sensore stato dispositivo nella riga di stato.',
      show_irrigation_mode_chip: 'Mostra il sensore modalità irrigazione nella riga di stato.',
      show_timed_irrigation_chip: 'Mostra il sensore irrigazione temporizzata nella riga di stato.',
      show_daily_volume_chip: 'Mostra il volume di irrigazione giornaliero configurato.',
      show_real_time_volume_chip: 'Mostra il volume dell’irrigazione corrente configurato.',
      show_real_time_duration_chip: 'Mostra la durata dell’irrigazione corrente configurata.',
      show_irrigation_time_chips: 'Mostra gli orari di inizio e fine dai sensori timestamp.',
      show_shortage_protection_button: 'Mostra un pulsante per lo switch di protezione carenza acqua.',
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

export const timestampClock = (value, locale, timeZone) => {
  const number = numeric(value);
  const timestamp = number === null && typeof value === 'string' ? Date.parse(value) : number;
  if (!Number.isFinite(timestamp) || timestamp <= 0) return null;
  const date = new Date(timestamp > 1e12 ? timestamp : timestamp * 1000);
  if (!Number.isFinite(date.getTime())) return null;
  try {
    return new Intl.DateTimeFormat(locale || 'en', {
      hour: '2-digit', minute: '2-digit',
      ...(timeZone ? { timeZone } : {}),
    }).format(date);
  } catch {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
};

const entityTokens = (entityId, state, extraName = '') => new Set(
  `${entityId?.split('.')?.[1] || ''} ${state?.attributes?.friendly_name || ''} ${extraName || ''}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1),
);

const isSensorKind = (entityId, state, kind) => {
  const attributes = state?.attributes || {};
  const deviceClass = String(attributes.device_class || '').toLowerCase();
  const unit = entityUnit(state).toLowerCase().replaceAll('³', '3').replaceAll('²', '2').replaceAll(' ', '');
  const name = `${entityId || ''} ${attributes.friendly_name || ''} ${attributes.icon || ''}`.toLowerCase();
  if (kind === 'battery') {
    return deviceClass === 'battery' || (unit === '%' && /battery|batteria|charge/.test(name));
  }
  if (kind === 'flow') {
    return deviceClass === 'volume_flow_rate' || deviceClass === 'flow'
      || ((unit.includes('/') || unit.includes('per')) && /(?:l|m3|gal|ft3)/.test(unit));
  }
  if (kind === 'volume') {
    if (deviceClass === 'volume_flow_rate' || deviceClass === 'flow') return false;
    return ['volume', 'water', 'volume_storage'].includes(deviceClass)
      || ['l', 'ml', 'm3', 'gal', 'ft3', 'liter', 'liters', 'litre', 'litres'].includes(unit);
  }
  return false;
};

// Auto-discover only sensor entities that look like the requested measurement.
// A unique candidate is safe to use; otherwise prefer a uniquely named match
// to the pump, and leave ambiguous choices unset for the user to configure.
export const discoverSensorEntity = (hass, pumpEntity, kind, pumpName = '') => {
  const states = hass?.states;
  if (!states || !['flow', 'volume', 'battery'].includes(kind)) return null;
  const candidates = Object.entries(states)
    .filter(([entityId, state]) => entityId.startsWith('sensor.') && isSensorKind(entityId, state, kind))
    .map(([entityId, state]) => ({ entityId, state }));
  if (candidates.length === 1) return candidates[0].entityId;
  if (candidates.length < 2) return null;
  const pumpTokens = entityTokens(pumpEntity, states[pumpEntity], pumpName);
  const scored = candidates.map(({ entityId, state }) => {
    const tokens = entityTokens(entityId, state);
    let score = 0;
    for (const token of tokens) if (pumpTokens.has(token)) score += 1;
    return { entityId, score };
  }).sort((a, b) => b.score - a.score);
  return scored[0].score > 0 && scored[0].score > scored[1].score ? scored[0].entityId : null;
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
  if (program?.schedule_mode === 'weekdays') return true;
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

export const activeSlotFor = (slots, weekday, minute, scheduleMode = 'legacy') => {
  for (const slot of Array.isArray(slots) ? slots : []) {
    const start = timeMinutes(slot?.start);
    if (start === null || (!Array.isArray(slot.days) && scheduleMode !== 'interval')) continue;
    const duration = numeric(slot.duration) ?? 0;
    // Before the start time the window that covers this minute began yesterday.
    const coveringWeekday = minute >= start ? weekday : (weekday - 2 + 7) % 7 + 1;
    if (scheduleMode !== 'interval' && !slot.days.includes(coveringWeekday)) continue;
    if (((minute - start) % 1440 + 1440) % 1440 < duration) return slot;
  }
  return null;
};

const activeScheduleSlot = (program, timestamp) => {
  const now = new Date(timestamp);
  const mode = program?.schedule_mode || 'legacy';
  const weekday = isoWeekday(now);
  const minute = now.getHours() * 60 + now.getMinutes();
  if (mode === 'interval') {
    const currentEligible = frequencyAllows(program, timestamp);
    const previousDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12).getTime();
    const previousEligible = frequencyAllows(program, previousDay);
    for (const slot of Array.isArray(program?.slots) ? program.slots : []) {
      const start = timeMinutes(slot?.start);
      const duration = numeric(slot?.duration) ?? 0;
      if (start === null) continue;
      const startedToday = minute >= start;
      if (startedToday ? !currentEligible : !previousEligible) continue;
      const elapsed = startedToday ? minute - start : 1440 - start + minute;
      if (elapsed < duration) return slot;
    }
    return null;
  }
  if (frequencyAllows(program, timestamp)) {
    return activeSlotFor(program?.slots, weekday, minute, mode);
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

export const localDateString = (date = new Date(), timeZone) => {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      ...(timeZone ? { timeZone } : {}),
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
};

const scheduleClock = (timestamp, timeZone) => {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return null;
  try {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      ...(timeZone ? { timeZone } : {}),
    }).format(date);
  } catch {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
};

const scheduleStatus = (program) => {
  if (!program) {
    return { enabled: false, running: false, slot: null, slotId: null, frequencyOk: false, nextChangeMs: null };
  }
  const slot = program.enabled === false || !Array.isArray(program.slots)
    ? null
    : program.slots.find((candidate) => candidate.id === program.active_slot_id) || null;
  const nextChange = typeof program.next_change === 'string' ? Date.parse(program.next_change) : NaN;
  return {
    enabled: program.enabled !== false,
    running: Boolean(slot),
    slot,
    slotId: slot?.id ?? null,
    frequencyOk: Boolean(program.frequency_ok || slot),
    nextChangeMs: Number.isFinite(nextChange) ? nextChange : null,
  };
};

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

export const nextWindowMs = (slots, nowMs = Date.now(), program = null) => {
  const list = Array.isArray(slots) ? slots : [];
  if (!list.length) return null;
  const now = new Date(nowMs);
  const frequency = numeric(program?.frequency_days) ?? 1;
  const mode = program?.schedule_mode || 'legacy';
  if (mode !== 'weekdays' && frequency > 1 && !isValidDate(program?.start_date)) return null;
  const cycleDays = mode === 'weekdays' ? 7 : frequency > 1 ? (7 * frequency) / gcd(7, frequency) : 7;
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const match = frequency > 1 ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(program.start_date) : null;
  const anchorUtc = match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : todayUtc;
  const anchorOffset = Math.max(0, Math.round((anchorUtc - todayUtc) / 86400000));
  const firstOffset = anchorOffset ? anchorOffset : -1;
  const lastOffset = firstOffset + cycleDays + 8;
  const candidates = [];
  for (let offset = firstOffset; offset <= lastOffset; offset += 1) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const weekday = isoWeekday(day);
    candidates.push(new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime());
    for (const slot of list) {
      const start = timeMinutes(slot?.start);
      const duration = numeric(slot.duration) ?? 0;
      if (start === null || (mode !== 'interval' && (!Array.isArray(slot.days) || !slot.days.includes(weekday)))) continue;
      candidates.push(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, start).getTime());
      candidates.push(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, start + duration).getTime());
    }
  }
  const wantsWater = (timestamp) => {
    if (program) return Boolean(activeScheduleSlot(program, timestamp));
    const date = new Date(timestamp);
    return Boolean(activeSlotFor(list, isoWeekday(date), date.getHours() * 60 + date.getMinutes()));
  };
  const future = [...new Set(candidates)].filter((candidate) => candidate > nowMs).sort((a, b) => a - b);
  return future.find((candidate) => wantsWater(candidate - 60000) !== wantsWater(candidate)) ?? null;
};

export const activeProgram = (program, nowMs = Date.now()) => {
  if (!program || program.enabled === false) {
    return { enabled: false, running: false, slot: null, slotId: null, frequencyOk: false, nextChangeMs: null };
  }
  const now = new Date(nowMs);
  const frequencyOk = frequencyAllows(program, nowMs);
  const slot = activeScheduleSlot(program, nowMs);
  return {
    enabled: true,
    running: Boolean(slot),
    slot,
    slotId: slot ? slot.id : null,
    frequencyOk: frequencyOk || Boolean(slot),
    nextChangeMs: nextWindowMs(program.slots, nowMs, program),
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

export const workStateLabel = (state, strings) => {
  const value = typeof state === 'object' ? state?.state : state;
  if (value === 'on') return strings.valveOn;
  if (value === 'off') return strings.valveOff;
  return strings.unavailable;
};

export const deviceStatusLabel = (state, strings) => {
  if (state === 'normal_state') return strings.deviceStatusNormal;
  if (state === 'unknown' || state === 'unavailable' || state === null || state === undefined || state === '') {
    return strings.unavailable;
  }
  return String(state);
};

export const emptyScheduleDraft = () => ({
  enabled: false,
  schedule_mode: 'weekdays',
  frequency_days: 1,
  start_date: '',
  auto_entity: '',
  slots: [slotDraft()],
});

export const slotDraft = (index = 0) => ({ id: `window-${index + 1}`, days: [], start: '05:30', duration: 30, liters: '' });

export const nextSlotId = (slots = []) => {
  const ids = new Set(Array.isArray(slots) ? slots.map((slot) => slot?.id).filter(Boolean) : []);
  let index = 1;
  while (ids.has(`window-${index}`)) index += 1;
  return `window-${index}`;
};

export const scheduleDraft = (program) => {
  if (!program || typeof program !== 'object') return emptyScheduleDraft();
  const frequency = numeric(program.frequency_days) ?? 1;
  const scheduleMode = SCHEDULE_MODES.includes(program.schedule_mode)
    ? program.schedule_mode
    : frequency > 1 ? 'legacy' : 'weekdays';
  const slots = Array.isArray(program.slots)
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
    schedule_mode: scheduleMode,
    frequency_days: frequency,
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
  const mode = SCHEDULE_MODES.includes(draft.schedule_mode) ? draft.schedule_mode : null;
  if (!mode) return fail('invalid_schedule_mode');
  const frequency = numeric(draft.frequency_days);
  if (mode !== 'weekdays' && (frequency === null || !Number.isInteger(frequency) || frequency < 1 || frequency > MAX_FREQUENCY_DAYS)) {
    return fail('invalid_frequency', { max: MAX_FREQUENCY_DAYS });
  }
  if (mode !== 'weekdays' && draft.start_date && !isValidDate(draft.start_date)) return fail('invalid_start_date');
  if (mode !== 'weekdays' && frequency > 1 && !draft.start_date) return fail('frequency_needs_anchor');
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
    if (!Array.isArray(slot.days) || (mode !== 'interval' && !slot.days.length) || slot.days.some((day) => !Number.isInteger(day) || day < 1 || day > 7)) {
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
    const validationDays = mode === 'interval' ? [1, 2, 3, 4, 5, 6, 7] : [...new Set(slot.days)];
    for (const day of validationDays) {
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
  const scheduleMode = SCHEDULE_MODES.includes(draft.schedule_mode)
    ? draft.schedule_mode
    : numeric(draft.frequency_days) > 1 ? 'legacy' : 'weekdays';
  const frequencyDays = scheduleMode === 'weekdays' ? 1 : Number(draft.frequency_days) || 1;
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
    schedule_mode: scheduleMode,
    slots,
    frequency_days: frequencyDays,
    ...(scheduleMode !== 'weekdays' && (frequencyDays > 1 || draft.start_date) ? { start_date: draft.start_date || null } : {}),
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
  show_battery_button: true,
  show_next_change_chip: true,
  show_unavailable_badge: true,
  show_auto_button: true,
  show_schedule_button: true,
  show_work_state_button: true,
  show_device_status_chip: true,
  show_irrigation_mode_chip: true,
  show_timed_irrigation_chip: true,
  show_daily_volume_chip: true,
  show_real_time_volume_chip: true,
  show_real_time_duration_chip: true,
  show_irrigation_time_chips: true,
  show_shortage_protection_button: true,
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
    field('battery_entity', { entity: { filter: { domain: ['sensor'] } } }),
    field('work_state_entity', { entity: { filter: { domain: ['binary_sensor'] } } }),
    field('device_status_entity', { entity: { filter: { domain: ['sensor'] } } }),
    field('irrigation_mode_entity', { entity: { filter: { domain: ['sensor'] } } }),
    field('timed_irrigation_entity', { entity: { filter: { domain: ['sensor'] } } }),
    field('daily_volume_entity', { entity: { filter: { domain: ['sensor'] } } }),
    field('real_time_volume_entity', { entity: { filter: { domain: ['sensor'] } } }),
    field('real_time_duration_entity', { entity: { filter: { domain: ['sensor'] } } }),
    field('irrigation_start_time_entity', { entity: { filter: { domain: ['sensor'] } } }),
    field('irrigation_end_time_entity', { entity: { filter: { domain: ['sensor'] } } }),
    field('shortage_protection_entity', { entity: { filter: { domain: ['switch'] } } }),
    field('program_entity', { entity: { filter: { domain: ['sensor'] } } }),
  ]),
  grid('visible', [
    ...['show_state_chip', 'show_flow_chip', 'show_volume_chip', 'show_battery_button', 'show_next_change_chip', 'show_unavailable_badge', 'show_auto_button', 'show_schedule_button', 'show_work_state_button', 'show_device_status_chip', 'show_irrigation_mode_chip', 'show_timed_irrigation_chip', 'show_daily_volume_chip', 'show_real_time_volume_chip', 'show_real_time_duration_chip', 'show_irrigation_time_chips', 'show_shortage_protection_button']
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
  ha-card{--water-flow-accent-color:var(--primary-color);position:relative;overflow:hidden;cursor:pointer;transition:background-color .16s ease,border-color .22s,box-shadow .22s}
  ha-card[data-surface="elevated"]{box-shadow:0 6px 22px rgba(0,0,0,.28);border-color:color-mix(in srgb, var(--water-flow-accent-color) 35%, transparent)}
  ha-card[data-surface="blend"]{background:transparent;border-color:transparent;box-shadow:none}
  ha-card[data-running="true"]{--water-flow-accent-color:var(--state-switch-on-color,var(--primary-color))}
  ha-card[data-running="true"]:not([data-surface="blend"]){background-color:color-mix(in srgb,var(--water-flow-accent-color) 7%,var(--card-background-color,var(--ha-card-background)));border-color:color-mix(in srgb,var(--water-flow-accent-color) 28%,var(--divider-color))}
  ha-card[data-running="true"][data-surface="blend"]{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--water-flow-accent-color) 30%,transparent)}
  @media(hover:hover) and (pointer:fine){ha-card:not([data-surface="blend"]):hover{background-color:color-mix(in srgb,var(--water-flow-accent-color) 5%,var(--card-background-color,var(--ha-card-background)))}ha-card[data-surface="blend"]:hover{background-color:color-mix(in srgb,var(--water-flow-accent-color) 5%,transparent)}}
  ha-card:not([data-surface="blend"]).card-press-feedback{background-color:color-mix(in srgb,var(--water-flow-accent-color) 9%,var(--card-background-color,var(--ha-card-background)))}
  ha-card[data-surface="blend"].card-press-feedback{background-color:color-mix(in srgb,var(--water-flow-accent-color) 9%,transparent)}
  @media(prefers-reduced-motion:reduce){ha-card{transition:none!important}}
  ha-card[data-animations="false"]{transition:none!important}
  .row{display:flex;align-items:center;gap:14px;padding:14px 16px}
  .compact .row{padding:12px 14px;gap:12px}
  .row-content{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:14px;cursor:pointer}
  .row-content:focus-visible{outline:2px solid var(--primary-color);outline-offset:3px;border-radius:12px}
  .compact .row-content{gap:12px}
  .icon{flex:0 0 auto;width:46px;height:46px;border:1px solid var(--divider-color);border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--secondary-background-color);color:var(--secondary-text-color);transition:background-color .22s,border-color .22s,color .22s,box-shadow .22s}
  ha-card[data-running="true"] .icon{background:var(--water-flow-accent-color);border-color:transparent;color:var(--text-primary-color,#fff);box-shadow:0 0 0 3px color-mix(in srgb,var(--water-flow-accent-color) 20%,transparent)}
  .compact .icon{width:38px;height:38px}
  .icon ha-icon{--mdc-icon-size:24px}
  .main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:3px}
  .title{font-size:16px;font-weight:600;color:var(--primary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .status-line{font-size:13px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;overflow-x:auto;overscroll-behavior-inline:contain;scrollbar-width:none}
  .status-line::-webkit-scrollbar{display:none}
  .status-line span+span:before{content:' · '}
  .status-line .live{color:var(--water-flow-accent-color);font-weight:600}
  .status-line .state-chip{display:inline-block;padding:3px 9px;border:1px solid var(--divider-color);border-radius:999px;background:var(--secondary-background-color)}
  .status-line .state-chip[data-state="on"]{background:color-mix(in srgb,var(--water-flow-accent-color) 12%,var(--secondary-background-color));border-color:color-mix(in srgb,var(--water-flow-accent-color) 38%,var(--divider-color))}
  .status-line ha-icon{--mdc-icon-size:14px;vertical-align:-2px}
  .badge{display:inline-flex;align-items:center;gap:4px;color:var(--error-color)}
  .side{flex:0 0 auto;display:flex;align-items:center;gap:8px}
  .round{width:38px;height:38px;border-radius:50%;border:1px solid var(--divider-color);background:var(--secondary-background-color);color:var(--primary-text-color);display:flex;align-items:center;justify-content:center;cursor:pointer}
  .round:hover{border-color:var(--water-flow-accent-color);color:var(--water-flow-accent-color)}
  .battery-button{height:38px;max-width:116px;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:0 10px;border:1px solid var(--divider-color);border-radius:999px;background:var(--secondary-background-color);color:var(--primary-text-color);font:inherit;font-size:12px;font-weight:650;white-space:nowrap;cursor:pointer;appearance:none;-webkit-appearance:none;transition:background-color .18s,border-color .18s,color .18s,box-shadow .18s,transform .12s}
  .battery-button ha-icon{--mdc-icon-size:17px;flex:0 0 auto}
  .battery-button .battery-value{overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
  .battery-button:hover{background:var(--water-flow-accent-color);border-color:var(--water-flow-accent-color);color:var(--text-primary-color,#fff);box-shadow:0 0 0 3px color-mix(in srgb,var(--water-flow-accent-color) 24%,transparent);transform:translateY(-1px)}
  .battery-button:active{transform:scale(.96);filter:brightness(.9)}
  .battery-button:focus-visible,.round:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .subrow{display:flex;flex-wrap:wrap;gap:8px;padding:0 14px 14px}
  .compact .subrow{padding:0 12px 12px}
  .sub{flex:1 1 120px;min-width:0;display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 8px;border-radius:12px;border:1px solid var(--divider-color);background:var(--secondary-background-color);color:var(--primary-text-color);font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sub ha-icon{--mdc-icon-size:16px;flex:0 0 auto}
  .sub .sub-label{overflow:hidden;text-overflow:ellipsis}
  .sub[data-active="true"]{background:color-mix(in srgb, var(--water-flow-accent-color) 22%, transparent);border-color:color-mix(in srgb, var(--water-flow-accent-color) 55%, transparent);color:var(--water-flow-accent-color)}
  .sub[data-act="schedule"][data-active="true"],.round[data-active="true"]{background:var(--water-flow-accent-color);border-color:var(--water-flow-accent-color);color:var(--text-primary-color,#fff)}
  .sub:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .error{margin:0 14px 12px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb, var(--error-color) 15%, transparent);color:var(--error-color);font-size:12px;line-height:1.35}
  .unavailable{opacity:.6}
  @keyframes wf-pulse{0%{transform:scale(1)}45%{transform:scale(1.12)}100%{transform:scale(1)}}
  ha-card[data-animations="true"][data-running="true"] .icon{animation:wf-pulse 1.6s ease-in-out infinite}
  ha-card[data-animations="false"] .icon{animation:none}
  dialog{color:var(--primary-text-color);background:var(--card-background-color,var(--ha-card-background));border:1px solid var(--divider-color);border-radius:22px;padding:0;max-width:min(700px,calc(100vw - 28px));width:100%;max-height:min(88vh,820px);box-shadow:0 18px 56px rgba(0,0,0,.38)}
  dialog::backdrop{background:rgba(0,0,0,.58);backdrop-filter:blur(3px)}
  [hidden]{display:none!important}
  .dlg-shell{display:flex;flex-direction:column;max-height:min(88vh,820px);overflow:hidden}
  .dlg-head{display:flex;align-items:center;gap:12px;padding:20px 22px 12px}
  .dlg-icon{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb, var(--water-flow-accent-color) 18%, transparent);color:var(--water-flow-accent-color)}
  .dlg-titles{flex:1 1 auto;min-width:0}
  .dlg-titles h2{margin:0;font-size:20px;letter-spacing:-.02em}
  .dlg-sub{font-size:13px;color:var(--secondary-text-color);margin-top:2px}
  .close{width:34px;height:34px;border-radius:50%;border:0;background:transparent;color:var(--secondary-text-color);cursor:pointer}
  .close:hover{background:var(--secondary-background-color);color:var(--primary-text-color)}
  .dlg-summary{margin:0 22px 14px;padding:14px 16px;border:1px solid color-mix(in srgb, var(--water-flow-accent-color) 28%, var(--divider-color));border-radius:16px;background:color-mix(in srgb, var(--water-flow-accent-color) 7%, var(--card-background-color,var(--ha-card-background)));display:flex;align-items:center;justify-content:space-between;gap:12px}
  .summary-copy{display:flex;flex-direction:column;gap:3px;min-width:0}
  .summary-copy strong{font-size:15px;font-weight:650}
  .summary-copy small{font-size:12px;color:var(--secondary-text-color)}
  .status-pill{flex:0 0 auto;border-radius:999px;padding:6px 10px;background:var(--secondary-background-color);color:var(--secondary-text-color);font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
  .status-pill[data-enabled="true"]{background:color-mix(in srgb, var(--success-color,#2e7d32) 15%, transparent);color:var(--success-color,#2e7d32)}
  .dlg-body{padding:0 22px 18px;display:flex;flex-direction:column;gap:18px;min-height:0;flex:1 1 auto;overflow-y:auto;overscroll-behavior:contain}
  .dlg-section{display:flex;flex-direction:column;gap:10px;scroll-margin:10px}
  .dlg-section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
  .dlg-section-head h3{margin:0;font-size:16px;font-weight:650}
  .dlg-section-head p{margin:3px 0 0;font-size:12px;color:var(--secondary-text-color);line-height:1.4}
  .window-count{flex:0 0 auto;color:var(--secondary-text-color);font-size:11px;font-weight:650}
  .row-field{display:flex;align-items:center;justify-content:space-between;gap:12px}
  .row-field label{font-size:14px;font-weight:500}
  .row-field .hint{font-size:12px;color:var(--secondary-text-color);line-height:1.35;margin-top:2px}
  .input{font:inherit;font-size:14px;color:var(--primary-text-color);background:var(--secondary-background-color);border:1px solid var(--divider-color);border-radius:10px;padding:8px 10px;min-width:0}
  .input:focus-visible{outline:2px solid var(--primary-color);outline-offset:1px}
  .input[aria-invalid="true"],ha-entity-picker[aria-invalid="true"]{border-color:var(--error-color)}
  .input.num{width:96px;text-align:right}
  .field-stack{display:flex;flex-direction:column;gap:12px;padding:14px 0;border-bottom:1px solid var(--divider-color);scroll-margin:10px}
  .mode-picker{display:flex;flex-direction:column;gap:9px}
  .mode-picker-title{font-size:13px;font-weight:650;color:var(--primary-text-color)}
  .mode-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .mode-card{min-width:0;min-height:76px;display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--divider-color);border-radius:14px;background:var(--secondary-background-color);color:var(--primary-text-color);text-align:left;font:inherit;cursor:pointer;transition:background .18s,border-color .18s,box-shadow .18s,transform .18s}
  .mode-card:hover{border-color:color-mix(in srgb,var(--water-flow-accent-color) 55%,var(--divider-color));transform:translateY(-1px)}
  .mode-card[data-selected="true"]{border-color:var(--water-flow-accent-color);background:color-mix(in srgb,var(--water-flow-accent-color) 10%,var(--secondary-background-color));box-shadow:inset 0 0 0 1px var(--water-flow-accent-color)}
  .mode-card:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .mode-icon{--mdc-icon-size:21px;flex:0 0 auto;color:var(--secondary-text-color)}
  .mode-card[data-selected="true"] .mode-icon{color:var(--water-flow-accent-color)}
  .mode-copy{display:flex;flex:1 1 auto;min-width:0;flex-direction:column;gap:3px}
  .mode-copy strong{font-size:12px;font-weight:700}
  .mode-copy small{font-size:11px;line-height:1.35;color:var(--secondary-text-color)}
  .mode-check{--mdc-icon-size:18px;flex:0 0 auto;color:var(--water-flow-accent-color);opacity:0}
  .mode-card[data-selected="true"] .mode-check{opacity:1}
  [hidden]{display:none!important}
  .legacy-note{display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border:1px solid color-mix(in srgb,var(--warning-color,#ed9b00) 35%,var(--divider-color));border-radius:12px;background:color-mix(in srgb,var(--warning-color,#ed9b00) 7%,var(--secondary-background-color));color:var(--secondary-text-color);font-size:12px;line-height:1.4}
  .legacy-note ha-icon{--mdc-icon-size:17px;flex:0 0 auto;color:var(--warning-color,#ed9b00)}
  .legacy-note[hidden]{display:none}
  .switch{position:relative;width:42px;height:24px;flex:0 0 auto}
  .switch input{appearance:none;-webkit-appearance:none;position:absolute;inset:0;margin:0;border-radius:999px;background:var(--divider-color);border:0;cursor:pointer;transition:background .2s}
  .switch input:after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:var(--text-primary-color,#fff);transition:transform .2s}
  .switch input:checked{background:var(--water-flow-accent-color)}
  .switch input:checked:after{transform:translateX(18px)}
  .slot{border:1px solid var(--divider-color);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:12px;background:var(--secondary-background-color)}
  .slot-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
  .slot-head strong{font-size:13px}
  .slot-remove{border:0;background:transparent;color:var(--error-color);font:inherit;font-size:12px;cursor:pointer}
  .days{display:flex;gap:4px}
  .day{flex:1 1 0;border:1px solid var(--divider-color);background:var(--card-background-color,var(--ha-card-background));color:var(--secondary-text-color);border-radius:9px;padding:8px 0;font:inherit;font-size:12px;font-weight:650;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
  .day[aria-pressed="true"]{background:var(--water-flow-accent-color);border-color:var(--water-flow-accent-color);color:var(--text-primary-color,#fff)}
  .day:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .slot-grid{display:flex;gap:8px;flex-wrap:wrap}
  .slot-grid label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--secondary-text-color)}
  .number-control{display:inline-flex;align-items:stretch;height:40px}
  .number-control .input.num{width:76px;border-radius:10px 0 0 10px;padding-right:7px;-moz-appearance:textfield}
  .number-control input[type="number"]::-webkit-inner-spin-button,.number-control input[type="number"]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
  .number-steps{display:flex;flex-direction:column;width:30px;overflow:hidden;border:1px solid var(--divider-color);border-left:0;border-radius:0 10px 10px 0;background:var(--card-background-color,var(--ha-card-background))}
  .number-step{display:flex;flex:1;align-items:center;justify-content:center;min-height:0;padding:0;border:0;background:transparent;color:var(--secondary-text-color);cursor:pointer}
  .number-step+ .number-step{border-top:1px solid var(--divider-color)}
  .number-step ha-icon{--mdc-icon-size:15px}
  .number-step:hover{background:color-mix(in srgb,var(--water-flow-accent-color) 12%,transparent);color:var(--water-flow-accent-color)}
  .number-step:focus-visible{position:relative;z-index:1;outline:2px solid var(--primary-color);outline-offset:-2px}
  .number-step:active{background:color-mix(in srgb,var(--water-flow-accent-color) 22%,transparent)}
  .add{width:100%;border:1px dashed var(--divider-color);background:transparent;color:var(--primary-text-color);border-radius:12px;padding:11px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s,border-color .15s}
  .add:hover{border-color:var(--water-flow-accent-color);color:var(--water-flow-accent-color)}
  .add:disabled,.btn:disabled,.slot-remove:disabled{opacity:.48;cursor:default}
  .empty-windows{padding:18px;border:1px dashed var(--divider-color);border-radius:14px;text-align:center;color:var(--secondary-text-color);font-size:13px}
  .empty-windows strong{display:block;color:var(--primary-text-color);font-size:14px;margin-bottom:4px}
  .dlg-error{min-height:1.3em;margin:0;font-size:12px;color:var(--error-color)}
  .dlg-backend-error{margin:0 22px 14px;padding:9px 12px;border-radius:12px;background:color-mix(in srgb, var(--error-color) 10%, var(--card-background-color,var(--ha-card-background)));color:var(--error-color);font-size:12px;line-height:1.4}
  .dlg-foot{display:flex;flex-direction:column;gap:10px;padding:12px 22px max(14px,env(safe-area-inset-bottom));border-top:1px solid var(--divider-color);background:var(--card-background-color,var(--ha-card-background))}
  .dlg-feedback{min-height:1.1em;color:var(--secondary-text-color);font-size:12px}
  .dlg-feedback[data-dirty="true"]{color:var(--primary-color);font-weight:600}
  .dlg-actions{display:flex;align-items:center;justify-content:space-between;gap:8px}
  .dlg-actions-right{display:flex;align-items:center;justify-content:flex-end;gap:8px}
  .dlg-confirm{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:10px 12px;border:1px solid color-mix(in srgb, var(--error-color) 38%, var(--divider-color));border-radius:12px;background:color-mix(in srgb, var(--error-color) 7%, var(--card-background-color,var(--ha-card-background)))}
  .dlg-confirm p{flex:1 1 180px;margin:0;font-size:13px}
  .dlg-confirm-actions{display:flex;gap:8px}
  .btn{font:inherit;font-size:13px;font-weight:650;border-radius:999px;padding:10px 16px;cursor:pointer;border:1px solid var(--divider-color);background:var(--secondary-background-color);color:var(--primary-text-color);transition:filter .15s,transform .15s}
  .btn:not(:disabled):hover{filter:brightness(1.08);transform:translateY(-1px)}
  .btn.primary{background:var(--water-flow-accent-color);border-color:var(--water-flow-accent-color);color:var(--text-primary-color,#fff)}
  .btn.danger{color:var(--error-color);border-color:color-mix(in srgb, var(--error-color) 45%, transparent);background:transparent}
  .btn:focus-visible,.slot-remove:focus-visible,.close:focus-visible,.add:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  ha-entity-picker{flex:1 1 190px;max-width:280px;min-width:0}
  @media(max-width:520px){dialog{max-width:calc(100vw - 16px);border-radius:18px}.dlg-head{padding:16px 16px 10px}.dlg-summary{margin:0 16px 12px;padding:12px}.dlg-body{padding:0 16px 14px;gap:14px}.dlg-foot{padding:10px 16px max(12px,env(safe-area-inset-bottom))}.mode-grid{grid-template-columns:1fr}.mode-card{min-height:68px}.slot-grid label{flex:1 1 110px}.dlg-actions{align-items:stretch}.dlg-actions-right{margin-left:auto}}
  @media(prefers-reduced-motion:reduce){.day,.btn,.add{transition:none}.btn:not(:disabled):hover{transform:none}}
  .preview{pointer-events:none}
`;

export class WaterFlowCard extends HTMLElementBase {
  set hass(value) {
    this._hass = value;
    this._syncSessionTracking();
    const autoPicker = this._dialog?.open ? this._dialog.querySelector('[data-field="auto_entity"]') : null;
    if (autoPicker) autoPicker.hass = value;
    this._renderIfChanged();
  }

  connectedCallback() { this._syncSessionTracking(); }

  disconnectedCallback() {
    this._stopSessionTicker();
    globalThis.clearTimeout(this._cardSurfaceFeedbackTimer);
    this._cardSurfaceFeedbackTimer = null;
    this._cardPressFeedback = false;
    this.shadowRoot?.querySelector?.('ha-card')?.classList?.remove('card-press-feedback');
  }

  _syncSessionTracking() {
    const entityId = this.config?.entity;
    const state = this._hass?.states?.[entityId];
    if (state?.state !== 'on') {
      this._sessionStartMs = null;
      this._sessionMinute = null;
      this._sessionEntityId = entityId;
      this._stopSessionTicker();
      return;
    }
    if (this._sessionEntityId !== entityId || !this._sessionStartMs) {
      const lastChanged = Date.parse(state.last_changed);
      this._sessionStartMs = Number.isFinite(lastChanged) ? lastChanged : Date.now();
      this._sessionMinute = sessionMinutes(Date.now(), this._sessionStartMs);
    }
    this._sessionEntityId = entityId;
    this._startSessionTicker();
  }

  _startSessionTicker() {
    if (!globalThis.window || this._sessionTicker || !this._sessionStartMs || this.isConnected === false) return;
    this._sessionTicker = globalThis.setInterval(() => this._tickSession(), 15000);
  }

  _stopSessionTicker() {
    if (this._sessionTicker === undefined || this._sessionTicker === null) return;
    globalThis.clearInterval(this._sessionTicker);
    this._sessionTicker = null;
  }

  _bindCardSurfaceFeedback(card) {
    if (!card?.addEventListener) return;
    if (this._cardPressFeedback) card.classList?.add('card-press-feedback');
    card.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      this._flashCardSurfaceFeedback();
    }, { passive: true });
    card.addEventListener('click', () => this._flashCardSurfaceFeedback(), true);
  }

  _flashCardSurfaceFeedback() {
    globalThis.clearTimeout(this._cardSurfaceFeedbackTimer);
    this._cardPressFeedback = true;
    this.shadowRoot?.querySelector?.('ha-card')?.classList?.add('card-press-feedback');
    this._cardSurfaceFeedbackTimer = globalThis.setTimeout(() => {
      this._cardPressFeedback = false;
      this.shadowRoot?.querySelector?.('ha-card')?.classList?.remove('card-press-feedback');
      this._cardSurfaceFeedbackTimer = null;
    }, 260);
  }

  _tickSession() {
    if (!this._sessionStartMs || this._entity()?.state !== 'on') {
      this._stopSessionTicker();
      return;
    }
    const minute = sessionMinutes(Date.now(), this._sessionStartMs);
    if (minute === null || minute === this._sessionMinute) return;
    this._sessionMinute = minute;
    this._renderIfChanged();
  }

  setConfig(config) {
    if (!config || typeof config !== 'object') throw new Error('Invalid configuration');
    if (typeof config.entity !== 'string' || !config.entity.startsWith('switch.')) {
      throw new Error('entity must be a switch entity, for example switch.irrigazione');
    }
    const next = { ...config };
    const entityChanged = this.config?.entity !== next.entity;
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
    const workStateEntity = next.work_state_entity;
    if (workStateEntity !== undefined && workStateEntity !== null && workStateEntity !== ''
      && (typeof workStateEntity !== 'string' || !workStateEntity.startsWith('binary_sensor.'))) {
      throw new Error('work_state_entity must be a binary_sensor entity');
    }
    const deviceStatusEntity = next.device_status_entity;
    if (deviceStatusEntity !== undefined && deviceStatusEntity !== null && deviceStatusEntity !== ''
      && (typeof deviceStatusEntity !== 'string' || !deviceStatusEntity.startsWith('sensor.'))) {
      throw new Error('device_status_entity must be a sensor entity');
    }
    const irrigationModeEntity = next.irrigation_mode_entity;
    if (irrigationModeEntity !== undefined && irrigationModeEntity !== null && irrigationModeEntity !== ''
      && (typeof irrigationModeEntity !== 'string' || !irrigationModeEntity.startsWith('sensor.'))) {
      throw new Error('irrigation_mode_entity must be a sensor entity');
    }
    const timedIrrigationEntity = next.timed_irrigation_entity;
    if (timedIrrigationEntity !== undefined && timedIrrigationEntity !== null && timedIrrigationEntity !== ''
      && (typeof timedIrrigationEntity !== 'string' || !timedIrrigationEntity.startsWith('sensor.'))) {
      throw new Error('timed_irrigation_entity must be a sensor entity');
    }
    for (const [fieldName, domain] of [
      ['daily_volume_entity', 'sensor'],
      ['real_time_volume_entity', 'sensor'],
      ['real_time_duration_entity', 'sensor'],
      ['irrigation_start_time_entity', 'sensor'],
      ['irrigation_end_time_entity', 'sensor'],
      ['shortage_protection_entity', 'switch'],
    ]) {
      const value = next[fieldName];
      if (value !== undefined && value !== null && value !== ''
        && (typeof value !== 'string' || !value.startsWith(`${domain}.`))) {
        throw new Error(`${fieldName} must be a ${domain} entity`);
      }
    }
    if (Object.hasOwn(next, 'animation_duration')) next.animation_duration = normalizeAnimationDuration(next.animation_duration);
    this.config = next;
    if (entityChanged) this._syncSessionTracking();
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

  _autoEntity() {
    const program = this._program();
    if (program) return typeof program.auto_entity === 'string' ? program.auto_entity : null;
    return typeof this.config?.auto_entity === 'string' ? this.config.auto_entity : null;
  }

  _autoState() {
    const auto = this._autoEntity();
    return auto ? this._hass?.states?.[auto] ?? null : null;
  }

  _program() { return programOf(this._hass, this.config); }

  _sensorEntity(configField, kind) {
    const configured = this.config?.[configField];
    if (typeof configured === 'string' && configured) return configured;
    return discoverSensorEntity(this._hass, this.config?.entity, kind, this.config?.name);
  }

  _service(domain, service, data) {
    if (!this._hass?.callService) {
      this._showServiceError(new Error(this._strings().backendMissing));
      return Promise.resolve();
    }
    try {
      return Promise.resolve(this._hass.callService(domain, service, data)).catch((error) => {
        this._showServiceError(error);
        return undefined;
      });
    } catch (error) {
      this._showServiceError(error);
      return Promise.resolve();
    }
  }

  _showServiceError(error) {
    const strings = this._strings();
    const message = strings.serviceError(error?.message || String(error));
    if (this._dialog?.open && this._errorBox) {
      this._dialogError = message;
      this._errorBox.textContent = message;
      return;
    }
    this._cardServiceError = message;
    this._renderIfChanged();
  }

  _clearCardServiceError() {
    if (!this._cardServiceError) return;
    this._cardServiceError = null;
    this._renderIfChanged();
  }

  _renderKey() {
    const state = this._entity();
    const program = this._program();
    const auto = this._autoState();
    const readoutStates = [['flow_entity', 'flow'], ['volume_entity', 'volume'], ['battery_entity', 'battery']].map(([field, kind]) => {
      const entityId = this._sensorEntity(field, kind);
      const sensor = this._hass?.states?.[entityId];
      return [entityId, sensor?.state, sensor?.attributes?.unit_of_measurement];
    });
    const workStateEntity = this.config?.work_state_entity;
    const workState = workStateEntity ? this._hass?.states?.[workStateEntity] : null;
    const deviceStatusEntity = this.config?.device_status_entity;
    const deviceStatus = deviceStatusEntity ? this._hass?.states?.[deviceStatusEntity] : null;
    const irrigationModeEntity = this.config?.irrigation_mode_entity;
    const irrigationMode = irrigationModeEntity ? this._hass?.states?.[irrigationModeEntity] : null;
    const timedIrrigationEntity = this.config?.timed_irrigation_entity;
    const timedIrrigation = timedIrrigationEntity ? this._hass?.states?.[timedIrrigationEntity] : null;
    const supplementalStates = [
      'daily_volume_entity', 'real_time_volume_entity', 'real_time_duration_entity',
      'irrigation_start_time_entity', 'irrigation_end_time_entity', 'shortage_protection_entity',
    ].map((fieldName) => {
      const entityId = this.config?.[fieldName];
      const entityState = entityId ? this._hass?.states?.[entityId] : null;
      return [fieldName, entityId, entityState?.state, entityState?.attributes?.unit_of_measurement];
    });
    return JSON.stringify([
      this.config,
      state?.state,
      state?.attributes?.friendly_name,
      this._hass?.locale?.language ?? this._hass?.language ?? null,
      this._hass?.config?.time_zone ?? null,
      auto?.state,
      readoutStates,
      workStateEntity ? [workStateEntity, workState?.state] : null,
      deviceStatusEntity ? [deviceStatusEntity, deviceStatus?.state] : null,
      irrigationModeEntity ? [irrigationModeEntity, irrigationMode?.state] : null,
      timedIrrigationEntity ? [timedIrrigationEntity, timedIrrigation?.state] : null,
      supplementalStates,
      program,
      this._sessionMinute,
      this._dialogError,
      this._cardServiceError,
    ]);
  }

  _renderIfChanged() {
    // The dialog owns the interaction while it is open: rebuilding the card
    // body underneath it would drop the draft, so the close event invalidates
    // the cached key and the next tick repaints from fresh state.
    if (this._dialog?.open || !this.config) return;
    const key = this._renderKey();
    if (key === this._lastRenderKey) return;
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
    this._bindCardSurfaceFeedback(this.shadowRoot.querySelector?.('ha-card'));
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
    const autoEntity = this._autoEntity();
    const flowEntity = this._sensorEntity('flow_entity', 'flow');
    const volumeEntity = this._sensorEntity('volume_entity', 'volume');
    const batteryEntity = this._sensorEntity('battery_entity', 'battery');
    const batteryState = batteryEntity ? this._hass?.states?.[batteryEntity] : null;
    const workStateEntity = typeof config.work_state_entity === 'string' ? config.work_state_entity : '';
    const workState = workStateEntity ? this._hass?.states?.[workStateEntity] : null;
    const workStateValue = workState?.state;
    const workStateText = workStateLabel(workStateValue, strings);
    const deviceStatusEntity = typeof config.device_status_entity === 'string' ? config.device_status_entity : '';
    const deviceStatus = deviceStatusEntity ? this._hass?.states?.[deviceStatusEntity] : null;
    const irrigationModeEntity = typeof config.irrigation_mode_entity === 'string' ? config.irrigation_mode_entity : '';
    const irrigationMode = irrigationModeEntity ? this._hass?.states?.[irrigationModeEntity] : null;
    const timedIrrigationEntity = typeof config.timed_irrigation_entity === 'string' ? config.timed_irrigation_entity : '';
    const timedIrrigation = timedIrrigationEntity ? this._hass?.states?.[timedIrrigationEntity] : null;
    const dailyVolumeEntity = typeof config.daily_volume_entity === 'string' ? config.daily_volume_entity : '';
    const dailyVolume = dailyVolumeEntity ? this._hass?.states?.[dailyVolumeEntity] : null;
    const realTimeVolumeEntity = typeof config.real_time_volume_entity === 'string' ? config.real_time_volume_entity : '';
    const realTimeVolume = realTimeVolumeEntity ? this._hass?.states?.[realTimeVolumeEntity] : null;
    const realTimeDurationEntity = typeof config.real_time_duration_entity === 'string' ? config.real_time_duration_entity : '';
    const realTimeDuration = realTimeDurationEntity ? this._hass?.states?.[realTimeDurationEntity] : null;
    const startTimeEntity = typeof config.irrigation_start_time_entity === 'string' ? config.irrigation_start_time_entity : '';
    const startTimeState = startTimeEntity ? this._hass?.states?.[startTimeEntity] : null;
    const endTimeEntity = typeof config.irrigation_end_time_entity === 'string' ? config.irrigation_end_time_entity : '';
    const endTimeState = endTimeEntity ? this._hass?.states?.[endTimeEntity] : null;
    const shortageProtectionEntity = typeof config.shortage_protection_entity === 'string' ? config.shortage_protection_entity : '';
    const shortageProtection = shortageProtectionEntity ? this._hass?.states?.[shortageProtectionEntity] : null;
    const status = state?.state;
    const unavailable = status === 'unavailable' || status === 'unknown';
    const statusView = scheduleStatus(program);
    const running = status === 'on';
    const scheduleEnabled = program?.enabled === true;
    const accent = normalizeAccentColor(config.accent_color);
    const surface = normalizeSurface(config.surface);
    const layout = normalizeLayout(config.layout);
    const locale = cardLanguage(config, this._hass) === 'it' ? 'it-IT' : 'en-US';
    const timeZone = this._hass?.config?.time_zone;
    const chips = [];
    const stateLabel = unavailable ? strings.unavailable : pumpStateLabel(status, strings);
    const batteryReading = chipValue(batteryState, locale);
    const batteryValue = batteryReading === null
      ? strings.unavailable
      : entityUnit(batteryState) ? batteryReading : `${batteryReading} %`;
    const batteryLabel = strings.battery(batteryValue);
    if (config.show_state_chip !== false) {
      chips.push(`<span class="state-chip${running ? ' live' : ''}" data-state="${esc(status || 'unavailable')}">${esc(stateLabel)}</span>`);
    }
    if (config.show_device_status_chip !== false && deviceStatusEntity) {
      const statusText = deviceStatusLabel(deviceStatus?.state, strings);
      chips.push(`<span class="device-status-chip" title="${esc(strings.deviceStatus)}">${esc(strings.deviceStatus)} · ${esc(statusText)}</span>`);
    }
    if (config.show_irrigation_mode_chip !== false && irrigationModeEntity) {
      const modeText = irrigationMode?.state === 'unknown' || irrigationMode?.state === 'unavailable'
        ? strings.unavailable
        : irrigationMode?.state ?? strings.unavailable;
      chips.push(`<span class="irrigation-mode-chip" title="${esc(strings.irrigationMode)}">${esc(strings.irrigationMode)} · ${esc(modeText)}</span>`);
    }
    if (config.show_timed_irrigation_chip !== false && timedIrrigationEntity) {
      const timedText = timedIrrigation?.state === 'unknown' || timedIrrigation?.state === 'unavailable'
        ? strings.unavailable
        : timedIrrigation?.state ?? strings.unavailable;
      chips.push(`<span class="timed-irrigation-chip" title="${esc(strings.timedIrrigation)}">${esc(strings.timedIrrigation)} · ${esc(timedText)}</span>`);
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
    if (config.show_flow_chip !== false && flowEntity) {
      const value = chipValue(this._hass?.states?.[flowEntity], locale);
      if (value !== null) chips.push(`<span>${esc(strings.flow(value))}</span>`);
    }
    if (config.show_volume_chip !== false && volumeEntity) {
      const value = chipValue(this._hass?.states?.[volumeEntity], locale);
      if (value !== null) chips.push(`<span>${esc(strings.volume(value))}</span>`);
    }
    if (config.show_daily_volume_chip !== false && dailyVolumeEntity) {
      const value = chipValue(dailyVolume, locale);
      if (value !== null) chips.push(`<span class="daily-volume-chip">${esc(strings.dailyVolume)} · ${esc(value)}</span>`);
    }
    if (config.show_real_time_volume_chip !== false && realTimeVolumeEntity) {
      const value = chipValue(realTimeVolume, locale);
      if (value !== null) chips.push(`<span class="real-time-volume-chip">${esc(strings.realTimeVolume)} · ${esc(value)}</span>`);
    }
    if (config.show_real_time_duration_chip !== false && realTimeDurationEntity) {
      const value = chipValue(realTimeDuration, locale);
      if (value !== null) chips.push(`<span class="real-time-duration-chip">${esc(strings.realTimeDuration)} · ${esc(value)}</span>`);
    }
    if (config.show_irrigation_time_chips !== false && startTimeEntity) {
      const value = timestampClock(startTimeState?.state, locale, timeZone) || strings.unavailable;
      chips.push(`<span class="irrigation-start-chip">${esc(strings.irrigationStart)} · ${esc(value)}</span>`);
    }
    if (config.show_irrigation_time_chips !== false && endTimeEntity) {
      const value = timestampClock(endTimeState?.state, locale, timeZone) || strings.unavailable;
      chips.push(`<span class="irrigation-end-chip">${esc(strings.irrigationEnd)} · ${esc(value)}</span>`);
    }
    if (config.show_next_change_chip !== false && program) {
      const next = statusView.nextChangeMs ? scheduleClock(statusView.nextChangeMs, timeZone) : null;
      chips.push(`<span>${esc(strings.nextWindow + (next || strings.none))}</span>`);
    }
    const error = this._cardServiceError || (program?.last_error ? errorLabel(program.last_error, strings) : '');
    const title = esc(cardTitle(config, this._hass));
    const icon = esc(config.icon || 'mdi:water-pump');
    const autoLabel = auto ? (auto.state === 'on' ? strings.autoOn : strings.autoOff) : strings.noAuto;
    const frequency = program ? scheduleSummaryLabel(program, strings) : strings.none;
    const activeSlotId = statusView.slotId;
    const activeWindowIndex = Array.isArray(program?.slots) && activeSlotId
      ? program.slots.findIndex((slot) => slot.id === activeSlotId)
      : -1;
    const windowLabel = activeWindowIndex >= 0
      ? strings.window(activeWindowIndex + 1)
      : program && statusView.nextChangeMs
        ? scheduleClock(statusView.nextChangeMs, timeZone)
        : strings.none;
    const subRow = [];
    if (config.show_shortage_protection_button !== false && shortageProtectionEntity) {
      const active = shortageProtection?.state === 'on';
      const protectionText = active ? strings.shortageProtectionOn
        : shortageProtection?.state === 'off' ? strings.shortageProtectionOff : strings.unavailable;
      const toggleLabel = strings.toggleShortageProtection(shortageProtection?.state);
      subRow.push(`<button class="sub" type="button" data-act="shortage-protection" data-active="${active}" aria-pressed="${active}" aria-label="${esc(toggleLabel)}" title="${esc(toggleLabel)}"><ha-icon icon="mdi:water-alert"></ha-icon><span class="sub-label">${esc(`${strings.shortageProtection} · ${protectionText}`)}</span></button>`);
    }
    if (config.show_work_state_button !== false && workStateEntity) {
      const active = workStateValue === 'on';
      subRow.push(`<button class="sub" type="button" data-act="work-toggle" data-active="${active}" aria-pressed="${active}" aria-label="${esc(strings.toggleValve(workStateValue))}" title="${esc(strings.toggleValve(workStateValue))}"><ha-icon icon="mdi:valve"></ha-icon><span class="sub-label">${esc(`${strings.valve} · ${workStateText}`)}</span></button>`);
    }
    if (config.show_auto_button !== false && autoEntity) {
      subRow.push(`<button class="sub" type="button" data-act="auto" data-active="${auto?.state === 'on'}" aria-pressed="${auto?.state === 'on'}" title="${esc(autoLabel)}"><ha-icon icon="mdi:calendar-check"></ha-icon><span class="sub-label">${esc(strings.auto)}</span></button>`);
    }
    if (config.show_schedule_button !== false) {
      subRow.push(`<button class="sub" type="button" data-act="schedule" data-active="${scheduleEnabled}" data-focus="slots" title="${esc(strings.windowsAria)}"><ha-icon icon="mdi:clock-outline"></ha-icon><span class="sub-label">${esc(`${strings.windows}: ${windowLabel}`)}</span></button>`);
      subRow.push(`<button class="sub" type="button" data-act="schedule" data-active="${scheduleEnabled}" data-focus="frequency" title="${esc(strings.frequency)}"><ha-icon icon="mdi:calendar-sync"></ha-icon><span class="sub-label">${esc(frequency)}</span></button>`);
    }
    const batteryButton = config.show_battery_button !== false && batteryEntity
      ? `<button class="battery-button" type="button" data-act="battery" aria-label="${esc(batteryLabel)}" title="${esc(batteryLabel)}"><ha-icon icon="mdi:battery"></ha-icon><span class="battery-value">${esc(batteryValue)}</span></button>`
      : '';
    const ariaAction = config.tap_action === 'more-info' ? strings.actionMoreInfo
      : config.tap_action === 'none' ? strings.actionNone : strings.togglePump;
    const backdrop = state ? strings.openDetails(cardTitle(config, this._hass)) : strings.unavailable;
    const buttonLabel = config.show_state_chip !== false
      ? `${cardTitle(config, this._hass)} · ${stateLabel}`
      : cardTitle(config, this._hass);
    return `
      <ha-card class="${layout}" data-surface="${surface}" data-running="${running}" data-animations="${config.animations !== false}" style="${accent ? `--water-flow-accent-color:${accent};` : ''}" aria-label="${esc(backdrop)}" title="${esc(ariaAction)}">
        <div class="row">
          <div class="row-content" role="button" tabindex="0" data-act="card" aria-label="${esc(buttonLabel)}" title="${esc(ariaAction)}">
            <div class="icon ${unavailable ? 'unavailable' : ''}"><ha-icon icon="${icon}"></ha-icon></div>
            <div class="main">
              <div class="title">${title}</div>
              <div class="status-line">${chips.join('')}</div>
            </div>
          </div>
          <div class="side">
            ${batteryButton}
            ${config.show_schedule_button !== false ? `<button class="round" type="button" data-act="schedule" data-active="${scheduleEnabled}" data-focus="slots" aria-label="${esc(strings.windowsAria)}"><ha-icon icon="mdi:calendar-clock"></ha-icon></button>` : ''}
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
      if (act === 'battery') { this._batteryAction(); return; }
      if (act === 'work-toggle') { this._toggleWorkState(); return; }
      if (act === 'shortage-protection') { this._toggleShortageProtection(); return; }
      if (act === 'schedule') { this._scheduleOpener = target; this.openSchedule(target.dataset.focus || 'slots'); return; }
    });
    root.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const target = event.target?.closest?.('[data-act="card"]');
      if (!target || event.target !== target) return;
      event.preventDefault();
      this._cardAction();
    });
  }

  _cardAction() {
    if ((this.config?.tap_action ?? 'toggle') === 'more-info') {
      this._clearCardServiceError();
      fireHaptic(this.config.haptics !== false, this.config.haptics_style);
      return this._showMoreInfo(this.config.entity);
    }
    const call = actionCall(this.config?.tap_action ?? 'toggle', this.config.entity);
    if (!call) return;
    this._clearCardServiceError();
    fireHaptic(this.config.haptics !== false, this.config.haptics_style);
    this._service(call.domain, call.service, call.data);
  }

  _toggleAuto() {
    const auto = this._autoEntity();
    if (!auto) {
      this.openSchedule('slots');
      return;
    }
    this._clearCardServiceError();
    fireHaptic(this.config.haptics !== false, this.config.haptics_style);
    const call = toggleAutoCall(auto);
    this._service(call.domain, call.service, call.data);
  }

  _toggleWorkState() {
    if (!this.config?.work_state_entity || this.config.show_work_state_button === false) return Promise.resolve();
    const call = actionCall('toggle', this.config.entity);
    this._clearCardServiceError();
    fireHaptic(this.config.haptics !== false, this.config.haptics_style);
    return this._service(call.domain, call.service, call.data);
  }

  _toggleShortageProtection() {
    const entity = this.config?.shortage_protection_entity;
    if (!entity || this.config.show_shortage_protection_button === false) return Promise.resolve();
    const call = actionCall('toggle', entity);
    this._clearCardServiceError();
    fireHaptic(this.config.haptics !== false, this.config.haptics_style);
    return this._service(call.domain, call.service, call.data);
  }

  _batteryAction() {
    const entity = this._sensorEntity('battery_entity', 'battery');
    if (!entity) return Promise.resolve();
    this._clearCardServiceError();
    fireHaptic(this.config.haptics !== false, this.config.haptics_style);
    return this._showMoreInfo(entity);
  }

  _showMoreInfo(entityId) {
    if (typeof entityId !== 'string' || !entityId) return false;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      detail: { entityId },
      bubbles: true,
      composed: true,
    }));
    return true;
  }

  // --- Schedule dialog -------------------------------------------------

  openSchedule(focus = 'slots') {
    if (!this.shadowRoot) return;
    if (!this._dialog) {
      const dialog = document.createElement('dialog');
      dialog.addEventListener('close', () => this._onDialogClose());
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) { this._requestDialogClose(); return; }
        const target = event.target?.closest?.('[data-act]');
        if (!target) return;
        this._dialogAction(target.dataset.act, target);
      });
      dialog.addEventListener('input', (event) => this._dialogInput(event.target));
      dialog.addEventListener('change', (event) => this._dialogInput(event.target));
      dialog.addEventListener('value-changed', (event) => {
        if (event.target?.dataset?.field !== 'auto_entity') return;
        this._dialogInput({ dataset: { field: 'auto_entity' }, value: event.detail?.value ?? '' });
      });
      dialog.addEventListener('cancel', (event) => {
        if (this._busy || this._isScheduleDraftDirty()) {
          event.preventDefault();
          this._requestDialogClose();
        }
      });
      dialog.addEventListener('keydown', (event) => { if (event.key === 'Enter' && event.target?.tagName === 'INPUT') event.preventDefault(); });
      this._dialog = dialog;
      this.shadowRoot.appendChild(dialog);
    }
    if (this._dialog.open) {
      this._focusScheduleSection(focus);
      return;
    }
    this._dialogError = null;
    this._busy = false;
    this._busyAction = null;
    this._confirmDelete = false;
    this._confirmDiscard = false;
    const program = this._program();
    this._draft = scheduleDraft(program);
    if (!program && this.config?.auto_entity && !this._draft.auto_entity) this._draft.auto_entity = this.config.auto_entity;
    this._scheduleSnapshot = JSON.stringify(this._draft);
    this._fillDialog();
    if (!this._dialog.open) {
      if (typeof this._dialog.showModal === 'function') this._dialog.showModal();
      else this._dialog.setAttribute('open', '');
    }
    this._focusScheduleSection(focus);
  }

  _fillDialog() {
    const dialog = this._dialog;
    if (!dialog) return;
    const strings = this._strings();
    const draft = this._draft || (this._draft = scheduleDraft(this._program()));
    const program = this._program();
    const mode = draft.schedule_mode;
    const backendError = program?.last_error ? errorLabel(program.last_error, strings) : '';
    dialog.setAttribute('aria-label', strings.scheduleTitle);
    dialog.innerHTML = `
      <style>${CARD_CSS}</style>
      <div class="dlg-shell">
        <div class="dlg-head">
          <span class="dlg-icon"><ha-icon icon="mdi:water-pump"></ha-icon></span>
          <div class="dlg-titles"><h2>${esc(strings.scheduleTitle)}</h2><div class="dlg-sub">${esc(cardTitle(this.config, this._hass))}</div></div>
          <button class="close" type="button" data-act="close" aria-label="${esc(strings.closeSchedule)}"><ha-icon icon="mdi:close"></ha-icon></button>
        </div>
        <div class="dlg-summary" aria-live="polite">
          <div class="summary-copy">
            <strong data-role="summary-frequency">${esc(scheduleSummaryLabel(draft, strings))}</strong>
            <small data-role="summary-count">${esc(strings.windowCount(draft.slots.length))}</small>
          </div>
          <span class="status-pill" data-role="program-status" data-enabled="${draft.enabled}">${esc(draft.enabled ? strings.activeProgram : strings.pausedProgram)}</span>
        </div>
        ${backendError ? `<p class="dlg-backend-error" role="alert">${esc(strings.lastError + backendError)}</p>` : ''}
        <div class="dlg-body">
          <section class="field-stack" id="wf-frequency-section" tabindex="-1" aria-label="${esc(strings.frequency)}">
            <div class="row-field">
              <div><label for="wf-enabled">${esc(strings.scheduleEnabled)}</label><div class="hint" id="wf-enabled-help">${esc(strings.scheduleEnabledHelp)}</div></div>
              <span class="switch"><input id="wf-enabled" type="checkbox" role="switch" aria-describedby="wf-enabled-help" data-field="enabled" ${draft.enabled ? 'checked' : ''}></span>
            </div>
            <div class="mode-picker">
              <div class="mode-picker-title">${esc(strings.scheduleMode)}</div>
              ${mode === 'legacy' ? `<div class="legacy-note" role="note"><ha-icon icon="mdi:information-outline"></ha-icon><span>${esc(strings.legacyModeHelp)}</span></div>` : ''}
              <div class="mode-grid" role="group" aria-label="${esc(strings.scheduleMode)}">
                <button class="mode-card" type="button" data-act="set-mode" data-mode="weekdays" data-selected="${mode === 'weekdays'}" aria-pressed="${mode === 'weekdays'}">
                  <ha-icon class="mode-icon" icon="mdi:calendar-week"></ha-icon><span class="mode-copy"><strong>${esc(strings.weekdayMode)}</strong><small>${esc(strings.weekdayModeHelp)}</small></span><ha-icon class="mode-check" icon="mdi:check-circle"></ha-icon>
                </button>
                <button class="mode-card" type="button" data-act="set-mode" data-mode="interval" data-selected="${mode === 'interval'}" aria-pressed="${mode === 'interval'}">
                  <ha-icon class="mode-icon" icon="mdi:calendar-sync"></ha-icon><span class="mode-copy"><strong>${esc(strings.intervalMode)}</strong><small>${esc(strings.intervalModeHelp)}</small></span><ha-icon class="mode-check" icon="mdi:check-circle"></ha-icon>
                </button>
              </div>
            </div>
            <div class="row-field" data-role="frequency-row" ${mode === 'weekdays' ? 'hidden' : ''}>
              <div><label for="wf-frequency">${esc(strings.frequency)}</label><div class="hint" id="wf-frequency-help" data-role="frequency-help">${esc(frequencyHelpForMode(mode, strings))}</div></div>
              <input class="input num" id="wf-frequency" type="number" min="1" max="${MAX_FREQUENCY_DAYS}" step="1" aria-describedby="wf-frequency-help" data-field="frequency_days" value="${esc(draft.frequency_days)}">
            </div>
            <div class="row-field" data-role="anchor-row" ${mode !== 'weekdays' && Number(draft.frequency_days) > 1 ? '' : 'hidden'}>
              <div><label for="wf-anchor">${esc(strings.anchor)}</label><div class="hint" id="wf-anchor-help">${esc(strings.anchorHelp || '')}</div></div>
              <input class="input" id="wf-anchor" type="date" aria-describedby="wf-anchor-help" data-field="start_date" value="${esc(draft.start_date)}">
            </div>
            <div class="row-field">
              <div><label for="wf-auto">${esc(strings.auto)}</label><div class="hint" id="wf-auto-help">${esc(strings.autoHelp)}</div></div>
              <ha-entity-picker id="wf-auto" data-field="auto_entity" aria-describedby="wf-auto-help"></ha-entity-picker>
            </div>
          </section>
          <section class="dlg-section" id="wf-windows" tabindex="-1" aria-labelledby="wf-windows-title">
            <div class="dlg-section-head">
              <div><h3 id="wf-windows-title">${esc(strings.windowsAria)}</h3><p data-role="window-help">${esc(windowHelpForMode(mode, strings))}</p></div>
              <span class="window-count" data-role="window-count">${esc(strings.windowCountLimit(draft.slots.length, MAX_SLOTS))}</span>
            </div>
            <div class="slots">${draft.slots.map((slot, index) => this._slotMarkup(slot, index, strings)).join('')}</div>
            <div class="empty-windows" data-role="empty-windows" ${draft.slots.length ? 'hidden' : ''}>
              <strong>${esc(strings.emptyWindowsTitle)}</strong>${esc(strings.emptyWindowsHelp)}
            </div>
            <button class="add" type="button" data-act="add-slot" ${draft.slots.length >= MAX_SLOTS ? 'disabled' : ''}>${esc(strings.addWindow)}</button>
          </section>
          <p class="dlg-error" id="wf-dialog-error" role="alert" aria-live="assertive">${esc(this._dialogError || '')}</p>
        </div>
        <footer class="dlg-foot">
          <div class="dlg-feedback" data-role="dialog-feedback" role="status" aria-live="polite"></div>
          <div class="dlg-actions" data-role="dialog-actions">
            ${program ? `<button class="btn danger" type="button" data-act="delete">${esc(strings.deleteProgram)}</button>` : '<span></span>'}
            <div class="dlg-actions-right">
              <button class="btn" type="button" data-act="close">${esc(strings.cancel)}</button>
              <button class="btn primary" type="button" data-act="save">${esc(strings.saveProgram)}</button>
            </div>
          </div>
          <div class="dlg-confirm" data-confirm="discard" hidden>
            <p>${esc(strings.discardPrompt)}</p>
            <div class="dlg-confirm-actions"><button class="btn" type="button" data-act="keep-editing">${esc(strings.keepEditing)}</button><button class="btn danger" type="button" data-act="discard-changes">${esc(strings.discardChanges)}</button></div>
          </div>
          <div class="dlg-confirm" data-confirm="delete" hidden>
            <p>${esc(strings.deletePrompt)}</p>
            <div class="dlg-confirm-actions"><button class="btn" type="button" data-act="cancel-delete">${esc(strings.keepProgram)}</button><button class="btn danger" type="button" data-act="confirm-delete">${esc(strings.deleteNow)}</button></div>
          </div>
        </footer>
      </div>`;
    this._errorBox = dialog.querySelector('.dlg-error');
    this._bindAutoPicker();
    this._renderDialogState();
  }

  _bindAutoPicker() {
    const dialog = this._dialog;
    const picker = dialog?.querySelector('[data-field="auto_entity"]');
    if (!picker) return;
    picker.hass = this._hass;
    picker.includeDomains = ['input_boolean'];
    picker.value = this._draft?.auto_entity || null;
  }

  _slotMarkup(slot, index, strings) {
    const daysHidden = this._draft?.schedule_mode === 'interval' ? 'hidden' : '';
    return `
      <div class="slot" data-slot="${index}" role="group" aria-labelledby="wf-slot-title-${index}">
        <div class="slot-head">
          <div><strong id="wf-slot-title-${index}">${esc(strings.window(index + 1))}</strong><div class="hint slot-meta">${esc(`${slot.start} · ${formatDuration(slot.duration, strings)}`)}</div></div>
          <button class="slot-remove" type="button" data-act="remove-slot" data-slot="${index}" aria-label="${esc(strings.removeWindow(index + 1))}">${esc(strings.removeWindow(index + 1))}</button>
        </div>
        <div class="days" role="group" aria-label="${esc(strings.selectWindowDays(index + 1))}" ${daysHidden}>
          ${strings.dayPills.map((label, dayIndex) => {
            const day = dayIndex + 1;
            const pressed = slot.days.includes(day);
            return `<button class="day" type="button" data-act="toggle-day" data-slot="${index}" data-day="${day}" aria-pressed="${pressed}" aria-label="${esc(strings.dayNames[dayIndex])}">${esc(label)}</button>`;
          }).join('')}
        </div>
        <div class="slot-grid">
          <label>${esc(strings.start)}<input class="input" type="time" aria-label="${esc(`${strings.window(index + 1)} · ${strings.start}`)}" data-slot="${index}" data-slot-field="start" value="${esc(slot.start)}"></label>
          <label>${esc(strings.duration)}<span class="number-control"><input class="input num" id="wf-slot-${index}-duration" type="number" min="1" max="${MAX_DURATION_MINUTES}" step="1" aria-label="${esc(`${strings.window(index + 1)} · ${strings.duration}`)}" data-slot="${index}" data-slot-field="duration" value="${esc(slot.duration)}"><span class="number-steps"><button class="number-step" type="button" data-act="step-field" data-slot="${index}" data-slot-field="duration" data-direction="1" aria-label="${esc(strings.increaseValue(strings.duration, index + 1))}" aria-controls="wf-slot-${index}-duration"><ha-icon icon="mdi:chevron-up"></ha-icon></button><button class="number-step" type="button" data-act="step-field" data-slot="${index}" data-slot-field="duration" data-direction="-1" aria-label="${esc(strings.decreaseValue(strings.duration, index + 1))}" aria-controls="wf-slot-${index}-duration"><ha-icon icon="mdi:chevron-down"></ha-icon></button></span></span></label>
          <label>${esc(strings.liters)}<span class="number-control"><input class="input num" id="wf-slot-${index}-liters" type="number" min="0" step="any" aria-label="${esc(`${strings.window(index + 1)} · ${strings.liters}`)}" data-slot="${index}" data-slot-field="liters" value="${esc(slot.liters)}" title="${esc(strings.litersHelp)}" placeholder="—"><span class="number-steps"><button class="number-step" type="button" data-act="step-field" data-slot="${index}" data-slot-field="liters" data-direction="1" aria-label="${esc(strings.increaseValue(strings.liters, index + 1))}" aria-controls="wf-slot-${index}-liters"><ha-icon icon="mdi:chevron-up"></ha-icon></button><button class="number-step" type="button" data-act="step-field" data-slot="${index}" data-slot-field="liters" data-direction="-1" aria-label="${esc(strings.decreaseValue(strings.liters, index + 1))}" aria-controls="wf-slot-${index}-liters"><ha-icon icon="mdi:chevron-down"></ha-icon></button></span></span></label>
        </div>
      </div>`;
  }

  _dialogInput(target) {
    const draft = this._draft;
    if (!draft || !target || this._busy) return;
    const field = target.dataset?.field;
    if (field === 'enabled') draft.enabled = Boolean(target.checked);
    else if (field === 'frequency_days') {
      draft.frequency_days = target.value === '' ? '' : Number(target.value);
      if (Number(draft.frequency_days) === 1) draft.start_date = '';
    }
    else if (field === 'start_date') draft.start_date = target.value;
    else if (field === 'auto_entity') draft.auto_entity = String(target.value ?? '').trim();
    else {
      const slotIndex = Number(target.dataset?.slot);
      const slotField = target.dataset?.slotField;
      if (!Number.isInteger(slotIndex) || !draft.slots[slotIndex] || !slotField) return;
      draft.slots[slotIndex][slotField] = slotField === 'duration' && target.value !== '' ? Number(target.value) : target.value;
    }
    const anchorInput = this._dialog?.querySelector('[data-field="start_date"]');
    if (anchorInput && anchorInput.value !== (draft.start_date || '')) anchorInput.value = draft.start_date || '';
    this._clearDialogValidation();
    this._renderDialogState();
  }

  _dialogAction(action, target) {
    const strings = this._strings();
    const draft = this._draft;
    if (this._busy) return;
    if (action === 'close') { this._requestDialogClose(); return; }
    if (action === 'keep-editing' || action === 'cancel-delete') {
      this._confirmDelete = false;
      this._confirmDiscard = false;
      this._renderDialogState();
      return;
    }
    if (action === 'discard-changes') { this._closeDialog(true); return; }
    if (action === 'confirm-delete') { this._deleteDraft(); return; }
    if (action === 'step-field') {
      const index = Number(target.dataset.slot);
      const field = target.dataset.slotField;
      if (!Number.isInteger(index) || !draft.slots[index] || !['duration', 'liters'].includes(field)) return;
      const value = stepScheduleValue(draft.slots[index][field], field, Number(target.dataset.direction));
      const input = this._dialog.querySelector(`[data-slot="${index}"][data-slot-field="${field}"]`);
      if (!input) return;
      input.value = String(value);
      this._dialogInput(input);
      input.focus();
      return;
    }
    if (action === 'set-mode') {
      this._setScheduleMode(target.dataset.mode);
      return;
    }
    if (action === 'add-slot') {
      if (draft.slots.length >= MAX_SLOTS) return;
      const slot = slotDraft();
      slot.id = nextSlotId(draft.slots);
      const index = draft.slots.push(slot) - 1;
      this._clearDialogValidation();
      this._refreshSlots(index);
      return;
    }
    if (action === 'remove-slot') {
      const index = Number(target.dataset.slot);
      if (!Number.isInteger(index) || !draft.slots[index]) return;
      draft.slots.splice(index, 1);
      this._clearDialogValidation();
      this._refreshSlots(Math.min(index, draft.slots.length - 1));
      return;
    }
    if (action === 'toggle-day') {
      const index = Number(target.dataset.slot);
      const day = Number(target.dataset.day);
      if (!draft.slots[index] || !Number.isInteger(day) || day < 1 || day > 7) return;
      const days = draft.slots[index].days;
      draft.slots[index].days = days.includes(day) ? days.filter((value) => value !== day) : [...days, day].sort((a, b) => a - b);
      target.setAttribute('aria-pressed', String(draft.slots[index].days.includes(day)));
      this._clearDialogValidation();
      this._renderDialogState();
      return;
    }
    if (action === 'delete') {
      this._confirmDelete = true;
      this._confirmDiscard = false;
      this._renderDialogState();
      this._dialog.querySelector('[data-act="cancel-delete"]')?.focus?.();
      return;
    }
    if (action === 'save') { this._saveDraft(); return; }
  }

  _setScheduleMode(mode) {
    const draft = this._draft;
    if (!draft || this._busy || !['weekdays', 'interval'].includes(mode) || draft.schedule_mode === mode) return;
    draft.schedule_mode = mode;
    if (mode === 'weekdays') {
      draft.frequency_days = 1;
      draft.start_date = '';
    } else {
      if (!isValidDate(draft.start_date)) draft.start_date = localDateString(new Date(), this._hass?.config?.time_zone);
    }
    this._clearDialogValidation();
    this._renderDialogState();
  }

  _refreshSlots(focusIndex = null) {
    const container = this._dialog?.querySelector('.slots');
    if (!container) return;
    container.innerHTML = this._draft.slots.map((slot, index) => this._slotMarkup(slot, index, this._strings())).join('');
    this._renderDialogState();
    if (focusIndex !== null && focusIndex >= 0) {
      const focusTarget = this._draft.schedule_mode === 'interval'
        ? this._dialog.querySelector(`.slot[data-slot="${focusIndex}"] [data-slot-field="start"]`)
        : this._dialog.querySelector(`.slot[data-slot="${focusIndex}"] .day`);
      focusTarget?.focus?.();
      this._dialog.querySelector(`.slot[data-slot="${focusIndex}"]`)?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    } else if (!this._draft.slots.length) {
      this._dialog.querySelector('[data-act="add-slot"]')?.focus?.();
    }
  }

  _focusScheduleSection(focus = 'slots') {
    const target = focus === 'frequency'
      ? this._dialog?.querySelector(this._draft?.schedule_mode === 'weekdays' ? '[data-act="set-mode"][data-mode="interval"]' : '[data-field="frequency_days"]')
      : this._dialog?.querySelector('#wf-windows');
    if (!target) return;
    target.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    target.focus?.({ preventScroll: true });
    if (focus === 'frequency') target.select?.();
  }

  _isScheduleDraftDirty() {
    return Boolean(this._draft && this._scheduleSnapshot && JSON.stringify(this._draft) !== this._scheduleSnapshot);
  }

  _renderDialogState() {
    const dialog = this._dialog;
    const draft = this._draft;
    if (!dialog || !draft) return;
    const strings = this._strings();
    const dirty = this._isScheduleDraftDirty();
    const frequency = dialog.querySelector('[data-role="summary-frequency"]');
    const count = dialog.querySelector('[data-role="summary-count"]');
    const status = dialog.querySelector('[data-role="program-status"]');
    const windowCount = dialog.querySelector('[data-role="window-count"]');
    const anchorRow = dialog.querySelector('[data-role="anchor-row"]');
    const anchorInput = dialog.querySelector('[data-field="start_date"]');
    const frequencyRow = dialog.querySelector('[data-role="frequency-row"]');
    const frequencyHelp = dialog.querySelector('[data-role="frequency-help"]');
    const windowHelp = dialog.querySelector('[data-role="window-help"]');
    const empty = dialog.querySelector('[data-role="empty-windows"]');
    const add = dialog.querySelector('[data-act="add-slot"]');
    const feedback = dialog.querySelector('[data-role="dialog-feedback"]');
    if (frequency) frequency.textContent = scheduleSummaryLabel(draft, strings);
    if (count) count.textContent = strings.windowCount(draft.slots.length);
    if (status) {
      status.textContent = draft.enabled ? strings.activeProgram : strings.pausedProgram;
      status.dataset.enabled = String(draft.enabled);
    }
    if (windowCount) windowCount.textContent = strings.windowCountLimit(draft.slots.length, MAX_SLOTS);
    if (anchorInput && anchorInput.value !== (draft.start_date || '')) anchorInput.value = draft.start_date || '';
    if (frequencyRow) frequencyRow.hidden = draft.schedule_mode === 'weekdays';
    if (frequencyHelp) frequencyHelp.textContent = frequencyHelpForMode(draft.schedule_mode, strings);
    if (anchorRow) anchorRow.hidden = draft.schedule_mode === 'weekdays' || !(Number(draft.frequency_days) > 1);
    if (windowHelp) windowHelp.textContent = windowHelpForMode(draft.schedule_mode, strings);
    for (const button of dialog.querySelectorAll('[data-act="set-mode"]')) {
      const selected = button.dataset.mode === draft.schedule_mode;
      button.dataset.selected = String(selected);
      button.setAttribute('aria-pressed', String(selected));
    }
    for (const days of dialog.querySelectorAll('.days')) days.hidden = draft.schedule_mode === 'interval';
    if (empty) empty.hidden = draft.slots.length > 0;
    if (add) add.disabled = this._busy || draft.slots.length >= MAX_SLOTS;
    if (feedback) {
      feedback.dataset.dirty = String(dirty);
      feedback.textContent = this._busy
        ? (this._busyAction === 'delete' ? strings.deletingProgram : strings.savingProgram)
        : dirty ? strings.unsavedChanges : '';
    }
    const showDiscard = this._confirmDiscard && !this._busy;
    const showDelete = this._confirmDelete && !this._busy;
    const discardPanel = dialog.querySelector('[data-confirm="discard"]');
    const deletePanel = dialog.querySelector('[data-confirm="delete"]');
    const actions = dialog.querySelector('[data-role="dialog-actions"]');
    if (discardPanel) discardPanel.hidden = !showDiscard;
    if (deletePanel) deletePanel.hidden = !showDelete;
    if (actions) actions.hidden = showDiscard || showDelete;
    const save = dialog.querySelector('[data-act="save"]');
    if (save) save.textContent = this._busyAction === 'save' ? strings.savingProgram : strings.saveProgram;
    const deleteButton = dialog.querySelector('[data-act="delete"]');
    if (deleteButton) deleteButton.textContent = this._busyAction === 'delete' ? strings.deletingProgram : strings.deleteProgram;
    if (this._busy) dialog.setAttribute('aria-busy', 'true');
    else dialog.removeAttribute('aria-busy');
  }

  _setDialogBusy(busy, action = null) {
    const dialog = this._dialog;
    this._busy = busy;
    this._busyAction = busy ? action : null;
    if (!dialog) return;
    for (const control of dialog.querySelectorAll('button,input,ha-entity-picker')) {
      if (busy) {
        control.dataset.busyWasDisabled = String(Boolean(control.disabled));
        control.disabled = true;
      } else if (control.dataset.busyWasDisabled !== undefined) {
        control.disabled = control.dataset.busyWasDisabled === 'true';
        delete control.dataset.busyWasDisabled;
      }
    }
    this._renderDialogState();
  }

  _setDialogError(message) {
    this._dialogError = message;
    if (this._errorBox) this._errorBox.textContent = message || '';
  }

  _clearDialogValidation() {
    for (const target of this._dialog?.querySelectorAll('[aria-invalid="true"]') || []) {
      target.removeAttribute('aria-invalid');
      const describedBy = (target.getAttribute('aria-describedby') || '').split(/\s+/).filter((id) => id && id !== 'wf-dialog-error');
      if (describedBy.length) target.setAttribute('aria-describedby', describedBy.join(' '));
      else target.removeAttribute('aria-describedby');
    }
    this._setDialogError('');
  }

  _validationMessage(result) {
    const context = { ...result.context };
    if (result.code === 'slots_overlap') {
      for (const key of ['a', 'b']) {
        const index = this._draft.slots.findIndex((slot) => slot.id === context[key]);
        if (index >= 0) context[key] = this._strings().window(index + 1);
      }
    }
    return errorLabel({ ...result, context }, this._strings()) || this._strings().invalidDraft;
  }

  _showValidationError(result) {
    let target = null;
    const field = {
      invalid_enabled: 'enabled',
      invalid_frequency: 'frequency_days',
      invalid_start_date: 'start_date',
      frequency_needs_anchor: 'start_date',
      invalid_auto_entity: 'auto_entity',
    }[result.code];
    if (field) target = this._dialog?.querySelector(`[data-field="${field}"]`);
    if (!target && ['invalid_time', 'invalid_duration', 'invalid_liters', 'invalid_days', 'duplicate_days', 'invalid_slot_schema', 'invalid_slot_id', 'duplicate_slot_id', 'slots_overlap'].includes(result.code)) {
      let index = 0;
      let slotField = null;
      if (result.code === 'slots_overlap') {
        index = this._draft.slots.findIndex((slot) => slot.id === result.context.b);
        slotField = 'start';
      } else if (result.code === 'invalid_time') {
        index = this._draft.slots.findIndex((slot) => timeMinutes(slot.start) === null);
        slotField = 'start';
      } else if (result.code === 'invalid_duration') {
        index = this._draft.slots.findIndex((slot) => {
          const value = numeric(slot.duration);
          return value === null || !Number.isInteger(value) || value < 1 || value > MAX_DURATION_MINUTES;
        });
        slotField = 'duration';
      } else if (result.code === 'invalid_liters') {
        index = this._draft.slots.findIndex((slot) => slot.liters !== '' && slot.liters !== null && slot.liters !== undefined && (numeric(slot.liters) === null || numeric(slot.liters) <= 0));
        slotField = 'liters';
      } else if (result.code === 'invalid_days') {
        index = this._draft.slots.findIndex((slot) => !Array.isArray(slot.days) || !slot.days.length || slot.days.some((day) => !Number.isInteger(day) || day < 1 || day > 7));
      } else if (result.code === 'duplicate_days') {
        index = this._draft.slots.findIndex((slot) => Array.isArray(slot.days) && new Set(slot.days).size !== slot.days.length);
      } else if (result.code === 'duplicate_slot_id') {
        index = this._draft.slots.findIndex((slot, slotIndex) => this._draft.slots.findIndex((candidate) => candidate.id === slot.id) !== slotIndex);
      } else if (result.code === 'invalid_slot_id') {
        index = this._draft.slots.findIndex((slot) => typeof slot.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(slot.id));
      }
      index = Math.max(index, 0);
      target = result.code === 'invalid_slot_id'
        ? this._dialog?.querySelector(`.slot[data-slot="${index}"] [data-act="remove-slot"]`)
        : slotField
          ? this._dialog?.querySelector(`[data-slot="${index}"][data-slot-field="${slotField}"]`)
          : this._dialog?.querySelector(`.slot[data-slot="${index}"] .day`);
    }
    if (result.code === 'too_many_slots') target = this._dialog?.querySelector('.slot [data-act="remove-slot"]');
    if (['empty_enabled_program', 'invalid_slots'].includes(result.code)) target = this._dialog?.querySelector('[data-act="add-slot"]');
    const message = this._validationMessage(result);
    this._setDialogError(message);
    if (target) {
      target.setAttribute('aria-invalid', 'true');
      const describedBy = new Set((target.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
      describedBy.add('wf-dialog-error');
      target.setAttribute('aria-describedby', [...describedBy].join(' '));
      target.closest?.('.slot')?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      target.focus?.();
    }
  }

  async _saveDraft() {
    if (this._busy) return;
    const strings = this._strings();
    const result = validateScheduleDraft(this._draft);
    if (!result.ok) {
      this._showValidationError(result);
      return;
    }
    const payload = programPayload(this.config.entity, this._draft);
    fireHaptic(this.config.haptics !== false, this.config.haptics_style);
    this._clearDialogValidation();
    this._setDialogBusy(true, 'save');
    await this._service(WATER_FLOW_DOMAIN, 'save_program', payload);
    const failed = Boolean(this._dialogError);
    this._setDialogBusy(false);
    if (!failed) this._closeDialog(true);
  }

  async _deleteDraft() {
    if (this._busy) return;
    this._clearDialogValidation();
    this._setDialogBusy(true, 'delete');
    await this._service(WATER_FLOW_DOMAIN, 'delete_program', deleteProgramPayload(this.config.entity));
    const failed = Boolean(this._dialogError);
    this._setDialogBusy(false);
    if (!failed) this._closeDialog(true);
  }

  _requestDialogClose() {
    if (this._busy) return;
    this._confirmDelete = false;
    if (this._isScheduleDraftDirty()) {
      this._confirmDiscard = true;
      this._renderDialogState();
      this._dialog?.querySelector('[data-act="keep-editing"]')?.focus?.();
      return;
    }
    this._closeDialog(true);
  }

  _closeDialog(force = false) {
    const dialog = this._dialog;
    if (!dialog) return;
    if (this._busy) return;
    if (!force && this._isScheduleDraftDirty()) { this._requestDialogClose(); return; }
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else {
      dialog.removeAttribute('open');
      this._onDialogClose();
    }
  }

  _onDialogClose() {
    const focus = this._scheduleOpener?.dataset?.focus;
    this._lastRenderKey = null;
    this._draft = null;
    this._scheduleSnapshot = null;
    this._dialogError = null;
    this._errorBox = null;
    this._busy = false;
    this._busyAction = null;
    this._confirmDelete = false;
    this._confirmDiscard = false;
    this._renderIfChanged();
    const opener = focus
      ? this.shadowRoot?.querySelector?.(`[data-act="schedule"][data-focus="${focus}"]`)
      : this.shadowRoot?.querySelector?.('[data-act="schedule"]');
    opener?.focus?.();
    this._scheduleOpener = null;
  }
}

export const frequencyLabel = (days, strings) => strings.everyDays(numeric(days) ?? 1);

export const scheduleSummaryLabel = (program, strings) => {
  const frequency = numeric(program?.frequency_days) ?? 1;
  const mode = SCHEDULE_MODES.includes(program?.schedule_mode)
    ? program.schedule_mode
    : frequency > 1 ? 'legacy' : 'weekdays';
  if (mode === 'weekdays') return strings.weeklySummary;
  const interval = frequencyLabel(frequency, strings);
  return mode === 'legacy' ? strings.legacySummary(interval) : interval;
};

const windowHelpForMode = (mode, strings) => {
  if (mode === 'interval') return strings.intervalWindowHelp;
  if (mode === 'legacy') return strings.legacyWindowHelp;
  return strings.weekdayWindowHelp;
};

const frequencyHelpForMode = (mode, strings) => mode === 'interval'
  ? strings.intervalFrequencyHelp
  : mode === 'legacy' ? strings.legacyFrequencyHelp : strings.intervalFrequencyHelp;

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
