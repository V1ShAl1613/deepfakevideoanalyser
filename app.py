"""
Deepfake Video Forensics — Hugging Face Space & Production Entrypoint
Serves the custom glassmorphic dark-mode web application at `/`
and exposes the ZeroGPU-accelerated VideoMAE API, with Gradio mounted at `/gradio`.
"""

import os
from pathlib import Path
import gradio as gr
import torch

from server import (
    app as server_app,
    mount_static_and_root,
    run_inference,
    get_model,
    extract_frames,
    MODEL_ID,
    NUM_FRAMES,
)

# ---------------------------------------------------------------------------
# Hugging Face ZeroGPU compatibility
# ---------------------------------------------------------------------------
try:
    import spaces
except ImportError:
    class spaces:
        @staticmethod
        def GPU(func=None, **kwargs):
            if func is None:
                return lambda f: f
            return func


@spaces.GPU
def hf_zerogpu_forward(processor, model, device, frames):
    """ZeroGPU forward pass runner recognized by Hugging Face startup checks."""
    return run_inference(processor, model, device, frames)


# ---------------------------------------------------------------------------
# Optional Gradio interface (accessible at /gradio)
# ---------------------------------------------------------------------------
@spaces.GPU
def gradio_analyze_video(video_path):
    """Companion Gradio analysis endpoint."""
    if not video_path:
        return None, "⚠️ Please upload a video first.", []

    try:
        processor, model, device = get_model()
        frames = extract_frames(video_path)
        if not frames:
            return None, "❌ Could not extract readable frames.", []

        probabilities = hf_zerogpu_forward(processor, model, device, frames)

        confidences = {}
        for idx, score in enumerate(probabilities.tolist()):
            label = model.config.id2label.get(idx, f"Class {idx}").upper()
            confidences[label] = float(score)

        fake_score = confidences.get("FAKE", 0.0)
        real_score = confidences.get("REAL", 0.0)

        if fake_score >= 0.5:
            verdict = f"🚨 **SYNTHETIC / DEEPFAKE DETECTED** ({fake_score * 100:.2f}%)"
        else:
            verdict = f"✅ **AUTHENTIC / REAL MEDIA** ({real_score * 100:.2f}%)"

        report = f"""
### Forensic Verdict
{verdict}

* **Inference Device**: `{str(device).upper()}`
* **Frames Sampled**: `{len(frames)} frames`
* **Full Studio UI**: Visit the root page [/](/) for the full interactive dark-mode dashboard.
        """
        return confidences, report, frames

    except Exception as e:
        return None, f"❌ Error: {str(e)}", []


with gr.Blocks(title="Deepfake Video Forensics") as demo:
    gr.Markdown(
        """
        # 🛡️ Deepfake Video Forensics — Engine Backend
        > **Note:** The full custom glassmorphic application is running at **[Root (/)](/)**.
        """
    )
    with gr.Row():
        with gr.Column():
            video_in = gr.Video(label="Input Video", sources=["upload"])
            btn_run = gr.Button("🔍 Run Forensic Check", variant="primary")
        with gr.Column():
            lbl_out = gr.Label(label="Authenticity Probability", num_top_classes=2)
            rep_out = gr.Markdown()
    with gr.Row():
        gal_out = gr.Gallery(label="Sampled Timeline Frames", columns=8, rows=2, height=240)

    btn_run.click(
        fn=gradio_analyze_video,
        inputs=[video_in],
        outputs=[lbl_out, rep_out, gal_out],
    )


# ---------------------------------------------------------------------------
# Mount Gradio at /gradio, and serve the custom frontend at root /
# ---------------------------------------------------------------------------
app = gr.mount_gradio_app(server_app, demo, path="/gradio")
mount_static_and_root(app)


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"[app] Launching Deepfake Video Forensics on http://{host}:{port}")
    uvicorn.run("app:app", host=host, port=port, reload=False)
