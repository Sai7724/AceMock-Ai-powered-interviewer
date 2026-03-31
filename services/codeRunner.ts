export type RunResult = {
  stdout: string;
  stderr: string;
  code?: number;
  signal?: string | null;
};

export type RunnerMode = 'browser' | 'remote' | 'none';
export type RunnerInputMode = 'solve-json' | 'stdin' | 'none';

type RunnerConfig = {
  language: string | null;
  mode: RunnerMode;
  inputMode: RunnerInputMode;
  runtimeLabel: string;
};

const SELECTION_RUNNER_CONFIG: Record<string, RunnerConfig> = {
  JavaScript: {
    language: 'javascript',
    mode: 'browser',
    inputMode: 'solve-json',
    runtimeLabel: 'In-browser JavaScript runtime',
  },
  TypeScript: {
    language: 'typescript',
    mode: 'remote',
    inputMode: 'stdin',
    runtimeLabel: 'TypeScript server runtime',
  },
  Python: {
    language: 'python',
    mode: 'remote',
    inputMode: 'stdin',
    runtimeLabel: 'Python server runtime',
  },
  Java: {
    language: 'java',
    mode: 'remote',
    inputMode: 'stdin',
    runtimeLabel: 'Java server runtime',
  },
  'C++': {
    language: 'cpp',
    mode: 'remote',
    inputMode: 'stdin',
    runtimeLabel: 'C++ server runtime',
  },
  'C#': {
    language: 'csharp',
    mode: 'remote',
    inputMode: 'stdin',
    runtimeLabel: 'C# server runtime',
  },
  Go: {
    language: 'go',
    mode: 'remote',
    inputMode: 'stdin',
    runtimeLabel: 'Go server runtime',
  },
  Rust: {
    language: 'rust',
    mode: 'remote',
    inputMode: 'stdin',
    runtimeLabel: 'Rust server runtime',
  },
  PHP: {
    language: 'php',
    mode: 'remote',
    inputMode: 'stdin',
    runtimeLabel: 'PHP server runtime',
  },
  Ruby: {
    language: 'ruby',
    mode: 'remote',
    inputMode: 'stdin',
    runtimeLabel: 'Ruby server runtime',
  },
  Kotlin: {
    language: 'kotlin',
    mode: 'remote',
    inputMode: 'stdin',
    runtimeLabel: 'Kotlin server runtime',
  },
  Swift: {
    language: 'swift',
    mode: 'remote',
    inputMode: 'stdin',
    runtimeLabel: 'Swift server runtime',
  },
  React: {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  Angular: {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  Vue: {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  Svelte: {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  'Next.js': {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  'Express.js': {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  NestJS: {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  Django: {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  Flask: {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  FastAPI: {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  'Spring Boot': {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  'ASP.NET Core': {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  'Ruby on Rails': {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  Laravel: {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for framework-based challenges',
  },
  'Full-Stack (MERN)': {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for full-stack track challenges',
  },
  'Data Science (Python)': {
    language: null,
    mode: 'none',
    inputMode: 'none',
    runtimeLabel: 'Run console is disabled for library-dependent track challenges',
  },
  'Android (Kotlin)': {
    language: 'kotlin',
    mode: 'remote',
    inputMode: 'stdin',
    runtimeLabel: 'Kotlin server runtime',
  },
  'iOS (Swift)': {
    language: 'swift',
    mode: 'remote',
    inputMode: 'stdin',
    runtimeLabel: 'Swift server runtime',
  },
};

const DEFAULT_DISABLED_RUNNER: RunnerConfig = {
  language: null,
  mode: 'none',
  inputMode: 'none',
  runtimeLabel: 'Run console is not available for this selection',
};


type RunnerEndpoint = {
  url: string;
  attachApiKey: boolean;
  source: 'proxy' | 'direct';
};

function getRunnerEndpoint(): RunnerEndpoint {
  const configuredProxy = import.meta.env.VITE_CODE_RUNNER_URL?.trim();

  if (configuredProxy) {
    return {
      url: configuredProxy,
      attachApiKey: false,
      source: 'proxy',
    };
  }

  // In local dev the Vite dev-server proxy handles /api/code-runner → OneCompiler.
  if (import.meta.env.DEV) {
    return {
      url: '/api/code-runner',
      attachApiKey: false,
      source: 'proxy',
    };
  }

  // Production fallback: browsers block direct calls to OneCompiler due to CORS.
  // If we reach here it means VITE_CODE_RUNNER_URL was not set during the build.
  // Attempting the direct URL would always fail, so surface a clear error instead.
  throw new Error(
    'Code runner is not configured. Set VITE_CODE_RUNNER_URL=/api/code-runner in your Render environment variables and redeploy.'
  );
}

function getDefaultFileName(language: string): string {
  const map: Record<string, string> = {
    javascript: 'main.js',
    typescript: 'main.ts',
    python: 'main.py',
    java: 'Main.java',
    cpp: 'main.cpp',
    csharp: 'main.cs',
    go: 'main.go',
    rust: 'main.rs',
    php: 'main.php',
    ruby: 'main.rb',
    kotlin: 'Main.kt',
    swift: 'main.swift',
  };

  return map[language] ?? 'main.txt';
}

async function parseRunnerResponse(response: Response): Promise<RunResult> {
  // Read as text first so we never crash on an empty or non-JSON body
  const rawText = await response.text();

  if (!rawText.trim()) {
    return {
      stdout: '',
      stderr: `Empty response from code runner (HTTP ${response.status}). Check your proxy configuration.`,
      code: 1,
    };
  }

  let data: Record<string, unknown>;

  try {
    data = JSON.parse(rawText);
  } catch {
    return {
      stdout: '',
      stderr: `Code runner returned unexpected content (HTTP ${response.status}): ${rawText.slice(0, 300)}`,
      code: 1,
    };
  }

  // ── Piston native shape (used in local dev where Vite proxy hits Piston directly) ──
  // { language, version, run: { stdout, stderr, code, signal } }
  if (data.run && typeof data.run === 'object') {
    const run = data.run as Record<string, unknown>;
    return {
      stdout: (run.stdout as string) ?? '',
      stderr: (run.stderr as string) ?? '',
      code:   typeof run.code === 'number' ? run.code : (run.code === 0 ? 0 : 1),
      signal: (run.signal as string | null) ?? null,
    };
  }

  // ── Flattened shape (used in production where Express proxy normalises the response) ──
  // { stdout, stderr, status, code }
  const stdout = (data.stdout as string) ?? '';
  let stderr   = (data.stderr as string) ?? '';
  const status = (data.status as string) ?? '';

  if (data.exception) {
    const ex = data.exception as string;
    stderr = stderr ? `${stderr}\n${ex}` : ex;
  }

  const topLevelMessage = ((data.error ?? data.message) as string) ?? '';
  if (topLevelMessage) {
    stderr = stderr ? `${stderr}\n${topLevelMessage}` : topLevelMessage;
  }

  return {
    stdout,
    stderr,
    code: status === 'success' ? 0 : 1,
  };
}



export function getRunnerInfo(selection: string) {
  const config = SELECTION_RUNNER_CONFIG[selection] ?? DEFAULT_DISABLED_RUNNER;

  return {
    language: config.language,
    mode: config.mode,
    inputMode: config.inputMode,
    runtimeLabel: config.runtimeLabel,
    isAvailable: config.mode !== 'none' && config.language !== null,
  };
}

export function getPistonLanguageForSelection(selection: string): string | null {
  return getRunnerInfo(selection).language;
}

export function getRunnerRuntimeLabel(selection: string): string {
  return getRunnerInfo(selection).runtimeLabel;
}

// Map our internal language names → Piston runtime identifiers.
// This runs on the client so both local dev (Vite proxy) and production (Express proxy) get the right payload.
const PISTON_LANGUAGE_MAP: Record<string, string> = {
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

export async function runCode(selection: string, code: string, stdin = ''): Promise<RunResult> {
  const runner = getRunnerInfo(selection);

  if (!runner.isAvailable || !runner.language || runner.mode !== 'remote') {
    throw new Error(`Remote runner is not available for selection: ${selection}`);
  }

  const endpoint = getRunnerEndpoint();

  // Map the internal language name to what Piston expects
  const pistonLanguage = PISTON_LANGUAGE_MAP[runner.language] ?? runner.language;

  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: pistonLanguage,
        version: '*',           // Piston requires a version field; '*' = latest
        stdin,
        files: [
          {
            name: getDefaultFileName(runner.language),
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
      let details = '';
      try { details = await response.text(); } catch { /* ignore */ }
      throw new Error(
        details
          ? `Execution request failed (${response.status}): ${details}`
          : `Execution request failed: ${response.status} ${response.statusText}`
      );
    }

    return await parseRunnerResponse(response);
  } catch (error) {
    if (error instanceof TypeError && /fetch/i.test(error.message)) {
      throw new Error(
        'Unable to reach the code-runner proxy. Restart the dev server and try again.'
      );
    }
    throw error;
  }
}


export async function checkAvailableLanguages(): Promise<string[]> {
  return Object.keys(SELECTION_RUNNER_CONFIG).filter((selection) => getRunnerInfo(selection).isAvailable);
}
