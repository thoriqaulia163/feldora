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
| Last Updated | 23 June 2026 |
| Model Size | ~417 KB |
| Inference Time | <1ms |
| Offline | Yes (setelah model loaded) |

### Deskripsi

Prediksi hujan per slot waktu (Pagi/Siang/Sore/Malam) untuk 287 kota/kabupaten di Indonesia menggunakan 4 Random Forest independen (satu per slot) yang berjalan sepenuhnya di browser. Setiap slot menghasilkan prediksi binary: Hujan atau Tidak Hujan. Mendukung dua mode prediksi: Standard dan Sensitive.

### Perbedaan dengan V1

| Aspek | V1 | V2 |
|-------|-----|-----|
| Output | 1 prediksi per hari | 4 prediksi (per slot waktu) |
| Klasifikasi | Binary (Rain/No Rain) | Binary per slot (Hujan/Tidak Hujan) |
| Arsitektur | 1 Random Forest (40 trees) | 4 RF independen (30 trees/slot) |
| Data source | Daily precipitation_sum | Hourly weather_code |
| Granularity | Satu hari | 4 slot waktu per hari |
| Features | 8 | 9 (+ prevDayRain) |
| Fitur dinamis | Tidak ada | Cuaca kemarin (user input, binary) |
| Prediction mode | Single | Standard / Sensitive toggle |

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

### Performance

**Standard mode (threshold 0.5):**

| Slot | Accuracy | Macro F1 | Distribusi (Tidak Hujan / Hujan) |
|------|----------|----------|----------------------------------|
| Morning | 78.38% | 52.77% | 77% / 23% |
| Afternoon | 66.49% | 64.00% | 44% / 56% |
| Evening | 64.79% | 63.78% | 48% / 52% |
| Night | 80.27% | 44.58% | 80% / 20% |
| **Average** | **72.48%** | **56.28%** | |

**Sensitive mode (tuned thresholds [0.15, 0.5, 0.5, 0.15]):**

| Slot | Accuracy | Macro F1 | R(Hujan) |
|------|----------|----------|----------|
| Morning | 78.45% | 59.19% | 21.9% |
| Afternoon | 66.50% | 63.85% | 83.4% |
| Evening | 64.61% | 63.44% | 79.0% |
| Night | 80.29% | 47.23% | 2.9% |
| **Average** | **72.46%** | **58.43%** | |

**Perbandingan dengan V1:**

| | V1 | V2 Standard | V2 Sensitive |
|--|-----|-------------|--------------|
| Accuracy | 65.35% | 72.48% | 72.46% |
| Macro F1 | 65.35% | 56.28% | 58.43% |

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
| 8 | `prevDayRain` | binary | 0/1 | Apakah kemarin hujan (user input) |

### Prediction Modes

| Mode | Threshold | Karakteristik |
|------|-----------|---------------|
| **Standard** | 0.5 semua slot | Higher accuracy, konservatif — jarang prediksi hujan kecuali yakin |
| **Sensitive** | Per-slot tuned | Higher F1, lebih sering detect hujan — cocok jika ingin antisipasi payung |

Threshold sensitive di-optimasi dengan sweep 0.15–0.50 pada test set, memilih threshold yang memaksimalkan Macro F1 per slot.

### Keputusan Arsitektur

**Kenapa 4 forest independen, bukan 1 multi-output model?**

Multi-output RF (1 model, 4 output) diuji dan gagal:
- Combined Gini averaging antar slot mendilusi sinyal
- Class imbalance berbeda per slot — tidak bisa di-balance bersamaan
- Hasil: hanya prediksi majority class (Macro F1 ~21%)

**Kenapa binary (bukan 4-5 kelas)?**

4-class multiclass (Cerah/Berawan/Gerimis/Hujan) diuji dan gagal:
- Dengan hanya fitur klimatologi, model tidak bisa membedakan Cerah vs Berawan
- Macro F1 hanya 27-35% meskipun berbagai strategi balancing dicoba
- Binary terbukti achievable dan actionable: "perlu payung atau tidak?"

**Kenapa prevDayRain binary (bukan multi-value 0-4)?**

Multi-value (jumlah slot kemarin yang hujan) diuji dan hanya +3% improvement atas binary. Trade-off:
- Multi-value ambiguous (hujan 2 slot beruntun vs terpisah tidak bisa dibedakan)
- UX lebih kompleks (user harus ingat berapa slot)
- Binary sederhana dan menangkap sinyal utama: weather persistence

### File Structure

```
src/components/playground/modules/weather-v2/
├── WeatherModuleV2.tsx              # UI component + Standard/Sensitive toggle
├── useLocalWeatherPredictorV2.ts    # Hook: load model, predict(tuned?), cache
└── weatherUtilsV2.ts               # Feature vector builder, time slots, display config

src/lib/ml/
├── typesV2.ts                       # SerializedModelV2, PredictionResultV2, SlotForest
├── randomForestV2.ts                # Per-slot RF predict with threshold support
├── cities.ts                        # 287 kota Indonesia (shared)
└── prng.ts                          # Deterministic PRNG (shared)

scripts/local-weather-forecast-v2/
├── dataset-extract.ts               # Fetch Open-Meteo hourly, aggregate + prevDay
├── model-generation-parallel.ts     # Train 4 forests in parallel (worker_threads)
├── threshold-tune.ts                # Sweep thresholds, update model.json
└── HOW-TO-USE.md

public/ai-models/local-weather-forecast-v2/model.json
public/dataset/local-weather-forecast-v2/dataset.json (git-ignored)
```

### UI Components

**Input Panel:**
- Date picker (default: hari ini)
- City search (autocomplete 287 kota)
- Cuaca Kemarin dropdown (Tidak hujan / Hujan) + helper text
- Advanced Settings (collapsible): ENSO phase dropdown, IOD phase dropdown
- Predict button
- Mode toggle: Standard / Sensitive

**Result Panel (1 card, 4 baris):**
- 4 baris slot waktu (Pagi/Siang/Sore/Malam)
- Masing-masing: icon + label (Hujan/Tidak Hujan) + confidence bar
- Slot hujan di-highlight biru
- Execution time di bawah

**Info Section (bottom):**
- How to Use box
- About box (fitur, mode explanation, perbandingan V1) + Disclaimer

### Inference Flow

```
1. User pilih kota + tanggal + cuaca kemarin + mode + (optional) ENSO/IOD
2. buildFeatureVector() → [dayOfYear, lat, lng, elev, zone, season, enso, iod, prevDayRain]
3. predictV2(model, features, tuned) → traverse 4 forests, apply threshold per slot
4. Return: { morning, afternoon, evening, night } × { category, confidence }
```

### Limitasi

- Morning/Night cenderung under-predict hujan (distribusi 77-80% tidak hujan)
- Sensitive mode membantu tapi recall Hujan tetap rendah untuk Night (2.9%)
- Afternoon/Evening paling reliable karena distribusi data seimbang
- ENSO & IOD simplified (monthly granularity)
- prevDayRain bergantung pada input user (subjektif)

---

## Local Weather Forecast V2.5

| Field | Value |
|-------|-------|
| ID | `local-weather-forecast-v2-5` |
| Label | AI |
| Last Updated | 23 June 2026 |
| Model Size | ~320 KB |
| Inference Time | <1ms |
| Offline | Yes (setelah model loaded) |

### Deskripsi

Prediksi hujan per slot waktu (Pagi/Siang/Sore/Malam) menggunakan Gradient Boosted Trees (GBT) dengan computed climate features. Menghasilkan probability yang lebih calibrated dibanding V2 RF, memungkinkan threshold tuning yang lebih efektif — terutama untuk slot Night yang sulit.

### Perbedaan dengan V2

| Aspek | V2 | V2.5 |
|-------|-----|-----|
| Algorithm | Random Forest | Gradient Boosted Trees |
| Trees per slot | 30 × depth 6 | 100 × depth 4 |
| Features | 9 | 12 (+ sinDay, cosDay, dayLength) |
| Probability calibration | Moderate (vote proportions) | Better (sigmoid of cumulative scores) |
| Threshold tuning impact | +2% F1 | +8.5% F1 |
| Night F1 (tuned) | 47.23% | 60.1% |
| Model size | ~417 KB | ~320 KB |

### Machine Learning

| Parameter | Value |
|-----------|-------|
| Algorithm | 4 × Independent Gradient Boosted Trees |
| Trees per slot | 100 |
| Total trees | 400 |
| Max Depth | 4 (shallow weak learners) |
| Learning Rate | 0.1 |
| Loss | Binary log-loss (logistic) |
| Seed | 42 (deterministic, +offset per slot) |
| Split | 80% train / 20% test (random) |

### Performance

**Standard mode (threshold 0.5):**

| Slot | Accuracy | Macro F1 |
|------|----------|----------|
| Morning | 77.9% | 45.7% |
| Afternoon | 66.7% | 63.8% |
| Evening | 64.9% | 64.1% |
| Night | 80.3% | 44.5% |
| **Average** | **72.46%** | **54.56%** |

**Sensitive mode (tuned thresholds [0.3, 0.55, 0.5, 0.25]):**

| Slot | Accuracy | Macro F1 | R(Hujan) |
|------|----------|----------|----------|
| Morning | 76.8% | 63.0% | 35.4% |
| Afternoon | 66.5% | 65.3% | 76.3% |
| Evening | 64.9% | 64.1% | 79.0% |
| Night | 75.1% | 60.1% | 35.0% |
| **Average** | **70.8%** | **63.1%** | |

**Perbandingan semua versi (tuned):**

| | V1 | V2 Sensitive | V2.5 Sensitive |
|--|-----|--------------|--------------|
| Accuracy | 65.35% | 72.46% | 70.8% |
| Macro F1 | 65.35% | 58.43% | **63.1%** |
| Night F1 | — | 47.23% | **60.1%** |

### Dataset

Sama dengan V2 (copy):
- 524,000 samples, 287 kota, 5 tahun
- Label mapping: Cerah+Berawan → 0, Gerimis+Hujan → 1
- prevDayRainSlots di-convert ke binary (≥1 → 1)

### Features (12 total)

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
| 8 | `prevDayRain` | binary | 0/1 | Apakah kemarin hujan |
| 9 | `sinDay` | float | -1 to 1 | sin(2π × dayOfYear / 365) — circular encoding |
| 10 | `cosDay` | float | -1 to 1 | cos(2π × dayOfYear / 365) — circular encoding |
| 11 | `dayLength` | float | ~11–13 | Jam cahaya matahari (dari lat + dayOfYear) |

Computed features (9-11) dihitung otomatis tanpa input user tambahan.

### Prediction Modes

| Mode | Threshold | Karakteristik |
|------|-----------|---------------|
| **Standard** | 0.5 semua slot | Higher accuracy (~72%), konservatif |
| **Sensitive** | Per-slot tuned | Higher F1 (~63%), jauh lebih baik detect hujan Night (+13% F1 vs V2) |

GBT menghasilkan probability lebih calibrated (tersebar merata 0-1) dibanding RF (cluster di dekat 0 atau 1). Ini membuat threshold tuning jauh lebih efektif — terutama terlihat di Night slot.

### File Structure

```
src/components/playground/modules/weather-v2-5/
├── WeatherModuleV3.tsx              # UI component + Standard/Sensitive toggle
├── useLocalWeatherPredictorV3.ts    # Hook: load model, predict(tuned?), cache
└── weatherUtilsV3.ts               # Feature vector + computed features

src/lib/ml/
└── gbt-local-weather-forecast-v2-5.ts # GBT types + prediction runtime

scripts/local-weather-forecast-v2-5/
├── model-generation.ts              # Train GBT parallel (worker_threads)
├── threshold-tune.ts                # Sweep thresholds, update model.json
└── HOW-TO-USE.md

public/ai-models/local-weather-forecast-v2-5/model.json
public/dataset/local-weather-forecast-v2-5/dataset.json (copy dari V2, git-ignored)
```

### UI Components

**Input Panel (sama dengan V2):**
- Date picker
- City search (autocomplete 287 kota)
- Cuaca Kemarin (Tidak hujan / Hujan)
- Advanced Settings: ENSO + IOD
- Predict button
- Mode toggle: Standard / Sensitive

**Result Panel (sama dengan V2):**
- 1 card, 4 baris slot (Pagi/Siang/Sore/Malam)
- Icon + label + confidence bar per slot
- Execution time

### GBT Architecture

```
Per slot:
  score = baseScore + lr × (tree_1 + tree_2 + ... + tree_100)
  probability = sigmoid(score)
  prediction = probability >= threshold ? "Hujan" : "Tidak Hujan"

  baseScore = log(positive_rate / (1 - positive_rate))
  Each tree: regression tree on residuals (actual - predicted_probability)
  Shallow trees (depth 4) = weak learners that progressively correct errors
```

### Limitasi

- Sama seperti V2: fitur klimatologi statis tidak bisa menangkap variasi cuaca harian
- Night slot masih challenging (distribusi 80/20) tapi jauh lebih baik dari V2
- Computed features (sin/cos, dayLength) memberikan improvement minimal — kunci performa V2.5 ada di probability calibration GBT
- Training time ~9 min (parallel), RAM ~3-4 GB
- prevDayRain bergantung pada input user (subjektif)

---

## Split Bill

| Field | Value |
|-------|-------|
| ID | `split-bill` |
| Label | Tool |
| Last Updated | 23 June 2026 |
| Download Size | ~0 KB (no model) |
| Offline | Yes (IndexedDB + Web Crypto) |

### Description

Offline bill splitting tool with encrypted local storage. Supports 3 split modes: Equal, Custom, and Itemized. Data encrypted with AES-GCM (DEK + KEK architecture). Optional PIN protection.

### Features

- **Fully offline** — All data in IndexedDB, no server dependency
- **Encrypted** — AES-GCM encryption prevents casual reading of stored data
- **3 split modes** — Equal (total ÷ people), Custom (manual per-person), Itemized (pay for own items)
- **Global participants** — Reusable people list shared across bills
- **PIN protection** — Optional toggle, re-wraps DEK without re-encrypting bills
- **Payment tracking** — Simple paid/unpaid toggle per participant

### Split Modes

| Mode | How it works |
|------|-------------|
| **Equal** | Total of all items ÷ number of people = each person pays |
| **Custom** | User manually sets how much each person pays (must equal total) |
| **Itemized** | Each person pays the sum of their own items |

### Data Model

Each participant in a bill owns items (name + price). The bill total is auto-computed from all items.

**Storage encryption:**

| Field | Encrypted? | Decrypt when |
|-------|-----------|--------------|
| Participant `name` | Yes | Home page load (all, cached in memory) |
| Bill `title` | Yes | Home page load (all, cached in memory) |
| Bill `payload` (items, payments, splitMode) | Yes | Detail page open (single, on-demand) |
| Bill metadata (`createdAt`, `updatedAt`, `status`) | No | Never (already raw) |
| Participant `id` | No | Never |

```
IndexedDB schema:
  participants: { id (plain), encryptedName, createdAt }
  splitBills: { id, encryptedTitle, encryptedPayload, createdAt, updatedAt, status }
  settings: { key, value }
```

### Encryption (DEK + KEK)

```
Mode A (no PIN): VITE_SPLIT_BILL_KEK env → PBKDF2 → KEK → decrypt DEK → decrypt data
Mode B (PIN):    user PIN → PBKDF2 → KEK → decrypt DEK → decrypt data
```

PIN toggle only re-wraps the DEK — encrypted data is never re-encrypted.

If the encryption key (env var) changes, existing data cannot be decrypted. A "Reset All Data" option is provided to start fresh with the new key.

### UI Details

**Bill Detail page (`/detail/:id`):**
- Meta cards grid (2x2): Total Bill (green), Method (purple), People (orange), Status (green/amber based on completion)
- Each card has icon + label + value with colored background
- Per-participant rows: person icon avatar (green if paid, purple if unpaid), name, amount, payment toggle
- Paid rows have green tint background + strikethrough amount
- Item list with tag icons indented under each person

**Create/Edit form:**
- Person icon avatar next to each participant name in the items section
- Searchable dropdown for adding people ("+Add" always first option)

### Routing

| Route | Page |
|-------|------|
| `/playground/split-bill` | Home — people list + bills list |
| `/playground/split-bill/create` | Create new bill |
| `/playground/split-bill/detail/:id` | Bill detail + payment toggles |
| `/playground/split-bill/edit/:id` | Edit bill (resets payments) |

### File Structure

```
src/components/playground/modules/split-bill/
├── CryptoProvider.tsx       # DEK context shared across routes
├── types.ts                 # BillPayload, BillParticipant, BillItem, etc.
├── splitCalculator.ts       # Equal/Custom/Itemized compute logic
├── validation.ts            # Form validation + error collection
├── db/
│   ├── schema.ts            # IndexedDB schema (idb)
│   ├── database.ts          # openDB singleton
│   ├── services.ts          # CRUD: participants, bills, settings
│   └── index.ts             # Barrel
├── hooks/
│   ├── useCrypto.ts         # DEK init/unlock, PIN toggle
│   ├── useParticipants.ts   # Global people CRUD
│   ├── useBillData.ts       # Bill list + detail + payment toggle
│   ├── useSplitForm.ts      # Create/edit form state
│   └── index.ts
├── components/
│   ├── Modals.tsx           # ParticipantModal + DeleteConfirmModal
│   ├── Placeholders.tsx     # Skeletons + EmptyState
│   ├── ParticipantList.tsx  # Scrollable people list
│   ├── BillCard.tsx         # Bill list item
│   ├── BillForm.tsx         # Create/edit form + ParticipantSearch
│   ├── BillBreakdown.tsx    # Detail view + payment toggles
│   ├── SplitModeSelector.tsx
│   ├── PaymentToggle.tsx
│   ├── PinGate.tsx          # Lock screen
│   ├── PinSetup.tsx         # PIN toggle UI
│   └── index.ts
├── pages/
│   ├── HomePage.tsx
│   ├── CreatePage.tsx
│   ├── DetailPage.tsx
│   └── EditPage.tsx

src/lib/crypto/              # Reusable encryption layer
├── aes.ts, kek.ts, dek.ts, types.ts, index.ts
```

### Environment Variable

```
VITE_SPLIT_BILL_KEK="your-passphrase-here"
```

Module is **disabled** if this env var is not set.

### QR Sharing

Bills can be shared via QR code between users with the same encryption key.

**Share flow (Detail page):**
1. Click Share button (share + QR icon) → ShareModal opens
2. QR code generated from encrypted + compressed bill data
3. Options: Share via Web Share API, or Download as PNG

**Import flow (Home page):**
1. Click "QR" button next to search → ImportQRModal opens
2. Choose: Scan with Camera (live video) or Import from Image (file picker)
3. QR decoded successfully → **Confirm step**: modal shows "Add this bill?" with editable title input
4. User can modify title (content stays same) → click Save
5. Bill created → navigate to detail page

**Technical details:**
- Encode: JSON → AES-GCM encrypt (shared QR key) → pako deflate → base64 → QR image
- Decode: QR string → base64 → pako inflate → AES-GCM decrypt (shared QR key) → JSON
- **QR key** is derived from `VITE_SPLIT_BILL_KEK` + fixed salt — NOT from DEK or PIN. This ensures all devices with the same env var can decrypt regardless of PIN state.
- Max QR capacity: ~2,900 bytes compressed. Bills exceeding this show error.
- Libraries: `qrcode` (generate), `jsqr` (read/scan), `pako` (compress/decompress)
- QR prefix: `FDSB:` (Feldora Split Bill marker for validation)
- Import QR button always visible (even when bill list is empty)

**Files:**
```
src/components/playground/modules/split-bill/
├── qr.ts                        # Encode/decode utilities
├── components/ShareModal.tsx    # QR display + share + download
├── components/ImportQRModal.tsx # Camera scan + file import + confirm step
```

### Limitations

- Not security-grade — prevents casual reading of IndexedDB, not a secure vault
- QR sharing requires same VITE_SPLIT_BILL_KEK on both devices
- Large bills (10+ people × 15+ items) may exceed QR capacity (~2,900 bytes compressed)
- No export/import for bulk data (only single bill via QR)
- No partial payments (only paid/unpaid)
- Clearing browser data = all bills lost (no cloud backup)

---

## Tic Tac Toe

| Field | Value |
|-------|-------|
| ID | `tic-tac-toe` |
| Label | Game |
| Last Updated | 30 June 2026 |
| Download Size | < 10 KB |
| Offline | Yes (no assets to load) |

### Deskripsi

Classic 3×3 strategy game dengan dua mode permainan. **PvP** memungkinkan dua pemain bergantian pada satu device. **PvC** memungkinkan pemain (X) melawan bot (O) dengan tiga tingkat kesulitan: Easy, Medium, dan Hard.

### Game Modes

| Mode | Deskripsi |
|------|-----------|
| **PvP** (Player vs Player) | Dua pemain bergantian secara manual di device yang sama. X selalu jalan pertama. |
| **PvC** (Player vs Computer) | Pemain selalu bermain sebagai X, bot bermain sebagai O. Bot merespons otomatis dengan delay 400ms untuk kesan natural. |

### Bot Difficulty Levels

| Level | Algoritma | Karakteristik |
|-------|-----------|---------------|
| **Easy** | Random | Pilih sel kosong secara acak. Bisa dikalahkan dengan mudah. |
| **Medium** | Win → Block → Random | Menang jika bisa, blok kemenangan lawan jika perlu, selain itu acak. |
| **Hard** | Minimax | Optimal sempurna — tidak pernah kalah. Selalu menang atau seri. Pusat dipilih pertama untuk efisiensi. |

### Minimax Implementation

Bot Hard menggunakan algoritma Minimax lengkap (tanpa alpha-beta pruning, board 3×3 sehingga tidak diperlukan):

```
minimax(board, isMaximizing, bot, human):
  if winner == bot  → return +10
  if winner == human → return -10
  if board full     → return  0

  if maximizing: return max score for each empty cell (bot plays)
  if minimizing: return min score for each empty cell (human plays)
```

Optimasi opening: pusat (index 4) selalu diambil saat board kosong. Sudut acak diambil jika pusat sudah terisi. Ini mengurangi kedalaman rekursi pada 2 langkah pertama.

### Confirm Modal Behavior

Modal konfirmasi muncul saat ada aksi yang akan mereset game yang sedang berjalan (`moveCount > 0` AND `status === 'playing'`):

| Aksi | Kapan Modal Muncul | Kapan Langsung Dieksekusi |
|------|-------------------|--------------------------|
| Reset Game | Game in progress | Game idle atau sudah selesai |
| Ganti Mode (PvP ↔ PvC) | Game in progress | Mode sama / game idle / sudah selesai |
| Ganti Bot Level | Game in progress | Level sama / game idle / sudah selesai |

### Simbol & Warna

| Simbol | Pemain | Warna | Tailwind |
|--------|--------|-------|---------|
| `X` | Player 1 / Human | Ungu | `text-feldora-accent` |
| `O` | Player 2 / Bot | Orange | `text-feldora-accent-secondary` |

Sel yang menjadi bagian dari kombinasi menang mendapat: `bg-{color}/10`, `border-{color}/60`, `scale-105`, dan `drop-shadow` berwarna (`glow`).

### Status Bar States

| Kondisi | Tampilan |
|---------|---------|
| `idle` | "Click a cell to start" |
| `playing` (giliran X, PvP) | "X — Player X's turn" |
| `playing` (giliran X, PvC) | "X — Your turn" |
| `playing` (giliran O, PvC, bot thinking) | Spinner + "Bot thinking..." |
| `won` (X, PvP) | "Player X Wins! — X takes it" |
| `won` (X, PvC) | "You Win! — X takes it" |
| `won` (O, PvC) | "Bot Wins! — O takes it" |
| `draw` | "It's a Draw" |

### File Structure

```
src/components/playground/modules/tic-tac-toe/
├── types.ts              # Player, Cell, Board, GameMode, BotLevel, GameStatus, WIN_LINES, GameState
├── botEngine.ts          # getBotMove(board, bot, human, level), checkWinner(board)
├── useGameState.ts       # Full game state hook (board, status, actions, botThinking)
├── GameBoard.tsx         # 3×3 grid — winning cells highlighted, corner-cut cell 8
├── ConfirmModal.tsx      # Reusable confirm modal (amber warning icon, cancel + confirm)
└── TicTacToeModule.tsx   # Main module — SegmentedControl, StatusBar, board, reset button

src/routes/
└── playground.tic-tac-toe.tsx   # Route file (lazy Suspense)
```

### State Management

`useGameState` hook memiliki semua state dan logic permainan:

```typescript
// State
board: Board           // 9-cell tuple
currentPlayer: Player  // 'X' | 'O'
status: GameStatus     // 'idle' | 'playing' | 'won' | 'draw'
winner: Player | null
winLine: [number, number, number] | null
gameMode: GameMode     // 'pvp' | 'pvc'
botLevel: BotLevel     // 'easy' | 'medium' | 'hard'
moveCount: number      // untuk deteksi "in progress"
botThinking: boolean   // untuk spinner state

// Actions
makeMove(index)    // klik sel (blocked di O's turn saat PvC)
resetGame()        // reset ke board kosong, pertahankan mode & level
setGameMode(mode)  // ganti mode + reset
setBotLevel(level) // ganti level + reset
```

Bot turn di-trigger via `useEffect` yang watch `currentPlayer + status + gameMode`. Delay 400ms via `setTimeout` untuk kesan natural. Double-check status sebelum eksekusi (race condition safe).

### UI Layout

```
[◆ TIC TAC TOE]

Controls (kiri / atas mobile)     Board area (kanan / bawah mobile)
─────────────────────────────    ─────────────────────────────────
[PvP]  [PvC]                     ┌───┬───┬───┐
Bot: [Easy] [Med] [Hard]         │ X │   │ O │
                                 ├───┼───┼───┤
X — You  |  O — Bot              │   │ X │   │
                                 ├───┼───┼───┤
[How to Play box]                │ O │   │ X │
                                 └───┴───┴───┘
                                 [Status: X Wins!]
                                 [RESET GAME]
```

Layout responsif: desktop = 2 kolom (`lg:grid-cols-[1fr_auto]`), mobile = stacked vertikal. How to Play box: visible di desktop di dalam kolom kiri, visible di mobile di bawah setelah board.

### Limitasi

- Tidak ada animasi transisi antar sel (fade-in saat X/O muncul)
- Tidak ada score tracking / win counter antar ronde
- Tidak ada mode "Bot goes first"
- Hard mode 100% optimal — tidak ada variasi/randomness, selalu main sempurna
