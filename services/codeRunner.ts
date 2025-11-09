// Multi-language code runner using the public Piston API
// GET https://emkc.org/api/v2/piston/runtimes
// POST https://emkc.org/api/v2/piston/execute
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

const PISTON_BASE_URL = 'https://piston-api.bun.sh/api/v2';
const RUNTIMES_URL = `${PISTON_BASE_URL}/runtimes`;
const EXECUTE_URL = `${PISTON_BASE_URL}/execute`;

// Cache available runtimes
let availableRuntimes: Record<string, string[]> | null = null;

async function getAvailableRuntimes(): Promise<Record<string, string[]>> {
  if (availableRuntimes) return availableRuntimes;
  
  try {
    const res = await fetch(RUNTIMES_URL);
    if (!res.ok) throw new Error(`Failed to fetch runtimes: ${res.status}`);
    
    const data = await res.json();
    // Group by language name, collect versions
    const runtimes: Record<string, string[]> = {};
    for (const runtime of data) {
      const lang = runtime.language;
      if (!runtimes[lang]) runtimes[lang] = [];
      runtimes[lang].push(runtime.version);
    }
    availableRuntimes = runtimes;
    return runtimes;
  } catch (error) {
    console.warn('Failed to fetch Piston runtimes, using fallback:', error);
    // Fallback to known supported languages
    return {
      javascript: ['18.17.0'],
      python: ['3.10.0'],
      java: ['19.0.2'],
      cpp: ['11.2.0'],
      csharp: ['6.12.0'],
      go: ['1.21.0'],
      rust: ['1.70.0'],
      php: ['8.2.8'],
      ruby: ['3.2.2'],
      kotlin: ['1.9.0'],
      swift: ['5.9.2'],
    };
  }
}

export async function runCode(selection: string, code: string, stdin: string = ''): Promise<RunResult> {
  const language = getPistonLanguageForSelection(selection);
  if (!language) {
    throw new Error(`Runner not available for selection: ${selection}`);
  }

  // Get available runtimes and use the latest version
  const runtimes = await getAvailableRuntimes();
  const versions = runtimes[language];
  if (!versions || versions.length === 0) {
    throw new Error(`Language ${language} not available in Piston runtimes`);
  }
  const version = versions[versions.length - 1]; // Use latest version

  const body = {
    language,
    version,
    files: [
      {
        name: 'Main',
        content: code,
      },
    ],
    stdin,
  };

  const res = await fetch(EXECUTE_URL, {
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

// Export for debugging/testing
export async function checkAvailableLanguages(): Promise<string[]> {
  const runtimes = await getAvailableRuntimes();
  return Object.keys(runtimes);
}


