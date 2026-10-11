/**
 * Amingo Video Forensics — Interactive Frontend Controller
 * Handles drag-and-drop video upload, instant previews, API analysis,
 * and high-fidelity forensic report generation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Elements ──
  const statusBadge = document.getElementById('statusBadge');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const previewArea = document.getElementById('previewArea');
  const videoPreview = document.getElementById('videoPreview');
  const fileNameText = document.getElementById('fileNameText');
  const btnRemove = document.getElementById('btnRemove');
  const btnAnalyze = document.getElementById('btnAnalyze');
  const btnLabel = document.getElementById('btnLabel');
  const errorBanner = document.getElementById('errorBanner');
  const errorText = document.getElementById('errorText');
  const resultsSection = document.getElementById('resultsSection');

  let selectedFile = null;
  let videoObjectUrl = null;

  // ── Utility: Format Bytes ──
  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // ── 1. Backend Health Check ──
  async function checkHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        const dev = (data.device || 'CPU').toUpperCase();
        statusDot.classList.remove('offline');
        statusText.textContent = `Amingo Engine Ready (${dev})`;
      } else {
        throw new Error('Health check returned ' + res.status);
      }
    } catch (err) {
      statusDot.classList.add('offline');
      statusText.textContent = 'Engine Offline';
    }
  }

  checkHealth();
  // Poll health periodically
  setInterval(checkHealth, 30000);

  // ── Error Helpers ──
  function showError(msg) {
    errorText.textContent = msg;
    errorBanner.style.display = 'flex';
  }

  function hideError() {
    errorBanner.style.display = 'none';
    errorText.textContent = '';
  }

  // ── 2. File Selection & Validation ──
  function handleFile(file) {
    if (!file) return;

    hideError();

    const validExtensions = ['.mp4', '.mov', '.webm'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext)) ||
      file.type.startsWith('video/');

    if (!isValid) {
      showError('Please upload a supported video file (.mp4, .mov, or .webm).');
      return;
    }

    if (file.size > 250 * 1024 * 1024) {
      showError('File exceeds 250MB size limit. Please upload a shorter clip.');
      return;
    }

    selectedFile = file;

    // Clean up previous preview URL
    if (videoObjectUrl) {
      URL.revokeObjectURL(videoObjectUrl);
    }

    videoObjectUrl = URL.createObjectURL(file);
    videoPreview.src = videoObjectUrl;
    fileNameText.textContent = `${file.name} (${formatBytes(file.size)})`;

    dropZone.style.display = 'none';
    previewArea.style.display = 'block';
    btnAnalyze.disabled = false;
    resultsSection.innerHTML = '';
  }

  // ── 3. Drag & Drop Listeners ──
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  // ── 4. Remove Button ──
  btnRemove.addEventListener('click', () => {
    if (videoObjectUrl) {
      URL.revokeObjectURL(videoObjectUrl);
      videoObjectUrl = null;
    }
    selectedFile = null;
    fileInput.value = '';
    videoPreview.src = '';

    previewArea.style.display = 'none';
    dropZone.style.display = 'block';
    btnAnalyze.disabled = true;
    hideError();
    resultsSection.innerHTML = '';
  });

  // ── 5. Video Analysis ──
  btnAnalyze.addEventListener('click', async () => {
    if (!selectedFile) return;

    hideError();
    btnAnalyze.disabled = true;
    btnLabel.innerHTML = `
      <div class="spinner"></div>
      <span>Extracting & Analyzing Frames with Amingo VideoMAE…</span>
    `;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errMessage = 'Analysis failed. Please check your video file.';
        try {
          const errData = await response.json();
          if (errData && errData.detail) errMessage = errData.detail;
        } catch (_) { }
        throw new Error(errMessage);
      }

      const data = await response.json();
      renderResults(data);

      // Scroll smoothly to results
      setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      showError(err.message || 'An unexpected error occurred during processing.');
    } finally {
      btnAnalyze.disabled = false;
      btnLabel.innerHTML = '🔍 Analyze Video';
    }
  });

  // ── 6. Render Results ──
  function renderResults(data) {
    const results = data.results || [];
    const frames = data.frames || [];
    const device = (data.device || 'CPU').toUpperCase();
    const framesCount = data.frames_sampled || frames.length;

    if (results.length === 0) {
      showError('No classification results were returned by the model.');
      return;
    }

    // Top prediction
    const top = results[0];
    const isReal = top.label.toLowerCase() === 'real';
    const topPercent = (top.score * 100).toFixed(1);

    // Look for Real and Fake specifically to display the comparison cards
    const realEntry = results.find(r => r.label.toLowerCase() === 'real') || { label: 'Real', score: 0 };
    const fakeEntry = results.find(r => r.label.toLowerCase() === 'fake') || { label: 'Fake', score: 0 };

    const realPercent = (realEntry.score * 100).toFixed(1);
    const fakePercent = (fakeEntry.score * 100).toFixed(1);

    const verdictClass = isReal ? 'verdict-real' : 'verdict-fake';
    const verdictIcon = isReal ? '🛡️' : '⚠️';
    const verdictTitle = isReal ? 'Authentic Video' : 'Manipulated Video (Deepfake)';
    const verdictSubtitle = isReal
      ? `The model found no significant evidence of facial manipulation (${topPercent}% authentic confidence).`
      : `The model detected facial manipulation artifacts with ${topPercent}% confidence.`;

    // Render frame thumbnails HTML
    const framesHtml = frames.map((b64, idx) => `
      <div class="frame-thumb" title="Sampled Frame #${idx + 1}">
        <img src="${b64}" alt="Sampled Frame ${idx + 1}" loading="lazy" />
        <span class="frame-number">#${idx + 1}</span>
      </div>
    `).join('');

    resultsSection.innerHTML = `
      <div class="results-section">
        <div class="results-header">
          <h2>Forensic Analysis Report</h2>
          <span class="device-badge">Processed on ${device}</span>
        </div>

        <!-- Verdict Card -->
        <div class="verdict-card ${verdictClass}">
          <div class="verdict-icon">${verdictIcon}</div>
          <div class="verdict-label">${verdictTitle}</div>
          <div class="verdict-confidence">${verdictSubtitle}</div>
        </div>

        <!-- Scores Grid -->
        <div class="scores-grid">
          <div class="score-card real">
            <div class="score-label">REAL</div>
            <div class="score-value">${realPercent}%</div>
            <div class="score-bar-track">
              <div class="score-bar-fill" style="width: ${realPercent}%"></div>
            </div>
          </div>
          <div class="score-card fake">
            <div class="score-label">FAKE</div>
            <div class="score-value">${fakePercent}%</div>
            <div class="score-bar-track">
              <div class="score-bar-fill" style="width: ${fakePercent}%"></div>
            </div>
          </div>
        </div>

        <!-- Disclaimer Banner -->
        <div class="disclaimer">
          <strong>Amingo Forensics Advisory:</strong> Spatio-temporal self-attention evaluated ${framesCount} evenly spaced frames across the video timeline. This model was fine-tuned specifically for facial reenactment, deepfake manipulation signatures, and temporal inconsistency detection.
        </div>

        <!-- Sampled Frames Gallery -->
        <div class="frames-section">
          <h3>Sampled Timeline Frames (${framesCount})</h3>
          <div class="frames-grid">
            ${framesHtml}
          </div>
        </div>
      </div>
    `;
  }
});
