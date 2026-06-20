/** A single decision tree node serialized to JSON */
export interface SerializedNode {
  /** Feature index to split on (-1 for leaf) */
  f: number
  /** Threshold value for split */
  t: number
  /** Left child node (<=threshold) */
  l?: SerializedNode
  /** Right child node (>threshold) */
  r?: SerializedNode
  /** Leaf prediction (0 or 1) */
  p?: number
  /** Leaf probability (confidence for class 1) */
  c?: number
}

/** A serialized decision tree */
export interface SerializedTree {
  root: SerializedNode
}

/** The full serialized Random Forest model */
export interface SerializedModel {
  version: number
  nTrees: number
  maxDepth: number
  featureNames: string[]
  trees: SerializedTree[]
  metadata?: {
    trainedAt: string
    datasetSize: number
    accuracy: number
    f1Score: number
  }
}

/** Prediction result from the model */
export interface PredictionResult {
  prediction: 0 | 1
  confidence: number
  executionTime: number
  features: Record<string, number>
}

/** A single data sample for training */
export interface TrainingSample {
  features: number[]
  label: number
}
