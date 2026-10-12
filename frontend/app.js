/**
 * Amingo Video Forensics — Application Controller & Engine Bridge
 * Manages video ingestion, client-side metadata parsing, asynchronous API requests,
 * spatiotemporal results interpretation, frame lightbox, and theme persistence.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── 1. DOM Elements ──
  // Header Telemetry
  const engineDot = document.getElementById('engineDot');
  const engineStatusText = document.getElementById('engineStatusText');
  const badgeDevice = document.getElementById('badgeDevice');
  const deviceText = document.getElementById('deviceText');
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const btnOpenGuide = document.getElementById('btnOpenGuide');

  // Ingestion Panel
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const previewArea = document.getElementById('previewArea');
  const videoPreview = document.getElementById('videoPreview');
  const fileNameText = document.getElementById('fileNameText');
  const fileSizeBadge = document.getElementById('fileSizeBadge');
  const videoResolutionBadge = document.getElementById('videoResolutionBadge');
  const videoDurationBadge = document.getElementById('videoDurationBadge');
  const btnRemove = document.getElementById('btnRemove');
  const btnAnalyze = document.getElementById('btnAnalyze');
  const btnLabel = document.getElementById('btnLabel');
  const errorBanner = document.getElementById('errorBanner');
  const errorText = document.getElementById('errorText');

  // Results Section
  const resultsSection = document.getElementById('resultsSection');
  const emptyStateView = document.getElementById('emptyStateView');
  const activeResultsView = document.getElementById('activeResultsView');
  const forensicReportSection = document.getElementById('forensicReportSection');
  const reportContentArea = document.getElementById('reportContentArea');
  const btnPrintReport = document.getElementById('btnPrintReport');

  // Modals
  const frameModal = document.getElementById('frameModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const modalFrameImg = document.getElementById('modalFrameImg');
  const modalFrameBadge = document.getElementById('modalFrameBadge');
  const modalFrameTime = document.getElementById('modalFrameTime');
  const modalCounterIndicator = document.getElementById('modalCounterIndicator');
  const btnModalPrev = document.getElementById('btnModalPrev');
  const btnModalNext = document.getElementById('btnModalNext');

  const guideModal = document.getElementById('guideModal');
  const btnCloseGuideModal = document.getElementById('btnCloseGuideModal');

  // Toasts
  const toastContainer = document.getElementById('toastContainer');

  // State Variables
  let selectedFile = null;
  let videoObjectUrl = null;
  let videoDuration = 0;
  let videoWidth = 0;
  let videoHeight = 0;
  let currentSampledFrames = [];
  let currentActiveFrameIndex = 0;
  let isAnalyzing = false;

  // ── 2. Toast Notification System ──
  function showToast(message, type = 'info', duration = 4000) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '🛡️';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ── 3. Theme Management ──
  function initTheme() {
    const savedTheme = localStorage.getItem('amingo_forensics_theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', initialTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('amingo_forensics_theme', nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} theme`, 'info', 2000);
  }

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', toggleTheme);
  }
  initTheme();

  // ── 4. Formatting Utilities ──
  function formatBytes(bytes, decimals = 1) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0.0s';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}m ${secs}s`;
  }

  // ── 5. Backend Health Check ──
  async function checkHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        const dev = (data.device || 'CPU').toUpperCase();

        if (engineDot) {
          engineDot.className = 'status-indicator-dot online';
        }
        if (engineStatusText) {
          engineStatusText.textContent = 'Engine Ready';
        }

        if (deviceText) {
          deviceText.textContent = dev === 'CUDA' ? 'CUDA (GPU)' : 'CPU Multi-Core';
        }
        if (badgeDevice) {
          if (dev === 'CUDA') {
            badgeDevice.classList.add('cuda-active');
          } else {
            badgeDevice.classList.remove('cuda-active');
          }
        }
      } else {
        throw new Error(`Health status: ${res.status}`);
      }
    } catch (err) {
      if (engineDot) {
        engineDot.className = 'status-indicator-dot offline';
      }
      if (engineStatusText) {
        engineStatusText.textContent = 'Engine Offline';
      }
      if (deviceText) {
        deviceText.textContent = 'Offline';
      }
      if (badgeDevice) {
        badgeDevice.classList.remove('cuda-active');
      }
    }
  }

  checkHealth();
  setInterval(checkHealth, 30000);

  // ── 6. File Selection & Local Video Preview ──
  function showError(msg) {
    if (errorText) errorText.textContent = msg;
    if (errorBanner) errorBanner.style.display = 'flex';
  }

  function hideError() {
    if (errorBanner) errorBanner.style.display = 'none';
    if (errorText) errorText.textContent = '';
  }

  function handleFile(file) {
    if (!file) return;
    hideError();

    const validExtensions = ['.mp4', '.mov', '.webm'];
    const fileName = file.name.toLowerCase();
    const isValidExt = validExtensions.some(ext => fileName.endsWith(ext)) || file.type.startsWith('video/');

    if (!isValidExt) {
      showError('Unsupported file type. Please upload an MP4, MOV, or WebM video file.');
      showToast('Unsupported video file format', 'error');
      return;
    }

    // 250 MB Limit
    const MAX_SIZE_BYTES = 250 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      showError(`File exceeds maximum 250 MB limit (${formatBytes(file.size)}). Please choose a shorter clip.`);
      showToast('File exceeds 250 MB size limit', 'error');
      return;
    }

    selectedFile = file;

    // Clean up previous Object URL to prevent memory leaks
    if (videoObjectUrl) {
      URL.revokeObjectURL(videoObjectUrl);
    }

    videoObjectUrl = URL.createObjectURL(file);
    videoPreview.src = videoObjectUrl;

    // Populate File Card Meta
    if (fileNameText) fileNameText.textContent = file.name;
    if (fileSizeBadge) fileSizeBadge.textContent = formatBytes(file.size);
    if (videoResolutionBadge) videoResolutionBadge.textContent = 'Reading…';
    if (videoDurationBadge) videoDurationBadge.textContent = '0.0s';

    // Parse Video Dimensions and Duration
    videoPreview.onloadedmetadata = () => {
      videoDuration = videoPreview.duration || 0;
      videoWidth = videoPreview.videoWidth || 0;
      videoHeight = videoPreview.videoHeight || 0;

      if (videoDurationBadge) {
        videoDurationBadge.textContent = formatDuration(videoDuration);
      }
      if (videoResolutionBadge && videoWidth > 0 && videoHeight > 0) {
        videoResolutionBadge.textContent = `${videoWidth}×${videoHeight}`;
      }
    };

    dropZone.style.display = 'none';
    previewArea.style.display = 'flex';
    btnAnalyze.disabled = false;
    btnAnalyze.setAttribute('aria-disabled', 'false');

    showToast(`Loaded ${file.name} (${formatBytes(file.size)})`, 'success', 3000);
  }

  // ── 7. Drag & Drop Event Listeners ──
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  ['dragenter', 'dragover'].forEach(eventType => {
    dropZone.addEventListener(eventType, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-active');
    });
  });

  ['dragleave', 'drop'].forEach(eventType => {
    dropZone.addEventListener(eventType, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-active');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  // ── 8. Remove Video ──
  btnRemove.addEventListener('click', () => {
    if (isAnalyzing) return;

    if (videoObjectUrl) {
      URL.revokeObjectURL(videoObjectUrl);
      videoObjectUrl = null;
    }
    selectedFile = null;
    videoDuration = 0;
    videoWidth = 0;
    videoHeight = 0;
    fileInput.value = '';
    videoPreview.src = '';

    previewArea.style.display = 'none';
    dropZone.style.display = 'block';
    btnAnalyze.disabled = true;
    btnAnalyze.setAttribute('aria-disabled', 'true');
    hideError();

    // Reset results views
    activeResultsView.style.display = 'none';
    activeResultsView.innerHTML = '';
    forensicReportSection.style.display = 'none';
    emptyStateView.style.display = 'flex';

    showToast('Video removed from workspace', 'info', 2000);
  });

  // ── 9. Video Forensic Analysis Dispatch ──
  btnAnalyze.addEventListener('click', async () => {
    if (!selectedFile || isAnalyzing) return;

    isAnalyzing = true;
    hideError();
    btnAnalyze.disabled = true;
    btnAnalyze.setAttribute('aria-disabled', 'true');

    const startTime = performance.now();

    // Loading State
    btnLabel.innerHTML = `
      <span class="spinner-ring" aria-hidden="true"></span>
      <span>Sampling 16 Frames & Inferring with VideoMAE…</span>
    `;

    showToast('Dispatched forensic analysis job...', 'info', 3000);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errMessage = `Server returned HTTP ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.detail) errMessage = errData.detail;
        } catch (_) {}
        throw new Error(errMessage);
      }

      const data = await response.json();
      const elapsedSeconds = ((performance.now() - startTime) / 1000).toFixed(2);

      renderResults(data, elapsedSeconds);
      showToast('Forensic analysis successfully completed!', 'success', 4000);

      // Smooth scroll to results on smaller screens
      if (window.innerWidth < 1080) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

    } catch (err) {
      console.error('Forensic Analysis Error:', err);
      const message = err.message || 'An unexpected error occurred during video analysis.';
      showError(message);
      showToast(message, 'error', 6000);
    } finally {
      isAnalyzing = false;
      btnAnalyze.disabled = false;
      btnAnalyze.setAttribute('aria-disabled', 'false');
      btnLabel.innerHTML = `
        <svg class="btn-action-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <span>Re-Run Forensic Analysis</span>
      `;
    }
  });

  // ── 10. Results Rendering Logic ──
  function renderResults(data, elapsedSeconds) {
    const results = data.results || [];
    currentSampledFrames = data.frames || [];
    const device = (data.device || 'cpu').toUpperCase();
    const framesCount = data.frames_sampled || currentSampledFrames.length || 16;

    if (results.length === 0) {
      showError('The model returned an empty prediction array.');
      return;
    }

    // Identify Real and Fake scores strictly by label name
    const realEntry = results.find(r => r.label && r.label.toLowerCase() === 'real') || { label: 'real', score: 0 };
    const fakeEntry = results.find(r => r.label && r.label.toLowerCase() === 'fake') || { label: 'fake', score: 0 };

    const top = results[0];
    const isAuthentic = top.label && top.label.toLowerCase() === 'real';

    const realPercent = (realEntry.score * 100).toFixed(1);
    const fakePercent = (fakeEntry.score * 100).toFixed(1);
    const topScorePercent = (top.score * 100).toFixed(1);

    // Styling & Copy
    const verdictClass = isAuthentic ? 'verdict-real' : 'verdict-fake';
    const verdictIcon = isAuthentic ? '🛡️' : '⚠️';
    const verdictTitle = isAuthentic ? 'AUTHENTIC MEDIA' : 'MANIPULATED MEDIA (DEEPFAKE)';
    const verdictSummary = isAuthentic
      ? `The VideoMAE spatio-temporal self-attention backbone found continuous temporal facial alignment and detected no significant deepfake manipulation signatures across the sampled duration (${realPercent}% authenticity confidence).`
      : `The VideoMAE spatio-temporal self-attention backbone identified temporal manipulation signatures, facial warping, or reenactment synthesis artifacts across the sampled frames (${fakePercent}% manipulation confidence).`;

    // Render 16 Sampled Frames
    const framesHtml = currentSampledFrames.map((b64, idx) => {
      // Calculate timestamp in video
      let timeLabel = `Frame #${idx + 1}`;
      if (videoDuration > 0 && framesCount > 1) {
        const timeSec = ((idx / (framesCount - 1)) * videoDuration).toFixed(2);
        timeLabel = `${timeSec}s`;
      }

      return `
        <div class="frame-card" data-index="${idx}" tabindex="0" role="button" aria-label="Sampled Frame ${idx + 1} at ${timeLabel}">
          <img class="frame-img" src="${b64}" alt="Sampled frame ${idx + 1}" loading="lazy" />
          <span class="frame-badge-index">#${String(idx + 1).padStart(2, '0')}</span>
          <span class="frame-badge-time">${timeLabel}</span>
          <div class="frame-hover-overlay" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      `;
    }).join('');

    // Active Results Template
    activeResultsView.innerHTML = `
      <!-- 1. Verdict Banner -->
      <div class="verdict-banner-card ${verdictClass}" role="region" aria-label="Forensic Classification Verdict">
        <div class="verdict-icon-container" aria-hidden="true">${verdictIcon}</div>
        <div class="verdict-text-content">
          <div class="verdict-classification-row">
            <h3 class="verdict-title">${verdictTitle}</h3>
            <span class="verdict-score-pill">${topScorePercent}% CONFIDENCE</span>
          </div>
          <p class="verdict-summary-text">${verdictSummary}</p>
          <p class="verdict-disclaimer-text">
            * Probabilistic Assessment: Model outputs represent statistical likelihoods evaluated on 16 sampled frames and do not constitute absolute forensic proof.
          </p>
        </div>
      </div>

      <!-- 2. Summary Metric Cards -->
      <div class="metrics-summary-grid">
        <div class="metric-card">
          <span class="metric-label">Primary Verdict</span>
          <span class="metric-value ${isAuthentic ? 'authentic-val' : 'manipulated-val'}">
            ${isAuthentic ? 'Authentic' : 'Deepfake'}
          </span>
          <span class="metric-sub">Top Predicted Class</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Authentic Score</span>
          <span class="metric-value authentic-val">${realPercent}%</span>
          <span class="metric-sub">P(Real) Distribution</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Manipulated Score</span>
          <span class="metric-value manipulated-val">${fakePercent}%</span>
          <span class="metric-sub">P(Fake) Distribution</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Sampled Frames</span>
          <span class="metric-value">${framesCount}</span>
          <span class="metric-sub">Uniform Timeline Extract</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Compute Device</span>
          <span class="metric-value">${device}</span>
          <span class="metric-sub">${device === 'CUDA' ? 'GPU Accelerated' : 'CPU Multi-Thread'}</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Inference Latency</span>
          <span class="metric-value">${elapsedSeconds}s</span>
          <span class="metric-sub">Total End-to-End</span>
        </div>
      </div>

      <!-- 3. Dual Probability Meter -->
      <div class="probability-visualizer">
        <div class="prob-header">
          <span>Spatio-Temporal Softmax Probability Distribution</span>
          <span style="font-family: var(--font-mono); font-size: 0.75rem;">16 Frames Evaluated</span>
        </div>

        <div class="prob-bars-stack">
          <div class="prob-bar-group">
            <div class="prob-bar-meta">
              <span style="color: var(--authentic-emerald);">Authentic (Real Video)</span>
              <span style="font-family: var(--font-mono); color: var(--authentic-emerald);">${realPercent}%</span>
            </div>
            <div class="prob-bar-track">
              <div class="prob-bar-fill real-fill" style="width: ${realPercent}%;"></div>
            </div>
          </div>

          <div class="prob-bar-group">
            <div class="prob-bar-meta">
              <span style="color: var(--manipulated-crimson);">Manipulated (Facial Deepfake)</span>
              <span style="font-family: var(--font-mono); color: var(--manipulated-crimson);">${fakePercent}%</span>
            </div>
            <div class="prob-bar-track">
              <div class="prob-bar-fill fake-fill" style="width: ${fakePercent}%;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Sampled Frame Inspection Gallery (Scrollable Timeline Filmstrip) -->
      <div class="sampled-frames-container">
        <div class="frames-section-header">
          <div class="frames-header-left">
            <h3 class="frames-section-title">Timeline Inspection Frames (${framesCount})</h3>
            <span class="frames-subtitle">Scroll horizontally or click to inspect full-res</span>
          </div>
          <div class="frames-header-controls">
            <button type="button" class="frames-nav-btn" id="btnScrollFramesLeft" aria-label="Scroll timeline left" title="Scroll left">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            </button>
            <button type="button" class="frames-nav-btn" id="btnScrollFramesRight" aria-label="Scroll timeline right" title="Scroll right">
              <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
            </button>
          </div>
        </div>

        <div class="frames-scroll-wrapper">
          <div class="frames-filmstrip" id="framesGrid">
            ${framesHtml}
          </div>
        </div>

        <p class="frames-explanatory-note">
          ℹ️ 16 frames uniformly extracted across video timeline. Scroll horizontally inside the container to inspect cross-frame transitions.
        </p>
      </div>
    `;

    const analysisDateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 5. Populate Minimal & Professional Forensic Dossier Below
    reportContentArea.innerHTML = `
      <div class="dossier-container">
        <!-- 1. Executive Verdict & File Summary Card -->
        <div class="dossier-executive-card">
          <div class="dossier-exec-main">
            <div class="dossier-status-pill ${isAuthentic ? 'status-authentic' : 'status-manipulated'}">
              <span class="dossier-status-dot"></span>
              <span class="dossier-status-title">${isAuthentic ? 'Authentic (Real Video)' : 'Manipulated (Deepfake Detected)'}</span>
              <span class="dossier-status-score">${topScorePercent}% Confidence</span>
            </div>
            <p class="dossier-summary-desc">
              ${isAuthentic
                ? 'Analysis indicates natural spatio-temporal facial movements consistent with original, unmanipulated video footage.'
                : 'Analysis detected temporal facial anomalies and synthetic signatures indicative of AI manipulation or face replacement.'}
            </p>
          </div>
          <div class="dossier-meta-list">
            <div class="dossier-meta-item">
              <span class="dossier-meta-label">File Analyzed</span>
              <span class="dossier-meta-value" title="${escapeHtml(selectedFile ? selectedFile.name : 'Uploaded Video')}">${escapeHtml(selectedFile ? selectedFile.name : 'Uploaded Video')}</span>
            </div>
            <div class="dossier-meta-item">
              <span class="dossier-meta-label">Length & Size</span>
              <span class="dossier-meta-value">${formatDuration(videoDuration)} • ${selectedFile ? formatBytes(selectedFile.size) : 'N/A'}</span>
            </div>
            <div class="dossier-meta-item">
              <span class="dossier-meta-label">Analyzed At</span>
              <span class="dossier-meta-value">${analysisDateStr}</span>
            </div>
          </div>
        </div>

        <!-- 2. Classification Breakdown -->
        <div class="dossier-section">
          <div class="dossier-section-header">
            <h4 class="dossier-section-title">Classification Breakdown</h4>
            <span class="dossier-section-badge">Model Output</span>
          </div>
          <div class="dossier-table-wrap">
            <table class="dossier-table">
              <thead>
                <tr>
                  <th>Classification Class</th>
                  <th>Confidence</th>
                  <th>Model Score</th>
                  <th>Assessment</th>
                </tr>
              </thead>
              <tbody>
                <tr class="${isAuthentic ? 'row-primary' : ''}">
                  <td>
                    <div class="dossier-label-cell">
                      <span class="badge-dot dot-authentic"></span>
                      <span>Authentic (Real)</span>
                    </div>
                  </td>
                  <td><strong>${realPercent}%</strong></td>
                  <td><code>${realEntry.score.toFixed(4)}</code></td>
                  <td>
                    <span class="dossier-badge ${isAuthentic ? 'badge-primary-verdict' : 'badge-secondary'}">
                      ${isAuthentic ? 'Primary Verdict' : 'Secondary'}
                    </span>
                  </td>
                </tr>
                <tr class="${!isAuthentic ? 'row-primary' : ''}">
                  <td>
                    <div class="dossier-label-cell">
                      <span class="badge-dot dot-manipulated"></span>
                      <span>Manipulated (Deepfake)</span>
                    </div>
                  </td>
                  <td><strong>${fakePercent}%</strong></td>
                  <td><code>${fakeEntry.score.toFixed(4)}</code></td>
                  <td>
                    <span class="dossier-badge ${!isAuthentic ? 'badge-primary-verdict' : 'badge-secondary'}">
                      ${!isAuthentic ? 'Primary Verdict' : 'Secondary'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. Key Technical Specifications -->
        <div class="dossier-section">
          <div class="dossier-section-header">
            <h4 class="dossier-section-title">Analysis Specifications</h4>
            <span class="dossier-section-badge">Offline Local Engine</span>
          </div>
          <div class="dossier-specs-grid">
            <div class="dossier-spec-card">
              <span class="dossier-spec-icon">🤖</span>
              <div class="dossier-spec-content">
                <span class="dossier-spec-label">Forensic Model</span>
                <span class="dossier-spec-value">VideoMAE</span>
                <span class="dossier-spec-note">Vision Transformer</span>
              </div>
            </div>
            <div class="dossier-spec-card">
              <span class="dossier-spec-icon">🎯</span>
              <div class="dossier-spec-content">
                <span class="dossier-spec-label">Benchmark</span>
                <span class="dossier-spec-value">FaceForensics++</span>
                <span class="dossier-spec-note">Facial reenactment standard</span>
              </div>
            </div>
            <div class="dossier-spec-card">
              <span class="dossier-spec-icon">🎞️</span>
              <div class="dossier-spec-content">
                <span class="dossier-spec-label">Sampled Timeline</span>
                <span class="dossier-spec-value">${framesCount} Frames</span>
                <span class="dossier-spec-note">${elapsedSeconds}s processing (${device})</span>
              </div>
            </div>
            <div class="dossier-spec-card">
              <span class="dossier-spec-icon">🛡️</span>
              <div class="dossier-spec-content">
                <span class="dossier-spec-label">Data Privacy</span>
                <span class="dossier-spec-value">100% On-Device</span>
                <span class="dossier-spec-note">Local host memory execution</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Plain-English Forensic Guidance -->
        <div class="dossier-advisory-grid">
          <div class="dossier-advisory-card">
            <div class="advisory-title-wrap">
              <span class="advisory-icon">🎯</span>
              <h5>What This Means</h5>
            </div>
            <p class="advisory-text">
              ${isAuthentic
                ? 'The video exhibits consistent facial expressions and continuous motion across sampled frames with no evident synthetic reenactment artifacts.'
                : 'The AI detected statistical inconsistencies typical of facial manipulation or deepfake synthesis across the extracted frames.'}
            </p>
          </div>

          <div class="dossier-advisory-card">
            <div class="advisory-title-wrap">
              <span class="advisory-icon">💡</span>
              <h5>Verification Guidance</h5>
            </div>
            <p class="advisory-text">
              This model evaluates visual facial motion. For high-stakes verification, consider cross-checking audio for voice cloning and reviewing camera EXIF/C2PA metadata.
            </p>
          </div>
        </div>
      </div>
    `;

    // Swap empty state for active results
    emptyStateView.style.display = 'none';
    activeResultsView.style.display = 'flex';
    forensicReportSection.style.display = 'block';

    // Attach click listeners to frame thumbnails for modal
    attachFrameClickListeners();

    // Attach horizontal scroll navigation controls
    const filmstrip = document.getElementById('framesGrid');
    const btnScrollLeft = document.getElementById('btnScrollFramesLeft');
    const btnScrollRight = document.getElementById('btnScrollFramesRight');

    if (filmstrip && btnScrollLeft && btnScrollRight) {
      btnScrollLeft.addEventListener('click', () => {
        filmstrip.scrollBy({ left: -260, behavior: 'smooth' });
      });
      btnScrollRight.addEventListener('click', () => {
        filmstrip.scrollBy({ left: 260, behavior: 'smooth' });
      });

      // Enable horizontal mouse wheel scrolling inside container
      filmstrip.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          filmstrip.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }
  }

  // ── 11. Frame Lightbox Modal Management ──
  function attachFrameClickListeners() {
    const frameCards = document.querySelectorAll('.frame-card');
    frameCards.forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-index'), 10);
        openFrameModal(idx);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const idx = parseInt(card.getAttribute('data-index'), 10);
          openFrameModal(idx);
        }
      });
    });
  }

  function openFrameModal(index) {
    if (!currentSampledFrames || currentSampledFrames.length === 0) return;
    if (index < 0 || index >= currentSampledFrames.length) return;

    currentActiveFrameIndex = index;
    updateModalFrame();
    frameModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeFrameModal() {
    frameModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function updateModalFrame() {
    const total = currentSampledFrames.length;
    modalFrameImg.src = currentSampledFrames[currentActiveFrameIndex];
    modalFrameBadge.textContent = `FRAME #${String(currentActiveFrameIndex + 1).padStart(2, '0')} / ${total}`;
    modalCounterIndicator.textContent = `${currentActiveFrameIndex + 1} of ${total}`;

    let timeText = 'Timestamp: N/A';
    if (videoDuration > 0 && total > 1) {
      const timeSec = ((currentActiveFrameIndex / (total - 1)) * videoDuration).toFixed(2);
      timeText = `Timestamp: ${timeSec}s`;
    }
    modalFrameTime.textContent = timeText;

    btnModalPrev.disabled = currentActiveFrameIndex <= 0;
    btnModalNext.disabled = currentActiveFrameIndex >= total - 1;
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeFrameModal);
  }

  if (btnModalPrev) {
    btnModalPrev.addEventListener('click', () => {
      if (currentActiveFrameIndex > 0) {
        currentActiveFrameIndex--;
        updateModalFrame();
      }
    });
  }

  if (btnModalNext) {
    btnModalNext.addEventListener('click', () => {
      if (currentActiveFrameIndex < currentSampledFrames.length - 1) {
        currentActiveFrameIndex++;
        updateModalFrame();
      }
    });
  }

  // Close modal when clicking backdrop
  frameModal.addEventListener('click', (e) => {
    if (e.target === frameModal) closeFrameModal();
  });

  // ── 12. Forensic Specs & Guide Modal ──
  if (btnOpenGuide) {
    btnOpenGuide.addEventListener('click', () => {
      guideModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  }

  if (btnCloseGuideModal) {
    btnCloseGuideModal.addEventListener('click', () => {
      guideModal.style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  guideModal.addEventListener('click', (e) => {
    if (e.target === guideModal) {
      guideModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  // ── 13. Global Keyboard Shortcuts ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (frameModal.style.display === 'flex') closeFrameModal();
      if (guideModal.style.display === 'flex') {
        guideModal.style.display = 'none';
        document.body.style.overflow = '';
      }
    } else if (frameModal.style.display === 'flex') {
      if (e.key === 'ArrowLeft' && currentActiveFrameIndex > 0) {
        currentActiveFrameIndex--;
        updateModalFrame();
      } else if (e.key === 'ArrowRight' && currentActiveFrameIndex < currentSampledFrames.length - 1) {
        currentActiveFrameIndex++;
        updateModalFrame();
      }
    }
  });

  // ── 14. Export / Print Dossier ──
  if (btnPrintReport) {
    btnPrintReport.addEventListener('click', () => {
      window.print();
    });
  }
});
