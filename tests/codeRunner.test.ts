import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('codeRunner service', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('reports runner capabilities accurately for languages and frameworks', async () => {
    const { getRunnerInfo } = await import('../services/codeRunner');

    expect(getRunnerInfo('JavaScript')).toMatchObject({
      isAvailable: true,
      mode: 'browser',
      inputMode: 'solve-json',
    });

    expect(getRunnerInfo('Python')).toMatchObject({
      isAvailable: true,
      mode: 'remote',
      inputMode: 'stdin',
    });

    expect(getRunnerInfo('React')).toMatchObject({
      isAvailable: false,
      mode: 'none',
    });
  });

  it('returns a clear error when the proxy runner cannot be reached', async () => {
    vi.stubEnv('VITE_CODE_RUNNER_URL', '/api/code-runner');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const { runCode } = await import('../services/codeRunner');

    await expect(runCode('Python', 'print(123)')).rejects.toThrow(
      /Unable to reach the local code-runner proxy/i
    );
  });
});
