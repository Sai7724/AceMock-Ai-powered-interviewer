// Simple multi-language code runner using the public Piston API
// Docs: https://github.com/engineer-man/piston

export type RunResult = {
  stdout: string;
  stderr: string;
  code?: number; // exit code
  signal?: string | null;
};

// Map selection names to Piston language identifiers
const SELECTION_TO_PISTON_LANG: Record<string, string> = {
  // Languages
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  Python: 'python',
  Java: 'java',
  'C++': 'cpp',
  'C#': 'csharp',
  Go: 'go',
  Rust: 'rust',
  PHP: 'php',
  Ruby: 'ruby',
  Kotlin: 'kotlin',
  Swift: 'swift',

  // Frameworks -> map to their base language
  React: 'javascript',
  Angular: 'typescript',
  Vue: 'javascript',
  Svelte: 'javascript',
  'Next.js': 'javascript',
  'Express.js': 'javascript',
  NestJS: 'typescript',
  Django: 'python',
  Flask: 'python',
  FastAPI: 'python',
  'Spring Boot': 'java',
  'ASP.NET Core': 'csharp',
  'Ruby on Rails': 'ruby',
  Laravel: 'php',

  // Tracks
  'Full-Stack (MERN)': 'javascript',
  'Data Science (Python)': 'python',
  'Android (Kotlin)': 'kotlin',
  'iOS (Swift)': 'swift',
};

export function getPistonLanguageForSelection(selection: string): string | null {
  return SELECTION_TO_PISTON_LANG[selection] ?? null;
}

// Endpoint can be customized via env; default to public Piston endpoint
const DEFAULT_PISTON_URL = 'https://emkc.org/api/v2/piston/execute';
const RUN_URL = (import.meta as any)?.env?.VITE_CODE_RUNNER_URL || DEFAULT_PISTON_URL;

export async function runCode(selection: string, code: string, stdin: string = ''): Promise<RunResult> {
  const language = getPistonLanguageForSelection(selection);
  if (!language) {
    throw new Error(`Runner not available for selection: ${selection}`);
  }

  const body = {
    language,
    // omit version to use the latest available on Piston
    files: [
      {
        name: 'Main',
        content: code,
      },
    ],
    stdin,
  };

  const res = await fetch(RUN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Runner API error (${res.status}): ${msg}`);
  }

  // Piston response shape: { run: { stdout, stderr, code, signal }, compile?: {...} }
  const data = await res.json();
  const run = data.run || {};
  return {
    stdout: String(run.stdout || ''),
    stderr: String(run.stderr || ''),
    code: typeof run.code === 'number' ? run.code : undefined,
    signal: run.signal ?? null,
  };
}


