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
  },
  weather: {
    name: 'Local Weather Forecast',
    description:
      'Offline rain prediction for 38 Indonesian provinces using a pre-trained Random Forest model. No API calls — runs entirely in-browser.',
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
  },
} as const
