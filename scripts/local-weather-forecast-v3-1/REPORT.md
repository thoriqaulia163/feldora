# Local Weather Forecast — V3 vs V3.1 Comparison Report

## Summary

V3.1 tested whether V3 was limited by model capacity. Result: **No meaningful improvement.** Larger network + embedding did not improve generalization, confirming the bottleneck is in data/features rather than architecture size.

---

## Architecture Comparison

| Aspect | V3 | V3.1 |
|--------|-----|------|
| Embedding dim | 8 | 16 |
| Hidden layers | [64, 32, 16] | [128, 64, 32] |
| Total input dim | 22 (8+14) | 30 (16+14) |
| Parameters (approx) | ~3.5K | ~14K |
| Model size | **63.9 KB** | 179.9 KB |
| Feature set | 14 numeric | 14 numeric (identical) |

---

## Performance — Test Set (Year 2025)

### Standard Mode (threshold=0.5)

| Metric | V3 | V3.1 | Δ |
|--------|---:|---:|---:|
| **Accuracy** | **72.76%** | 72.56% | -0.20% |
| **Macro F1** | 60.30% | **60.74%** | +0.44% |
| Morning F1 | 60.5% | **62.5%** | +2.0% |
| Afternoon F1 | **65.6%** | 65.1% | -0.5% |
| Evening F1 | **63.4%** | 62.7% | -0.7% |
| Night F1 | 51.8% | **52.6%** | +0.8% |

### Sensitive Mode (tuned thresholds)

| Metric | V3 | V3.1 | Δ |
|--------|---:|---:|---:|
| Thresholds | [0.30, 0.55, 0.55, 0.30] | [0.35, 0.575, 0.55, 0.325] | — |
| **Accuracy** | 69.49% | **69.62%** | +0.13% |
| **Macro F1** | **64.16%** | 64.08% | -0.08% |
| Morning F1 | **65.5%** | 65.3% | -0.2% |
| Afternoon F1 | 66.3% | **66.3%** | 0.0% |
| Evening F1 | **63.9%** | **63.9%** | 0.0% |
| Night F1 | **60.9%** | 60.8% | -0.1% |

---

## Model Size vs Performance Trade-off

| Model | Macro F1 (Sensitive) | Size | F1 per KB |
|-------|---:|---:|---:|
| V3 | **64.16%** | 63.9 KB | **1.004%/KB** |
| V3.1 | 64.08% | 179.9 KB | 0.356%/KB |

V3 delivers essentially the same performance at 2.8× less storage.

---

## Learning Curves (V3.1)

| Epoch | Train Loss | Val Loss | Val Macro F1 |
|---:|---:|---:|---:|
| 1 | 2.1154 | 2.1589 | 59.6% |
| 5 | 2.0458 | 2.2359 | 58.5% |
| 10 | 2.0223 | 2.2822 | 58.7% |
| 15 | 2.0078 | 2.2529 | 59.8% |
| 16 | — | — | Early stopped |

**Diagnosis**: Mild overfitting. Training loss keeps decreasing while validation loss increases after epoch 1. The network has excess capacity for this dataset/feature set — it memorizes training patterns that don't generalize.

---

## Rolling Temporal Validation (V3.1)

| Configuration | Val Loss | Macro F1 (t=0.5) |
|---------------|---:|---:|
| Train 2021-22, Val 2023 | 2.0401 | 58.43% |
| Train 2021-23, Val 2024 | 2.1989 | 60.20% |

Temporal stability is adequate — performance improves with more training data (expected). The gap between rolling validation and main benchmark (60.74%) is small, suggesting reasonable temporal generalization.

---

## Key Findings

1. **Capacity is not the bottleneck**: Increasing from [64,32,16] to [128,64,32] and embedding from 8→16 produced no meaningful F1 improvement (+0.44% standard, -0.08% sensitive)
2. **Overfitting signal**: V3.1 shows mild overfitting in learning curves — the extra capacity hurts rather than helps
3. **Size penalty without benefit**: 2.8× larger model for effectively identical performance
4. **Feature/data limitation**: The bottleneck is likely in the feature set (only climate-static features) and dataset characteristics, not model expressiveness
5. **V3 is already near-optimal** for this feature set: small NN captures the learnable patterns efficiently

---

## V3.1 + Light Regularization Experiment

Tested whether V3.1's stagnation was due to overfitting by adding:
- Dropout: 0.10 (inverted, on hidden layers)
- Weight decay: 1e-4 (AdamW, on weights only, not biases/embeddings)
- Patience increased to 20

### Results

| Metric | V3.1 Baseline | V3.1 + Regularization |
|--------|---:|---:|
| Macro F1 (Sensitive) | 64.08% | 63.95% |
| Accuracy (Sensitive) | 69.62% | 69.33% |
| Best epoch | 1 | 2 |
| Early stopped at | 16 | 22 |

**Regularization did not help.** Performance is marginally worse (-0.13% F1).

### Learning Curve Comparison

| | V3.1 Baseline | V3.1 + Reg |
|--|---:|---:|
| Epoch 1 val loss | 2.1589 | 2.1519 |
| Best val loss | 2.1589 (epoch 1) | 2.1445 (epoch 2) |
| Train-val gap at best | -0.0435 | -0.0445 |
| Training continues | loss dropping, val rising | similar pattern |

The regularized model shows a marginally smaller train-val gap but no generalization improvement. This confirms overfitting is **not** the primary issue.

### Diagnosis

The problem is not model capacity (V3 → V3.1 showed no gain) and not overfitting (regularization showed no gain). The bottleneck is definitively in the **feature/data space**:
- Only climate-static features (no real-time weather variables)
- Binary target from WMO weather codes (information loss)
- Limited temporal features (no multi-day patterns)

---

## Conclusion

V3.1 answers two experimental questions:

> **"Was V3 limited by capacity?"**
>
> **No.** V3 (64 KB, [64,32,16], emb=8) is already sufficient.

> **"Was V3.1 limited by overfitting?"**
>
> **No.** Dropout + weight decay did not improve generalization.

The performance ceiling (~64% Macro F1) is a **data limitation**, not a model limitation.

### Recommendations for future improvement

Rather than making the network larger or more regularized, focus on:
- **Richer features**: humidity, pressure, wind patterns (would require weather API during dataset generation, not inference)
- **More granular targets**: continuous precipitation amount instead of binary
- **Ensemble approaches**: combining V3 predictions with rule-based heuristics
- **V3.3 independent networks**: test whether slot-specific specialization helps

---

## Definition of Done Checklist

- [x] V3 baseline tetap dapat dievaluasi
- [x] Embedding menggunakan dimension 16
- [x] Hidden layers menggunakan 128 → 64 → 32
- [x] Temporal split tetap 2021–2023 / 2024 / 2025
- [x] Normalization statistics hanya berasal dari training set
- [x] Threshold V3.1 tidak menggunakan threshold V2.5
- [x] Threshold dibuat secara independen untuk setiap time slot
- [x] Threshold hanya dituning menggunakan validation set
- [x] Test set tidak digunakan untuk threshold tuning
- [x] Learning curve training/validation tersedia
- [x] Rolling temporal validation tersedia sebagai evaluasi tambahan
- [x] Final test dilakukan pada 2025
- [x] Macro F1 dibandingkan dengan V3
- [x] F1 masing-masing slot dibandingkan
- [x] Model size dibandingkan
- [x] Inference latency dibandingkan (both <1ms)
- [x] Hasil akhir V3.1 didokumentasikan
