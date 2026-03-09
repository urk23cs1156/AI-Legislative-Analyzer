/* ─────────────────────────────────────────
   VIDHI — Legislative AI Dashboard
   js/ui.js  —  DOM & Results Rendering
───────────────────────────────────────── */

// ── Char / token counter ──
document.getElementById('docText').addEventListener('input', function () {
  const chars  = this.value.length;
  const tokens = estimateTokens(this.value);
  document.getElementById('charCount').textContent =
    `${chars.toLocaleString()} chars / ~${tokens.toLocaleString()} tokens`;
});

// ── Compression slider label ──
function updateCompression(val) {
  document.getElementById('compressionVal').textContent = `${val}×`;
}

// ── Drag & drop / file picker ──
const uploadZone = document.getElementById('uploadZone');

uploadZone.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', ()  => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

document.getElementById('fileInput').addEventListener('change', e => {
  if (e.target.files[0]) handleFile(e.target.files[0]);
});

function handleFile(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('docText').value = ev.target.result;
    document.getElementById('docText').dispatchEvent(new Event('input'));
  };
  reader.readAsText(file);
}

// ── Loading steps ──
const STEP_IDS = ['step1', 'step2', 'step3', 'step4', 'step5'];

async function runLoadingSteps(totalChunks) {
  // Steps 1–2 are fixed; step 3 shows chunk progress for large docs
  for (let i = 0; i < 2; i++) {
    await delay(500);
    if (i > 0) document.getElementById(STEP_IDS[i - 1]).className = 'done';
    document.getElementById(STEP_IDS[i]).className = 'active';
  }
}

function markStepDone(stepIndex) {
  if (stepIndex > 0) document.getElementById(STEP_IDS[stepIndex - 1]).className = 'done';
  if (stepIndex < STEP_IDS.length) document.getElementById(STEP_IDS[stepIndex]).className = 'active';
}

function finishLoadingSteps() {
  STEP_IDS.forEach(id => document.getElementById(id).className = 'done');
}

// ── Chunk progress bar (shown only for large docs) ──
function showChunkProgress(done, total) {
  let el = document.getElementById('chunkProgressWrap');
  if (!el) {
    el = document.createElement('div');
    el.id = 'chunkProgressWrap';
    el.className = 'chunk-progress';
    document.getElementById('loadingOverlay').appendChild(el);
  }
  const pct = Math.round((done / total) * 100);
  el.innerHTML = `
    <div style="color: var(--muted)">Processing chunk <strong style="color:var(--saffron)">${done}</strong> of <strong style="color:var(--saffron)">${total}</strong></div>
    <div class="chunk-bar-wrap"><div class="chunk-bar-fill" style="width:${pct}%"></div></div>
    <div style="color:var(--muted); font-size:0.75rem">Map-Reduce: summarising each section, then synthesising…</div>
  `;
  markStepDone(2);
}

// ── Populate all results into the DOM ──
function populateResults(data, origTokens, compTokens, ratio, co2Saved, compPrompt) {
  // Token banner
  document.getElementById('origTokens').textContent    = origTokens.toLocaleString();
  document.getElementById('compTokens').textContent    = compTokens.toLocaleString();
  document.getElementById('compRatio').textContent     = ratio + '%';
  document.getElementById('co2SavedBanner').textContent = co2Saved;

  // Summary card
  document.getElementById('billTitle').textContent    = data.title || 'Bill Analysis';
  document.getElementById('summaryText').innerHTML    = (data.summary || '').replace(/\n\n/g, '<br><br>');
  document.getElementById('eli5Text').textContent     = data.eli5 || '';

  // Key provisions
  const kpList = document.getElementById('keyPoints');
  kpList.innerHTML = (data.keyPoints || []).map((pt, i) =>
    `<li><span class="point-num">${i + 1}</span><span>${pt}</span></li>`
  ).join('');
  document.getElementById('provisionCount').textContent = `${(data.keyPoints || []).length} items`;

  // Affected groups
  const chipClassMap = {
    citizen: 'chip-citizen', farmer: 'chip-farmer',
    business: 'chip-business', govt: 'chip-govt', other: 'chip-other',
  };
  document.getElementById('groupChips').innerHTML = (data.groups || []).map(g =>
    `<button class="group-chip ${chipClassMap[g.chip] || 'chip-other'}"
       onclick="showGroupDetail('${encodeURIComponent(g.impact)}')">${g.name}</button>`
  ).join('');

  // Concerns
  const sevColors = { high: 'var(--red)', medium: 'var(--token-warn)', low: 'var(--green)' };
  const sevWidth  = { high: '85', medium: '55', low: '30' };
  document.getElementById('concernsBody').innerHTML = (data.concerns || []).length
    ? (data.concerns || []).map(c => `
        <div class="concern-meter">
          <div class="meter-label">
            <span>${c.text}</span>
            <span style="color:${sevColors[c.severity]||'#888'};font-family:IBM Plex Mono;font-size:10px;text-transform:uppercase">${c.severity}</span>
          </div>
          <div class="meter-bar">
            <div class="meter-fill" style="background:${sevColors[c.severity]||'#888'};width:${sevWidth[c.severity]||'40'}%;animation:growBar 1s ease"></div>
          </div>
        </div>`).join('')
    : '<p style="font-size:0.85rem;color:var(--muted)">No major concerns identified.</p>';

  // Compression viz
  document.getElementById('origBlock').textContent = origTokens.toLocaleString();
  document.getElementById('compBlock').textContent = compTokens.toLocaleString();
  document.getElementById('effPct').textContent    = ratio + '%';
  document.getElementById('energyPct').textContent = Math.min(95, parseFloat(ratio) + 18).toFixed(1) + '%';
  document.getElementById('compressedPromptView').textContent = compPrompt;

  // CO2
  document.getElementById('co2Saved').textContent = co2Saved;
  const co2f = parseFloat(co2Saved);
  let ctx =
    co2f < 0.01 ? `Equivalent to keeping a single LED on for ${(co2f * 1000).toFixed(1)} fewer seconds.` :
    co2f < 1    ? `Equivalent to ${(co2f * 12.5).toFixed(1)} fewer seconds of smartphone screen time.` :
                  `Equivalent to charging ${(co2f / 8.22).toFixed(2)} smartphones — saved by compression!`;
  ctx += ` At scale, token compression cuts legislative AI energy use by ~${ratio}% per query.`;
  document.getElementById('co2Context').textContent = ctx;
}

function showGroupDetail(encodedImpact) {
  document.getElementById('groupDetail').textContent = decodeURIComponent(encodedImpact);
}

// ── Reveal animations ──
function revealResults() {
  document.querySelectorAll('.reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120);
  });
}

// ── Action buttons ──
function copyResults() {
  const title   = document.getElementById('billTitle').textContent;
  const summary = document.getElementById('summaryText').innerText;
  const eli5    = document.getElementById('eli5Text').textContent;
  navigator.clipboard
    .writeText(`${title}\n\nSummary:\n${summary}\n\nSimple Explanation:\n${eli5}`)
    .then(() => alert('Summary copied to clipboard!'));
}

function shareResults() {
  if (navigator.share) {
    navigator.share({ title: 'Vidhi — Legislative Summary', text: document.getElementById('summaryText').innerText, url: window.location.href });
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'));
  }
}

function downloadPDF() {
  alert('PDF download: In a production build this generates a formatted PDF via html2pdf.js or a server-side renderer.');
}

// ── Utility ──
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
