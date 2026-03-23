import React, { useState } from 'react';

export default function AceTutor() {
  // Sidebar/config state
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [secondaryTool, setSecondaryTool] = useState<'Drive' | 'Notion'>('Drive');
  const [driveUrl, setDriveUrl] = useState('');
  const [notionUrl, setNotionUrl] = useState('');

  // Main area state
  const [userGoal, setUserGoal] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string[]>([]);

  // UI Handlers (no backend yet)
  const handleGenerate = () => {
    setIsGenerating(true);
    setProgress(0.1);
    setProgressMsg('Setting up agent with tools...');
    setTimeout(() => {
      setProgress(0.3);
      setProgressMsg('Creating AI agent...');
      setTimeout(() => {
        setProgress(0.5);
        setProgressMsg('Generating your learning path...');
        setTimeout(() => {
          setProgress(1.0);
          setProgressMsg('Learning path generation complete!');
          setResult([
            'Day 1: Topic: Introduction to Python\nYouTube Link: https://youtube.com/1',
            'Day 2: Topic: Variables and Data Types\nYouTube Link: https://youtube.com/2',
            '... (Sample output)' 
          ]);
          setIsGenerating(false);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-slate-800 p-6 flex-shrink-0 border-r border-slate-700">
        <h2 className="text-xl font-bold mb-4 text-cyan-400">Configuration</h2>
        <label className="block mb-2 font-semibold">Google API Key</label>
        <input type="password" className="w-full mb-4 p-2 rounded bg-slate-700 text-white" value={googleApiKey} onChange={e => setGoogleApiKey(e.target.value)} placeholder="Enter your Google API Key" />
        <label className="block mb-2 font-semibold">YouTube URL (Required)</label>
        <input type="text" className="w-full mb-4 p-2 rounded bg-slate-700 text-white" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} placeholder="Enter your Pipedream YouTube URL" />
        <div className="mb-2 font-semibold">Select Secondary Tool:</div>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input type="radio" checked={secondaryTool === 'Drive'} onChange={() => setSecondaryTool('Drive')} /> Drive
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={secondaryTool === 'Notion'} onChange={() => setSecondaryTool('Notion')} /> Notion
          </label>
        </div>
        {secondaryTool === 'Drive' ? (
          <>
            <label className="block mb-2 font-semibold">Drive URL</label>
            <input type="text" className="w-full mb-4 p-2 rounded bg-slate-700 text-white" value={driveUrl} onChange={e => setDriveUrl(e.target.value)} placeholder="Enter your Pipedream Drive URL" />
          </>
        ) : (
          <>
            <label className="block mb-2 font-semibold">Notion URL</label>
            <input type="text" className="w-full mb-4 p-2 rounded bg-slate-700 text-white" value={notionUrl} onChange={e => setNotionUrl(e.target.value)} placeholder="Enter your Pipedream Notion URL" />
          </>
        )}
        <div className="mt-8 text-slate-300 text-sm">
          <strong>Quick Guide:</strong>
          <ol className="list-decimal ml-5 mt-2 space-y-1">
            <li>Enter your Google API key and YouTube URL (required)</li>
            <li>Select and configure your secondary tool (Drive or Notion)</li>
            <li>Enter a clear learning goal, for example:<br />
              <span className="italic">"I want to learn python basics in 3 days"</span><br />
              <span className="italic">"I want to learn data science basics in 10 days"</span>
            </li>
          </ol>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">AceTutor - Learning Path Generator</h1>
        <div className="w-full max-w-xl">
          <label className="block mb-2 font-semibold text-lg">Enter Your Goal</label>
          <input
            type="text"
            className="w-full mb-4 p-3 rounded bg-slate-800 text-white border border-slate-700"
            value={userGoal}
            onChange={e => setUserGoal(e.target.value)}
            placeholder="Describe what you want to learn..."
            disabled={isGenerating}
          />
          <button
            className="w-full bg-cyan-500 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-cyan-400 transition mb-6 disabled:opacity-60"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            Generate Learning Path
          </button>
          {/* Progress Bar */}
          {isGenerating || progress === 1.0 ? (
            <div className="mb-6">
              <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden mb-2">
                <div
                  className="bg-cyan-400 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="text-slate-300 text-center">{progressMsg}</div>
            </div>
          ) : null}
          {/* Results */}
          {result.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-cyan-300 mb-4">Your Learning Path</h2>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                {result.map((msg, i) => (
                  <div key={i} className="mb-4 whitespace-pre-line text-slate-200">
                    📚 {msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 