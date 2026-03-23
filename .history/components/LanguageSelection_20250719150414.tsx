import React, { useState } from 'react';

interface LanguageSelectionProps {
  onComplete: (language: string) => void;
}

const languages = [
  "JavaScript", "Python", "Java", "C++", 
  "Full-Stack (MERN)", "Data Science (Python)", "Android (Kotlin)", "iOS (Swift)"
];

export default function LanguageSelection({ onComplete }: LanguageSelectionProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const handleSelect = (lang: string) => {
    setSelectedLanguage(lang);
  };
  
  const handleSubmit = () => {
    if (selectedLanguage) {
      onComplete(selectedLanguage);
    }
  };

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <h2 className="text-2xl font-bold text-cyan-400 mb-2">Step 1: Choose Your Focus</h2>
      <p className="text-slate-400 mb-8 text-center">Select the language or technology stack you want to be interviewed on.</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-2xl mb-8">
        {languages.map(lang => (
          <button 
            key={lang}
            onClick={() => handleSelect(lang)}
            className={`p-4 rounded-lg text-center font-semibold border-2 transition-all duration-200
              ${selectedLanguage === lang 
                ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/30' 
                : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-slate-500'}`}
          >
            {lang}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedLanguage}
        className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300"
      >
        Continue
      </button>
    </div>
  );
}