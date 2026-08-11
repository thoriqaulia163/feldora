# Local Weather Forecast — V2.5 vs V3 Comparison Report

## Summary

V3 (Neural Network) mengalahkan V2.5 (Gradient Boosted Trees) pada metric utama Macro F1 dengan model **5× lebih kecil**.

---

## Model Size

| Model | Format | Size |
|-------|--------|------|
| V2.5 (GBT) | JSON (400 trees × depth 4) | **319.7 KB** |
| V3 (NN) | JSON (weights + embedding + config) | **63.9 KB** |

Reduction: **-80%** (255.8 KB lebih kecil)

---

## Architecture Comparison

| Aspect | V2.5 | V3 |
|--------|------|-----|
| Model type | Gradient Boosted Trees | Neural Network (Shared MLP) |
| Structure | 4 independent GBT forests | 1 shared backbone + 4 output heads |
| Trees/params | 100 trees/slot × depth 4 | Embedding(287×8) + Dense[64,32,16] + 4 heads |
| Features | 12 | 14 (+sinMonth, +cosMonth) |
| Location handling | Raw coordinates | Learned embedding (dim=8) |
| Temporal encoding | sin/cos dayOfYear + dayLength | sin/cos dayOfYear + sin/cos month + dayLength |
| Probability method | sigmoid(cumulative tree scores) | sigmoid(final layer output) |
| Training split | 80/20 random | Time-based: 2021-23 / 2024 / 2025 |

---

## Performance — Test Set (Year 2025)

### Overall Metrics

| Metric | V2.5 Standard | V2.5 Sensitive | V3 Standard | V3 Sensitive |
|--------|---:|---:|---:|---:|
| **Accuracy** | 72.46% | 70.80% | **72.76%** | 69.49% |
| **Macro F1** | 54.56% | 63.10% | 60.30% | **64.16%** |

### Per-Slot Metrics — Standard Mode (threshold=0.5)

| Slot | V2.5 Acc | V2.5 F1 | V3 Acc | V3 F1 |
|------|---:|---:|---:|---:|
| Morning | 77.9% | 45.7% | **79.3%** | **60.5%** |
| Afternoon | 66.7% | 63.8% | 67.2% | **65.6%** |
| Evening | 64.9% | **64.1%** | 64.1% | 63.4% |
| Night | 80.3% | 44.5% | **80.4%** | **51.8%** |

### Per-Slot Metrics — Sensitive Mode (tuned thresholds)

| Slot | V2.5 Threshold | V2.5 F1 | V3 Threshold | V3 F1 |
|------|---:|---:|---:|---:|
| Morning | 0.30 | 63.0% | 0.30 | **65.5%** |
| Afternoon | 0.55 | **65.3%** | 0.55 | **66.3%** |
| Evening | 0.50 | 64.1% | 0.55 | **63.9%** |
| Night | 0.25 | 60.1% | 0.30 | **60.9%** |

---

## Key Findings

1. **Macro F1 (primary metric)**: V3 Sensitive (64.16%) > V2.5 Sensitive (63.10%) — +1.06%
2. **Morning slot**: Biggest improvement — V3 Standard F1 60.5% vs V2.5 Standard 45.7% (+14.8%)
3. **Night slot**: V3 Standard F1 51.8% vs V2.5 Standard 44.5% (+7.3%)
4. **Model size**: V3 is 5× smaller (64 KB vs 320 KB)
5. **Accuracy trade-off**: V3 Sensitive slightly lower accuracy (69.49% vs 70.80%) but significantly better F1 — model is less conservative, detects more rain events

---

## Training Details

| Parameter | V2.5 | V3 |
|-----------|------|-----|
| Algorithm | GBT (100 trees × depth 4, lr=0.1) | Adam (lr=0.001) |
| Training time | ~9 min (parallel workers) | ~5 min (single thread) |
| Epochs/iterations | 100 boosting rounds | 19 epochs (early stopped) |
| Early stopping | N/A | Patience 15 (val loss) |
| Data split | 80/20 random | Time-based 60/20/20 |
| Batch size | Full dataset | 64 |
| Seed | 42 | 42 |

---

## Dataset

Shared between both models:
- Source: Open-Meteo Historical Weather API (hourly weather_code)
- Locations: 287 Indonesian cities/kabupaten
- Period: 5 years (2021–2025)
- Total samples: 524,062
- Label: binary (WMO code ≥ 2 = rain)
- V3 split: train 314,265 (2021-2023) / val 105,042 (2024) / test 104,755 (2025)

---

## Inference Performance (Browser)

| Metric | V2.5 | V3 |
|--------|------|-----|
| Inference time | <1ms | <1ms |
| Model load (cached) | Instant (singleton) | Instant (singleton) |
| Model load (network) | ~320 KB fetch | ~64 KB fetch |
| Memory footprint | Tree structures in JSON | Weight matrices in JSON |
| Device support | Desktop ✅ Mobile ✅ | Desktop ✅ Mobile ✅ |

---

## Conclusion

V3 Neural Network merupakan eksperimen yang berhasil:

- **Lebih baik** pada metric utama (Macro F1) — khususnya slot Morning dan Night yang sebelumnya sulit
- **Jauh lebih kecil** (5× reduction) — lebih cepat download, lebih ringan di cache
- **Competitive accuracy** — hanya selisih kecil di standard mode
- **Learned representations** — location embedding memungkinkan model menangkap pola per-kota tanpa feature engineering manual

Trade-off:
- Accuracy Sensitive mode sedikit lebih rendah (-1.3%) karena threshold lebih agresif
- Training reproducibility: NN sensitif terhadap initialization, meskipun seed digunakan
- Time-based split lebih ketat (test = future year) vs random split pada V2.5
