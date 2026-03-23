import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';

interface LanguageSelectionProps {
  onComplete?: (language: string) => void;
  onLanguageSelect?: (language: string) => void; // Back-compat for tests
}

type LanguageOption = {
  name: string;
  category: 'Language' | 'Framework' | 'Track';
  description: string;
  icon: ReactElement;
};

const IconCircle = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

const LANGUAGE_OPTIONS: LanguageOption[] = [
  // Languages (include those referenced by tests)
  { name: 'JavaScript', category: 'Language', description: 'Versatile for web and beyond.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'TypeScript', category: 'Language', description: 'Typed superset of JavaScript.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Python', category: 'Language', description: 'Great for data, backend, scripting.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Java', category: 'Language', description: 'Enterprise-grade OOP language.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'C++', category: 'Language', description: 'High performance systems programming.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'C#', category: 'Language', description: 'Modern language for .NET ecosystem.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Go', category: 'Language', description: 'Fast, simple, and concurrent.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Rust', category: 'Language', description: 'Memory-safe and fast systems.', icon: <IconCircle className="w-6 h-6" /> },
  // Frameworks
  { name: 'React', category: 'Framework', description: 'Component-driven UI library for the web.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Angular', category: 'Framework', description: 'Full-featured web app framework by Google.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Vue', category: 'Framework', description: 'Progressive framework for building UIs.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Svelte', category: 'Framework', description: 'Compiler for truly reactive web apps.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Next.js', category: 'Framework', description: 'React framework for SSR/SSG and routing.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Express.js', category: 'Framework', description: 'Minimal and flexible Node.js web framework.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'NestJS', category: 'Framework', description: 'Structured Node.js framework with TypeScript.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Django', category: 'Framework', description: 'Batteries-included Python web framework.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Flask', category: 'Framework', description: 'Lightweight Python web microframework.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'FastAPI', category: 'Framework', description: 'High-performance APIs with Python type hints.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Spring Boot', category: 'Framework', description: 'Rapid Java backend development framework.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'ASP.NET Core', category: 'Framework', description: 'Cross-platform, high-performance .NET web.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Ruby on Rails', category: 'Framework', description: 'Convention-over-configuration web framework.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Laravel', category: 'Framework', description: 'Expressive PHP framework for the web.', icon: <IconCircle className="w-6 h-6" /> },
  // Frameworks / Tracks
  { name: 'Full-Stack (MERN)', category: 'Track', description: 'MongoDB, Express, React, Node.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Data Science (Python)', category: 'Track', description: 'Pandas, NumPy, ML basics.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'Android (Kotlin)', category: 'Track', description: 'Native Android development.', icon: <IconCircle className="w-6 h-6" /> },
  { name: 'iOS (Swift)', category: 'Track', description: 'Native iOS development.', icon: <IconCircle className="w-6 h-6" /> },
];

export default function LanguageSelection({ onComplete, onLanguageSelect }: LanguageSelectionProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | LanguageOption['category']>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const categories = useMemo<('All' | LanguageOption['category'])[]>(
    () => ['All', 'Language', 'Framework', 'Track'],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LANGUAGE_OPTIONS.filter(opt => {
      const matchesQuery = q === '' || opt.name.toLowerCase().includes(q) || opt.description.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || opt.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory]);

  const handleSelect = (lang: string) => {
    setSelectedLanguage(lang);
    if (onLanguageSelect) onLanguageSelect(lang); // immediate for test/back-compat
  };

  const handleContinue = () => {
    if (selectedLanguage && onComplete) onComplete(selectedLanguage);
  };

  return (
    <div className="flex flex-col items-center animate-fade-in font-sans w-full">
      {/* Headings (include legacy test string) */}
      <h2 className="text-4xl font-extrabold text-cyan-400 mb-3 tracking-tight text-center">Choose Your Programming Language</h2>
      <p className="text-slate-400 mb-8 text-lg sm:text-xl text-center leading-relaxed max-w-3xl">
        Select the language or technology stack you want to be interviewed on. Your choice will tailor questions and evaluation criteria.
      </p>

      {/* Search + Categories */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              aria-label="Search languages"
              placeholder="Search languages..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-800 text-slate-100 placeholder:text-slate-500 border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 px-4 py-3 outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">⌘K</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg border text-sm whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-700'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl"
      >
        {filtered.map(opt => {
          const selected = selectedLanguage === opt.name;
          return (
            <button
              key={opt.name}
              onClick={() => handleSelect(opt.name)}
              className={`group relative text-left rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
                selected
                  ? 'bg-gradient-to-br from-cyan-600/20 to-blue-600/10 border-cyan-600 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 hover:border-slate-600'
              } p-5`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-cyan-400">{opt.icon}</span>
                <span className="font-semibold text-slate-100 text-lg">{opt.name}</span>
              </div>
              <div className="text-sm text-slate-400 mb-6">{opt.description}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 border border-slate-600">
                  {opt.category}
                </span>
                {selected && (
                  <span className="text-cyan-300 text-xs">Selected</span>
                )}
              </div>
              <span className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>

      {/* Continue */}
      <div className="w-full max-w-4xl mt-10 flex flex-col items-center gap-3">
        <button
          onClick={handleContinue}
          disabled={!selectedLanguage || !onComplete}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-xl px-8 py-4 font-bold text-white shadow-xl transition-all ${
            selectedLanguage && onComplete
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/20'
              : 'bg-slate-700 text-slate-300 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Continue{selectedLanguage ? ` with ${selectedLanguage}` : ''}
        </button>
        <div className="text-xs text-slate-500">
          You can change your selection later in the session settings.
        </div>
      </div>
    </div>
  );
}