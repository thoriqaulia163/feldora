# Local Weather Forecast V3.1 — Improvement Plan

## 1. Tujuan

V3.1 merupakan improvement terkontrol dari V3, bukan arsitektur baru.

Tujuan utama:

> Meningkatkan performa V3 dengan meningkatkan kapasitas neural network dan memperbaiki methodology evaluasi/threshold tuning, tanpa mengubah filosofi utama model.

V3.1 tetap menggunakan:

- Shared Neural Network
- Location Embedding
- Temporal Representation
- 4 output heads
- Binary classification
- Pretrained model
- Browser-side inference
- Offline-first
- Lazy-loaded Playground module

Tidak ada V3.1-A/B/C. Hanya ada satu implementasi V3.1.

---

## 2. Baseline V3

V3 saat ini menjadi baseline yang harus dipertahankan untuk perbandingan.

Arsitektur:

```text
Location Embedding
    embedding dimension = 8
        ↓
Dense 64
    ↓
Dense 32
    ↓
Dense 16
    ↓
4 output heads:
- Morning
- Noon
- Afternoon
- Night
```

V3 menghasilkan binary prediction:

```text
0 = tidak hujan
1 = hujan
```

V3.1 tidak boleh mengubah baseline V3 secara destruktif.

---

## 3. Perubahan Utama V3 → V3.1

V3.1 memiliki dua perubahan arsitektur utama.

### Hidden Layers

V3:

```text
64 → 32 → 16
```

V3.1:

```text
128 → 64 → 32
```

### Location Embedding

V3:

```text
embeddingDim = 8
```

V3.1:

```text
embeddingDim = 16
```

Arsitektur V3.1:

```text
Input Features
      │
      ├── Location ID
      │       ↓
      │   Embedding 16
      │
      └── Temporal / numerical features
              ↓
          Concatenate
              ↓
          Dense 128
              ↓
             ReLU
              ↓
           Dense 64
              ↓
             ReLU
              ↓
           Dense 32
              ↓
             ReLU
              ↓
       Shared Representation
              │
      ┌───────┼────────┬────────┐
      ↓       ↓        ↓        ↓
    Morning  Noon   Afternoon  Night
      ↓       ↓        ↓        ↓
    Sigmoid Sigmoid  Sigmoid  Sigmoid
```

---

# 4. 🔴 Requirement Wajib #1 — Temporal Split sebagai Benchmark Utama

V3.1 harus mempertahankan temporal split sebagai benchmark utama:

```text
2021–2023 → TRAIN
2024      → VALIDATION
2025      → TEST
```

Tujuannya mensimulasikan deployment:

```text
data masa lalu
    ↓
training
    ↓
data tahun berikutnya
    ↓
prediction
```

Jangan mengganti benchmark utama menjadi random split.

Semua keputusan model V3.1 harus dibuat berdasarkan TRAIN + VALIDATION.

`TEST = 2025` harus tetap unseen sampai evaluasi final.

---

# 5. 🔴 Requirement Wajib #2 — Threshold Tuning V3.1 Independen dari V2.5

V3.1 menghasilkan probability melalui sigmoid:

```text
0.0 → 1.0
```

Threshold V2.5 tidak boleh digunakan sebagai threshold V3.1.

Threshold V3 juga tidak boleh diasumsikan tetap optimal untuk V3.1.

V3.1 harus mencari threshold sendiri berdasarkan output probability V3.1.

Pipeline:

```text
Training
   ↓
Validation prediction
   ↓
Threshold tuning
   ↓
Lock threshold
   ↓
Test prediction
```

Threshold tidak boleh ditentukan menggunakan test set.

---

# 6. 🔴 Requirement Wajib #3 — Per-Slot Threshold

Jangan menggunakan satu threshold global untuk seluruh output.

V3.1 memiliki empat output:

```text
Morning
Noon
Afternoon
Night
```

Masing-masing harus memiliki threshold sendiri:

```text
morningThreshold
noonThreshold
afternoonThreshold
nightThreshold
```

Contoh nilai threshold hanya ilustrasi. Jangan hardcode nilai contoh tersebut.

Threshold harus dihitung dari validation set.

Objective tuning:

```text
Macro F1 / F1 masing-masing slot
```

---

# 7. 🔴 Requirement Wajib #4 — Hidden Layer 128 → 64 → 32

V3.1 wajib menggunakan:

```text
Dense 128
    ↓
Dense 64
    ↓
Dense 32
```

dengan:

```text
activation = ReLU
```

Output setiap slot:

```text
Dense 1
    ↓
Sigmoid
```

Tidak perlu menambahkan hidden layer tambahan atau melakukan architecture search.

Tujuannya menguji hipotesis:

> V3 mungkin masih under-capacity karena network 64 → 32 → 16 terlalu kecil.

---

# 8. 🔴 Requirement Wajib #5 — Embedding Dimension 16

V3.1 wajib menggunakan:

```text
embeddingDim = 16
```

Location ID tidak boleh diperlakukan sebagai numerical ordinal feature.

Benar:

```text
Location ID
    ↓
Embedding Layer
    ↓
16-dimensional learned representation
```

Embedding dilatih bersama neural network.

---

# 9. 🔴 Requirement Wajib #6 — Threshold Hanya dari Validation

Threshold tuning hanya boleh menggunakan:

```text
VALIDATION = 2024
```

Jangan menggunakan:

```text
TEST = 2025
```

untuk memilih threshold.

Urutan:

```text
2021–2023
    ↓
Train model
    ↓
2024
    ↓
Generate probability
    ↓
Cari threshold optimal
    ↓
Lock threshold
    ↓
2025
    ↓
Final evaluation
```

Setelah threshold dikunci, jangan mengubah threshold berdasarkan hasil test.

---

# 10. 🔴 Requirement Wajib #7 — Learning Curves

Training V3.1 wajib menyimpan history per epoch.

Minimal:

```text
epoch
training loss
validation loss
```

Jika pipeline memungkinkan, tambahkan:

```text
training F1
validation F1
```

Tujuannya mengetahui apakah model:

### Underfitting

```text
training loss tinggi
validation loss tinggi
```

### Overfitting

```text
training loss terus turun
validation loss mulai naik
```

### Healthy training

```text
training loss turun
validation loss turun
```

Learning curve harus tersedia dalam training report dan tidak perlu dikirim ke browser.

---

# 11. Normalization

Gunakan normalization yang konsisten dengan V3.

Untuk numerical feature:

```text
x_normalized = (x - mean) / std
```

Statistics `mean` dan `std` harus dihitung **hanya dari training set**.

Pipeline:

```text
Raw Dataset
    ↓
TRAIN / VALIDATION / TEST split
    ↓
Fit mean/std dari TRAIN
    ↓
Normalize TRAIN
Normalize VALIDATION menggunakan TRAIN statistics
Normalize TEST menggunakan TRAIN statistics
```

Jangan melakukan normalization terhadap seluruh dataset sebelum split.

Location ID tidak dinormalisasi karena diproses melalui embedding.

Target binary tidak dinormalisasi.

Normalization statistics harus disimpan dalam model artifact.

---

# 12. Feature Set

V3.1 menggunakan feature set yang sama dengan V3.

Jangan menambahkan feature baru dalam improvement ini.

Tujuannya mengisolasi dampak:

```text
V3
    ↓
larger neural network
+
larger location embedding
+
better threshold methodology
```

Feature engineering baru menjadi eksperimen berikutnya.

---

# 13. Training

V3.1 tetap pretrained.

Training hanya dilakukan pada model-generation/build pipeline.

Browser tidak melakukan training.

Pipeline:

```text
Dataset
    ↓
Temporal Split
    ↓
Normalization / preprocessing
    ↓
Build V3.1
    ↓
Training
    ↓
Validation
    ↓
Threshold tuning
    ↓
Lock threshold
    ↓
Final test
    ↓
Export model
```

Pertahankan early stopping dan best checkpoint berdasarkan validation performance/loss.

Jangan menggunakan test performance untuk early stopping.

---

# 14. Model Artifact

Model artifact V3.1 harus menyimpan:

```text
model weights
model architecture/config
feature order
normalization mean
normalization std
location vocabulary/index
embedding dimension
temporal encoding configuration
per-slot thresholds
model version
```

Contoh metadata:

```json
{
  "modelVersion": "v3.1",
  "architecture": "shared-mlp",
  "embeddingDim": 16,
  "hiddenLayers": [128, 64, 32],
  "activation": "relu",
  "outputActivation": "sigmoid"
}
```

Threshold harus merupakan hasil validation tuning.

---

# 15. Evaluation

V3.1 wajib dibandingkan dengan V3.

Minimal:

| Metric | V3 | V3.1 |
|---|---:|---:|
| Accuracy | | |
| Macro F1 | | |
| Morning F1 | | |
| Noon F1 | | |
| Afternoon F1 | | |
| Night F1 | | |
| Model Size | | |
| Inference Latency | | |
| Load Time | | |

Metric utama:

```text
Macro F1
```

Metric tambahan:

```text
Accuracy
Precision
Recall
F1 per slot
```

---

# 16. Model Size dan Performance

V3 memiliki ukuran model sekitar:

```text
~64 KB
```

Jangan menjadikan `<64 KB` sebagai requirement V3.1.

V3.1 boleh menjadi lebih besar selama peningkatan performa sebanding.

Tetap ukur:

```text
model size
load time
inference latency
```

Tujuannya mencari trade-off yang baik antara:

```text
accuracy/F1
      ↕
model size
      ↕
inference performance
```

---

# 17. Rolling Temporal Validation

Ini evaluasi tambahan, bukan pengganti benchmark utama.

Gunakan untuk melihat stabilitas temporal.

Contoh:

```text
Train: 2021–2022
Validation: 2023
```

dan:

```text
Train: 2021–2023
Validation: 2024
```

Test 2025 tetap menjadi final test.

Tujuan:

> Mengetahui apakah performa model stabil ketika diterapkan pada tahun yang berbeda.

---

# 18. Scope V3.1

Untuk menjaga eksperimen tetap terkendali, jangan menambahkan:

- V3.1-A/B/C
- architecture search
- hidden layer tambahan
- embedding dimension lain
- feature baru
- hierarchical classification
- regional classification
- V3.3 architecture
- Transformer
- LLM
- weather API
- online learning
- training di browser
- oversampling
- quantization sebagai requirement utama

V3.1 fokus pada tujuh requirement wajib dan evaluasi yang mendukungnya.

---

# 19. Decision Criteria

V3.1 dianggap berhasil jika memberikan improvement yang meaningful pada Macro F1 tanpa membuat model menjadi tidak masuk akal dari sisi resource.

Contoh:

```text
V3
Macro F1 = 64.16%
Model = ~64 KB

V3.1
Macro F1 = 67%
Model = ~150 KB
```

merupakan trade-off yang sangat baik.

Sebaliknya:

```text
V3
Macro F1 = 64.16%

V3.1
Macro F1 = 64.3%
Model = 500 KB
```

belum tentu layak.

Neural network yang lebih besar tidak otomatis lebih baik.

---

# 20. Expected V3.1 Architecture

```text
                    Input
                      │
          ┌───────────┴───────────┐
          │                       │
     Location ID            Numerical /
          │                Temporal Features
          ↓                       │
   Embedding 16                  │
          │                       │
          └───────────┬───────────┘
                      ↓
                 Concatenate
                      ↓
                 Dense 128
                      ↓
                    ReLU
                      ↓
                 Dense 64
                      ↓
                    ReLU
                      ↓
                 Dense 32
                      ↓
                    ReLU
                      │
          ┌───────────┼───────────┬───────────┐
          ↓           ↓           ↓           ↓
       Morning       Noon      Afternoon     Night
          ↓           ↓           ↓           ↓
       Sigmoid      Sigmoid     Sigmoid     Sigmoid
          ↓           ↓           ↓           ↓
     Probability  Probability  Probability  Probability
          │           │           │           │
          ↓           ↓           ↓           ↓
    Per-slot threshold tuning on VALIDATION
          │           │           │           │
          ↓           ↓           ↓           ↓
       Rain?       Rain?       Rain?       Rain?
```

---

# 21. Final V3.1 Workflow

```text
                 Existing V3
                     │
                     ↓
              Preserve baseline
                     │
                     ↓
          ┌──────────────────────┐
          │ V3.1 Architecture    │
          │                      │
          │ Embedding = 16       │
          │ Dense = 128→64→32    │
          └──────────┬───────────┘
                     ↓
              Temporal Split
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
       2021-23      2024       2025
        TRAIN     VALIDATION    TEST
          │          │
          ↓          ↓
      Training   Probability
                     │
                     ↓
             Per-slot threshold
                 tuning
                     │
                     ↓
              Lock thresholds
                     │
                     ↓
                  2025
                     │
                     ↓
              Final evaluation
                     │
                     ↓
          Compare V3 vs V3.1
```

---

# 22. Definition of Done

- [ ] V3 baseline tetap dapat dievaluasi
- [ ] Embedding menggunakan dimension 16
- [ ] Hidden layers menggunakan `128 → 64 → 32`
- [ ] Temporal split tetap `2021–2023 / 2024 / 2025`
- [ ] Normalization statistics hanya berasal dari training set
- [ ] Threshold V3.1 tidak menggunakan threshold V2.5
- [ ] Threshold dibuat secara independen untuk setiap time slot
- [ ] Threshold hanya dituning menggunakan validation set
- [ ] Test set tidak digunakan untuk threshold tuning
- [ ] Learning curve training/validation tersedia
- [ ] Rolling temporal validation tersedia sebagai evaluasi tambahan
- [ ] Final test dilakukan pada 2025
- [ ] Macro F1 dibandingkan dengan V3
- [ ] F1 masing-masing slot dibandingkan
- [ ] Model size dibandingkan
- [ ] Inference latency dibandingkan
- [ ] Hasil akhir V3.1 didokumentasikan

---

# 23. Prinsip Utama

V3.1 bukan perlombaan untuk membuat neural network sebesar mungkin.

Eksperimen ini ingin menjawab:

> **Apakah V3 selama ini dibatasi oleh kapasitas model dan/atau methodology threshold/evaluation, dan apakah peningkatan kapasitas dari 64→32→16 menjadi 128→64→32 dengan embedding 16 dapat menghasilkan generalization yang lebih baik?**

Jika jawabannya ya, lanjutkan ke V3.3 dengan dasar eksperimen yang lebih kuat.

Jika jawabannya tidak, jangan memaksakan kompleksitas tambahan hanya karena neural network memiliki kapasitas lebih besar.
