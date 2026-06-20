# Local Weather Forecast — Scripts

Scripts untuk mengekstrak dataset dan melatih model Random Forest prediksi cuaca Indonesia.

## Prerequisites

```bash
npm install -D tsx
```

> `tsx` sudah termasuk jika kamu menggunakan Node 18+ dengan `npx`.

## 1. Extract Dataset

Mengambil data cuaca historis dari [Open-Meteo](https://open-meteo.com/) untuk 500+ kota/kabupaten Indonesia secara parallel (concurrency 10).

```bash
npx tsx scripts/local-weather-forecast/dataset-extract.ts --start 2021 --end 2025
```

**Parameter:**
| Flag | Deskripsi | Default |
|------|-----------|---------|
| `--start` | Tahun awal data | 2021 |
| `--end` | Tahun akhir data | 2025 |

**Output:** `public/dataset/local-weather-forecast/dataset.json`

**Fitur script:**
- Parallel fetching (concurrency 10) — ~5-8 menit untuk 500+ kota × 5 tahun
- Retry otomatis (3x per kota) jika request gagal
- Resume — lihat penjelasan di bawah
- Progress logging ke terminal
- Kota yang gagal di-exclude dari dataset (tidak ada data kosong)

### Resume (Jika Ada Kota yang Gagal)

Saat extraction berjalan, Open-Meteo API kadang throttle/timeout beberapa request — terutama di batch yang padat. Kota yang gagal tidak akan masuk dataset.

**Untuk melanjutkan kota yang gagal, cukup jalankan perintah yang sama:**

```bash
npx tsx scripts/local-weather-forecast/dataset-extract.ts --start 2021 --end 2025
```

Script menyimpan progress di `scripts/local-weather-forecast/dataset-progress.json`. Saat dijalankan ulang:
1. Membaca progress file
2. Melihat kota mana yang sudah berhasil
3. Hanya fetch kota yang belum berhasil
4. Menambahkan hasilnya ke dataset yang sudah ada

Proses ini bisa diulang sampai semua kota berhasil. File progress otomatis dihapus setelah semua kota selesai.

**Contoh:**
```
Run 1: 493/514 berhasil (21 gagal karena throttle)
Run 2: 21 kota sisanya di-fetch → semua selesai → progress file dihapus
```

**Jika ingin mulai dari awal (fresh extract):**
```bash
rm public/dataset/local-weather-forecast/dataset.json
rm scripts/local-weather-forecast/dataset-progress.json
npx tsx scripts/local-weather-forecast/dataset-extract.ts --start 2021 --end 2025
```

## 2. Generate Model

Melatih Random Forest dan menghasilkan model JSON siap pakai.

```bash
npx tsx scripts/local-weather-forecast/model-generation.ts
```

**Input:** `public/dataset/local-weather-forecast/dataset.json`
**Output:** `public/ai-models/local-weather-forecast/model.json`

**Konfigurasi model:**
- Algorithm: Random Forest
- Trees: 40
- Max Depth: 6
- Seed: 42 (deterministic & reproducible)
- Split: 80% train / 20% test

**Output evaluasi:** Accuracy, Precision, Recall, F1 Score, dan Confusion Matrix ditampilkan di terminal.

## 3. Full Pipeline

Jalankan kedua script secara berurutan:

```bash
# Step 1: Extract data (jalankan ulang jika ada yang gagal)
npx tsx scripts/local-weather-forecast/dataset-extract.ts --start 2021 --end 2025

# Step 2: Train & export model
npx tsx scripts/local-weather-forecast/model-generation.ts
```

Setelah selesai, `public/ai-models/local-weather-forecast/model.json` siap digunakan oleh module Local Weather Forecast di `/playground`.

## Dataset Features

| Feature | Tipe | Deskripsi |
|---------|------|-----------|
| `dayOfYear` | 1-366 | Hari ke-n dalam tahun |
| `latitude` | float | Lintang kota |
| `longitude` | float | Bujur kota |
| `elevation` | int | Ketinggian (meter) |
| `monsoonZone` | 0/1/2 | 0=Equatorial, 1=Monsoonal, 2=Local |
| `localSeasonIndex` | 0/1/2 | 0=Kemarau, 1=Transisi, 2=Hujan |
| `enso` | -1/0/1 | -1=La Nina, 0=Netral, 1=El Nino |
| `iod` | -1/0/1 | -1=Negatif, 0=Netral, 1=Positif |

**Label:** `rain` — 1 jika presipitasi > 5mm, 0 jika tidak.

## Catatan

- Dataset extraction membutuhkan koneksi internet (fetch ke Open-Meteo API)
- Model generation berjalan offline (hanya baca dataset.json)
- Model output (~400-500 KB) disimpan di `public/ai-models/local-weather-forecast/` dan di-serve sebagai static asset
- `public/dataset/` di-exclude dari git (lihat .gitignore) — tidak ikut deploy
- Prediksi di browser sepenuhnya offline setelah model dimuat
- Daftar kota ada di `src/lib/ml/cities.ts` (514 kota/kabupaten)
