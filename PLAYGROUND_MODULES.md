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

Prediksi hujan (>5mm) untuk 287 kota/kabupaten di Indonesia menggunakan Random Forest yang berjalan sepenuhnya di browser. Tidak ada API call saat prediksi — model di-load sekali, lalu semua inference offline.

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
| Locations | 287 kota/kabupaten Indonesia |
| Period | 5 tahun (configurable via --start/--end) |
| Samples | ~524,000 rows (287 × 365 × 5) |
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
├── cities.ts                    # 287 kota Indonesia (koordinat, elevasi, zone)
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
- About box — paragraf tentang model, data, dan filosofi + Disclaimer

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


---

## Local Weather Forecast V2

| Field | Value |
|-------|-------|
| ID | `local-weather-forecast-v2` |
| Label | AI |
| Last Updated | 22 June 2026 |
| Model Size | ~417 KB |
| Inference Time | <1ms |
| Offline | Yes (setelah model loaded) |

### Deskripsi

Prediksi hujan per slot waktu (Pagi/Siang/Sore/Malam) untuk 287 kota/kabupaten di Indonesia menggunakan 4 Random Forest independen (satu per slot) yang berjalan sepenuhnya di browser. Setiap slot menghasilkan prediksi binary: Hujan atau Tidak Hujan.

### Perbedaan dengan V1

| Aspek | V1 | V2 |
|-------|-----|-----|
| Output | 1 prediksi per hari | 4 prediksi (per slot waktu) |
| Klasifikasi | Binary (Rain/No Rain) | Binary per slot (Hujan/Tidak Hujan) |
| Arsitektur | 1 Random Forest (40 trees) | 4 RF independen (30 trees/slot) |
| Data source | Daily precipitation_sum | Hourly weather_code |
| Granularity | Satu hari | 4 slot waktu per hari |
| Features | 8 | 9 (+ prevDayRainSlots) |
| Fitur dinamis | Tidak ada | Cuaca kemarin (user input) |

### Machine Learning

| Parameter | Value |
|-----------|-------|
| Algorithm | 4 × Independent Random Forest (CART) |
| Trees per slot | 30 |
| Total trees | 120 |
| Max Depth | 6 |
| Split Candidates | Max 60 per feature per node (quantile-based) |
| Bootstrap | Standard (same size, with replacement) |
| Seed | 42 (deterministic, +offset per slot) |
| Split | 80% train / 20% test (random) |
| Accuracy | 73.25% average |
| Macro F1 | 59.05% average |

### Per-Slot Performance

| Slot | Accuracy | Macro F1 | Distribusi (Tidak Hujan / Hujan) |
|------|----------|----------|----------------------------------|
| Morning | 79.87% | 59.32% | 77% / 23% |
| Afternoon | 67.35% | 64.96% | 44% / 56% |
| Evening | 65.27% | 64.69% | 48% / 52% |
| Night | 80.50% | 47.22% | 80% / 20% |

### Dataset

| Parameter | Value |
|-----------|-------|
| Source | Open-Meteo Historical Weather API (hourly) |
| Data Field | `weather_code` (WMO code) |
| Locations | 287 kota/kabupaten Indonesia (seluruh 38 provinsi) |
| Period | 5 tahun (2021–2025) |
| Samples | ~524,000 rows (287 × ~1826 hari) |
| Aggregation | Majority vote per time slot |
| Label mapping | Cerah+Berawan → 0 (Tidak Hujan), Gerimis+Hujan+Badai → 1 (Hujan) |

### Rentang Waktu

| Slot | Label | Jam |
|------|-------|-----|
| 0 | Pagi | 05:00 – 10:59 |
| 1 | Siang | 11:00 – 14:59 |
| 2 | Sore | 15:00 – 17:59 |
| 3 | Malam | 18:00 – 04:59 |

Catatan: 00:00–04:59 dianggap sebagai bagian malam hari sebelumnya.

### Features (9 total)

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
| 8 | `prevDayRainSlots` | int | 0–4 | Jumlah slot waktu kemarin yang hujan (user input) |

### Keputusan Arsitektur

**Kenapa 4 forest independen, bukan 1 multi-output model?**

Multi-output RF (1 model, 4 output) diuji lebih dulu dan gagal:
- Combined Gini averaging antar slot mendilusi sinyal
- Class imbalance berbeda per slot — tidak bisa di-balance bersamaan
- Hasil: hanya prediksi majority class (Macro F1 ~21%)

4 forest independen memungkinkan:
- Tiap slot di-training optimal untuk distribusinya sendiri
- Tidak ada interferensi antar slot
- Tetap 1 file model, 1 inference call, <1ms

**Kenapa binary (bukan 4-5 kelas)?**

4-class multiclass (Cerah/Berawan/Gerimis/Hujan) diuji dan gagal:
- Dengan hanya fitur klimatologi, model tidak bisa membedakan Cerah vs Berawan (terlalu mirip)
- Macro F1 hanya 27-35% meskipun berbagai strategi balancing dicoba
- Binary (Hujan/Tidak Hujan) terbukti achievable dan actionable: "perlu payung atau tidak?"

**Kenapa prevDayRainSlots?**

Weather persistence (cuaca hari ini berkorelasi kuat dengan kemarin) adalah fitur paling impactful yang bisa ditambahkan secara offline. Menambahkan fitur ini meningkatkan accuracy dari baseline dan memberikan dimensi temporal yang tidak dimiliki fitur klimatologi statis.

### File Structure

```
src/components/playground/modules/weather-v2/
├── WeatherModuleV2.tsx              # UI component (default export)
├── useLocalWeatherPredictorV2.ts    # Hook: load model, predict, cache
└── weatherUtilsV2.ts               # Feature vector builder, time slots, display config

src/lib/ml/
├── typesV2.ts                       # SerializedModelV2, PredictionResultV2, SlotForest
├── randomForestV2.ts                # Per-slot RF predict (browser runtime)
├── cities.ts                        # 287 kota Indonesia (shared with V1)
└── prng.ts                          # Deterministic PRNG (shared with V1)

scripts/local-weather-forecast-v2/
├── dataset-extract.ts               # Fetch Open-Meteo hourly, aggregate + prevDay
├── model-generation.ts              # Train 4 independent forests (sequential)
├── model-generation-parallel.ts     # Train 4 forests in parallel (worker_threads)
└── HOW-TO-USE.md                    # Cara jalankan scripts

public/ai-models/local-weather-forecast-v2/
└── model.json                       # Pre-trained model (served ke browser)

public/dataset/local-weather-forecast-v2/
└── dataset.json                     # Training data (git-ignored)
```

### UI Components

**Input Panel:**
- Date picker (default: hari ini)
- City search (autocomplete 287 kota)
- Cuaca Kemarin dropdown (0-4 slot hujan kemarin, dengan keterangan rentang waktu)
- Advanced Settings (collapsible): ENSO phase dropdown, IOD phase dropdown

**Result Panel (1 card, 4 baris):**
- `idle` — "Select a city and click Predict"
- `loading` — Spinner + "Predicting..."
- `error` — Error message + Retry button
- `success` — 4 baris slot waktu (Pagi/Siang/Sore/Malam) masing-masing: icon + label (Hujan/Tidak Hujan) + confidence bar, slot hujan di-highlight biru. Execution time di bawah.

**Info Section (bottom):**
- How to Use box (termasuk penjelasan slot waktu)
- About box + Disclaimer

### Inference Flow

```
1. User pilih kota + tanggal + cuaca kemarin + (optional) ENSO/IOD
2. buildFeatureVector() → [dayOfYear, lat, lng, elev, zone, season, enso, iod, prevDayRainSlots]
3. predictV2() → traverse 4 forests (30 trees each), majority vote per slot
4. Return: { morning, afternoon, evening, night } masing-masing { category, confidence }
```

### Architecture

```
                    ┌── Forest Morning (30 trees) ──→ Hujan/Tidak Hujan
                    │
  features[9] ───→ ├── Forest Afternoon (30 trees) ─→ Hujan/Tidak Hujan
                    │
                    ├── Forest Evening (30 trees) ──→ Hujan/Tidak Hujan
                    │
                    └── Forest Night (30 trees) ────→ Hujan/Tidak Hujan

  Per forest:
    - Standard bootstrap (with replacement, same size as training)
    - Binary Gini impurity
    - Leaf stores: prediction (0 or 1) + confidence

  Aggregation per slot:
    - Majority vote across 30 trees
    - Confidence = proportion of trees voting for winning class
```

### Offline Support

- Model (`model.json`) di-fetch sekali saat module pertama kali dimuat
- Disimpan di module-level singleton variable (`cachedModel`)
- Persist across mount/unmount
- Browser/SW cache response untuk offline access
- Badge di playground index: "Offline Ready" (hijau) atau "Not Loaded" (abu-abu)

### Scripts

**Dataset extraction:**
```bash
npx tsx scripts/local-weather-forecast-v2/dataset-extract.ts --start 2021 --end 2025
```
- Fetch hourly weather_code, mulai 1 hari lebih awal untuk prevDay
- Agregasi ke 4 slot waktu menggunakan majority vote
- Hitung prevDayRainSlots inline
- Resume otomatis, parallel (concurrency 5)

**Model generation (parallel, recommended):**
```bash
npx tsx scripts/local-weather-forecast-v2/model-generation-parallel.ts
```
- 4 worker threads, 1 per slot
- Training time ~12 min (wall-clock)
- RAM usage ~3-4 GB

**Model generation (sequential, lower RAM):**
```bash
npx tsx scripts/local-weather-forecast-v2/model-generation.ts
```
- Training time ~40 min
- RAM usage ~1 GB

### Limitasi

- Prediksi bersifat statistik berbasis pola klimatologi, bukan forecast meteorologi real-time
- Accuracy 73% average — adequate untuk pattern recognition, tidak untuk keputusan kritis
- Morning/Night cenderung under-predict hujan (distribusi imbalanced: 77-80% tidak hujan)
- Afternoon/Evening lebih seimbang dan akurat
- ENSO & IOD simplified (monthly granularity)
- Tidak mempertimbangkan data atmosfer dinamis (suhu, kelembapan, tekanan, angin)
- prevDayRainSlots bergantung pada input user (subjektif)
