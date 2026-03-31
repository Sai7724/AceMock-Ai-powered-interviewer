import express from 'express';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ─── CORS for the proxy route ────────────────────────────────────────────────
app.use('/api/code-runner', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

// ─── OneCompiler proxy ────────────────────────────────────────────────────────
app.post('/api/code-runner', async (req, res) => {
  const apiKey = process.env.ONECOMPILER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ONECOMPILER_API_KEY is not configured on the server.' });
  }

  try {
    const upstream = await fetch('https://api.onecompiler.com/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('[proxy] OneCompiler fetch failed:', err);
    res.status(502).json({ error: 'Proxy could not reach OneCompiler.', details: String(err) });
  }
});

// ─── Serve the Vite production build ─────────────────────────────────────────
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));

// SPA fallback – send index.html for every unknown route so React Router works
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AceMock server running on port ${PORT}`);
});
