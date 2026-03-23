import { corsHeaders } from '../_shared/cors.ts';

const ONECOMPILER_URL = 'https://api.onecompiler.com/v1/run';

type CodeFile = {
  name: string;
  content: string;
};

type RunnerRequest = {
  language?: string;
  stdin?: string;
  files?: CodeFile[];
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const apiKey = Deno.env.get('ONECOMPILER_API_KEY');
  if (!apiKey) {
    return jsonResponse({ error: 'Missing ONECOMPILER_API_KEY secret.' }, 500);
  }

  let payload: RunnerRequest;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON request body.' }, 400);
  }

  if (!payload.language || !Array.isArray(payload.files) || payload.files.length === 0) {
    return jsonResponse({ error: 'language and files are required.' }, 400);
  }

  try {
    const upstreamResponse = await fetch(ONECOMPILER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        language: payload.language,
        stdin: payload.stdin ?? '',
        files: payload.files,
      }),
    });

    const responseText = await upstreamResponse.text();

    return new Response(responseText, {
      status: upstreamResponse.status,
      headers: {
        ...corsHeaders,
        'Content-Type': upstreamResponse.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch (error) {
    console.error('Code runner proxy failed:', error);
    return jsonResponse({ error: 'Failed to reach OneCompiler from the server proxy.' }, 502);
  }
});
