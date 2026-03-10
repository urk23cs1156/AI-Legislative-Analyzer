/* ─────────────────────────────────────────
   VIDHI  |  js/api.js
   Calls our own Express backend at /api/analyze
   The backend holds the API key — never exposed to browser
───────────────────────────────────────── */

const API_URL = '/api/analyze';   // relative — works locally and on Render

// ── Shared system prompt ──
function getSystemPrompt(audience, lang) {
  const audienceMap = {
    citizen:  'a common Indian citizen with no legal background',
    farmer:   'an Indian farmer with limited formal education',
    business: 'a small or medium business owner in India',
    student:  'an Indian college student',
    legal:    'a legal professional who wants a quick structured overview',
  };
  const langInstr =
    lang === 'hi'     ? 'Respond in Hindi.' :
    lang === 'simple' ? 'Use very simple English at a grade-6 reading level.' :
                        'Respond in clear, plain English.';

  return `You are Vidhi, India's AI Legislative Analyst. You explain Indian laws and parliamentary bills to citizens clearly and accurately. You receive TOKEN-COMPRESSED documents to minimise energy use. ${langInstr}

CRITICAL: Respond ONLY with valid JSON — no preamble, no markdown fences.`;
}

const OUTPUT_SCHEMA = `{
  "title": "short bill name",
  "summary": "2-3 paragraph plain-language summary",
  "eli5": "1 paragraph as if explaining to a 12-year-old",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "groups": [
    {"name": "Group Name", "chip": "citizen|farmer|business|govt|other", "impact": "specific impact"}
  ],
  "concerns": [
    {"text": "concern description", "severity": "high|medium|low"}
  ],
  "readabilityScore": 75,
  "readabilityLabel": "Moderate"
}`;

const CHUNK_SCHEMA = `{
  "chunkSummary": "2-3 sentence summary of this section",
  "keyProvisions": ["provision 1", "provision 2", "provision 3"],
  "entities": ["affected party 1", "affected party 2"],
  "penalties": ["penalty description if any"]
}`;

// ── Base fetch wrapper — hits our server ──
async function callAPI(system, messages) {
  const response = await fetch(API_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ system, messages, max_tokens: 1000 }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Server error ${response.status}`);
  }

  const raw   = data.content.map(b => b.text || '').join('');
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// ── MAP: summarise a single chunk ──
async function callChunkSummary(chunk, index, total, audience, lang) {
  const system = getSystemPrompt(audience, lang) + `\n\nSchema:\n${CHUNK_SCHEMA}`;
  const messages = [{
    role: 'user',
    content: `[CHUNK ${index + 1} of ${total} — compressed legislative text]\n${chunk}\n[END CHUNK]\n\nExtract key provisions and a brief summary of this section only.`,
  }];
  return callAPI(system, messages);
}

// ── REDUCE: merge chunk summaries into final output ──
async function callReduceSummary(chunkSummaries, origTokens, compTokens, audience, lang) {
  const system = getSystemPrompt(audience, lang) + `\n\nSchema:\n${OUTPUT_SCHEMA}`;

  const summaryText = chunkSummaries.map((s, i) =>
    `SECTION ${i + 1}:\nSummary: ${s.chunkSummary}\nProvisions: ${(s.keyProvisions || []).join('; ')}\nEntities: ${(s.entities || []).join(', ')}\nPenalties: ${(s.penalties || []).join('; ')}`
  ).join('\n\n');

  const messages = [{
    role: 'user',
    content: `[MAP-REDUCE SYNTHESIS — ${chunkSummaries.length} sections | ${compTokens} compressed tokens from original ${origTokens}]\n\n${summaryText}\n\n[END SECTIONS]\n\nSynthesise all sections into a complete citizen-facing analysis. Return the JSON.`,
  }];

  return callAPI(system, messages);
}

// ── Main entry point ──
async function callClaude(compressedText, audience, lang, origTokens, compTokens, onChunkProgress) {
  const chunks = chunkDocument(compressedText);

  if (chunks.length === 1) {
    // Small doc — single call
    const system = getSystemPrompt(audience, lang) + `\n\nSchema:\n${OUTPUT_SCHEMA}`;
    const messages = [{
      role: 'user',
      content: `[COMPRESSED DOC — ${compTokens} tokens from original ${origTokens}]\n${compressedText.substring(0, 14000)}\n[END DOC]\n\nAnalyse this Indian legislative document and return the JSON summary.`,
    }];
    return callAPI(system, messages);
  }

  // Large doc — map-reduce
  const chunkSummaries = [];
  for (let i = 0; i < chunks.length; i++) {
    const summary = await callChunkSummary(chunks[i].text, i, chunks.length, audience, lang);
    chunkSummaries.push(summary);
    if (onChunkProgress) onChunkProgress(i + 1, chunks.length);
  }
  return callReduceSummary(chunkSummaries, origTokens, compTokens, audience, lang);
}

// ── Fallback when server/API is unreachable ──
function getFallbackResult() {
  return {
    title: 'Legislative Document',
    summary: 'Could not reach the analysis server. Make sure the server is running and your ANTHROPIC_API_KEY is set in .env.',
    eli5: 'Something went wrong connecting to the AI. Please check your setup and try again.',
    keyPoints: [
      'Ensure server is running: npm run dev',
      'Check that .env contains a valid ANTHROPIC_API_KEY',
      'Verify you are opening the app via http://localhost:3000 (not as a file)',
    ],
    groups: [],
    concerns: [{ text: 'API connection failed — see browser console for details', severity: 'high' }],
    readabilityScore: 0,
    readabilityLabel: 'N/A',
  };
}


