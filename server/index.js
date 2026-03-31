import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Language name → Piston runtime name ─────────────────────────────────────
// Piston uses different identifiers than our internal names.
// Full list: https://emkc.org/api/v2/piston/runtimes
const PISTON_LANGUAGE_MAP = {
  javascript: 'javascript',
  typescript: 'typescript',
  python:     'python',
  java:       'java',
  cpp:        'c++',
  csharp:     'csharp',
  go:         'go',
  rust:       'rust',
  php:        'php',
  ruby:       'ruby',
  kotlin:     'kotlin',
  swift:      'swift',
};

// ─── CORS for the proxy route ─────────────────────────────────────────────────
app.use('/api/code-runner', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

// ─── Piston proxy ─────────────────────────────────────────────────────────────
// Piston is a free, open-source code execution engine with no API key required.
// Docs: https://github.com/engineer-man/piston
app.post('/api/code-runner', async (req, res) => {
  const { language, stdin = '', files = [] } = req.body ?? {};

  if (!language) {
    return res.status(400).json({ error: 'Missing required field: language' });
  }

  // Map our internal language name → Piston language identifier
  const pistonLang = PISTON_LANGUAGE_MAP[language] ?? language;

  const pistonBody = {
    language: pistonLang,
    version: '*',      // always use latest available version
    files,
    stdin,
  };

  console.log(`[proxy] Running ${pistonLang} via Piston…`);

  try {
    const upstream = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pistonBody),
    });

    const rawText = await upstream.text();
    console.log(`[proxy] Piston responded ${upstream.status}: ${rawText.slice(0, 300)}`);

    if (!rawText.trim()) {
      return res.status(502).json({
        error: `Piston returned an empty response (HTTP ${upstream.status}).`,
      });
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(502).json({
        error: `Piston returned non-JSON (HTTP ${upstream.status}): ${rawText.slice(0, 300)}`,
      });
    }

    // Piston wraps output inside data.run; normalise to a flat shape the
    // client's parseRunnerResponse already understands via .stdout / .stderr
    if (data.run) {
      return res.status(200).json({
        stdout: data.run.stdout ?? '',
        stderr: data.run.stderr ?? '',
        // Piston treats code 0 as success
        status: data.run.code === 0 ? 'success' : 'error',
        code:   data.run.code,
        signal: data.run.signal ?? null,
      });
    }

    // If Piston returned an error object (e.g. unsupported language)
    return res.status(upstream.status).json({
      stdout: '',
      stderr: data.message ?? data.error ?? JSON.stringify(data),
      status: 'error',
    });

  } catch (err) {
    console.error('[proxy] Piston fetch failed:', err);
    res.status(502).json({ error: 'Proxy could not reach Piston.', details: String(err) });
  }
});

// ─── Serve the Vite production build ──────────────────────────────────────────
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));

// SPA fallback – React Router needs this
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AceMock server running on port ${PORT}`);
});
