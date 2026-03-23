import React from 'react';
import { LightBulbIcon, CheckIcon, CodeBracketIcon, MicrophoneIcon, UserCircleIcon, CpuChipIcon, ChartBarIcon, ClockIcon } from '../constants';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { CatmullRomCurve3, Vector3 } from 'three';
import { Link } from 'react-router-dom';

interface WelcomeProps {
  onStart: () => void;
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}
const Section = ({ children, className = '', id }: SectionProps) => (
  <section id={id} className={`py-24 sm:py-36 lg:py-44 ${className} font-sans`}>
    <div className="max-w-6xl mx-auto px-8 sm:px-16 lg:px-24">
      {children}
    </div>
  </section>
);

const SectionTitle = ({ children, subtitle }: { children: React.ReactNode, subtitle?: string }) => (
  <div className="text-center mb-20 sm:mb-28">
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-sans tracking-tight leading-tight">
      {children}
    </h2>
    {subtitle && <p className="mt-8 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-sans leading-relaxed">{subtitle}</p>}
  </div>
);

// Modern 3D Hero Background: Animated Particles + Floating Glass Panels
// If you want type safety for three.js, run: npm i --save-dev @types/three
function Particles({ count = 120 }) {
  const mesh = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() =>
    Array.from({ length: count }, () => [
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 10
    ]), [count]);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    positions.forEach((pos, i) => {
      const t = clock.getElapsedTime() + i;
      dummy.position.set(
        pos[0] + Math.sin(t * 0.7 + i) * 0.2,
        pos[1] + Math.cos(t * 0.5 + i) * 0.2,
        pos[2] + Math.sin(t * 0.3 + i) * 0.2
      );
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.09, 12, 12]} />
      <meshStandardMaterial color="#67e8f9" emissive="#0ea5e9" emissiveIntensity={0.7} transparent opacity={0.7} />
    </instancedMesh>
  );
}

function GlassPanels({ count = 7 }) {
  const mesh = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const panels = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 6,
      z: (Math.random() - 0.5) * 8,
      r: Math.random() * Math.PI * 2,
      s: 1.2 + Math.random() * 1.8
    })), [count]);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    panels.forEach((panel, i) => {
      const t = clock.getElapsedTime() * 0.5 + i;
      dummy.position.set(
        panel.x + Math.sin(t + i) * 0.3,
        panel.y + Math.cos(t + i) * 0.3,
        panel.z + Math.sin(t * 0.7 + i) * 0.2
      );
      dummy.rotation.set(0, panel.r + Math.sin(t) * 0.2, 0);
      dummy.scale.set(panel.s, panel.s * 0.18, 1);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 0.08]} />
      <meshPhysicalMaterial color="#e0f2fe" roughness={0.1} metalness={0.2} transmission={0.85} thickness={0.5} ior={1.5} transparent opacity={0.7} />
    </instancedMesh>
  );
}

// ...existing code...
function Hero({ onStart }: WelcomeProps) {
  return (
    <div id="home" className="relative text-center py-36 sm:py-48 lg:py-56 overflow-hidden min-h-[800px] flex items-center justify-center font-sans bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">
      {/* 3D Canvas background removed for now due to errors */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-50 to-cyan-400 mb-10 animate-fade-in-up font-sans tracking-tight leading-tight">
          Unlock Your Career Potential
        </h1>
        <p className="max-w-4xl mx-auto text-xl sm:text-2xl text-slate-300 mb-16 animate-fade-in-up delay-200 font-sans leading-relaxed">
          AceMock is your personal AI interview coach. Practice with realistic questions, get instant, detailed feedback, and build the confidence to land your dream job.
        </p>
        <div className="animate-fade-in-up delay-400">
          <button
            onClick={onStart}
            className="bg-cyan-500 text-white font-bold py-5 px-16 rounded-2xl shadow-2xl shadow-cyan-500/20 transform hover:scale-105 transition-all duration-300 ease-in-out text-2xl hover:bg-cyan-400 font-sans"
          >
            Start Your Free Assessment
          </button>
        </div>
      </div>
    </div>
  );
}

function AceTutorSection() {
  return (
    <Section id="acetutor" className="bg-slate-900/80 animate-fade-in-up">
      <SectionTitle subtitle="Your personalized AI-powered study planner, integrated with YouTube and Google Drive.">
        Introducing AceTutor
      </SectionTitle>
      <div className="max-w-3xl mx-auto text-center text-slate-300 text-lg mb-8">
        AceTutor helps you create a day-wise, goal-driven learning path using the best YouTube videos and generates daily study documents for you. Plan your learning journey, get curated resources, and track your progress—all in one place!
      </div>
      <div className="flex justify-center">
        <Link to="/acetutor" className="bg-cyan-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-cyan-500/30 transform hover:scale-105 transition-all duration-300 ease-in-out text-lg border-2 border-transparent hover:border-cyan-300">
          Go to AceTutor
        </Link>
      </div>
    </Section>
  );
}

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

const aboutCards = [
  {
    icon: <CpuChipIcon className="w-10 h-10 text-cyan-400 mb-4" />, 
    title: 'AI-Powered Feedback',
    desc: 'Get instant, actionable feedback on every answer, powered by state-of-the-art AI.'
  },
  {
    icon: <CodeBracketIcon className="w-10 h-10 text-cyan-400 mb-4" />, 
    title: 'Personalized Practice',
    desc: 'Practice with realistic, dynamic questions and coding challenges tailored to your tech stack.'
  },
  {
    icon: <MicrophoneIcon className="w-10 h-10 text-cyan-400 mb-4" />, 
    title: 'Voice & Progress Tools',
    desc: 'Use speech-to-text, voice feedback, and detailed progress reports to master every stage.'
  },
  {
    icon: <ChartBarIcon className="w-10 h-10 text-cyan-400 mb-4" />, 
    title: 'Track & Improve',
    desc: 'Monitor your strengths, pinpoint areas for growth, and build confidence for real interviews.'
  },
];

const ProjectInfo = () => (
  <Section id="projectinfo" className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-fade-in-up">
    <SectionTitle subtitle="What makes AceMock special?">About AceMock</SectionTitle>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto mt-12">
      {aboutCards.map((card, i) => (
        <div key={card.title} className={`flex flex-col items-center bg-slate-800/60 rounded-2xl p-8 border border-slate-700 shadow-lg animate-fade-in-up delay-${i * 100 + 100} hover:scale-105 hover:shadow-cyan-500/30 transition-transform duration-300`}>
          {card.icon}
          <h3 className="text-xl font-bold text-cyan-200 mb-2 text-center">{card.title}</h3>
          <p className="text-slate-300 text-center">{card.desc}</p>
        </div>
      ))}
    </div>
  </Section>
);

const devTeam = [
  { name: 'Sai', role: 'Lead Developer', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Vamsi', role: 'UI/UX Designer', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Surya', role: 'AI Engineer', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
];

const DevTeam = () => (
  <Section id="devteam" className="bg-slate-900/80 animate-fade-in-up">
    <SectionTitle subtitle="Meet the creators behind AceMock">Our Dev Team</SectionTitle>
    <div className="flex flex-wrap justify-center gap-8 mt-8 animate-fade-in-up delay-200">
      {devTeam.map((member, i) => (
        <div key={member.name} className="flex flex-col items-center bg-slate-800/60 rounded-2xl p-6 shadow-lg border border-slate-700 hover:scale-105 hover:shadow-cyan-500/30 transition-transform duration-300 animate-fade-in-up delay-400" style={{ animationDelay: `${i * 100 + 200}ms` }}>
          <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full border-4 border-cyan-400 shadow-md mb-4" />
          <h4 className="text-xl font-bold text-cyan-300 mb-1">{member.name}</h4>
          <p className="text-slate-300 text-base">{member.role}</p>
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
      <AceTutorSection />
      <HowItWorks />
      <Features />
      <ProjectInfo />
      <DevTeam />
      <FinalCTA onStart={onStart}/>
    </div>
  );
}