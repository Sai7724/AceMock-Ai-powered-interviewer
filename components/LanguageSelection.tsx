import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import Card from './common/Card';
import GlassButton from './common/GlassButton';

interface LanguageSelectionProps {
  onComplete?: (language: string) => void;
  onLanguageSelect?: (language: string) => void;
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
  { name: 'JavaScript', category: 'Language', description: 'Versatile for web and beyond.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'TypeScript', category: 'Language', description: 'Typed superset of JavaScript.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Python', category: 'Language', description: 'Great for data, backend, scripting.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Java', category: 'Language', description: 'Enterprise-grade OOP language.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'C++', category: 'Language', description: 'High performance systems programming.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'C#', category: 'Language', description: 'Modern language for .NET ecosystem.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Go', category: 'Language', description: 'Fast, simple, and concurrent.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Rust', category: 'Language', description: 'Memory-safe and fast systems.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'React', category: 'Framework', description: 'Component-driven UI library for the web.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Angular', category: 'Framework', description: 'Full-featured web app framework by Google.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Vue', category: 'Framework', description: 'Progressive framework for building UIs.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Svelte', category: 'Framework', description: 'Compiler for truly reactive web apps.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Next.js', category: 'Framework', description: 'React framework for SSR/SSG and routing.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Express.js', category: 'Framework', description: 'Minimal and flexible Node.js web framework.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'NestJS', category: 'Framework', description: 'Structured Node.js framework with TypeScript.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Django', category: 'Framework', description: 'Batteries-included Python web framework.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Flask', category: 'Framework', description: 'Lightweight Python web microframework.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'FastAPI', category: 'Framework', description: 'High-performance APIs with Python type hints.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Spring Boot', category: 'Framework', description: 'Rapid Java backend development framework.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'ASP.NET Core', category: 'Framework', description: 'Cross-platform, high-performance .NET web.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Ruby on Rails', category: 'Framework', description: 'Convention-over-configuration web framework.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Laravel', category: 'Framework', description: 'Expressive PHP framework for the web.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Full-Stack (MERN)', category: 'Track', description: 'MongoDB, Express, React, Node.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Data Science (Python)', category: 'Track', description: 'Pandas, NumPy, ML basics.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'Android (Kotlin)', category: 'Track', description: 'Native Android development.', icon: <IconCircle className="h-6 w-6" /> },
  { name: 'iOS (Swift)', category: 'Track', description: 'Native iOS development.', icon: <IconCircle className="h-6 w-6" /> },
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
    const normalizedQuery = query.trim().toLowerCase();

    return LANGUAGE_OPTIONS.filter((option) => {
      const matchesQuery =
        normalizedQuery === '' ||
        option.name.toLowerCase().includes(normalizedQuery) ||
        option.description.toLowerCase().includes(normalizedQuery);
      const matchesCategory = activeCategory === 'All' || option.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, query]);

  const handleSelect = (language: string) => {
    setSelectedLanguage(language);
    onLanguageSelect?.(language);
  };

  const handleContinue = () => {
    if (selectedLanguage && onComplete) {
      // Trigger fullscreen mode for a locked-in interview experience
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
      onComplete(selectedLanguage);
    }
  };

  return (
    <div className="flex w-full flex-col items-center animate-fade-in font-sans p-8 md:p-10 rounded-[40px] bg-[#0a0d14]/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
      <div className="mb-12 text-center">
        <div className="mb-6 px-4">
          <div className="inline-block text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
            Language Setup
          </div>
        </div>
        <h2 className="mb-4 text-center text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Choose Your Track
        </h2>
        <p className="mx-auto max-w-2xl text-center text-lg text-slate-400">
          Select the technology stack you want to be interviewed on. We'll tailor questions to your expertise.
        </p>
      </div>

      <div className="mb-10 w-full max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <input
              aria-label="Search languages"
              placeholder="Filter by language or framework..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="liquid-input w-full rounded-2xl px-5 py-3.5 text-white placeholder:text-slate-500 bg-white/5 border-white/10"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {categories.map((category) => (
              <GlassButton
                key={category}
                variant={activeCategory === category ? 'primary' : 'secondary'}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeCategory === category
                    ? 'text-slate-950 scale-105'
                    : 'bg-white/5 text-slate-400'
                  }`}
              >
                {category}
              </GlassButton>
            ))}
          </div>
        </div>
      </div>

      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((option) => {
          const selected = selectedLanguage === option.name;

          return (
            <Card
              key={option.name}
              onClick={() => handleSelect(option.name)}
              className={`group cursor-pointer transition-all duration-300 ${selected ? 'border-blue-400/50 shadow-2xl shadow-blue-500/10 scale-[1.02]' : 'hover:scale-[1.02]'
                } !p-0`}
            >
              <div className="p-6">
                <div className="mb-4 flex items-center gap-4">
                  <div className={`p-3 rounded-2xl transition-colors ${selected ? 'bg-blue-500 text-white' : 'bg-white/5 text-blue-400 group-hover:bg-blue-500 group-hover:text-white'}`}>
                    {option.icon}
                  </div>
                  <span className="text-xl font-bold text-white tracking-tight">{option.name}</span>
                </div>
                <p className="mb-6 text-sm text-slate-400 leading-relaxed min-h-[40px]">
                  {option.description}
                </p>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {option.category}
                  </span>
                  {selected && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                      <div className="h-1 w-1 rounded-full bg-current animate-pulse"></div>
                      Selected
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-16 flex w-full max-w-sm flex-col items-center gap-4">
        <GlassButton
          variant={selectedLanguage && onComplete ? 'primary' : 'secondary'}
          onClick={handleContinue}
          disabled={!selectedLanguage || !onComplete}
          className={`group flex w-full items-center justify-center gap-3 rounded-full py-4.5 font-bold text-lg shadow-2xl transition-all duration-300 py-4 ${selectedLanguage && onComplete
              ? 'scale-105 hover:shadow-blue-500/20'
              : 'cursor-not-allowed bg-slate-800 text-slate-500 opacity-50'
            }`}
        >
          {selectedLanguage ? `Confirm ${selectedLanguage}` : 'Select a Track'}
          <svg className={`h-5 w-5 transition-transform duration-300 ${selectedLanguage ? 'group-hover:translate-x-1' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </GlassButton>
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          Requires a camera and microphone for the best experience.
        </p>
      </div>
    </div>
  );
}
