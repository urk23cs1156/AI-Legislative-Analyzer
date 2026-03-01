# Vidhi — AI Legislative Analyzer

> A citizen-facing dashboard that provides plain-language summaries of Indian parliamentary bills and legal documents using token compression to minimize AI energy usage.

---

## Features

- **Token Compression** — shrinks dense legal text before sending to AI, reducing cost and energy
- **100k+ token support** — map-reduce chunking for very large documents
- **Plain language summaries** — tailored for citizens, farmers, students, or legal professionals
- **Hindi / Simple English** output modes
- **CO₂ savings tracker** — shows environmental impact of compression
- **4 sample bills** — DPDP Act, GST Amendment, Farm Laws, IT Rules 2021

---

## Local Development

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/vidhi-legislative-ai.git
cd vidhi-legislative-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your API key
```bash
cp .env.example .env
# Open .env and replace with your real key
# Get one from https://console.anthropic.com
```

### 4. Run the dev server
```bash
npm run dev       # uses nodemon, auto-restarts on changes
# or
npm start         # plain node
```

### 5. Open in browser
```
http://localhost:3000
```

---

## Deploy to Render

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/vidhi-legislative-ai.git
git push -u origin main
```

### 2. Create a Web Service on Render
1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Set these fields:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

### 3. Add environment variable
In Render dashboard → **Environment** tab:
| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (your real key) |

### 4. Deploy
Click **Deploy** — Render will build and give you a live URL like `https://vidhi-legislative-ai.onrender.com`

---

## Project Structure

```
vidhi/
├── server.js              ← Express backend (API proxy)
├── package.json
├── .env                   ← API key (never committed)
├── .gitignore
└── public/                ← Static frontend
    ├── index.html
    ├── css/
    │   └── styles.css
    └── js/
        ├── compression.js ← Token compression engine
        ├── samples.js     ← Sample bill data
        ├── api.js         ← Calls /api/analyze on our server
        ├── ui.js          ← DOM rendering & events
        └── main.js        ← Orchestrator / analyze() pipeline
```

---

## How Token Compression Works

```
Raw Document (100k tokens)
        ↓
  compressTokens()          ← abbreviate legal boilerplate, strip preambles
        ↓
Compressed (~60k tokens)
        ↓
  chunkDocument()           ← split into 3k-token chunks with overlap
        ↓
[Chunk 1] [Chunk 2] ... [Chunk N]
        ↓
  callChunkSummary() × N    ← MAP: summarise each chunk
        ↓
[Summary 1] ... [Summary N]
        ↓
  callReduceSummary()       ← REDUCE: synthesise into final analysis
        ↓
Citizen Dashboard Output
```

---

## Tech Stack

- **Backend:** Node.js + Express
- **AI:** Anthropic Claude Sonnet (via REST API)
- **Frontend:** Vanilla HTML/CSS/JS (no framework needed)
- **Deploy:** Render (free tier works)


