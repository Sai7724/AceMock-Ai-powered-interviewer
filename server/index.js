import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ─── CORS for API routes ──────────────────────────────────────────────────────
app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

// Helper: resolve the API key from multiple possible env var names
function resolveApiKey() {
  return (
    process.env.ONECOMPILER_API_KEY ||
    process.env.VITE_ONECOMPILER_API_KEY ||
    process.env.VITE_RAPIDAPI_KEY ||
    ''
  );
}

// ─── Diagnostic endpoint – call /api/debug in browser to inspect server config ─
app.get('/api/debug', (_req, res) => {
  const key = resolveApiKey();
  res.json({
    hasKey: !!key,
    keyPreview: key ? `${key.slice(0, 8)}...${key.slice(-4)}` : '(none)',
    nodeVersion: process.version,
    platform: process.platform,
    env: {
      ONECOMPILER_API_KEY:      !!process.env.ONECOMPILER_API_KEY,
      VITE_ONECOMPILER_API_KEY: !!process.env.VITE_ONECOMPILER_API_KEY,
      VITE_RAPIDAPI_KEY:        !!process.env.VITE_RAPIDAPI_KEY,
    },
  });
});

// ─── OneCompiler proxy ────────────────────────────────────────────────────────
app.post('/api/code-runner', async (req, res) => {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    return res.status(500).json({
      stdout: '',
      stderr:
        'Server configuration error: No OneCompiler API key found.\n' +
        'Set ONECOMPILER_API_KEY in your Render environment variables.',
      status: 'error',
    });
  }

  const { language, stdin = '', files = [] } = req.body ?? {};
  if (!language) {
    return res.status(400).json({ stdout: '', stderr: 'Missing field: language', status: 'error' });
  }

  const payload = JSON.stringify({ language, stdin, files });
  console.log(`[proxy] → OneCompiler | lang=${language} | keyPrefix=${apiKey.slice(0, 8)}`);

  try {
    const upstream = await fetch('https://api.onecompiler.com/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: payload,
    });

    const rawText = await upstream.text();
    console.log(`[proxy] ← OneCompiler status=${upstream.status} bodyLen=${rawText.length} body=${rawText.slice(0, 400)}`);

    if (!rawText.trim()) {
      // OneCompiler returned 200 with completely empty body.
      // This happens when the free-tier API blocks requests from cloud/datacenter IPs.
      // The key itself may be valid but the plan doesn't support server-to-server calls from this IP.
      return res.status(200).json({
        stdout: '',
        stderr:
          `OneCompiler returned an empty response (HTTP ${upstream.status}).\n` +
          'This usually means the OneCompiler free plan is blocking requests from cloud server IPs.\n' +
          'Check Render logs at /api/debug to verify the key is loaded, then check your OneCompiler plan.',
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
