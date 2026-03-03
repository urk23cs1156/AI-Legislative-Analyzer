require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

console.log('🔑 Groq API Key loaded:', process.env.GROQ_API_KEY ? 'YES ✅' : 'NO ❌');

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Vidhi Legislative AI' });
});

app.post('/api/analyze', async (req, res) => {
  const { system, messages, max_tokens } = req.body;

  if (!system || !messages) {
    return res.status(400).json({ error: 'Missing system or messages.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set in .env' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:      'llama-3.3-70b-versatile',
        max_tokens: max_tokens || 1000,
        temperature: 0.3,
        messages: [
          { role: 'system', content: system },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Groq error:', JSON.stringify(data));
      return res.status(response.status).json({ error: data });
    }

    // Convert Groq response → Anthropic-style so frontend works unchanged
    const text = data.choices?.[0]?.message?.content || '';
    res.json({ content: [{ type: 'text', text }] });

    console.log('✅ Groq call succeeded');

  } catch (err) {
    console.error('❌ Fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Vidhi server running at http://localhost:${PORT}`);
});