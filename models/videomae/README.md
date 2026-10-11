---
license: proprietary
---
# 🧾 Model Card — Amingo VideoMAE DeepFake Detector v1

## 🧠 Model Overview

Amingo VideoMAE DeepFake Detector v1 is a fine-tuned video deepfake detection model developed by Amingo. It distinguishes between authentic and manipulated facial videos using the VideoMAE architecture adapted for binary classification.

The base model was originally trained on large-scale video action datasets, enabling strong spatiotemporal feature understanding. It was further fine-tuned on the FaceForensics++ dataset to detect visual artifacts, temporal inconsistencies, and manipulation signatures commonly found in deepfake videos.

By leveraging transformer-based video representation learning, the model captures both frame-level visual cues and motion patterns across time, allowing it to identify subtle manipulations that traditional image-based detectors may miss.

The model is designed for applications in media verification, misinformation detection, and AI-generated content monitoring.

## 🏗️ Training Details

| Parameter | Value |
|---|---|
| Base Model | VideoMAE base (Kinetics fine-tuned) |
| Framework | Amingo Video Forensics Platform + PyTorch |
| Training Hardware | Amingo In-House High-End GPU Workstation |
| Epochs | 15 |
| Batch Size | 4 |
| Learning Rate | 2e-5 |
| Optimizer | AdamW |
| Video Sampling | 16 frames per clip |
| Resolution | 224 × 224 |

### Training Strategy

- Transfer learning with partial freezing
- ~70% of VideoMAE backbone layers frozen
- Final transformer layers + classifier head fine-tuned

### Training Dataset

- **FaceForensics++** (C23 compression level) — used exclusively for training this model
- The dataset was sourced, processed, and trained entirely on Amingo's in-house infrastructure

### Classes

- 🟢 Real Video
- 🔴 Deepfake Video

## 📊 Training Dataset & Data Policy

This model was trained using the **FaceForensics++** dataset, a widely used benchmark for deepfake detection research containing manipulated videos generated using multiple facial manipulation techniques, including deepfake generation and facial reenactment.

For this model version, training used a subset consisting of:

- Original videos (real)
- Deepfakes manipulation videos (fake)

Each video was processed by sampling 16 frames uniformly across its duration to capture both spatial and temporal artifacts.

| Label | Description |
|---|---|
| Real | Authentic unmodified video |
| Fake | Video manipulated using deepfake synthesis techniques |

> ⚠️ **Important — Data Policy**
>
> The FaceForensics++ training dataset (100+ GB) was used to train this model entirely on **Amingo's in-house high-end GPU workstation**. Due to the massive size and proprietary nature of the training pipeline, the raw training dataset is **not included** in this repository and **cannot be transferred** to customers.
>
> What is shipped to customers is the **final trained model** — the optimized weights, configuration, and preprocessor files that power the Amingo Video Forensics application. This approach ensures:
>
> - **Compact delivery** — only the production-ready model (~330 MB) is included, not hundreds of gigabytes of training data
> - **Intellectual property protection** — Amingo's training methodology, data curation, and fine-tuning pipeline remain proprietary
> - **Immediate usability** — the application works out of the box without any additional data downloads or setup

## 🎯 Evaluation Metrics

Evaluation was performed on a held-out validation split of the dataset.

| Metric | Score |
|---|---|
| Train Loss | 0.303 |
| Validation Loss | 0.506 |
| Accuracy | 88.0% |
| F1 Score | 0.742 |
| AUC | 0.836 |

✅ The model demonstrates strong ability to distinguish between authentic and manipulated videos using temporal visual patterns.

## 💬 Example Usage

```python
import torch
import numpy as np
from PIL import Image
from transformers import VideoMAEForVideoClassification, VideoMAEImageProcessor

MODEL_PATH = "models/videomae"

model = VideoMAEForVideoClassification.from_pretrained(
    MODEL_PATH, local_files_only=True
)

processor = VideoMAEImageProcessor.from_pretrained(
    MODEL_PATH, local_files_only=True
)

# See server.py for full video analysis pipeline
```

## 🧩 Intended Use

- Deepfake detection in video content
- Media authenticity verification
- AI-generated video detection pipelines
- Research on manipulated media detection
- Integration into misinformation monitoring systems

## ⚠️ Limitations

The model was trained on a subset of FaceForensics++ and may not generalize perfectly to unseen deepfake generation techniques.

Performance may degrade on:

- Heavily compressed social media videos
- Unseen manipulation methods
- Partial face occlusions
- Extremely short clips

This model should be used as an assistive forensic tool, not as a definitive authenticity guarantee.

## 📜 License

This model and all associated files are proprietary and licensed exclusively under Amingo. All rights reserved.

Unauthorized reproduction, distribution, or use of this model outside the Amingo Video Forensics platform is prohibited without explicit written permission from Amingo.

## 🚀 Acknowledgements

- VideoMAE — Base architecture for video representation learning
- FaceForensics++ — Deepfake detection dataset benchmark
- Amingo Video Forensics Platform — Training, deployment, and inference framework