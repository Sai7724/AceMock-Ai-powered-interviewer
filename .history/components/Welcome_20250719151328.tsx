import React from 'react';
import { LightBulbIcon, CheckIcon, CodeBracketIcon, MicrophoneIcon, UserCircleIcon, CpuChipIcon, ChartBarIcon, ClockIcon } from '../constants';

interface WelcomeProps {
  onStart: () => void;
}

const Section = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <section className={`py-16 sm:py-20 lg:py-24 ${className}`}>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

const SectionTitle = ({ children, subtitle }: { children: React.ReactNode, subtitle?: string }) => (
  <div className="text-center mb-12 sm:mb-16">
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100">
      {children}
    </h2>
    {subtitle && <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

const Hero = ({ onStart }: { onStart: () => void }) => (
  <div id="home" className="relative text-center py-20 sm:py-28 lg:py-32 overflow-hidden">
    {/* Grid background */}
    <div className="absolute inset-0 z-0 bg-grid-pattern"></div>
    {/* Radial gradient overlay */}
    <div className="absolute inset-0 z-0 bg-slate-900 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
    
    <div className="relative z-10 max-w-4xl mx-auto px-4">
       <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-50 to-cyan-400 mb-4 animate-fade-in-up">
           Unlock Your Career Potential
       </h1>
       <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 mb-10 animate-fade-in-up delay-200">
           AceMock is your personal AI interview coach. Practice with realistic questions, get instant, detailed feedback, and build the confidence to land your dream job.
       </p>
       <div className="animate-fade-in-up delay-400">
           <button 
             onClick={onStart} 
             className="bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-cyan-500/20 transform hover:scale-105 transition-all duration-300 ease-in-out text-lg hover:bg-cyan-400"
           >
               Start Your Free Assessment
           </button>
       </div>
    </div>
  </div>
);

const HowItWorks = () => (
  <Section id="howitworks">
    <SectionTitle subtitle="A straightforward path to interview mastery in five simple steps.">
      How It Works
    </SectionTitle>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
      {[
        { icon: <CheckIcon className="w-8 h-8"/>, title: "1. Pick Your Path", description: "Select the language or tech stack you want to focus on." },
        { icon: <MicrophoneIcon className="w-8 h-8"/>, title: "2. Self-Introduction", description: "Record your intro and get feedback on your delivery and structure." },
        { icon: <ClockIcon className="w-8 h-8"/>, title: "3. Aptitude Test", description: "Test your logical and quantitative skills in a timed challenge." },
        { icon: <LightBulbIcon className="w-8 h-8"/>, title: "4. Technical Q&A", description: "Answer a targeted technical question based on your chosen path." },
        { icon: <CodeBracketIcon className="w-8 h-8"/>, title: "5. Coding Challenge", description: "Solve a real-world coding problem in your selected language." }
      ].map((step, i) => (
        <div key={i} className={`p-6 bg-slate-800/50 rounded-xl border border-slate-700 animate-fade-in-up delay-${i * 100 + 100}`}>
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-700/50 text-cyan-400 mx-auto mb-4">
            {step.icon}
          </div>
          <h3 className="text-xl font-bold text-slate-100 mb-2">{step.title}</h3>
          <p className="text-slate-400 text-sm">{step.description}</p>
        </div>
      ))}
    </div>
  </Section>
);

const Features = () => (
  <Section id="features" className="bg-slate-900/70">
    <SectionTitle subtitle="Leverage cutting-edge AI to gain a competitive edge.">
      Why AceMock?
    </SectionTitle>
    <div className="grid md:grid-cols-2 gap-8">
        {[
          { icon: <CpuChipIcon className="w-7 h-7" />, title: "AI-Powered Analysis", description: "Receive granular feedback on your answers, powered by Google's Gemini API for state-of-the-art analysis." },
          { icon: <CodeBracketIcon className="w-7 h-7" />, title: "Personalized Challenges", description: "Practice with questions and coding problems dynamically generated for your chosen tech stack." },
          { icon: <ChartBarIcon className="w-7 h-7" />, title: "Track Your Progress", description: "Detailed scoring and reports help you identify strengths and pinpoint areas for targeted improvement." },
          { icon: <CheckIcon className="w-7 h-7" />, title: "Build Confidence", description: "Walk into any interview room prepared, composed, and ready to demonstrate your true potential." },
        ].map((feature, i) => (
          <div key={i} className={`flex items-start gap-4 p-6 animate-fade-in-up delay-${i * 100 + 100}`}>
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">{feature.title}</h3>
              <p className="mt-1 text-slate-400">{feature.description}</p>
            </div>
          </div>
        ))}
    </div>
  </Section>
);

const FinalCTA = ({ onStart }: { onStart: () => void }) => (
    <Section className="!py-16">
        <div className="text-center">
             <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4 animate-fade-in-up">Ready to Ace Your Next Interview?</h2>
             <p className="text-slate-400 text-lg mb-8 animate-fade-in-up delay-200">Get started now and receive your personalized feedback in minutes.</p>
             <div className="animate-fade-in-up delay-400">
                <button 
                  onClick={onStart} 
                  className="bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-cyan-500/20 transform hover:scale-105 transition-all duration-300 ease-in-out text-lg hover:bg-cyan-400"
                >
                    Begin Your Assessment
                </button>
             </div>
        </div>
    </Section>
);


export default function Welcome({ onStart }: WelcomeProps) {
  return (
    <div className="-m-6 sm:-m-10 animate-fade-in-slow">
      <Hero onStart={onStart} />
      <HowItWorks />
      <Features />
      <FinalCTA onStart={onStart}/>
    </div>
  );
}