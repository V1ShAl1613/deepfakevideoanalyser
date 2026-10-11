
import os
import tempfile

import cv2
import numpy as np
import streamlit as st
import torch

from PIL import Image
from transformers import (
    VideoMAEForVideoClassification,
    VideoMAEImageProcessor,
)

from pathlib import Path

MODEL_ID = str(
    Path(__file__).resolve().parent
    / "models"
    / "videomae"
)
NUM_FRAMES = 16

st.set_page_config(
    page_title="Amingo Video Forensics",
    page_icon="🎬",
    layout="centered",
)

@st.cache_resource
def load_model():
    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    processor = VideoMAEImageProcessor.from_pretrained(
        MODEL_ID,
        local_files_only=True,
    )

    model = VideoMAEForVideoClassification.from_pretrained(
        MODEL_ID,
        local_files_only=True,
    )

    model = model.to(device)
    model.eval()

    return processor, model, device


def extract_frames(video_path):
    cap = cv2.VideoCapture(video_path)

    try:
        if not cap.isOpened():
            raise ValueError(
                "Could not open this video. Try an MP4 file."
            )

        total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        if total < 1:
            raise ValueError("The video contains no readable frames.")

        # Select 16 evenly spaced frame positions.
        indices = np.linspace(
            0, total - 1, NUM_FRAMES
        ).astype(int)

        frames = []

        for index in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(index))
            ok, frame = cap.read()

            if not ok:
                continue

            # OpenCV uses BGR; the model expects RGB.
            frame = cv2.cvtColor(
                frame, cv2.COLOR_BGR2RGB
            )

            frames.append(Image.fromarray(frame))

        if not frames:
            raise ValueError("Could not extract video frames.")

        # Repeat frames if the clip was too short to provide 16.
        while len(frames) < NUM_FRAMES:
            frames.append(frames[-1])

        return frames[:NUM_FRAMES]

    finally:
        cap.release()


def analyze_video(video_path, processor, model, device):
    frames = extract_frames(video_path)

    inputs = processor(
        frames,
        return_tensors="pt"
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.inference_mode():
        outputs = model(**inputs)
        probabilities = torch.softmax(
            outputs.logits, dim=-1
        )[0]

    results = []

    for index, score in enumerate(probabilities.tolist()):
        label = model.config.id2label.get(
            index, f"Class {index}"
        )

        results.append({
            "label": str(label),
            "score": float(score),
        })

    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return results, frames


st.title("🎬 Amingo Video Forensics")
st.write(
    "Analyze a video for signs of facial deepfake manipulation."
)

st.info(
    "This first version detects facial deepfakes. "
    "It does not establish whether every fully AI-generated "
    "scene is fake."
)

uploaded = st.file_uploader(
    "Upload a video",
    type=["mp4", "mov", "webm"]
)

if uploaded is not None:
    st.video(uploaded)

    if st.button("Analyze Video", type="primary"):
        suffix = os.path.splitext(uploaded.name)[1] or ".mp4"
        temp_path = None

        try:
            with tempfile.NamedTemporaryFile(
                delete=False, suffix=suffix
            ) as temp:
                temp.write(uploaded.getbuffer())
                temp_path = temp.name

            with st.spinner(
                "Loading model and analyzing frames..."
            ):
                processor, model, device = load_model()

                results, frames = analyze_video(
                    temp_path,
                    processor,
                    model,
                    device
                )

            st.success("Analysis completed")
            st.write("Inference device:", str(device))

            st.subheader("Model classification scores")

            for result in results:
                st.write(
                    f"**{result['label']}**: "
                    f"{result['score']:.1%}"
                )
                st.progress(result["score"])

            st.caption(
                "These are model scores, not calibrated "
                "probabilities of authenticity. The result "
                "covers sampled frames and may be wrong on "
                "unseen generators or heavily edited videos."
            )

            st.subheader("Sampled frames")

            st.image(
                frames,
                caption=[
                    f"Frame {i + 1}"
                    for i in range(len(frames))
                ],
                width=120,
            )

        except Exception as error:
            st.error(
                f"Analysis failed: {error}"
            )
            st.write(
                "Check that the Amingo model files are present, "
                "the video is readable, and the installed "
                "dependencies are compatible."
            )

        finally:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)
