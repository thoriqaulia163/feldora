/**
 * Types for Local Weather Forecast V2
 *
 * Multi-output multiclass Random Forest:
 * - 4 time slots: morning, afternoon, evening, night
 * - 5 weather categories per slot: Cerah(0), Berawan(1), Gerimis(2), Hujan(3), Badai(4)
 */

// ─── Weather Categories ─────────────────────────────────────────────────────

export const WEATHER_CATEGORIES = ['Tidak Hujan', 'Hujan'] as const
export type WeatherCategory = (typeof WEATHER_CATEGORIES)[number]

export const NUM_CLASSES = 2
export const NUM_SLOTS = 4

export const TIME_SLOTS = ['morning', 'afternoon', 'evening', 'night'] as const
export type TimeSlot = (typeof TIME_SLOTS)[number]

// ─── Serialized Model Format ────────────────────────────────────────────────

/** A single decision tree node (single-output, per-slot) */
export interface SerializedNodeV2 {
  /** Feature index to split on (-1 for leaf) */
  f: number
  /** Threshold value for split */
  t: number
  /** Left child node (<=threshold) */
  l?: SerializedNodeV2
  /** Right child node (>threshold) */
  r?: SerializedNodeV2
  /** Leaf prediction: class index 0-3 */
  p?: number
  /** Leaf confidence: proportion of majority class in leaf */
  c?: number
}

/** A serialized decision tree */
export interface SerializedTreeV2 {
  root: SerializedNodeV2
}

/** A per-slot forest */
export interface SlotForest {
  slot: string
  nTrees: number
  trees: SerializedTreeV2[]
}

/** The full serialized model with independent forests per slot */
export interface SerializedModelV2 {
  version: 2
  nSlots: number
  nClasses: number
  maxDepth: number
  featureNames: string[]
  slotNames: string[]
  categoryNames: string[]
  thresholds?: number[]
  forests: SlotForest[]
  metadata?: {
    trainedAt: string
    datasetSize: number
    accuracy: Record<string, number>
    f1Score: Record<string, number>
  }
}

// ─── Prediction Result ──────────────────────────────────────────────────────

export interface SlotPrediction {
  category: WeatherCategory
  categoryIndex: number
  confidence: number
}

export interface PredictionResultV2 {
  morning: SlotPrediction
  afternoon: SlotPrediction
  evening: SlotPrediction
  night: SlotPrediction
  executionTime: number
  features: Record<string, number>
}

// ─── Training Types (used in scripts) ───────────────────────────────────────

export interface TrainingSampleV2 {
  features: number[]
  /** Labels for each time slot [morning, afternoon, evening, night], each 0-4 */
  labels: number[]
}
