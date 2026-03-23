import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeSlideUp, staggerContainer, heroTitle, heroSubtitle, heroCTA } from '../animations';
import { LightBulbIcon, CheckIcon, CodeBracketIcon, MicrophoneIcon, CpuChipIcon, ChartBarIcon, ClockIcon } from '../constants';
import { Link } from 'react-router-dom';
import Card from './common/Card';
import GlassSurface from './common/GlassSurface';
import GlassButton from './common/GlassButton';

interface WelcomeProps {
  onStart: () => void;
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}
const Section = ({ children, className = '', id }: SectionProps) => (
  <section id={id} className={`scroll-mt-28 py-20 px-6 sm:py-28 sm:px-12 lg:py-36 lg:px-20 ${className} font-sans`}>
    <div className="max-w-7xl mx-auto w-full">
      {children}
    </div>
  </section>
);

const SectionTitle = ({ children, subtitle }: { children: React.ReactNode, subtitle?: string }) => (
  <div className="text-center mb-20 sm:mb-28">
    <h2 className="liquid-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: 'Sora, Manrope, sans-serif' }}>
      {children}
    </h2>
    {subtitle && <p className="liquid-copy mt-8 text-lg sm:text-xl max-w-3xl mx-auto font-sans leading-relaxed">{subtitle}</p>}
  </div>
);

// Sub-task 10.1: Hero entrance animations
function Hero({ onStart }: WelcomeProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section id="home" className="relative flex w-full min-h-[800px] items-center justify-center pt-10 pb-16 px-4">
      <GlassSurface
        width="100%"
        height="100%"
        borderRadius={48}
        blur={24}
        opacity={0.7}
        backgroundOpacity={0.08}
        displace={0.6}
        className="w-full max-w-6xl p-10 sm:p-14 lg:p-20 relative overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center justify-center text-center"
      >
        <div className="liquid-pill inline-flex items-center gap-3 px-6 py-2 text-xs font-bold uppercase tracking-[0.3em] text-cyan-400 border border-cyan-500/30 bg-cyan-500/10">
          The Directive: AI Interview Simulator
        </div>
        <motion.h1
          variants={reduceMotion ? {} : heroTitle}
          initial="hidden"
          animate="visible"
          className="mb-10 mt-12 text-5xl font-extrabold text-white sm:text-7xl xl:text-8xl tracking-tight leading-[1.1]"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Master the <span className="text-cyan-400">Interview.</span>
        </motion.h1>
        <motion.p
          variants={reduceMotion ? {} : heroSubtitle}
          initial="hidden"
          animate="visible"
          className="liquid-copy max-w-3xl text-xl sm:text-2xl mb-16 font-sans leading-relaxed text-slate-400"
        >
          AceMock is your high-fidelity AI interview coach. Practice with realistic scenarios, receive granular editorial feedback, and build the command to land your legacy.
        </motion.p>
        <motion.div
          variants={reduceMotion ? {} : heroCTA}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <GlassButton
              onClick={onStart}
              className="liquid-button-primary rounded-full px-12 py-6 text-lg font-black uppercase tracking-widest sm:px-16"
            >
              Initialize Assessment
            </GlassButton>
            <GlassButton
              as={Link}
              to="/test-stages"
              variant="secondary"
              className="liquid-button-secondary inline-flex items-center justify-center rounded-full px-12 py-6 text-lg font-bold"
            >
              Explore Stages
            </GlassButton>
          </div>
        </motion.div>
        <div className="mt-16 grid w-full max-w-5xl gap-6 sm:grid-cols-3">
          {[
            ['5 stages', 'End-to-end assessment flow with instant AI analysis.'],
            ['Fast feedback', 'Stage-by-stage scoring, weaknesses, and improvement advice.'],
            ['Test mode', 'Validate every round independently before full interviews.'],
          ].map(([title, copy]) => (
            <GlassSurface
              key={title}
              width="100%"
              height="auto"
              borderRadius={28}
              blur={16}
              opacity={0.7}
              backgroundOpacity={0.04}
              displace={0.45}
              className="liquid-card-hover p-5"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--accent-blue-strong)]">{title}</p>
              <p className="liquid-copy mt-3 text-sm leading-6">{copy}</p>
            </GlassSurface>
          ))}
        </div>
      </GlassSurface>
    </section>
  );
}

function AceTutorSection() {
  return (
    <Section id="acetutor">
      <SectionTitle subtitle="Your personalized AI-powered study planner, integrated with YouTube and Google Drive.">
        Introducing AceTutor
      </SectionTitle>
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={32}
        blur={18}
        opacity={0.8}
        backgroundOpacity={0.06}
        displace={0.5}
        className="px-8 py-10 text-center relative overflow-hidden"
      >
        <div className="w-full flex flex-col items-center justify-center">
          <div className="liquid-copy max-w-3xl mx-auto text-lg mb-8">
            AceTutor helps you create a day-wise, goal-driven learning path using the best YouTube videos and generates daily study documents for you. Plan your learning journey, get curated resources, and track your progress all in one place.
          </div>
          <div className="flex justify-center">
            <GlassButton as={Link} to="/acetutor" className="rounded-full px-8 py-3 text-lg font-bold">
              Go to AceTutor
            </GlassButton>
          </div>
        </div>
      </GlassSurface>
    </Section>
  );
}

// Sub-task 10.2: HowItWorks scroll animations
const HowItWorks = () => {
  const reduceMotion = useReducedMotion();
  const sectionVariants = reduceMotion ? {} : fadeSlideUp;
  const gridVariants = reduceMotion ? {} : staggerContainer;
  const cardVariants = reduceMotion ? {} : fadeSlideUp;

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Section id="howitworks">
        <SectionTitle subtitle="A straightforward path to interview mastery in five simple steps.">
          Operational Protocol
        </SectionTitle>
        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-stretch text-center mt-12 w-full max-w-7xl mx-auto"
        >
          {[
            { icon: <CheckIcon className="w-8 h-8" />, title: "1. Vector Selection", description: "Select the language or tech stack you want to focus on." },
            { icon: <MicrophoneIcon className="w-8 h-8" />, title: "2. Narrative Identity", description: "Record your intro and get feedback on your delivery and structure." },
            { icon: <ClockIcon className="w-8 h-8" />, title: "3. Logical Validation", description: "Test your logical and quantitative skills in a timed challenge." },
            { icon: <LightBulbIcon className="w-8 h-8" />, title: "4. Technical Depth", description: "Answer a targeted technical question based on your chosen path." },
            { icon: <CodeBracketIcon className="w-8 h-8" />, title: "5. Execution Proof", description: "Solve a real-world coding problem in your selected language." },
            { icon: <CodeBracketIcon className="w-8 h-8" />, title: "6. Cultural Alignment", description: "Answer common HR questions and get feedback on your responses." },
          ].map((step, i) => (
            <motion.div key={i} variants={cardVariants}>
              <GlassSurface
                className="h-full p-8 md:p-10 border border-white/5 ring-1 ring-white/10 group hover:ring-cyan-500/20 transition-all duration-500"
                borderRadius={32}
                blur={20}
                backgroundOpacity={0.05}
              >
                <div className="flex items-center justify-center h-20 w-20 rounded-3xl bg-cyan-500/5 text-cyan-400 mx-auto mb-8 border border-cyan-500/10 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all duration-500">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </GlassSurface>
            </motion.div>
          ))}
        </motion.div>
      </Section>
    </motion.div>
  );
};

// Sub-task 10.3: Features scroll animations
const Features = () => {
  const reduceMotion = useReducedMotion();
  const sectionVariants = reduceMotion ? {} : fadeSlideUp;
  const gridVariants = reduceMotion ? {} : staggerContainer;
  const cardVariants = reduceMotion ? {} : fadeSlideUp;

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Section id="features">
        <SectionTitle subtitle="Leverage cutting-edge AI to gain a competitive edge.">
          Why AceMock?
        </SectionTitle>
        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mt-12 w-full max-w-7xl mx-auto"
        >
          {[
            { icon: <CpuChipIcon className="w-7 h-7" />, title: "AI-Powered Analysis", description: "Receive granular feedback on your answers, powered by Google's Gemini API for state-of-the-art analysis." },
            { icon: <CodeBracketIcon className="w-7 h-7" />, title: "Personalized Challenges", description: "Practice with questions and coding problems dynamically generated for your chosen tech stack." },
            { icon: <ChartBarIcon className="w-7 h-7" />, title: "Track Your Progress", description: "Detailed scoring and reports help you identify strengths and pinpoint areas for targeted improvement." },
            { icon: <CheckIcon className="w-7 h-7" />, title: "Build Confidence", description: "Walk into any interview room prepared, composed, and ready to demonstrate your true potential." },
          ].map((feature, i) => (
            <motion.div key={i} variants={cardVariants}>
              <Card className="!p-6 sm:!p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl bg-white/10 text-[color:var(--accent-blue-strong)] border border-white/10">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="liquid-heading text-xl font-bold">{feature.title}</h3>
                    <p className="liquid-muted mt-1">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>
    </motion.div>
  );
};

const aboutCards = [
  {
    icon: <CpuChipIcon className="w-10 h-10 text-[color:var(--accent-blue-strong)] mb-4" />,
    title: 'AI-Powered Feedback',
    desc: 'Get instant, actionable feedback on every answer, powered by state-of-the-art AI.'
  },
  {
    icon: <CodeBracketIcon className="w-10 h-10 text-[color:var(--accent-blue-strong)] mb-4" />,
    title: 'Personalized Practice',
    desc: 'Practice with realistic, dynamic questions and coding challenges tailored to your tech stack.'
  },
  {
    icon: <MicrophoneIcon className="w-10 h-10 text-[color:var(--accent-blue-strong)] mb-4" />,
    title: 'Voice & Progress Tools',
    desc: 'Use speech-to-text, voice feedback, and detailed progress reports to master every stage.'
  },
  {
    icon: <ChartBarIcon className="w-10 h-10 text-[color:var(--accent-blue-strong)] mb-4" />,
    title: 'Track & Improve',
    desc: 'Monitor your strengths, pinpoint areas for growth, and build confidence for real interviews.'
  },
];

// Sub-task 10.4: ProjectInfo scroll animations
const ProjectInfo = () => {
  const reduceMotion = useReducedMotion();
  const sectionVariants = reduceMotion ? {} : fadeSlideUp;

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Section id="projectinfo">
        <SectionTitle subtitle="What makes AceMock special?">About AceMock</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full mx-auto mt-12 items-stretch">
          {aboutCards.map((card, i) => (
            <Card key={card.title} className={`animate-fade-in-up delay-${i * 100 + 100} flex flex-col items-center !p-8 text-center`}>
              {card.icon}
              <h3 className="text-xl font-bold text-[color:var(--accent-gold-strong)] mb-2">{card.title}</h3>
              <p className="liquid-copy">{card.desc}</p>
            </Card>
          ))}
        </div>
      </Section>
    </motion.div>
  );
};

const devTeam = [
  { name: 'Sai', role: 'Lead Developer', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Vamsi', role: 'UI/UX Designer', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Surya', role: 'AI Engineer', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
];

// Sub-task 10.5: DevTeam scroll animations
const DevTeam = () => {
  const reduceMotion = useReducedMotion();
  const sectionVariants = reduceMotion ? {} : fadeSlideUp;
  const gridVariants = reduceMotion ? {} : staggerContainer;
  const cardVariants = reduceMotion ? {} : fadeSlideUp;

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Section id="devteam">
        <SectionTitle subtitle="Meet the creators behind AceMock">Our Dev Team</SectionTitle>
        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 justify-center gap-8 max-w-6xl w-full mx-auto mt-12"
        >
          {devTeam.map((member) => (
            <motion.div key={member.name} variants={cardVariants}>
              <Card className="flex flex-col items-center !p-10 text-center h-full w-full">
                <img src={member.avatar} alt={member.name} className="w-28 h-28 rounded-full border-4 border-[color:var(--accent-blue-strong)] shadow-md mb-6" />
                <h4 className="text-xl font-bold text-cyan-300 mb-1">{member.name}</h4>
                <p className="liquid-copy text-base">{member.role}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>
    </motion.div>
  );
};

// Sub-task 10.6: FinalCTA scroll animations
const FinalCTA = ({ onStart }: { onStart: () => void }) => {
  const reduceMotion = useReducedMotion();
  const sectionVariants = reduceMotion ? {} : fadeSlideUp;

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <Section className="!py-16">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={32}
          blur={20}
          opacity={0.8}
          backgroundOpacity={0.06}
          displace={0.5}
          className="p-8 py-10 text-center relative overflow-hidden"
        >
          <div className="w-full flex flex-col items-center justify-center p-4">
            <h2 className="liquid-heading text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'Sora, Manrope, sans-serif' }}>Ready to Ace Your Next Interview?</h2>
            <p className="liquid-copy text-lg mb-8">Get started now and receive your personalized feedback in minutes.</p>
            <GlassButton
              onClick={onStart}
              className="rounded-full px-8 py-4 text-lg font-bold"
            >
              Begin Your Assessment
            </GlassButton>
          </div>
        </GlassSurface>
      </Section>
    </motion.div>
  );
};

export default function Welcome({ onStart }: WelcomeProps) {
  return (
    <div className="-m-6 sm:-m-10 animate-fade-in-slow">
      <Hero onStart={onStart} />
      <AceTutorSection />
      <HowItWorks />
      <Features />
      <ProjectInfo />
      <DevTeam />
      <FinalCTA onStart={onStart} />
    </div>
  );
}
