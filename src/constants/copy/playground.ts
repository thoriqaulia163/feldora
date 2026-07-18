export const PLAYGROUND_COPY = {
  header: {
    label: 'Experiments',
    heading: 'Play',
    headingAccent: 'ground',
    description:
      'A collection of experimental modules — lightweight tools and AI-powered features running entirely in your browser.',
  },
  moduleList: {
    loadButton: 'Load Module',
    loadingButton: 'Loading...',
    errorRetry: 'Retry',
    sizeLabel: 'Est. size',
    searchPlaceholder: 'Search modules...',
    offlineHint: 'Modules can be used offline after being opened once.',
    noModulesFound: 'No modules found',
    offlineReadyBadge: 'Offline Ready',
    notLoadedBadge: 'Not Loaded',
    updatedLabel: 'Updated:',
  },
  weather: {
    name: 'Local Weather Forecast',
    description:
      'Offline rain prediction for 287 Indonesian provinces using a pre-trained Random Forest model. No API calls — runs entirely in-browser.',
    provinceLabel: 'City',
    provincePlaceholder: 'Search city...',
    dateLabel: 'Date',
    advancedLabel: 'Advanced Settings',
    ensoLabel: 'ENSO Phase',
    iodLabel: 'IOD Phase',
    predictButton: 'Predict',
    resultTitle: 'Prediction Result',
    rainLabel: 'Rain',
    noRainLabel: 'No Rain',
    confidenceLabel: 'Confidence',
    executionTimeLabel: 'Execution Time',
    featuresTitle: 'Features Used',
    idleMessage: 'Select a city and click Predict',
    loadingModel: 'Loading model...',
    predicting: 'Predicting...',
    noCitiesFound: 'No cities found',
    selectedLabel: 'Selected:',
    aboutTitle: 'About',
    aboutDescription:
      'This module uses a Random Forest model (40 decision trees, max depth 6) trained on historical precipitation data from Open-Meteo covering 287 Indonesian cities between 2021–2025. Accuracy: 65.35%, Macro F1: 65.35%. The model predicts whether significant rainfall (>5mm) will occur on a given day.',
    aboutFeatures:
      'Features: day of year, latitude, longitude, elevation, monsoon zone, local season, ENSO phase, and IOD phase. Runs entirely in-browser with no API calls.',
    disclaimer:
      'Predictions are experimental and should not be used as a primary reference. Results are based on historical climatological patterns with limited parameters, not real-time atmospheric data. Use official meteorological services (BMKG) for critical decisions.',
  },
  weatherV2: {
    name: 'Local Weather Forecast V2',
    description:
      'Multi-slot rain prediction for 287 Indonesian cities using independent Random Forests per time slot. Predicts rain for morning, afternoon, evening, and night.',
    cityLabel: 'City',
    cityPlaceholder: 'Search city...',
    dateLabel: 'Date',
    prevDayLabel: 'Cuaca Kemarin',
    advancedLabel: 'Advanced Settings',
    ensoLabel: 'ENSO Phase',
    iodLabel: 'IOD Phase',
    predictButton: 'Predict',
    resultTitle: 'Prediction Result',
    executionTimeLabel: 'Execution Time',
    idleMessage: 'Select a city and click Predict',
    howToUseTitle: 'How to Use',
    howToUseSteps: [
      'Select a date (default: today).',
      'Search and select a city.',
      'Pilih kondisi hujan kemarin — dari 4 slot waktu (Pagi 05–10, Siang 11–14, Sore 15–17, Malam 18–04), berapa yang hujan.',
      '(Optional) Set ENSO & IOD phase in Advanced Settings.',
      'Toggle mode: Standard (conservative, high accuracy) or Sensitive (better rain detection, higher F1).',
      'Click Predict to see rain forecast for all time slots.',
    ],
    loadingModel: 'Loading model...',
    predicting: 'Predicting...',
    noCitiesFound: 'No cities found',
    selectedLabel: 'Selected:',
    aboutTitle: 'About',
    aboutDescription:
      'This module predicts rain/no-rain for four time slots — Pagi (05:00–10:59), Siang (11:00–14:59), Sore (15:00–17:59), Malam (18:00–04:59) — using 4 independent Random Forests (30 trees each) trained on 5 years of hourly historical data from 287 Indonesian cities. Standard mode: 72.48% accuracy, 56.28% F1. Sensitive mode: 72.46% accuracy, 58.43% F1 (tuned thresholds for better rain detection).',
    aboutFeatures:
      'Features: day of year, latitude, longitude, elevation, monsoon zone, local season, ENSO phase, IOD phase, and previous day rain (binary). Runs entirely in-browser with no API calls.',
    disclaimer:
      'Predictions are experimental and should not be used as a primary reference. Results are based on historical climatological patterns with limited parameters, not real-time atmospheric data. Use official meteorological services (BMKG) for critical decisions.',
  },
  weatherV2_5: {
    name: 'Local Weather Forecast V2.5',
    description:
      'Per-slot rain prediction using Gradient Boosted Trees with computed climate features.',
    cityLabel: 'City',
    cityPlaceholder: 'Search city...',
    dateLabel: 'Date',
    prevDayLabel: 'Cuaca Kemarin',
    advancedLabel: 'Advanced Settings',
    ensoLabel: 'ENSO Phase',
    iodLabel: 'IOD Phase',
    predictButton: 'Predict',
    resultTitle: 'Prediction Result',
    executionTimeLabel: 'Execution Time',
    idleMessage: 'Select a city and click Predict',
    howToUseTitle: 'How to Use',
    howToUseSteps: [
      'Select a date (default: today).',
      'Search and select a city.',
      'Select yesterday\'s weather condition.',
      '(Optional) Set ENSO & IOD phase in Advanced Settings.',
      'Toggle mode: Standard (conservative, high accuracy) or Sensitive (better rain detection, higher F1).',
      'Click Predict to see rain forecast for all time slots.',
    ],
    loadingModel: 'Loading model...',
    predicting: 'Predicting...',
    noCitiesFound: 'No cities found',
    selectedLabel: 'Selected:',
    aboutTitle: 'About',
    aboutDescription:
      'This module predicts rain/no-rain for four time slots — Pagi (05:00–10:59), Siang (11:00–14:59), Sore (15:00–17:59), Malam (18:00–04:59) — using Gradient Boosted Trees (100 trees per slot, depth 4) trained on 5 years of hourly historical data from 287 Indonesian cities. Standard mode: 72.46% accuracy, 54.56% F1. Sensitive mode: 70.8% accuracy, 63.1% F1 (best overall F1, significantly better rain detection especially at night: 60.1% F1 vs 47.2% in V2).',
    aboutFeatures:
      'Features: day of year (+ sin/cos encoding), latitude, longitude, elevation, monsoon zone, local season, ENSO phase, IOD phase, previous day rain, and computed day length. Runs entirely in-browser.',
    disclaimer:
      'Predictions are experimental and should not be used as a primary reference. Results are based on historical climatological patterns with limited parameters, not real-time atmospheric data. Use official meteorological services (BMKG) for critical decisions.',
  },
  aiUpscaler: {
    name: 'Advanced Image Upscaler',
    description: 'AI-powered 4× image upscaling using Real-ESRGAN x4v3 via LiteRT.js.',
    backLabel: 'Back to modules',
    moduleLabel: 'AI',
    startButton: 'Start Processing',
    downloadButton: '↓ Download',
    resetButton: 'Reset',
    modelLoadingLabel: 'Loading LiteRT runtime + model…',
    modelReadyWebGPU: 'Model ready — WebGPU',
    modelReadyWASM: 'Model ready — WASM (CPU)',
    processingLabel: 'Running Real-ESRGAN',
    assemblingLabel: 'Assembling',
    formatLabel: 'Output Format',
    qualityLabel: 'Quality',
  },
  quickUpscaler: {
    name: 'Quick Image Upscaler',
    description: 'GPU-accelerated image upscaling (2× / 4×) via AMD FSR1, Lanczos3, or EWA Jinc. Fully in-browser. Bicubic always available as fallback.',

    // Back link
    backLabel: 'Back to modules',

    // Module badge
    moduleLabel: 'Tool',

    // WebGPU status badge
    webGPUAvailable: 'WebGPU available',
    webGPUUnavailable: 'WebGPU unavailable',
    webGPURequiredTooltip: 'Requires WebGPU — not available in this browser',
    webGPUDisabledNote: 'WebGPU not available — Lanczos3, FSR1 and Jinc EWA are disabled',

    // Section labels
    algorithmLabel: 'Algorithm',
    scaleLabel: 'Upscale Factor',
    sharpeningLabel: 'Sharpening (RCAS)',
    strengthLabel: 'Strength',
    formatLabel: 'Output Format',
    qualityLabel: 'Quality',

    // Algorithm options
    algorithms: {
      bicubic:  { label: 'Bicubic',  desc: 'Smooth · no GPU' },
      lanczos3: { label: 'Lanczos3', desc: 'Sharp · WebGPU' },
      fsr1:     { label: 'FSR1',     desc: 'Edge-adaptive · WebGPU' },
      jinc:     { label: 'Jinc EWA', desc: 'Circular · WebGPU' },
    },

    // RCAS toggle
    rcasOn: 'On',
    rcasOff: 'Off',
    rcasNotAvailable: 'Not available for Bicubic',

    // Scale options
    scale2x: '2×',
    scale4x: '4×',

    // Format options
    formatPng: 'PNG',
    formatJpeg: 'JPEG',

    // Processing spinners
    processingLabels: {
      bicubic:  'Upscaling…',
      lanczos3: 'Running Lanczos3…',
      fsr1:     'Running FSR1 shaders…',
      jinc:     'Running Jinc EWA…',
      fallback: 'Processing…',
      updating: 'Updating…',
    },

    // Dropzone
    dropzonePrompt: 'Drop image or',
    dropzonePromptAccent: 'click to browse',
    dropzoneReplaceHint: 'click to replace',
    dropzoneAriaLabel: 'Upload image',

    // Slider comparison
    sliderOriginalLabel: 'Original',
    sliderResultLabel: 'Result',
    sliderResultAlt: 'Upscaled result',
    sliderOriginalAlt: 'Original',
    sliderHint: 'drag the divider to compare',

    // Download button
    downloadButton: '↓ Download',
  },
  ticTacToe: {
    name: 'Tic Tac Toe',
    description: 'Classic 3×3 strategy game with PvP and PvC modes.',

    // Navigation
    backLabel: 'Back to modules',

    // Section labels
    modeSectionLabel: 'Game Mode',
    levelSectionLabel: 'Bot Difficulty',

    // Mode buttons (short UI labels)
    modeOptions: {
      pvp: 'PvP',
      pvc: 'PvC',
    },

    // Level buttons (short UI labels)
    levelOptions: {
      easy: 'Easy',
      medium: 'Med',
      hard: 'Hard',
    },

    // Player legend
    legendYou: 'You',
    legendBot: 'Bot',
    legendPlayer1: 'Player 1',
    legendPlayer2: 'Player 2',

    // Status messages
    statusIdle: 'Click a cell to start',
    statusDraw: "It's a Draw",
    statusBotThinking: 'Bot thinking...',
    statusWinYou: 'You Win!',
    statusWinBot: 'Bot Wins!',
    statusWins: 'Wins!',       // PvP: "Player X {statusWins}"
    statusTakesIt: 'takes it', // "{winner} {statusTakesIt}"
    statusBotTurn: "Bot's turn",
    statusYourTurn: 'Your turn',
    statusPlayerTurnSuffix: "'s turn", // "Player X{statusPlayerTurnSuffix}"

    // Buttons
    resetButton: 'Reset Game',

    // Confirm modals — Reset
    modalResetTitle: 'Reset Game?',
    modalResetMessage: 'The current game will be cleared and a new one will start.',
    modalResetConfirm: 'Reset',

    // Confirm modals — Switch Mode
    modalSwitchModeTitle: 'Switch Mode?',
    modalSwitchModeSuffix: 'will reset the current game.',
    modalSwitchModePrefix: 'Switching to',
    modalSwitchConfirm: 'Switch',

    // Confirm modals — Change Difficulty
    modalChangeDiffTitle: 'Change Difficulty?',

    // Shared modal button
    modalCancel: 'Cancel',

    // Full mode names (for modal messages)
    modes: {
      pvp: 'Player vs Player',
      pvc: 'Player vs Computer',
    },

    // Full level names (for modal messages)
    levels: {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    },

    // Level descriptions (for documentation/about)
    levelDescriptions: {
      easy: 'Picks a random cell',
      medium: 'Wins or blocks when possible',
      hard: 'Unbeatable (Minimax)',
    },

    // How to play (for documentation/about)
    howToPlayTitle: 'How to Play',
    howToPlaySteps: [
      'Get 3 in a row — horizontal, vertical, or diagonal.',
      'X always goes first.',
      'PvP — two players take turns on the same device.',
      'PvC — you play as X, bot plays as O.',
    ],
  },
  splitBill: {
    name: 'Split Bill',
    description: 'Offline bill splitting with encrypted local storage.',
    moduleLabel: 'Tool',

    // Navigation
    backToPlayground: '← Playground',
    backToBills: '← Back',

    // Home page titles
    homeTitle: 'Split',
    homeTitleAccent: 'Bill',

    // Section headers
    peopleSectionTitle: 'People',
    billsSectionTitle: 'Bills',

    // Buttons
    addPersonButton: '+ Add',
    createBillButton: '+ Create',
    importQRButton: 'QR',
    importQRAriaLabel: 'Import bill from QR',
    settingsAriaLabel: 'Settings',

    // Search
    searchBillsPlaceholder: 'Search bills...',

    // Create page
    createPageTitle: 'Create',
    createPageTitleAccent: 'Bill',
    loadingEncryption: 'Loading encryption...',

    // Settings modal
    settingsTitle: 'Settings',
    settingsCloseAriaLabel: 'Close',

    // Empty states
    emptyPeopleTitle: 'No people yet',
    emptyPeopleDesc: 'Add people you usually split bills with',
    emptyPeopleAction: 'Add Person',
    emptyBillsTitle: 'No bills yet',
    emptyBillsDesc: 'Create your first bill to start splitting',
    emptyBillsAction: 'Create Bill',

    // Delete confirm modal
    deleteBillTitle: 'Delete Bill?',
    deleteBillSuffix: 'will be permanently deleted.',

    // PIN gate
    pinLockedTitle: 'Split Bill Locked',
    pinLockedSubtitle: 'Enter PIN to unlock',
    pinPlaceholder: 'PIN',
    pinUnlockButton: 'Unlock',
    pinUnlockingButton: 'Unlocking...',
    pinEnterError: 'Enter PIN',
    pinWrongError: 'Wrong PIN',

    // Settings — PIN protection
    pinLabel: 'PIN Protection',
    pinActiveDesc: 'Active — data locked with PIN',
    pinInactiveDesc: 'Inactive — data encrypted without PIN',

    // Split modes
    splitModes: {
      equal: 'Equal',
      custom: 'Custom',
      itemized: 'Itemized',
    },

    // Payment status
    paymentStatus: {
      paid: 'Paid',
      unpaid: 'Unpaid',
    },
  },
} as const
