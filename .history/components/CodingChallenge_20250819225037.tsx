import React, { useEffect, useMemo, useRef, useState } from 'react';
import { generateCodingChallenge, evaluateCode } from '../services/geminiService';
import { CodingFeedback } from '../types';
import Spinner from './common/Spinner';
import { getPistonLanguageForSelection, runCode } from '../services/codeRunner';

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
  // Runner state (JS-only for now)
  const [inputText, setInputText] = useState('');
  const [expectedText, setExpectedText] = useState('');
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [runResult, setRunResult] = useState<string>('');
  const [runError, setRunError] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    async function fetchChallenge() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedChallenge = await generateCodingChallenge(language);
        setChallenge(fetchedChallenge);
        setCode(fetchedChallenge.defaultCode);
      } catch (err) {
        setError("Failed to load a coding challenge. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchChallenge();
  }, [language]);

  // Whether runner is available for the selected language
  const isRunnerAvailable = useMemo(() => !!getPistonLanguageForSelection(language) || language.toLowerCase() === 'javascript', [language]);

  // Strip triple backtick fences if present
  function stripCodeFences(src: string): string {
    const fenceMatch = src.match(/^```[a-zA-Z0-9]*\n([\s\S]*?)\n```$/);
    if (fenceMatch) return fenceMatch[1];
    return src;
  }

  // Prepare iframe and message handling
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
    // Sandboxed document that listens for code/input from parent and executes it safely
    return `<!DOCTYPE html>
<html>
<head><meta charset=\"utf-8\" /></head>
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
        const fn = new Function(code + '\n;return (typeof solve!==\\\'undefined\\\')?solve:undefined;');
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
<\/script>
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
      const langId = getPistonLanguageForSelection(language);
      if (langId && langId !== 'javascript') {
        // Use Piston for non-JS languages (and also supports JS/TS)
        const runnable = stripCodeFences(code);
        const result = await runCode(language, runnable, inputText);
        const logs: string[] = [];
        if (result.stdout) logs.push(...result.stdout.split('\n').filter(Boolean));
        setRunLogs(logs);
        setRunResult(result.stdout || '');
        setRunError(result.stderr || '');
      } else {
        // Use iframe runner for JS (keeps console.log capture)
        const iframe = iframeRef.current;
        if (!iframe) return;
        const runnable = stripCodeFences(code);
        iframe.contentWindow?.postMessage({ type: 'runner:exec', code: runnable, input: inputText }, '*');
        // The result will be received via postMessage listener
      }
    } catch (e: any) {
      setRunError(e?.message || String(e));
    } finally {
      // For iframe path, we unset isRunning when message is received; keep a small delay fallback
      if (getPistonLanguageForSelection(language)) setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim() || !challenge) {
      setError("Please provide your code.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const feedback = await evaluateCode(challenge.description, language, code);
      onComplete(feedback);
    } catch (err) {
      setError("Failed to get feedback from AI. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Spinner />
        <p className="mt-4 text-slate-400">Crafting a coding challenge for you...</p>
      </div>
    );
  }

  if (error || !challenge) {
    return <p className="text-red-400 text-center">{error || "Could not load challenge."}</p>;
  }

  return (
    <div className="flex flex-col items-center animate-fade-in font-sans">
      <h2 className="text-4xl font-extrabold text-cyan-400 mb-6 tracking-tight font-sans">Stage 5: Coding Challenge</h2>
      
      <div className="w-full bg-slate-900/50 p-12 rounded-3xl border border-slate-700 mb-12 shadow-2xl font-sans">
        <h3 className="font-bold text-slate-100 text-3xl mb-6 font-sans">{challenge.title}</h3>
        <p className="text-slate-300 whitespace-pre-wrap text-xl leading-relaxed font-sans">{challenge.description}</p>
      </div>
      
      <div className="w-full mb-8">
        <label className="block text-xl font-medium text-slate-400 mb-3 font-sans">Language: <span className="font-bold text-slate-200">{language}</span></label>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Your code solution..."
        className="w-full h-80 p-8 bg-slate-900 border border-slate-700 rounded-2xl font-mono text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300 font-sans"
        spellCheck="false"
        disabled={isSubmitting}
      />

      {error && <p className="text-red-400 mt-6 font-sans">{error}</p>}

      {/* Runner Console (JS only) */}
      <div className="w-full mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-slate-200 font-semibold">Run Console</h4>
            <span className="text-xs text-slate-400">{isRunnerAvailable ? 'JavaScript runtime' : 'Run not available for this language'}</span>
          </div>
          <label className="block text-sm text-slate-400 mb-2">Input (JSON, passed to solve)</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='e.g. {"arr":[1,2,3]}'
            className="w-full h-24 p-3 bg-slate-900 border border-slate-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            spellCheck="false"
            disabled={!isRunnerAvailable}
          />
          <label className="block text-sm text-slate-400 mt-4 mb-2">Expected Output (optional, compared as text)</label>
          <input
            value={expectedText}
            onChange={(e) => setExpectedText(e.target.value)}
            placeholder='e.g. [3,2,1]'
            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            disabled={!isRunnerAvailable}
          />
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleRun}
              disabled={!isRunnerAvailable || isRunning}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-2 px-5 rounded-lg transition-colors"
            >
              {isRunning ? 'Running…' : 'Run'}
            </button>
            {!!runResult && expectedText && (
              <span className={`text-sm font-semibold ${runResult.trim() === expectedText.trim() ? 'text-emerald-400' : 'text-rose-400'}`}>
                {runResult.trim() === expectedText.trim() ? 'Output matches expected' : 'Output does not match expected'}
              </span>
            )}
          </div>
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
          <h4 className="text-slate-200 font-semibold mb-4">Program Output</h4>
          <div className="text-xs text-slate-400 mb-2">Console</div>
          <div className="h-24 overflow-auto bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm font-mono">
            {runLogs.length === 0 ? <div className="text-slate-500">(no console output)</div> : runLogs.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
          <div className="text-xs text-slate-400 mt-4 mb-2">Result (solve return value)</div>
          <div className="min-h-10 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm font-mono break-all">
            {runResult || <span className="text-slate-500">(no result)</span>}
          </div>
          {runError && (
            <div className="mt-3 text-rose-400 text-sm">Error: {runError}</div>
          )}
        </div>
      </div>

      {/* Hidden sandbox iframe (used for JS to capture console) */}
      {language.toLowerCase() === 'javascript' && (
        <iframe
          ref={iframeRef}
          title="runner-sandbox"
          sandbox="allow-scripts"
          style={{ display: 'none' }}
          srcDoc={runnerSrcDoc}
        />
      )}

      <div className="mt-10">
        {isSubmitting ? (
          <Spinner />
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !code.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-5 px-16 rounded-2xl transition-colors duration-300 text-2xl font-sans shadow-xl shadow-cyan-500/20"
          >
            Submit Code
          </button>
        )}
      </div>
    </div>
  );
}