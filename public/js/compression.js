/* ─────────────────────────────────────────
   VIDHI — Legislative AI Dashboard
   js/compression.js  —  Token Compression Engine

   Strategy (matches hackathon "Token Compression" requirement):
   1. Legal boilerplate abbreviation
   2. Redundant phrase stripping
   3. Cross-reference normalization
   4. Structural preamble removal (levels 3+)
   5. Sub-clause deduplication (levels 4+)
   6. Chunking for 100k+ token documents (map-reduce)
───────────────────────────────────────── */

// ── Abbreviation dictionary for Indian legal text ──
const LEGAL_ABBREVS = {
  'Government of India':                          'GoI',
  'Central Government':                           'CG',
  'State Government':                             'SG',
  'Ministry of Finance':                          'MoF',
  'Ministry of Electronics and Information Technology': 'MeitY',
  'notwithstanding anything contained in':        'notwithstanding',
  'in accordance with the provisions of':         'per',
  'subject to the provisions of this Act':        'per this Act',
  'as the case may be':                           '(as applicable)',
  'hereinafter referred to as':                   '→',
  'the aforesaid':                                'said',
  'in connection therewith':                      '(incidental)',
  'or incidental thereto':                        '',
  'for the purposes of':                          'for',
  'Personal Data':                                'PD',
  'Data Principal':                               'DPrincipal',
  'Data Fiduciary':                               'DFid',
  'personal data':                                'PD',
  'information technology':                       'IT',
  'financial year':                               'FY',
  'Goods and Services Tax':                       'GST',
  'Input Tax Credit':                             'ITC',
  'Significant Social Media Intermediary':        'SSMI',
  'Intermediary Guidelines':                      'IG',
  'Data Protection Board of India':               'DPBI',
  'sub-section':                                  'ss',
  'clause':                                       'cl',
  'hereinafter':                                  '(hereafter)',
  'Permanent Account Number':                     'PAN',
  'registered person':                            'reg. person',
};

/**
 * compressTokens(text, level)
 * Returns compressed string. Level 1–5.
 */
function compressTokens(text, level) {
  let out = text;

  // Level 1+ — abbreviate legal terms
  for (const [full, abbr] of Object.entries(LEGAL_ABBREVS)) {
    out = out.replace(new RegExp(full, 'gi'), abbr);
  }

  // Level 1+ — collapse excess whitespace / blank lines
  out = out.replace(/\n{3,}/g, '\n\n').trim();

  // Level 2+ — strip section numbering boilerplate repeated headers
  if (level >= 2) {
    out = out.replace(/\bBe it enacted by Parliament in the\b[^.]+\./gi, '[Enacted by Parliament]');
    out = out.replace(/\bIN WITNESS WHEREOF[^.]+\./gi, '');
  }

  // Level 3+ — remove preamble / SOR / enacting formula
  if (level >= 3) {
    out = out.replace(/IN EXERCISE of the powers conferred[^.]+\./gi, '[Auth: statutory powers]');
    out = out.replace(/A Bill to amend[^.]+\./gi, '[Amendment bill]');
    out = out.replace(/STATEMENT OF OBJECTS AND REASONS[\s\S]*?(?=CHAPTER|PART|KEY|SECTION|\n\d+\.)/i, '[SOR omitted]\n');
    out = out.replace(/An Act to provide for[^.]{0,300}\./gi, '[Act purpose omitted]');
  }

  // Level 4+ — remove sub-clauses that reference parent
  if (level >= 4) {
    out = out.replace(/\([a-z]\) [^;]+(?:as referred to above|as mentioned herein)[^;]+;/gi, '');
    // Collapse repeating penalty boilerplate
    out = out.replace(/(?:shall be liable to a penalty|shall be punishable)[^.]{0,200}\./gi, (m, offset, str) => {
      // Only collapse after the first occurrence
      const prev = str.substring(0, offset);
      return prev.includes('[penalty]') ? '[penalty — see above]' : '[penalty] ' + m;
    });
  }

  // Level 5 — aggressive: strip all sub-clause lettering, flatten structure
  if (level >= 5) {
    out = out.replace(/^\s*\([a-z]\)\s+/gm, '• ');
    out = out.replace(/^\s*\([ivxlcdm]+\)\s+/gim, '  – ');
  }

  return out;
}

// ── CHUNKING FOR 100K+ TOKEN DOCUMENTS ──

const CHUNK_SIZE_CHARS = 12000;   // ~3,000 tokens per chunk — safe for API context
const CHUNK_OVERLAP_CHARS = 800;  // overlap to preserve context across boundaries

/**
 * chunkDocument(text)
 * Splits text into overlapping chunks, respecting paragraph boundaries.
 * Returns array of { index, total, text } objects.
 */
function chunkDocument(text) {
  if (text.length <= CHUNK_SIZE_CHARS) {
    return [{ index: 0, total: 1, text }];
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    let end = start + CHUNK_SIZE_CHARS;

    // Try to break at a paragraph/section boundary rather than mid-sentence
    if (end < text.length) {
      const boundary = text.lastIndexOf('\n\n', end);
      if (boundary > start + CHUNK_SIZE_CHARS * 0.6) {
        end = boundary;
      } else {
        // Fall back to sentence boundary
        const sentBoundary = text.lastIndexOf('. ', end);
        if (sentBoundary > start + CHUNK_SIZE_CHARS * 0.6) {
          end = sentBoundary + 1;
        }
      }
    }

    chunks.push(text.substring(start, Math.min(end, text.length)));
    start = end - CHUNK_OVERLAP_CHARS; // overlap
    if (start >= text.length) break;
  }

  return chunks.map((text, i) => ({ index: i, total: chunks.length, text }));
}

/**
 * estimateTokens(text)
 * Rough estimate: 1 token ≈ 4 characters for English legal text.
 */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * buildDisplayPrompt(compressed, audience, lang)
 * Builds the human-readable "compressed prompt" shown in the UI.
 */
function buildDisplayPrompt(compressed, audience, lang) {
  const audienceMap = {
    citizen:  'common Indian citizen',
    farmer:   'Indian farmer',
    business: 'small business owner',
    student:  'Indian student',
    legal:    'legal professional',
  };
  const langMap = { en: 'English', hi: 'Hindi', simple: 'simple plain English' };

  return `[SYS:analyst|AUD:${audienceMap[audience]}|LANG:${langMap[lang]}|TASK:summarize+keypoints+groups+concerns]
[DOC_COMPRESSED↓]
${compressed.substring(0, 500).replace(/\n/g, '↵')}…
[/DOC]
[OUT:json{title,summary,eli5,keyPoints[],groups[{name,chip,impact}],concerns[{text,severity}],readabilityScore}]`;
}
