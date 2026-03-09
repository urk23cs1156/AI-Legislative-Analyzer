/* ─────────────────────────────────────────
   VIDHI — Legislative AI Dashboard
   js/main.js  —  Orchestrator / analyze()

   Depends on (load order):
     compression.js → samples.js → api.js → ui.js → main.js
───────────────────────────────────────── */

let sessionTokensSaved = 0;

/**
 * analyze()
 * Main pipeline:
 *   1. Read inputs
 *   2. Compress tokens
 *   3. Chunk (if large)
 *   4. Call Claude (single or map-reduce)
 *   5. Render results
 */
async function analyze() {
  const text = document.getElementById('docText').value.trim();
  if (!text || text.length < 50) {
    alert('Please paste a document or select a sample bill to analyze.');
    return;
  }

  const compressionLevel = parseInt(document.getElementById('compressionLevel').value);
  const audience         = document.getElementById('audience').value;
  const lang             = document.getElementById('summaryLang').value;

  // ── Show loading UI ──
  document.getElementById('loadingOverlay').classList.add('active');
  document.getElementById('analyzeBtn').disabled = true;
  document.getElementById('results').classList.remove('visible');

  // Remove any previous chunk progress bar
  const oldBar = document.getElementById('chunkProgressWrap');
  if (oldBar) oldBar.remove();

  // Animate first two loading steps
  await runLoadingSteps();

  // ── Step 1: Token compression ──
  markStepDone(1);
  const origTokens = estimateTokens(text);
  const compressed = compressTokens(text, compressionLevel);
  const compTokens = estimateTokens(compressed);
  const ratio      = ((1 - compTokens / origTokens) * 100).toFixed(1);
  const co2Saved   = ((origTokens - compTokens) * 0.00008).toFixed(3);

  sessionTokensSaved += (origTokens - compTokens);
  document.getElementById('headerSaved').textContent = sessionTokensSaved.toLocaleString();

  // ── Step 2: Determine chunking strategy ──
  const chunks = chunkDocument(compressed);
  const isLarge = chunks.length > 1;

  if (isLarge) {
    // Update step labels to reflect map-reduce
    document.getElementById('step3').querySelector('.step-dot').nextSibling.textContent =
      ` Chunking into ${chunks.length} sections (map-reduce)`;
  }

  markStepDone(2);
  await delay(300);

  // Build display prompt
  const displayPrompt = buildDisplayPrompt(compressed, audience, lang);

  // ── Step 3-4: Call Claude ──
  markStepDone(3);
  let aiResult;

  try {
    aiResult = await callClaude(
      compressed, audience, lang, origTokens, compTokens,
      isLarge ? (done, total) => showChunkProgress(done, total) : null
    );
  } catch (err) {
    console.error('Claude API error:', err);
    aiResult = getFallbackResult();
  }

  // ── Finish loading ──
  markStepDone(4);
  await delay(300);
  finishLoadingSteps();
  await delay(200);

  document.getElementById('loadingOverlay').classList.remove('active');
  document.getElementById('analyzeBtn').disabled = false;

  // ── Populate & show results ──
  populateResults(aiResult, origTokens, compTokens, ratio, co2Saved, displayPrompt);

  document.getElementById('results').classList.add('visible');

  // Animate bars after paint
  setTimeout(() => {
    document.getElementById('effBar').style.width    = ratio + '%';
    document.getElementById('energyBar').style.width = Math.min(95, parseFloat(ratio) + 20) + '%';
    revealResults();
  }, 100);

  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
