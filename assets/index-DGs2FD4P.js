(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(){let e=document.getElementById(`engineDot`),t=document.getElementById(`engineStatusText`),n=document.getElementById(`badgeDevice`),r=document.getElementById(`deviceText`),i=document.getElementById(`btnThemeToggle`),a=document.getElementById(`btnOpenGuide`),o=document.getElementById(`dropZone`),s=document.getElementById(`fileInput`),c=document.getElementById(`previewArea`),l=document.getElementById(`videoPreview`),u=document.getElementById(`fileNameText`),d=document.getElementById(`fileSizeBadge`),f=document.getElementById(`videoResolutionBadge`),p=document.getElementById(`videoDurationBadge`),m=document.getElementById(`btnRemove`),h=document.getElementById(`btnAnalyze`),g=document.getElementById(`btnLabel`),_=document.getElementById(`errorBanner`),v=document.getElementById(`errorText`),y=document.getElementById(`resultsSection`),b=document.getElementById(`emptyStateView`),x=document.getElementById(`activeResultsView`),S=document.getElementById(`forensicReportSection`),ee=document.getElementById(`reportContentArea`),C=document.getElementById(`btnPrintReport`),w=document.getElementById(`frameModal`),T=document.getElementById(`btnCloseModal`),te=document.getElementById(`modalFrameImg`),ne=document.getElementById(`modalFrameBadge`),re=document.getElementById(`modalFrameTime`),ie=document.getElementById(`modalCounterIndicator`),E=document.getElementById(`btnModalPrev`),D=document.getElementById(`btnModalNext`),O=document.getElementById(`guideModal`),k=document.getElementById(`btnCloseGuideModal`),A=document.getElementById(`landingView`),j=document.getElementById(`workspaceView`),M=document.getElementById(`btnNavHome`),N=document.getElementById(`btnNavWorkspace`),P=document.getElementById(`btnHeaderLaunch`),F=document.getElementById(`btnHeroLaunch`),ae=document.getElementById(`btnHeroSpecs`),oe=document.getElementById(`btnCtaLaunch`),se=document.getElementById(`brandHomeLink`),ce=document.getElementById(`toastContainer`),I=null,L=null,R=0,z=0,B=0,V=[],H=0,U=!1;function W(e,t=`info`,n=4e3){if(!ce)return;let r=document.createElement(`div`);r.className=`toast toast-${t}`;let i=`<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`;t===`success`?i=`<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`:t===`error`&&(i=`<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`),r.innerHTML=`
      <span class="toast-icon" aria-hidden="true">${i}</span>
      <span class="toast-message">${G(e)}</span>
    `,ce.appendChild(r),setTimeout(()=>{r.style.opacity=`0`,r.style.transform=`translateY(8px)`,setTimeout(()=>r.remove(),250)},n)}function G(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function le(){let e=localStorage.getItem(`deepfake_forensics_theme`),t=window.matchMedia&&window.matchMedia(`(prefers-color-scheme: dark)`).matches,n=e||(t?`dark`:`light`);document.documentElement.setAttribute(`data-theme`,n)}function ue(){let e=(document.documentElement.getAttribute(`data-theme`)||`dark`)===`dark`?`light`:`dark`;document.documentElement.setAttribute(`data-theme`,e),localStorage.setItem(`deepfake_forensics_theme`,e),W(`Switched to ${e===`dark`?`Dark`:`Light`} theme`,`info`,2e3)}i&&i.addEventListener(`click`,ue),le();function K(){A&&j&&(j.style.display=`none`,A.style.display=`flex`,M&&M.classList.add(`active`),N&&N.classList.remove(`active`),window.scrollTo({top:0,behavior:`smooth`}))}function q(){A&&j&&(A.style.display=`none`,j.style.display=`block`,M&&M.classList.remove(`active`),N&&N.classList.add(`active`),window.scrollTo({top:0,behavior:`smooth`}))}function de(){O&&(O.style.display=`flex`,document.body.style.overflow=`hidden`)}window.showLanding=K,window.showWorkspace=q,window.openGuideModal=de,M&&M.addEventListener(`click`,K),se&&se.addEventListener(`click`,K),N&&N.addEventListener(`click`,q),P&&P.addEventListener(`click`,q),F&&F.addEventListener(`click`,q),oe&&oe.addEventListener(`click`,q),ae&&ae.addEventListener(`click`,de);function J(e,t=1){if(!e||e===0)return`0 Bytes`;let n=1024,r=t<0?0:t,i=[`Bytes`,`KB`,`MB`,`GB`],a=Math.floor(Math.log(e)/Math.log(n));return parseFloat((e/n**a).toFixed(r))+` `+i[a]}function fe(e){return!e||isNaN(e)?`0.0s`:e<60?`${e.toFixed(1)}s`:`${Math.floor(e/60)}m ${(e%60).toFixed(1)}s`}function pe(){if(window.API_BASE_URL)return window.API_BASE_URL.replace(/\/+$/,``);if([`localhost`,`127.0.0.1`,`0.0.0.0`].includes(window.location.hostname))return``;let e=localStorage.getItem(`deepfake_backend_url`);return e?e.replace(/\/+$/,``):``}async function Y(){try{let i=`${pe()}/api/health`,a=await fetch(i);if(a.ok){let i=((await a.json()).device||`CPU`).toUpperCase();e&&(e.className=`status-indicator-dot online`),t&&(t.textContent=`Engine Ready`),r&&(r.textContent=i===`CUDA`?`CUDA (GPU)`:`CPU Multi-Core`),n&&(i===`CUDA`?n.classList.add(`cuda-active`):n.classList.remove(`cuda-active`))}else throw Error(`Health status: ${a.status}`)}catch{e&&(e.className=`status-indicator-dot offline`),t&&(t.textContent=`Engine Offline`),r&&(r.textContent=`Offline`),n&&n.classList.remove(`cuda-active`)}}Y(),setInterval(Y,3e4);function X(e){v&&(v.textContent=e),_&&(_.style.display=`flex`)}function Z(){_&&(_.style.display=`none`),v&&(v.textContent=``)}function me(e){if(!e)return;Z();let t=[`.mp4`,`.mov`,`.webm`],n=e.name.toLowerCase();t.some(e=>n.endsWith(e))||e.type.startsWith(`video/`)?e.size>262144e3?(X(`File exceeds maximum 250 MB limit (${J(e.size)}). Please choose a shorter clip.`),W(`File exceeds 250 MB size limit`,`error`)):(I=e,L&&URL.revokeObjectURL(L),L=URL.createObjectURL(e),l.src=L,u&&(u.textContent=e.name),d&&(d.textContent=J(e.size)),f&&(f.textContent=`Reading…`),p&&(p.textContent=`0.0s`),l.onloadedmetadata=()=>{R=l.duration||0,z=l.videoWidth||0,B=l.videoHeight||0,p&&(p.textContent=fe(R)),f&&z>0&&B>0&&(f.textContent=`${z}×${B}`)},o.style.display=`none`,c.style.display=`flex`,h.disabled=!1,h.setAttribute(`aria-disabled`,`false`),W(`Loaded ${e.name} (${J(e.size)})`,`success`,3e3)):(X(`Unsupported file type. Please upload an MP4, MOV, or WebM video file.`),W(`Unsupported video file format`,`error`))}o.addEventListener(`click`,()=>s.click()),o.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),s.click())}),[`dragenter`,`dragover`].forEach(e=>{o.addEventListener(e,e=>{e.preventDefault(),e.stopPropagation(),o.classList.add(`drag-active`)})}),[`dragleave`,`drop`].forEach(e=>{o.addEventListener(e,e=>{e.preventDefault(),e.stopPropagation(),o.classList.remove(`drag-active`)})}),o.addEventListener(`drop`,e=>{e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files.length>0&&me(e.dataTransfer.files[0])}),s.addEventListener(`change`,e=>{e.target.files&&e.target.files.length>0&&me(e.target.files[0])}),m.addEventListener(`click`,()=>{U||(L&&=(URL.revokeObjectURL(L),null),I=null,R=0,z=0,B=0,s.value=``,l.src=``,c.style.display=`none`,o.style.display=`block`,h.disabled=!0,h.setAttribute(`aria-disabled`,`true`),Z(),x.style.display=`none`,x.innerHTML=``,S.style.display=`none`,b.style.display=`flex`,W(`Video removed from workspace`,`info`,2e3))}),h.addEventListener(`click`,async()=>{if(!I||U)return;U=!0,Z(),h.disabled=!0,h.setAttribute(`aria-disabled`,`true`);let e=performance.now();g.innerHTML=`
      <span class="spinner-ring" aria-hidden="true"></span>
      <span>Sampling 16 Frames & Inferring with VideoMAE…</span>
    `,W(`Dispatched forensic analysis job...`,`info`,3e3);let t=new FormData;t.append(`file`,I);try{let n=`${pe()}/api/analyze`,r=await fetch(n,{method:`POST`,body:t});if(!r.ok){let e=`Server returned HTTP ${r.status}`;try{let t=await r.json();t&&t.detail&&(e=t.detail)}catch{}throw Error(e)}he(await r.json(),((performance.now()-e)/1e3).toFixed(2)),W(`Forensic analysis successfully completed!`,`success`,4e3),window.innerWidth<1080&&y.scrollIntoView({behavior:`smooth`,block:`start`})}catch(e){console.error(`Forensic Analysis Error:`,e);let t=e.message||`An unexpected error occurred during video analysis.`;X(t),W(t,`error`,6e3)}finally{U=!1,h.disabled=!1,h.setAttribute(`aria-disabled`,`false`),g.innerHTML=`
        <svg class="btn-action-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <span>Re-Run Forensic Analysis</span>
      `}});function he(e,t){let n=e.results||[];V=e.frames||[];let r=(e.device||`cpu`).toUpperCase(),i=e.frames_sampled||V.length||16;if(n.length===0){X(`The model returned an empty prediction array.`);return}let a=n.find(e=>e.label&&e.label.toLowerCase()===`real`)||{label:`real`,score:0},o=n.find(e=>e.label&&e.label.toLowerCase()===`fake`)||{label:`fake`,score:0},s=n[0],c=s.label&&s.label.toLowerCase()===`real`,l=(a.score*100).toFixed(1),u=(o.score*100).toFixed(1),d=(s.score*100).toFixed(1),f=c?`verdict-real`:`verdict-fake`,p=c?`<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zm3.707 6.349a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`:`<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>`,m=c?`AUTHENTIC MEDIA`:`MANIPULATED MEDIA (DEEPFAKE)`,h=c?`The VideoMAE spatio-temporal self-attention backbone found continuous temporal facial alignment and detected no significant deepfake manipulation signatures across the sampled duration (${l}% authenticity confidence).`:`The VideoMAE spatio-temporal self-attention backbone identified temporal manipulation signatures, facial warping, or reenactment synthesis artifacts across the sampled frames (${u}% manipulation confidence).`,g=V.map((e,t)=>{let n=`Frame #${t+1}`;return R>0&&i>1&&(n=`${(t/(i-1)*R).toFixed(2)}s`),`
        <div class="frame-card" data-index="${t}" tabindex="0" role="button" aria-label="Sampled Frame ${t+1} at ${n}">
          <img class="frame-img" src="${e}" alt="Sampled frame ${t+1}" loading="lazy" />
          <span class="frame-badge-index">#${String(t+1).padStart(2,`0`)}</span>
          <span class="frame-badge-time">${n}</span>
          <div class="frame-hover-overlay" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      `}).join(``);x.innerHTML=`
      <!-- 1. Verdict Banner -->
      <div class="verdict-banner-card ${f}" role="region" aria-label="Forensic Classification Verdict">
        <div class="verdict-icon-container" aria-hidden="true">${p}</div>
        <div class="verdict-text-content">
          <div class="verdict-classification-row">
            <h3 class="verdict-title">${m}</h3>
            <span class="verdict-score-pill">${d}% CONFIDENCE</span>
          </div>
          <p class="verdict-summary-text">${h}</p>
          <p class="verdict-disclaimer-text">
            * Probabilistic Assessment: Model outputs represent statistical likelihoods evaluated on 16 sampled frames and do not constitute absolute forensic proof.
          </p>
        </div>
      </div>

      <!-- 2. Summary Metric Cards -->
      <div class="metrics-summary-grid">
        <div class="metric-card">
          <span class="metric-label">Primary Verdict</span>
          <span class="metric-value ${c?`authentic-val`:`manipulated-val`}">
            ${c?`Authentic`:`Deepfake`}
          </span>
          <span class="metric-sub">Top Predicted Class</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Authentic Score</span>
          <span class="metric-value authentic-val">${l}%</span>
          <span class="metric-sub">P(Real) Distribution</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Manipulated Score</span>
          <span class="metric-value manipulated-val">${u}%</span>
          <span class="metric-sub">P(Fake) Distribution</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Sampled Frames</span>
          <span class="metric-value">${i}</span>
          <span class="metric-sub">Uniform Timeline Extract</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Compute Device</span>
          <span class="metric-value">${r}</span>
          <span class="metric-sub">${r===`CUDA`?`GPU Accelerated`:`CPU Multi-Thread`}</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">Inference Latency</span>
          <span class="metric-value">${t}s</span>
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
              <span style="font-family: var(--font-mono); color: var(--authentic-emerald);">${l}%</span>
            </div>
            <div class="prob-bar-track">
              <div class="prob-bar-fill real-fill" style="width: ${l}%;"></div>
            </div>
          </div>

          <div class="prob-bar-group">
            <div class="prob-bar-meta">
              <span style="color: var(--manipulated-crimson);">Manipulated (Facial Deepfake)</span>
              <span style="font-family: var(--font-mono); color: var(--manipulated-crimson);">${u}%</span>
            </div>
            <div class="prob-bar-track">
              <div class="prob-bar-fill fake-fill" style="width: ${u}%;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Sampled Frame Inspection Gallery (Scrollable Timeline Filmstrip) -->
      <div class="sampled-frames-container">
        <div class="frames-section-header">
          <div class="frames-header-left">
            <h3 class="frames-section-title">Timeline Inspection Frames (${i})</h3>
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
            ${g}
          </div>
        </div>

        <p class="frames-explanatory-note">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
          <span>16 frames uniformly extracted across video timeline. Scroll horizontally inside the container to inspect cross-frame transitions.</span>
        </p>
      </div>
    `;let _=new Date().toLocaleDateString(`en-US`,{year:`numeric`,month:`short`,day:`numeric`,hour:`2-digit`,minute:`2-digit`});ee.innerHTML=`
      <div class="dossier-container">
        <!-- 1. Executive Verdict & File Summary Card -->
        <div class="dossier-executive-card">
          <div class="dossier-exec-main">
            <div class="dossier-status-pill ${c?`status-authentic`:`status-manipulated`}">
              <span class="dossier-status-dot"></span>
              <span class="dossier-status-title">${c?`Authentic (Real Video)`:`Manipulated (Deepfake Detected)`}</span>
              <span class="dossier-status-score">${d}% Confidence</span>
            </div>
            <p class="dossier-summary-desc">
              ${c?`Analysis indicates natural spatio-temporal facial movements consistent with original, unmanipulated video footage.`:`Analysis detected temporal facial anomalies and synthetic signatures indicative of AI manipulation or face replacement.`}
            </p>
          </div>
          <div class="dossier-meta-list">
            <div class="dossier-meta-item">
              <span class="dossier-meta-label">File Analyzed</span>
              <span class="dossier-meta-value" title="${G(I?I.name:`Uploaded Video`)}">${G(I?I.name:`Uploaded Video`)}</span>
            </div>
            <div class="dossier-meta-item">
              <span class="dossier-meta-label">Length & Size</span>
              <span class="dossier-meta-value">${fe(R)} • ${I?J(I.size):`N/A`}</span>
            </div>
            <div class="dossier-meta-item">
              <span class="dossier-meta-label">Analyzed At</span>
              <span class="dossier-meta-value">${_}</span>
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
                <tr class="${c?`row-primary`:``}">
                  <td>
                    <div class="dossier-label-cell">
                      <span class="badge-dot dot-authentic"></span>
                      <span>Authentic (Real)</span>
                    </div>
                  </td>
                  <td><strong>${l}%</strong></td>
                  <td><code>${a.score.toFixed(4)}</code></td>
                  <td>
                    <span class="dossier-badge ${c?`badge-primary-verdict`:`badge-secondary`}">
                      ${c?`Primary Verdict`:`Secondary`}
                    </span>
                  </td>
                </tr>
                <tr class="${c?``:`row-primary`}">
                  <td>
                    <div class="dossier-label-cell">
                      <span class="badge-dot dot-manipulated"></span>
                      <span>Manipulated (Deepfake)</span>
                    </div>
                  </td>
                  <td><strong>${u}%</strong></td>
                  <td><code>${o.score.toFixed(4)}</code></td>
                  <td>
                    <span class="dossier-badge ${c?`badge-secondary`:`badge-primary-verdict`}">
                      ${c?`Secondary`:`Primary Verdict`}
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
              <span class="dossier-spec-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 7H7v6h6V7z"/>
                  <path fill-rule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5v10h10V5H5z" clip-rule="evenodd"/>
                </svg>
              </span>
              <div class="dossier-spec-content">
                <span class="dossier-spec-label">Forensic Model</span>
                <span class="dossier-spec-value">VideoMAE</span>
                <span class="dossier-spec-note">Vision Transformer</span>
              </div>
            </div>
            <div class="dossier-spec-card">
              <span class="dossier-spec-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V5z" clip-rule="evenodd"/>
                </svg>
              </span>
              <div class="dossier-spec-content">
                <span class="dossier-spec-label">Benchmark</span>
                <span class="dossier-spec-value">FaceForensics++</span>
                <span class="dossier-spec-note">Facial reenactment standard</span>
              </div>
            </div>
            <div class="dossier-spec-card">
              <span class="dossier-spec-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 0h1v2h-1V5zm1 4h-1v2h1V9zm-1 4h1v2h-1v-2zm-2 2H7v-4h6v4zm-8 0H4v-2h1v2zm-1-4h1V9H4v2zm1-4H4V5h1v2z" clip-rule="evenodd"/>
                </svg>
              </span>
              <div class="dossier-spec-content">
                <span class="dossier-spec-label">Sampled Timeline</span>
                <span class="dossier-spec-value">${i} Frames</span>
                <span class="dossier-spec-note">${t}s processing (${r})</span>
              </div>
            </div>
            <div class="dossier-spec-card">
              <span class="dossier-spec-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35-.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </span>
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
              <span class="advisory-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd"/>
                </svg>
              </span>
              <h5>What This Means</h5>
            </div>
            <p class="advisory-text">
              ${c?`The video exhibits consistent facial expressions and continuous motion across sampled frames with no evident synthetic reenactment artifacts.`:`The AI detected statistical inconsistencies typical of facial manipulation or deepfake synthesis across the extracted frames.`}
            </p>
          </div>

          <div class="dossier-advisory-card">
            <div class="advisory-title-wrap">
              <span class="advisory-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14H8a4 4 0 118 0h-4z"/>
                </svg>
              </span>
              <h5>Verification Guidance</h5>
            </div>
            <p class="advisory-text">
              This model evaluates visual facial motion. For high-stakes verification, consider cross-checking audio for voice cloning and reviewing camera EXIF/C2PA metadata.
            </p>
          </div>
        </div>
      </div>
    `,b.style.display=`none`,x.style.display=`flex`,S.style.display=`block`,ge();let v=document.getElementById(`framesGrid`),y=document.getElementById(`btnScrollFramesLeft`),C=document.getElementById(`btnScrollFramesRight`);v&&y&&C&&(y.addEventListener(`click`,()=>{v.scrollBy({left:-260,behavior:`smooth`})}),C.addEventListener(`click`,()=>{v.scrollBy({left:260,behavior:`smooth`})}),v.addEventListener(`wheel`,e=>{e.deltaY!==0&&(e.preventDefault(),v.scrollLeft+=e.deltaY)},{passive:!1}))}function ge(){document.querySelectorAll(`.frame-card`).forEach(e=>{e.addEventListener(`click`,()=>{_e(parseInt(e.getAttribute(`data-index`),10))}),e.addEventListener(`keydown`,t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),_e(parseInt(e.getAttribute(`data-index`),10)))})})}function _e(e){V&&V.length!==0&&(e<0||e>=V.length||(H=e,$(),w.style.display=`flex`,document.body.style.overflow=`hidden`))}function Q(){w.style.display=`none`,document.body.style.overflow=``}function $(){let e=V.length;te.src=V[H],ne.textContent=`FRAME #${String(H+1).padStart(2,`0`)} / ${e}`,ie.textContent=`${H+1} of ${e}`;let t=`Timestamp: N/A`;R>0&&e>1&&(t=`Timestamp: ${(H/(e-1)*R).toFixed(2)}s`),re.textContent=t,E.disabled=H<=0,D.disabled=H>=e-1}T&&T.addEventListener(`click`,Q),E&&E.addEventListener(`click`,()=>{H>0&&(H--,$())}),D&&D.addEventListener(`click`,()=>{H<V.length-1&&(H++,$())}),w.addEventListener(`click`,e=>{e.target===w&&Q()}),a&&a.addEventListener(`click`,()=>{O.style.display=`flex`,document.body.style.overflow=`hidden`}),k&&k.addEventListener(`click`,()=>{O.style.display=`none`,document.body.style.overflow=``}),O.addEventListener(`click`,e=>{e.target===O&&(O.style.display=`none`,document.body.style.overflow=``)}),document.addEventListener(`keydown`,e=>{e.key===`Escape`?(w.style.display===`flex`&&Q(),O.style.display===`flex`&&(O.style.display=`none`,document.body.style.overflow=``)):w.style.display===`flex`&&(e.key===`ArrowLeft`&&H>0?(H--,$()):e.key===`ArrowRight`&&H<V.length-1&&(H++,$()))}),C&&C.addEventListener(`click`,()=>{window.print()})}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,e):e();