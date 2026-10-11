# 🎬 Amingo Video Forensics

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-CUDA%20Accelerated-ee4c2c.svg)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-Proprietary%20Amingo-indigo.svg)](#-license)

**Amingo Video Forensics** is an AI-powered media verification and deepfake detection platform. Built on the **VideoMAE** (Video Masked Autoencoder) architecture, it analyzes both spatial facial features and cross-frame temporal motion dynamics to detect subtle manipulation signatures, facial reenactments, and deepfakes.

---

## ✨ Features

- **🧠 Spatio-Temporal VideoMAE Model**: Simultaneously evaluates 16 uniformly sampled frames across time to catch temporal glitches, blinking irregularities, and face warping.
- **⚡ Local GPU & CPU Acceleration**: Automatically utilizes NVIDIA CUDA when available with fallback to multi-threaded CPU.
- **🎨 Modern Glassmorphic Web Interface**: Standalone frontend featuring drag-and-drop video uploads, real-time video playback previews, animated confidence meters, and sampled frame galleries.
- **🚀 High-Performance FastAPI Backend**: REST API with asynchronous video handling and OpenCV timeline sampling.
- **🔒 100% Offline & Private Inference**: Runs strictly locally without sending video data to any external cloud service.

---

## 🛠️ System Requirements

- **Operating System**: Windows 10/11, macOS, or Linux
- **Python**: Version 3.10 or higher
- **GPU (Recommended)**: NVIDIA GPU with CUDA support for accelerated inference (CPU is also supported)

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/V1ShAl1613/deepfakevideoanalyser.git
cd deepfakevideoanalyser
```

### 2. One-Command Installation
Install all required dependencies with a single command:

```bash
pip install -r requirements.txt
```

> **Tip for CUDA (NVIDIA GPU)**: If you want GPU acceleration, ensure you have PyTorch installed with CUDA:
> ```bash
> pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
> ```

---

### 3. Model Weights Setup
Ensure the model weights file (`model.safetensors`) is placed inside the `models/videomae/` directory:

```text
models/videomae/
├── config.json
├── preprocessor_config.json
├── README.md
└── model.safetensors    <-- Place your trained model weights here (~328 MB)
```

---

### 4. Run the Application

Start the local web server with:

```bash
python -m uvicorn server:app --host 127.0.0.1 --port 8080 --reload
```

Once started, open your web browser and navigate to:
👉 **[http://127.0.0.1:8080](http://127.0.0.1:8080)**

---

## 🖥️ Alternative: Streamlit Interface

If you prefer to run the legacy Streamlit dashboard:

```bash
python -m streamlit run app.py
```
And access it at **`http://localhost:8501`**.

---

## 📂 Project Structure

```text
video-forensics/
├── frontend/
│   ├── index.html            # Semantic HTML5 web interface
│   ├── style.css             # Glassmorphic dark-mode styles & animations
│   └── app.js                # Interactive UI controller & API connector
├── models/
│   └── videomae/
│       ├── config.json       # VideoMAE model configuration
│       ├── preprocessor_config.json # 16-frame preprocessor configuration
│       ├── README.md         # Detailed Amingo model card & specifications
│       └── model.safetensors # Fine-tuned weights (local)
├── app.py                    # Streamlit application
├── server.py                 # FastAPI backend server
├── test_model.py             # Quick model load & sanity verification script
├── requirements.txt          # Python dependencies
└── README.md                 # Project documentation
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the interactive frontend web application |
| `GET` | `/api/health` | Returns server health status, active compute device (`cuda` or `cpu`), and model state |
| `POST` | `/api/analyze` | Accepts video upload (`multipart/form-data`), samples 16 frames, runs VideoMAE classification, and returns JSON scores |

### Sample Analysis Response
```json
{
  "results": [
    { "label": "Real", "score": 0.683 },
    { "label": "Fake", "score": 0.317 }
  ],
  "frames": ["data:image/jpeg;base64,..."],
  "device": "cuda",
  "frames_sampled": 16
}
```

---

## 📜 License & Intellectual Property

This project and model implementation are proprietary and developed under **Amingo**. All rights reserved.
Unauthorized duplication, distribution, or commercial reuse without explicit permission is prohibited.
