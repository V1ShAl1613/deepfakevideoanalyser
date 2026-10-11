
import torch
from pathlib import Path
from transformers import (
    VideoMAEForVideoClassification,
    VideoMAEImageProcessor,
)

MODEL_ID = str(
    Path(__file__).resolve().parent
    / "models"
    / "videomae"
)

def main():
    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    print("Loading processor...")
    processor = VideoMAEImageProcessor.from_pretrained(
        MODEL_ID
    )

    print("Loading model...")
    model = VideoMAEForVideoClassification.from_pretrained(
        MODEL_ID
    )

    model = model.to(device)
    model.eval()

    print("Model loaded successfully!")
    print("Device:", device)
    print("Labels:", model.config.id2label)

if __name__ == "__main__":
    main()
