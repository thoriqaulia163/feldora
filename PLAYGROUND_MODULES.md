# FELDORA — Playground Modules

Dokumentasi lengkap semua module yang tersedia di `/playground`.

---

## Local Weather Forecast

| Field | Value |
|-------|-------|
| ID | `local-weather-forecast` |
| Label | AI |
| Last Updated | 20 June 2026 |
| Model Size | ~130 KB |
| Inference Time | <1ms |
| Offline | Yes (setelah model loaded) |

### Deskripsi

Prediksi hujan (>5mm) untuk 514 kota/kabupaten di Indonesia menggunakan Random Forest yang berjalan sepenuhnya di browser. Tidak ada API call saat prediksi — model di-load sekali, lalu semua inference offline.

### Machine Learning

| Parameter | Value |
|-----------|-------|
| Algorithm | Random Forest (CART) |
| Trees | 40 |
| Max Depth | 6 |
| Split Candidates | Max 60 per feature per node (quantile-based) |
| Seed | 42 (deterministic) |
| Split | 80% train / 20% test |
| Target Accuracy | 65–75% |

### Dataset

| Parameter | Value |
|-----------|-------|
| Source | Open-Meteo Historical Weather API |
| Locations | 514 kota/kabupaten Indonesia |
| Period | 5 tahun (configurable via --start/--end) |
| Samples | ~940,000 rows (514 × 365 × 5) |
| Rain Threshold | >5mm precipitation = rain |

### Features (8 total)

| # | Feature | Type | Range | Deskripsi |
|---|---------|------|-------|-----------|
| 0 | `dayOfYear` | int | 1–366 | Hari ke-n dalam tahun |
| 1 | `latitude` | float | -10 to 5 | Lintang kota |
| 2 | `longitude` | float | 95 to 141 | Bujur kota |
| 3 | `elevation` | int | 0–1700 | Ketinggian (meter dpl) |
| 4 | `monsoonZone` | enum | 0/1/2 | 0=Equatorial, 1=Monsoonal, 2=Local |
| 5 | `localSeasonIndex` | enum | 0/1/2 | 0=Kemarau, 1=Transisi, 2=Hujan |
| 6 | `enso` | enum | -1/0/1 | -1=La Nina, 0=Netral, 1=El Nino |
| 7 | `iod` | enum | -1/0/1 | -1=Negatif, 0=Netral, 1=Positif |

**Label:** `rain` — 1 jika presipitasi harian > 5mm, 0 jika tidak.

### Encoding Referensi

**Monsoon Zone:**
- `0` = Equatorial — hujan sepanjang tahun, dua puncak (Mar–May, Sep–Nov). Sumatera, Kalimantan.
- `1` = Monsoonal — musim hujan jelas (Nov–Mar) dan kemarau (May–Sep). Jawa, Bali, NTB, NTT, Sulsel.
- `2` = Local — pola hujan lokal/reversed. Sulawesi (utara/tengah/tenggara), Maluku, Papua.

**Local Season Index:**
- `0` = Kemarau (dry season)
- `1` = Transisi (transition)
- `2` = Hujan (wet season)

Dihitung berdasarkan bulan + monsoon zone kota.

**ENSO (El Nino Southern Oscillation):**
- `-1` = La Nina — cenderung lebih basah di Indonesia
- `0` = Netral
- `1` = El Nino — cenderung lebih kering di Indonesia

**IOD (Indian Ocean Dipole):**
- `-1` = Negatif — lebih basah di barat Indonesia
- `0` = Netral
- `1` = Positif — lebih kering di Indonesia barat

### File Structure

```
src/components/playground/modules/weather/
├── WeatherModule.tsx            # UI component (default export)
├── useLocalWeatherPredictor.ts  # Hook: load model, predict, cache
└── weatherUtils.ts              # Feature vector builder, helpers

src/lib/ml/
├── cities.ts                    # 514 kota Indonesia (koordinat, elevasi, zone)
├── types.ts                     # SerializedModel, PredictionResult
├── randomForest.ts              # RF train/predict/evaluate (dipakai script)
└── prng.ts                      # Deterministic PRNG (Mulberry32)

scripts/local-weather-forecast/
├── dataset-extract.ts           # Fetch Open-Meteo, parallel, resume
├── model-generation.ts          # Train RF, evaluate, export JSON
└── HOW-TO-USE.md                # Cara jalankan scripts

public/ai-models/local-weather-forecast/
└── model.json                   # Pre-trained model (served ke browser)

public/dataset/local-weather-forecast/
└── dataset.json                 # Training data (git-ignored)
```

### UI Components

**Input Panel:**
- Date picker (default: hari ini, bisa pilih tanggal apapun)
- City search (autocomplete, ketik nama kota atau provinsi, max 20 results)
- Advanced Settings (collapsible): ENSO phase dropdown, IOD phase dropdown

**Result Panel (4 states):**
- `idle` — "Select a city and click Predict"
- `loading` — Spinner + "Predicting..."
- `error` — Error message + Retry button
- `success` — Rain/No Rain icon, confidence bar, execution time, features grid

**Info Section (bottom):**
- How to Use box — langkah-langkah pemakaian
- About box — paragraf tentang model, data, dan filosofi

### Inference Flow

```
1. User pilih kota + tanggal + (optional) ENSO/IOD
2. buildFeatureVector() → [dayOfYear, lat, lng, elev, zone, season, enso, iod]
3. predict() → traverse 40 trees, average confidence
4. Return: { prediction: 0|1, confidence: float, executionTime: ms }
```

### Offline Support

- Model (`model.json`) di-fetch sekali saat module pertama kali dimuat
- Disimpan di module-level singleton variable (`cachedModel`)
- Persist across mount/unmount — kembali ke module list lalu load lagi = instant (no re-fetch)
- Browser/SW cache response untuk offline access
- Status offline di-track via localStorage (`module-offline:local-weather-forecast`)
  - Set `true` saat model load sukses
  - Dihapus saat model load gagal (self-healing jika cache stale)
- Badge di playground index: "Offline Ready" (hijau) atau "Not Loaded" (abu-abu)

### Scripts

**Dataset extraction:**
```bash
npx tsx scripts/local-weather-forecast/dataset-extract.ts --start 2021 --end 2025
```
- Parallel fetch (concurrency 5, delay 2s antar batch)
- Resume otomatis dari dataset.json yang sudah ada
- Kota yang gagal di-exclude, jalankan ulang untuk retry

**Model generation:**
```bash
npx tsx scripts/local-weather-forecast/model-generation.ts
```
- Reads dataset.json, trains RF, evaluates, exports model.json
- Deterministic (seed 42) — output identik setiap run dengan data yang sama
- Menampilkan Accuracy, Precision, Recall, F1, dan Confusion Matrix

### Limitasi

- Prediksi bersifat statistik, bukan forecast meteorologi real-time
- Akurasi 65–75% — adequate untuk pattern recognition, tidak untuk keputusan kritis
- ENSO & IOD values simplified (monthly granularity, approximate from NOAA/historical)
- Model tidak mempertimbangkan faktor mikro (topografi detail, urban heat island, proximity to water bodies)
