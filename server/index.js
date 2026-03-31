import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ─── CORS for the proxy route ─────────────────────────────────────────────────
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
    return res.status(500).json({
      stdout: '',
      stderr: 'Server configuration error: ONECOMPILER_API_KEY is not set.',
      status: 'error',
    });
  }

  const { language, stdin = '', files = [] } = req.body ?? {};
  if (!language) {
    return res.status(400).json({ stdout: '', stderr: 'Missing field: language', status: 'error' });
  }

  const payload = JSON.stringify({ language, stdin, files });
  console.log(`[proxy] → OneCompiler | lang=${language} | payload=${payload.slice(0, 120)}`);

  try {
    const upstream = await fetch('https://api.onecompiler.com/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: payload,
    });

    // Always read as text first – prevents "Unexpected end of JSON" on empty bodies
    const rawText = await upstream.text();
    console.log(`[proxy] ← OneCompiler ${upstream.status}: ${rawText.slice(0, 300)}`);

    if (!rawText.trim()) {
      // OneCompiler returned 200 with empty body – likely a plan/key issue
      return res.status(200).json({
        stdout: '',
        stderr:
          `OneCompiler returned an empty ${upstream.status} response. ` +
          'Verify that your ONECOMPILER_API_KEY is valid and your plan supports server-to-server requests.',
        status: 'error',
      });
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(502).json({
        stdout: '',
        stderr: `OneCompiler returned non-JSON (HTTP ${upstream.status}): ${rawText.slice(0, 300)}`,
        status: 'error',
      });
    }

    res.status(upstream.status).json(data);
  } catch (err) {
    console.error('[proxy] fetch error:', err);
    res.status(502).json({
      stdout: '',
      stderr: `Proxy could not reach OneCompiler: ${String(err)}`,
      status: 'error',
    });
  }
});

// ─── Serve the Vite production build ──────────────────────────────────────────
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));

// SPA fallback – React Router
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AceMock server running on port ${PORT}`);
});
