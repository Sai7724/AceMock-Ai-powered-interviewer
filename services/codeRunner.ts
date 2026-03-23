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

const ONECOMPILER_BASE_URL = 'https://api.onecompiler.com/v1/run';

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

  if (import.meta.env.DEV) {
    return {
      url: '/api/code-runner',
      attachApiKey: false,
      source: 'proxy',
    };
  }

  return {
    url: ONECOMPILER_BASE_URL,
    attachApiKey: true,
    source: 'direct',
  };
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
  const data: {
    stdout?: string;
    stderr?: string;
    exception?: string;
    status?: string;
    error?: string;
    message?: string;
  } = await response.json();

  const stdout = data.stdout ?? '';
  let stderr = data.stderr ?? '';
  const status = data.status ?? '';

  if (data.exception) {
    stderr = stderr ? `${stderr}\n${data.exception}` : data.exception;
  }

  const topLevelMessage = data.error ?? data.message ?? '';
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

export async function runCode(selection: string, code: string, stdin = ''): Promise<RunResult> {
  const runner = getRunnerInfo(selection);

  if (!runner.isAvailable || !runner.language || runner.mode !== 'remote') {
    throw new Error(`Remote runner is not available for selection: ${selection}`);
  }

  const endpoint = getRunnerEndpoint();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (endpoint.attachApiKey) {
    const apiKey = import.meta.env.VITE_ONECOMPILER_API_KEY || import.meta.env.VITE_RAPIDAPI_KEY || '';

    if (!apiKey) {
      throw new Error('Missing OneCompiler API key. Set VITE_ONECOMPILER_API_KEY in .env.local.');
    }

    headers['X-API-Key'] = apiKey;
  }

  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        language: runner.language,
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

      try {
        details = await response.text();
      } catch {
        details = '';
      }

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
        endpoint.source === 'proxy'
          ? 'Unable to reach the local code-runner proxy. Restart the dev server and try again.'
          : 'The browser blocked the direct code-runner request. Configure a server-side proxy or use the local dev server.'
      );
    }

    throw error;
  }
}

export async function checkAvailableLanguages(): Promise<string[]> {
  return Object.keys(SELECTION_RUNNER_CONFIG).filter((selection) => getRunnerInfo(selection).isAvailable);
}
