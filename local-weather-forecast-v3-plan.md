# Local Weather Forecast V3 — Neural Network Specification, Design & Implementation Plan

## 1. Project Context

`local-weather-forecast` adalah modul eksperimental dalam project berbasis **TanStack Start + Vite + React**.

Modul ini berada di dalam halaman `/playground`.

`Playground` adalah rumah bagi banyak module eksperimental. `local-weather-forecast` hanyalah salah satu module.

Module tetap menggunakan lazy loading:

```text
Initial website
    ↓
/playground
    ↓
Local Weather Forecast belum dimuat
    ↓
User menekan "Load"
    ↓
Module + pretrained model dikirim ke browser
    ↓
Inference dilakukan di browser
```

Prinsip project:

- offline-first
- resource-aware
- pretrained model
- inference di browser/device
- tidak melakukan training ketika module dimuat
- ukuran model tetap diperhatikan
- dapat berjalan pada device dengan resource terbatas
- tidak membutuhkan weather API untuk inference
- hasil bersifat eksperimental dan bukan source of truth

Disclaimer:

> Prediksi ini bersifat eksperimental dan tidak boleh dijadikan acuan utama atau source of truth. Hasil prediksi dihasilkan oleh model machine learning dengan parameter yang terbatas.

---

# 2. Baseline dan Evolusi

Project telah berkembang melalui:

```text
V1
 ↓
V2
 ↓
V2.5
 ↓
V3
```

V2.5 adalah baseline utama V3.

Karakteristik penting V2.5:

- model tree/gradient boosting
- binary prediction
- output: hujan / tidak hujan
- pretrained ketika build
- inference di browser
- bundle model aktual sekitar **327 KB**
- dataset berkembang menjadi sekitar 5 tahun
- cakupan lokasi menggunakan sekitar **200-an kota/kabupaten Indonesia** dari dataset kota/kabupaten yang tersedia
- training dilakukan offline pada proses build
- browser hanya melakukan inference

Jangan mengubah baseline tanpa alasan eksperimental yang jelas.

---

# 3. Tujuan V3

V3 adalah eksperimen pertama yang berpindah dari tree-based model menuju **small neural network**.

Tujuan:

> Menguji apakah neural network kecil dengan learned location embedding dan temporal representation dapat memberikan performa lebih baik daripada V2.5, tanpa menjadi terlalu besar atau berat untuk browser/mobile.

V3 bukan proyek untuk membuat neural network sebesar mungkin.

Prinsip:

```text
V2.5
small + efficient + strong baseline

V3
lebih expressive
+
tetap resource-aware
```

Jangan memasukkan pada V3 awal:

- hierarchical classification
- regional models
- LLM
- Transformer
- weather API
- online learning
- training di browser
- dynamic weather features yang membutuhkan internet

---

# 4. Dua Arsitektur

## V3 — Shared Neural Network

V3 menggunakan satu neural network dengan:

- shared backbone
- location embedding
- temporal representation
- 4 output heads

Empat output:

```text
Pagi
Siang
Sore
Malam
```

Masing-masing adalah binary classification:

```text
0 = tidak hujan
1 = hujan
```

Arsitektur:

```text
                    Input Features
                         │
              ┌──────────┴──────────┐
              │                     │
        Location ID             Temporal features
              │                     │
        Embedding                 Encoding
              │                     │
              └──────────┬──────────┘
                         ↓
                    Concatenate
                         ↓
                    Dense 64
                         ↓
                       ReLU
                         ↓
                    Dense 32
                         ↓
                       ReLU
                         ↓
                    Dense 16
                         ↓
                       ReLU
                         ↓
              Shared Representation
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
       Morning          Noon         Afternoon      Night
        Head             Head           Head         Head
          ↓               ↓              ↓            ↓
       Sigmoid         Sigmoid        Sigmoid      Sigmoid
          ↓               ↓              ↓            ↓
       P(rain)         P(rain)        P(rain)      P(rain)
```

V3 adalah kandidat utama.

---

## V3.3 — Four Independent Neural Networks

V3.3 menjadi pembanding V3.

Empat network:

```text
Morning Network
Noon Network
Afternoon Network
Night Network
```

Masing-masing memiliki:

- location embedding
- temporal representation
- independent backbone
- satu binary output

```text
                 Input
                   │
        ┌──────────┼──────────┐
        ↓          ↓          ↓
     Morning      Noon     Afternoon     Night
       NN           NN          NN          NN
        ↓            ↓           ↓           ↓
    P(rain)      P(rain)     P(rain)     P(rain)
```

V3.3 tidak dibuat pada fase pertama. Implementasikan setelah V3 berhasil dievaluasi.

---

# 5. Pertanyaan Eksperimental

Eksperimen harus menjawab:

1. Apakah neural network dapat mengalahkan V2.5?
2. Apakah shared representation lebih efektif daripada independent networks?
3. Apakah location embedding memberikan kontribusi nyata?
4. Apakah temporal representation memberikan kontribusi nyata?
5. Bagaimana trade-off accuracy/F1 vs model size vs latency vs memory?

Perbandingan utama:

```text
V2.5 GBT
    vs
V3 Shared NN
    vs
V3.3 Independent NN
```

---

# 6. Dataset dan Target

Gunakan dataset yang sama/compatible dengan baseline V2.5 agar perbandingan adil.

Jangan memperbesar dataset hanya karena model baru adalah neural network.

Time slot:

```text
Pagi   : 05:00 - 11:00
Siang  : 11:00 - 15:00
Sore   : 15:00 - 18:00
Malam  : 18:00 - 05:00
```

Target:

```text
morning_rain
noon_rain
afternoon_rain
night_rain
```

Nilai:

```text
0 = tidak hujan
1 = hujan
```

V3 tetap binary classification. Ini bukan multiclass weather model.

Contoh output:

```json
{
  "morning": { "probability": 0.81, "prediction": true },
  "noon": { "probability": 0.64, "prediction": true },
  "afternoon": { "probability": 0.31, "prediction": false },
  "night": { "probability": 0.22, "prediction": false }
}
```

---

# 7. Location Embedding

Jangan memasukkan location ID sebagai angka ordinal.

Salah:

```text
Bandung = 1
Bogor = 2
Jakarta = 3
```

Gunakan embedding:

```text
Location ID
    ↓
Embedding Layer
    ↓
small learned vector
```

Mulai dengan embedding dimension yang kecil, misalnya:

```text
embeddingDim = 8
```

dan buat configurable.

Jangan menggunakan embedding besar tanpa bukti bahwa diperlukan.

Tujuan embedding adalah memungkinkan model mempelajari representasi lokasi berdasarkan pola training.

---

# 8. Temporal Representation

Gunakan cyclical encoding.

## Month

```text
sin(2π × month / 12)
cos(2π × month / 12)
```

## Day of Year

```text
sin(2π × dayOfYear / 365)
cos(2π × dayOfYear / 365)
```

Jika leap year ditangani, lakukan secara konsisten dan dokumentasikan.

Tujuannya agar:

```text
December → January
```

dipahami sebagai waktu yang berdekatan.

Jangan hanya menggunakan:

```text
month = 1..12
```

sebagai angka ordinal.

Hari dalam minggu boleh digunakan jika memang tersedia dan valid dalam dataset, tetapi jangan menambahkan fitur yang tidak memiliki data historis valid.

---

# 9. Dataset Normalization dan Preprocessing

Neural network sensitif terhadap skala feature. Karena itu **normalization merupakan bagian wajib dari pipeline V3**, bukan sekadar preprocessing tambahan saat inference.

## 9.1 Numerical Feature Normalization

Untuk setiap numerical feature yang digunakan model, hitung statistics dari **training split saja**:

```text
mean(feature)
std(feature)
```

Kemudian gunakan standardization:

```text
x_normalized = (x - mean) / std
```

Contoh:

```text
temperature
humidity
wind_speed
pressure
rainfall
dan numerical feature lain yang memang digunakan
```

Semua feature numerical yang masuk ke dense layers harus memiliki preprocessing yang konsisten.

**Jangan menghitung mean/std dari seluruh dataset sebelum split**, karena hal tersebut dapat menyebabkan data leakage.

Pipeline yang benar:

```text
Raw Dataset
    ↓
Train / Validation / Test Split
    ↓
Fit normalization statistics pada TRAIN saja
    ↓
Normalize TRAIN
Normalize VALIDATION menggunakan statistics TRAIN
Normalize TEST menggunakan statistics TRAIN
```

Bukan:

```text
Raw Dataset
    ↓
Normalize seluruh dataset
    ↓
Train / Validation / Test Split
```

## 9.2 Categorical Feature

Location tidak dinormalisasi sebagai angka.

Jangan melakukan:

```text
Jakarta = 1
Bandung = 2
Bogor = 3
```

kemudian melakukan standardization terhadap ID tersebut.

Location menggunakan:

```text
Location ID
    ↓
Embedding Layer
```

## 9.3 Temporal Representation

Fitur temporal yang sudah diubah menjadi cyclical representation:

```text
sin(...)
cos(...)
```

dapat langsung digunakan sebagai numerical input dan tidak boleh diperlakukan sebagai location ID.

Jika preprocessing tambahan terhadap temporal feature diperlukan, lakukan secara konsisten berdasarkan training data.

## 9.4 Artifact

Normalization statistics wajib disimpan bersama model artifact:

```text
model weights
+
feature schema
+
feature order
+
normalization mean
+
normalization std
+
location vocabulary/index
+
embedding configuration
+
temporal encoding configuration
+
threshold
```

Dengan demikian browser tidak perlu mengetahui dataset training.

Inference harus melakukan:

```text
raw input
    ↓
feature transformation
    ↓
normalization menggunakan TRAIN statistics
    ↓
location embedding lookup
    ↓
neural network
    ↓
prediction
```

## 9.5 Zero-Variance Feature

Jika sebuah numerical feature memiliki:

```text
std = 0
```

jangan melakukan pembagian dengan nol.

Pipeline harus memiliki penanganan eksplisit, misalnya menggunakan:

```text
std_safe = max(std, epsilon)
```

atau menghapus feature tersebut jika memang tidak memberikan informasi.

Keputusan yang digunakan harus dicatat dalam training metadata.

## 9.6 Target Tidak Dinormalisasi

Target binary:

```text
0 = tidak hujan
1 = hujan
```

tidak perlu dinormalisasi.


---

# 10. Data Splitting

Hindari random split yang menyebabkan temporal leakage.

Gunakan split berbasis waktu:

```text
Older data
    ↓
Training

Later data
    ↓
Validation

Latest data
    ↓
Test
```

Jika baseline V2.5 telah memiliki metodologi split yang sesuai, pertahankan metodologi tersebut agar perbandingan fair.

---

# 11. V3 Architecture

Baseline V3:

```text
Input
  ↓
Location Embedding
  ↓
Concatenate with numeric/temporal features
  ↓
Dense 64
  ↓
ReLU
  ↓
Dense 32
  ↓
ReLU
  ↓
Dense 16
  ↓
ReLU
  ↓
Shared representation
  ↓
4 independent output heads
```

Setiap head:

```text
Dense 1
  ↓
Sigmoid
```

Konfigurasi harus mudah diubah:

```text
embeddingDim = 8
hiddenLayers = [64, 32, 16]
activation = ReLU
outputActivation = Sigmoid
```

Jangan memperbesar network sebelum baseline kecil dievaluasi.

---

# 12. V3.3 Architecture

Setiap model:

```text
Input
  ↓
Location Embedding
  ↓
Temporal Representation
  ↓
Dense 64
  ↓
ReLU
  ↓
Dense 32
  ↓
ReLU
  ↓
Dense 16
  ↓
ReLU
  ↓
Dense 1
  ↓
Sigmoid
```

Model:

```text
morning-model
noon-model
afternoon-model
night-model
```

Semua menggunakan preprocessing dan embedding strategy yang konsisten.

Jika embedding dilatih secara independen, setiap model memiliki embedding weights sendiri.

---

# 13. Loss Function

Baseline:

```text
Binary Cross Entropy
```

Jika class imbalance menjadi masalah, eksperimen bertahap:

```text
BCE
 ↓
Weighted BCE
 ↓
Focal Loss
```

Jangan langsung menggunakan Focal Loss.

---

# 14. Optimizer

Mulai dengan:

```text
Adam
```

Learning rate harus configurable.

Jangan melakukan hyperparameter search besar pada implementasi pertama.

Tujuan awal adalah baseline yang reproducible.

---

# 15. Training

Training dilakukan **hanya saat model generation/build**, bukan ketika module dimuat.

Pipeline:

```text
Dataset
  ↓
Preprocessing
  ↓
Train/Validation/Test split
  ↓
Build Neural Network
  ↓
Training
  ↓
Validation
  ↓
Threshold tuning
  ↓
Final evaluation
  ↓
Export model artifact
```

Browser:

```text
Load model
  ↓
Preprocess inference input
  ↓
Inference
  ↓
Prediction
```

---

# 16. Batch, Epoch, Early Stopping

Gunakan batch training.

```text
batchSize = configurable
epochs = configurable
```

Gunakan validation monitoring dan early stopping.

Simpan best checkpoint berdasarkan validation performance/loss.

Jangan mengejar training accuracy.

Fokus pada validation/test performance.

---

# 17. Threshold Tuning

Sigmoid menghasilkan:

```text
0.0 → 1.0
```

Jangan otomatis menganggap:

```text
threshold = 0.5
```

optimal.

Cari threshold menggunakan validation set.

Contoh kandidat:

```text
0.30
0.35
0.40
...
0.70
```

Gunakan metric yang relevan, dengan Macro F1 sebagai metric utama.

Threshold harus disimpan sebagai bagian model artifact/configuration.

---

# 18. Evaluation

Minimal:

```text
Accuracy
Precision
Recall
F1
Macro F1
```

Evaluasikan:

### Overall

Semua slot.

### Per slot

```text
Morning F1
Noon F1
Afternoon F1
Night F1
```

### Per model

```text
V2.5
V3
V3.3
```

Jika memungkinkan, sediakan confusion matrix.

---

# 19. Model Size Budget

Baseline:

```text
V2.5 ≈ 327 KB
```

V3 boleh lebih besar.

Target:

```text
< 1 MB  = sangat baik
1–3 MB  = masih sangat baik
3–5 MB  = acceptable untuk eksperimen
> 5 MB  = perlu evaluasi trade-off
```

Jangan mengorbankan performa secara ekstrem hanya demi berada di bawah 327 KB.

---

# 20. Inference Performance

Ukur:

- model loading time
- preprocessing time
- inference latency
- memory usage jika memungkinkan

Bandingkan:

```text
V2.5
V3
V3.3
```

dengan environment yang sama.

Uji minimal desktop dan mobile-class device/emulation.

---

# 21. Quantization

Bukan requirement fase pertama.

Setelah model terbaik ditemukan, baru eksperimen:

```text
FP32
 ↓
FP16
 ↓
INT8
```

jika runtime/export pipeline mendukung.

Catat:

```text
model size
accuracy
F1
latency
```

sebelum/sesudah quantization.

---

# 22. Model Artifact

Artifact harus memuat seluruh informasi untuk inference.

Minimal:

```text
model weights
model architecture/config
feature order
normalization statistics (mean/std dari training set)
location vocabulary/index
embedding configuration
temporal encoding configuration
thresholds
model version
```

Normalization statistics harus berasal dari **training split**, bukan validation atau test split.

Dataset training tidak boleh dikirim ke browser.

---

# 23. Build Architecture

Pisahkan dataset extraction dari model generation.

```text
Manual:
dataset-extract
      ↓
training dataset

Build:
model-generation
      ↓
pretrained model artifact
      ↓
web application

Runtime:
browser
      ↓
load pretrained model
      ↓
inference
```

Browser tidak pernah melakukan training.

---

# 24. Playground Integration

Tetap gunakan:

```text
/playground
```

dan module lazy loading.

Ketika `/playground` dibuka:

- jangan load neural network
- jangan load model weights
- jangan load training dataset
- jangan melakukan initialization berat

Ketika user menekan `Load`:

```text
Load module
    ↓
Load pretrained V3 model
    ↓
Initialize inference
```

Jangan mengubah arsitektur Playground secara besar.

---

# 25. Offline Behavior

Setelah module dan model berhasil dimuat:

```text
Internet ON
    ↓
module + model downloaded
    ↓
cached
    ↓
Internet OFF
    ↓
module tetap dapat digunakan
```

Runtime tidak boleh membutuhkan:

- weather API
- backend prediction API
- remote ML service

---

# 26. UI Requirement

Ikuti design system existing.

Jangan membuat design system baru.

## Module Card

Tampilkan:

- nama module
- deskripsi
- status loaded/not loaded
- tombol `Load`

## Prediction Form

Input minimal:

- lokasi
- tanggal

Pertahankan parameter existing yang memang masih digunakan oleh implementasi project.

## Prediction Result

Tampilkan empat periode:

```text
Pagi
Hujan / Tidak hujan

Siang
Hujan / Tidak hujan

Sore
Hujan / Tidak hujan

Malam
Hujan / Tidak hujan
```

Probability boleh ditampilkan jika tersedia.

## Disclaimer

Selalu tampilkan disclaimer bahwa hasil bersifat eksperimental dan bukan source of truth.

---

# 27. Error Handling

Tangani:

- model gagal dimuat
- artifact tidak tersedia
- unsupported execution backend
- invalid input
- preprocessing mismatch
- inference error

Gunakan loading/error/empty state yang mengikuti design system.

Jangan membuat aplikasi crash hanya karena model gagal dimuat.

---

# 28. Reproducibility

Training harus reproducible sejauh framework/runtime memungkinkan.

Simpan:

```text
random seed
dataset version
feature schema
model configuration
training configuration
model version
```

Contoh:

```json
{
  "modelVersion": "v3.0.0",
  "architecture": "shared-mlp",
  "embeddingDim": 8,
  "hiddenLayers": [64, 32, 16],
  "activation": "relu",
  "outputActivation": "sigmoid",
  "optimizer": "adam"
}
```

---

# 29. Eksperimen Bertahap

## Experiment 0 — Baseline

Pastikan V2.5 dapat dievaluasi dengan dataset/test split yang sama.

## Experiment 1 — V3

```text
Shared MLP
+
Location Embedding
+
Temporal Representation
+
4 output heads
```

Catat:

```text
Accuracy
Macro F1
F1 per slot
Model size
Inference latency
```

## Experiment 2 — Architecture Size

Bandingkan:

```text
[32, 16]
[64, 32]
[64, 32, 16]
[128, 64, 32]
```

Jangan mencoba network besar sebelum diperlukan.

## Experiment 3 — Embedding Dimension

Bandingkan:

```text
4
8
16
```

## Experiment 4 — V3.3

Implementasikan empat independent networks dengan embedding dan temporal representation yang sama.

## Experiment 5 — Quantization

Hanya setelah arsitektur terbaik ditemukan.

---

# 30. Decision Criteria

V3 dianggap berhasil jika:

1. performanya setidaknya kompetitif dengan V2.5;
2. atau memberikan peningkatan F1/accuracy yang berarti;
3. model masih cukup kecil untuk browser;
4. inference tetap cepat;
5. tidak membutuhkan koneksi internet;
6. arsitektur tetap maintainable.

Jika V2.5 tetap lebih baik secara signifikan dengan resource jauh lebih rendah, itu adalah hasil eksperimen yang valid.

Neural network tidak otomatis dianggap lebih baik hanya karena lebih modern.

---

# 31. V2.5 vs V3 vs V3.3

Setelah model tersedia, buat tabel:

| Metric | V2.5 | V3 | V3.3 |
|---|---:|---:|---:|
| Accuracy | | | |
| Macro F1 | | | |
| Morning F1 | | | |
| Noon F1 | | | |
| Afternoon F1 | | | |
| Night F1 | | | |
| Model Size | | | |
| Load Time | | | |
| Inference Time | | | |
| Memory | | | |

Prioritas:

```text
1. Generalization / Macro F1
2. Accuracy
3. Per-slot consistency
4. Model size
5. Inference performance
6. Implementation complexity
```

---

# 32. Future Scope — Jangan Implementasikan Sekarang

Jika V3/V3.3 belum memenuhi target, kemungkinan eksperimen selanjutnya:

```text
V3.x
 ↓
architecture improvement
 ↓
regional representation
 ↓
hierarchical classification
 ↓
hybrid model
```

Namun jangan memasukkan semuanya ke V3.

V3 harus tetap menjadi eksperimen yang bersih:

> **Small Neural Network + Location Embedding + Temporal Representation**

---

# 33. Instruksi untuk AI Coding Agent

Agent harus:

1. membaca struktur project yang sudah ada;
2. memahami design system existing;
3. memahami module architecture Playground;
4. tidak mengganti framework;
5. tidak mengubah module lain;
6. tidak melakukan training di browser;
7. tidak mengirim dataset training ke client;
8. tidak membuat model runtime bergantung pada weather API;
9. menjaga lazy loading;
10. membuat pretrained model artifact;
11. menjaga separation training dan inference;
12. membuat konfigurasi eksperimen mudah diubah;
13. menulis dokumentasi hasil training;
14. menjaga V2.5 sebagai baseline;
15. menghindari refactor besar yang tidak berhubungan dengan V3.

---

# 34. Expected Flow

```text
                  DATASET
                     │
                     ↓
             Model Generation
                     │
                     ↓
             V3 Neural Network
                     │
             pretrained artifact
                     │
                     ↓
             Build Application
                     │
                     ↓
              TanStack Start
                     │
                     ↓
                 Playground
                     │
               [Load Module]
                     │
                     ↓
         Local Weather Forecast
                     │
                     ↓
              Load V3 Model
                     │
                     ↓
                 Inference
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
        Pagi       Siang       Sore       Malam
          ↓          ↓          ↓            ↓
       Rain?      Rain?       Rain?        Rain?
```

---

# 35. Final Requirement

Implementasikan **V3 terlebih dahulu**.

V3 wajib menggunakan:

```text
Shared Neural Network
+
Location Embedding
+
Temporal Representation
+
4 Binary Output Heads
+
Pretrained Model
+
Browser-side Offline Inference
+
Lazy-loaded Playground Module
```

V3.3 belum perlu diimplementasikan pada fase pertama.

Setelah V3 berhasil dan hasil evaluasi tersedia, V3.3 dibuat sebagai eksperimen pembanding:

```text
4 Independent Neural Networks
+
Location Embedding
+
Temporal Representation
```

Tujuan akhir:

> Menemukan arsitektur neural network paling kecil dan efisien yang memberikan peningkatan performa nyata terhadap V2.5 untuk prediksi cuaca lokal Indonesia, sambil mempertahankan filosofi offline-first dan resource-aware dari project ini.
