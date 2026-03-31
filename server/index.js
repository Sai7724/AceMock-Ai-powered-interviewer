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

    // Read as text first — avoids "Unexpected end of JSON" when body is empty
    const rawText = await upstream.text();
    console.log(`[proxy] OneCompiler responded ${upstream.status}: ${rawText.slice(0, 200)}`);

    if (!rawText.trim()) {
      // Empty body — surface a clear error instead of crashing
      return res.status(upstream.ok ? 200 : upstream.status).json({
        stdout: '',
        stderr: `Code runner returned an empty response (HTTP ${upstream.status}). ` +
                'This usually means an invalid API key or rate limit. Check ONECOMPILER_API_KEY.',
        status: 'error',
      });
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      // Non-JSON body (e.g. HTML error page from a gateway)
      return res.status(502).json({
        stdout: '',
        stderr: `Code runner returned unexpected content (HTTP ${upstream.status}): ${rawText.slice(0, 300)}`,
        status: 'error',
      });
    }

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
