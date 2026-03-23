import { useEffect, useMemo, useRef, useState } from 'react';
import { generateCodingChallenge, evaluateCode } from '../services/geminiService';
import { CodingFeedback } from '../types';
import Spinner from './common/Spinner';
import { getRunnerInfo, runCode } from '../services/codeRunner';
import GlassButton from './common/GlassButton';
import GlassSurface from './common/GlassSurface';

interface CodingChallengeProps {
  onComplete: (feedback: CodingFeedback) => void;
  language: string;
}

export default function CodingChallenge({ onComplete, language }: CodingChallengeProps) {
  const [challenge, setChallenge] = useState<{ title: string; description: string; defaultCode: string; } | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [expectedText, setExpectedText] = useState('');
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [runResult, setRunResult] = useState<string>('');
  const [runError, setRunError] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const runner = useMemo(() => getRunnerInfo(language), [language]);
  const isRunnerAvailable = runner.isAvailable;
  const usesBrowserRunner = runner.mode === 'browser';

  useEffect(() => {
    async function fetchChallenge() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedChallenge = await generateCodingChallenge(language);
        setChallenge(fetchedChallenge);
        setCode(fetchedChallenge.defaultCode);
      } catch (err) {
        setError('Failed to load a coding challenge. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchChallenge();
  }, [language]);

  function stripCodeFences(src: string): string {
    const fenceMatch = src.match(/^```[a-zA-Z0-9]*\n([\s\S]*?)\n```$/);
    if (fenceMatch) return fenceMatch[1];
    return src;
  }

  useEffect(() => {
    function onMessage(ev: MessageEvent) {
      if (!ev.data || typeof ev.data !== 'object') return;
      if (ev.data.type === 'runner:result') {
        setIsRunning(false);
        setRunLogs(ev.data.logs || []);
        setRunResult(ev.data.result ?? '');
        setRunError(ev.data.error ?? '');
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const runnerSrcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body>
<script>
  (function(){
    const logs = [];
    const origLog = console.log;
    console.log = function(){
      try { logs.push(Array.from(arguments).map(String).join(' ')); } catch(_) {}
      return origLog.apply(console, arguments);
    };
    function safeStringify(v){
      try { return typeof v === 'string' ? v : JSON.stringify(v); } catch(e){ return String(v); }
    }
    window.addEventListener('message', function(ev){
      if(!ev.data || ev.data.type !== 'runner:exec') return;
      const code = ev.data.code || '';
      const inputJson = ev.data.input || '';
      let result = '';
      let error = '';
      try {
        const fn = new Function(code + '\\n;return (typeof solve!==\\\'undefined\\\')?solve:undefined;');
        const solve = fn();
        let inputVal = undefined;
        if (inputJson && inputJson.trim().length > 0) {
          inputVal = JSON.parse(inputJson);
        }
        if (typeof solve === 'function') {
          const r = solve(inputVal);
          result = safeStringify(r);
        } else {
          result = '[No solve() function found]';
        }
      } catch(e){
        error = (e && e.message) ? e.message : String(e);
      }
      parent.postMessage({ type: 'runner:result', logs: logs, result: result, error: error }, '*');
    });
  })();
</script>
</body>
</html>`;
  }, []);

  const handleRun = async () => {
    if (!isRunnerAvailable) return;
    setIsRunning(true);
    setRunLogs([]);
    setRunResult('');
    setRunError('');
    try {
      if (runner.mode === 'remote') {
        const runnable = stripCodeFences(code);
        const result = await runCode(language, runnable, inputText);
        const logs: string[] = [];
        if (result.stdout) logs.push(...result.stdout.split('\n').filter(Boolean));
        setRunLogs(logs);
        setRunResult(result.stdout || '');
        setRunError(result.stderr || '');
      } else if (usesBrowserRunner) {
        const iframe = iframeRef.current;
        if (!iframe) {
          throw new Error('The in-browser runner did not initialize correctly. Refresh and try again.');
        }
        const runnable = stripCodeFences(code);
        iframe.contentWindow?.postMessage({ type: 'runner:exec', code: runnable, input: inputText }, '*');
      }
    } catch (runFailure) {
      setRunError(runFailure instanceof Error ? runFailure.message : String(runFailure));
    } finally {
      if (runner.mode === 'remote') {
        setIsRunning(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!code.trim() || !challenge) {
      setError('Please provide your code.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const feedback = await evaluateCode(challenge.description, language, code);
      onComplete(feedback);
    } catch (err) {
      setError('Failed to get feedback from AI. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <Spinner />
        <p className="liquid-muted mt-4">Crafting a coding challenge for you...</p>
      </div>
    );
  }

  if (error || !challenge) {
    return <p className="text-center text-rose-300">{error || 'Could not load challenge.'}</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center animate-fade-in font-sans">
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={32}
        blur={16}
        opacity={0.8}
        backgroundOpacity={0.06}
        className="text-center p-6 mb-8"
      >
        <p className="liquid-kicker">Stage 3</p>
        <h2 className="liquid-heading mt-3 text-3xl font-extrabold sm:text-4xl tracking-tight">
          Coding Challenge
        </h2>
      </GlassSurface>

      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={32}
        blur={16}
        opacity={0.8}
        backgroundOpacity={0.06}
        className="mb-10 p-8 sm:p-10 lg:p-12"
      >
        <h3 className="liquid-heading mb-5 text-3xl font-bold">{challenge.title}</h3>
        <p className="liquid-copy whitespace-pre-wrap text-lg leading-relaxed sm:text-xl">{challenge.description}</p>
      </GlassSurface>

      <div className="mb-6 w-full">
        <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
          Language
          <span className="liquid-accent ml-3 text-base font-bold tracking-normal normal-case">{language}</span>
        </label>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Your code solution..."
        className="liquid-editor h-80 w-full rounded-[1.75rem] p-6 font-mono text-base sm:text-lg"
        spellCheck="false"
        disabled={isSubmitting}
      />

      {error && <p className="mt-6 text-rose-300">{error}</p>}

      <div className="mt-10 grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          blur={16}
          opacity={0.8}
          backgroundOpacity={0.06}
          className="p-6"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="liquid-heading text-lg font-semibold">Run Console</h4>
            <span className="liquid-chip liquid-chip-accent">{runner.runtimeLabel}</span>
          </div>
          <label className="liquid-muted mb-2 block text-sm">
            {runner.inputMode === 'solve-json' ? 'Input (JSON, passed to solve)' : 'Program Input (stdin)'}
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={runner.inputMode === 'solve-json' ? 'e.g. {"arr":[1,2,3]}' : 'Input sent directly to the program stdin'}
            className="liquid-editor h-24 w-full rounded-2xl p-3 font-mono text-sm"
            spellCheck="false"
            disabled={!isRunnerAvailable}
          />
          <p className="liquid-muted mt-3 text-xs leading-5">
            {runner.inputMode === 'solve-json'
              ? 'The runner will call solve(input) and compare its return value.'
              : isRunnerAvailable
                ? 'Your code must read stdin and print output explicitly for the run console to show results.'
                : 'This challenge type is still evaluated by AI, but direct execution is disabled because the generated code depends on framework or track context.'}
          </p>
          <label className="liquid-muted mt-4 mb-2 block text-sm">Expected Output (optional, compared as text)</label>
          <input
            value={expectedText}
            onChange={(e) => setExpectedText(e.target.value)}
            placeholder="e.g. [3,2,1]"
            className="liquid-input w-full rounded-2xl p-3 font-mono text-sm"
            disabled={!isRunnerAvailable}
          />
          <div className="mt-4 flex items-center gap-3">
            <GlassButton
              variant="secondary"
              type="button"
              onClick={handleRun}
              disabled={!isRunnerAvailable || isRunning}
              className="rounded-full px-5 py-2.5 font-bold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? 'Running...' : 'Run'}
            </GlassButton>
            {!!runResult && expectedText && (
              <span className={`text-sm font-semibold ${runResult.trim() === expectedText.trim() ? 'text-[color:var(--success)]' : 'text-[color:var(--danger)]'}`}>
                {runResult.trim() === expectedText.trim() ? 'Output matches expected' : 'Output does not match expected'}
              </span>
            )}
          </div>
        </GlassSurface>

        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          blur={16}
          opacity={0.8}
          backgroundOpacity={0.06}
          className="p-6"
        >
          <h4 className="liquid-heading mb-4 text-lg font-semibold">Program Output</h4>
          <div className="liquid-muted mb-2 text-xs">Console</div>
          <div className="liquid-editor h-24 overflow-auto rounded-2xl p-3 text-sm font-mono">
            {runLogs.length === 0 ? <div className="text-white/30">(no console output)</div> : runLogs.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
          <div className="liquid-muted mt-4 mb-2 text-xs">
            {runner.inputMode === 'solve-json' ? 'Result (solve return value)' : 'Stdout'}
          </div>
          <div className="liquid-editor min-h-10 rounded-2xl p-3 text-sm font-mono break-all">
            {runResult || <span className="text-white/30">(no result)</span>}
          </div>
          {runError && (
            <div className="mt-3 text-sm text-[color:var(--danger)]">Error: {runError}</div>
          )}
        </GlassSurface>
      </div>

      {usesBrowserRunner && (
        <iframe
          ref={iframeRef}
          title="runner-sandbox"
          sandbox="allow-scripts"
          style={{ display: 'none' }}
          srcDoc={runnerSrcDoc}
        />
      )}

      <div className="mt-10">
        <GlassButton
          onClick={handleSubmit}
          disabled={isSubmitting || !code.trim()}
          className="rounded-full px-12 py-4 text-xl font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? <Spinner /> : 'Submit Code'}
        </GlassButton>
      </div>
    </div>
  );
}
