import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  staggerContainer, staggerFast, staggerSlow,
  heroTitle, heroSubtitle, heroCTA, cardPop, scaleReveal,
  fadeSlideIn, fadeSlideRight, fadeSlideDown,
} from '../animations';
import { ArrowRight, Compass } from 'lucide-react';
import { LightBulbIcon, CheckIcon, CodeBracketIcon, MicrophoneIcon, CpuChipIcon, ChartBarIcon, ClockIcon } from '../constants';
import { Link } from 'react-router-dom';
import Card from './common/Card';
import ScrollReveal from './common/ScrollReveal';
import { useAuth } from '../App';


interface WelcomeProps { onStart: () => void; }
interface SectionProps { children: React.ReactNode; className?: string; id?: string; }

/* ──────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────── */
const Section = ({ children, className = '', id }: SectionProps) => (
  <section id={id} className={`scroll-mt-28 ${className}`} style={{ padding: 'var(--section-py) var(--section-px)' }}>
    <div className="max-w-7xl mx-auto w-full">{children}</div>
  </section>
);

/**
 * Section heading with:
 * - framer-motion kicker slide-down
 * - GSAP per-word opacity+blur scrub on the h2
 * - GSAP per-word opacity+blur scrub on the subtitle
 */
function SectionTitle({
  children,
  kicker,
  subtitle,
}: {
  children: string;
  kicker?: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-20 sm:mb-28">
      {kicker && (
        <ScrollReveal direction="down" delay={0} margin="-60px">
          <motion.p
            className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.25em]"
            style={{ color: 'var(--accent-gold-strong)', letterSpacing: '0.25em', fontSize: '20px'}}
          >
            {kicker}
          </motion.p>
        </ScrollReveal>
      )}

      <ScrollReveal direction="up" delay={0.1} margin="-40px">
        <h2
          className="font-extrabold tracking-tight leading-tight text-white mb-6"
          style={{
            fontFamily: 'Sora, Inter, system-ui, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
          }}
        >
          {children}
        </h2>
      </ScrollReveal>

      {subtitle && (
        <ScrollReveal direction="up" delay={0.2} margin="-40px">
          <p
            className="max-w-3xl mx-auto leading-relaxed"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            {subtitle}
          </p>
        </ScrollReveal>
      )}
    </div>
  );
}


/* ──────────────────────────────────────────────────────────
   Scroll-progress line at the top of the page
   ────────────────────────────────────────────────────────── */
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[999] origin-left h-[2px]"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, var(--accent-gold-strong), var(--accent-blue-strong))',
      }}
    />
  );
}

/* ──────────────────────────────────────────────────────────
   Hero
   ────────────────────────────────────────────────────────── */
function Hero({ onStart }: WelcomeProps) {
  const rm = useReducedMotion();
  const { user } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  // Subtle parallax: hero content moves up slightly as user scrolls
  const y = useTransform(scrollY, [0, 400], [0, rm ? 0 : -60]);

  return (
    <section
      id="home"
      className="relative flex w-full min-h-[90vh] items-center justify-center pt-20 pb-12"
      ref={ref}
    >
      <motion.div style={{ y }} className="w-full max-w-7xl px-[var(--section-px)]">
        <div className="w-full relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 text-left">
          {/* Left Side: Content */}
          <div className="flex-1 md:text-left text-center flex flex-col items-center md:items-start max-w-2xl">
          {/* Kicker badge */}
          <motion.div
            variants={rm ? {} : fadeSlideDown}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border mb-10"
            style={{
              borderColor: 'rgba(232,195,97,0.35)',
              background: 'rgba(232,195,97,0.08)',
              color: 'var(--accent-gold-strong)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold-strong)] animate-pulse" />
            AI Interview Simulator
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={rm ? {} : heroTitle}
            initial="hidden"
            animate="visible"
            className="mb-8"
            style={{
              fontFamily: 'Sora, Inter, system-ui, sans-serif',
              fontSize: 'clamp(3rem, 6vw, 6rem)',
              fontWeight: 600,
              lineHeight: 1.2,
              letterSpacing: '-0.04em',
              color: '#ffffff',
            }}
          >
            Unlock Your Potential with{' '}
            <span style={{ color: 'var(--accent-gold-strong)' }}>AceMock</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={rm ? {} : heroSubtitle}
            initial="hidden"
            animate="visible"
            className="max-w-2xl text-xl sm:text-2xl mb-14 leading-relaxed"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              color: 'rgba(255,255,255,0.55)',
              fontWeight: 450,
              fontSize: '1.2rem',
            }}
          >
            AceMock is your intelligent AI Interview Simulator. Practice real-world scenarios, receive in-depth feedback, and develop the skills and confidence to land your dream job.
          </motion.p>
        </div>

        {/* Right Side: CTAs */}
        <div className="flex-shrink-0 flex flex-col items-center md:items-end justify-center gap-5 w-full md:w-auto">
          <motion.div
            variants={rm ? {} : heroCTA}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5 w-full md:w-auto"
          >
            <button
              onClick={onStart}
              className="liquid-button-primary inline-flex items-center justify-center rounded-full px-14 py-5 text-lg font-bold uppercase tracking-widest w-full md:w-auto"
            >
              Start Assessment <ArrowRight className="w-5 h-5 ml-1" />
            </button>
            {!user && (
              <Link
                to="/test-stages"
                className="liquid-button-secondary inline-flex items-center justify-center rounded-full px-12 py-5 text-lg font-semibold w-full md:w-auto text-white"
              >
                Explore Stages <Compass className="w-5 h-5 ml-1" />
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      <div className="mt-12 w-full max-w-7xl mx-auto px-[var(--section-px)]">
        {/* Stat pills or other free components */}
        {!user && (
          <motion.div
              variants={rm ? {} : staggerFast}
              initial="hidden"
              animate="visible"
              className="grid w-full max-w-4xl gap-5 sm:grid-cols-3"
            >
              {[
                ['5 Rounds', 'End-to-end simulation'],
                ['Instant Feedback', 'AI-powered scoring'],
                ['Test Mode', 'Per-stage validation'],
              ].map(([title, copy]) => (
                <motion.div variants={rm ? {} : cardPop} key={title}>
                  <div
                    className="p-5 text-left h-full rounded-[24px] liquid-panel"
                  >
                    <p
                      className="text-sm font-bold uppercase tracking-widest mb-1"
                      style={{ color: 'var(--accent-gold-strong)', fontFamily: 'Inter, sans-serif' }}
                    >
                      {title}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
                      {copy}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
        )}
        </div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   AceTutor section
   ────────────────────────────────────────────────────────── */
function AceTutorSection() {
  return (
    <Section id="acetutor">
      <SectionTitle
        kicker="New · AceTutor"
        subtitle="Your personalized AI-powered study planner, integrated with YouTube and Google Drive."
      >
        Introducing AceTutor
      </SectionTitle>
      <ScrollReveal direction="scale" margin="-100px">
        <div
          className="px-10 py-14 text-center relative overflow-hidden rounded-[32px] liquid-panel"
        >

          <p
            className="max-w-3xl mx-auto text-xl mb-10 leading-relaxed relative z-10 text-center"
            style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.65)' }}
          >
            AceTutor creates a goal-driven day-wise learning path using the best YouTube content
            and generates daily study documents. Plan, resource, track — everything in one place.
          </p>
          <div className="flex justify-center relative z-10">
            <Link to="/acetutor" className="liquid-button-secondary rounded-full px-10 py-4 text-lg font-bold inline-flex items-center justify-center text-white">
              Go to AceTutor →
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
}

/* ──────────────────────────────────────────────────────────
   How It Works — alternating left/right card reveal
   ────────────────────────────────────────────────────────── */
const steps = [
  { icon: <CheckIcon className="w-7 h-7" />, title: '01 · Language Selection', desc: 'Pick the language or tech stack you want to focus on.' },
  { icon: <MicrophoneIcon className="w-7 h-7" />, title: '02 · Self Introduction', desc: 'Record your intro and get AI feedback on delivery and structure.' },
  { icon: <ClockIcon className="w-7 h-7" />, title: '03 · Aptitude Round', desc: 'Tackle timed logical and quantitative challenges.' },
  { icon: <LightBulbIcon className="w-7 h-7" />, title: '04 · Technical Round', desc: 'Answer targeted technical questions based on your chosen stack.' },
  { icon: <CodeBracketIcon className="w-7 h-7" />, title: '05 · Coding Round', desc: 'Solve a real-world coding problem in your selected language.' },
  { icon: <CpuChipIcon className="w-7 h-7" />, title: '06 · HR Round ', desc: 'Answer HR questions and receive detailed cultural-fit feedback.' },
];

const HowItWorks = () => {
  const rm = !!useReducedMotion();
  return (
    <Section id="howitworks">
      <SectionTitle
        kicker="The Process"
        subtitle="Six focused rounds -> straight path to interview mastery."
      >
        Operational Protocol
      </SectionTitle>
      <motion.div
        variants={rm ? {} : staggerSlow}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-12"
      >
        {steps.map((step, i) => (
          <motion.div
            key={i}
            variants={rm ? {} : i % 2 === 0 ? fadeSlideIn : fadeSlideRight}
          >
            <div
              className="h-full p-8 border border-white/5 group hover:border-[rgba(232,195,97,0.2)] transition-all duration-500 rounded-[28px] liquid-panel"
            >
              {/* Icon */}
              <ScrollReveal direction="scale" delay={i * 0.06} margin="-40px">
                <div
                  className="mb-6 flex items-center justify-center h-16 w-16 rounded-2xl border border-white/10 group-hover:scale-110 group-hover:border-[rgba(232,195,97,0.3)] transition-all duration-500"
                  style={{ background: 'rgba(232,195,97,0.07)', color: 'var(--accent-gold-strong)' }}
                >
                  {step.icon}
                </div>
              </ScrollReveal>
              <h3
                className="text-lg font-bold mb-3 text-white"
                style={{ fontFamily: 'Sora, Inter, sans-serif', letterSpacing: '-0.01em' }}
              >
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
};

/* ──────────────────────────────────────────────────────────
   Features — two-column with side reveals
   ────────────────────────────────────────────────────────── */
const features = [
  { icon: <CpuChipIcon className="w-6 h-6" />, title: 'AI-Powered Analysis', desc: 'Granular feedback on every answer via Google Gemini for state of the art evaluation.' },
  { icon: <CodeBracketIcon className="w-6 h-6" />, title: 'Personalised Challenges', desc: 'Dynamic questions and coding problems generated for your specific tech stack.' },
  { icon: <ChartBarIcon className="w-6 h-6" />, title: 'Progress Tracking', desc: 'Detailed reports surface strengths and pinpoint areas for targeted improvement.' },
  { icon: <CheckIcon className="w-6 h-6" />, title: 'Real Confidence', desc: 'Walk into any interview room composed, prepared, and ready to demonstrate your potential.' },
];

const Features = () => {
  const rm = !!useReducedMotion();
  return (
    <Section id="features">
      <SectionTitle
        kicker="Why AceMock"
        subtitle="Unlock the power of cutting-edge AI and gain a clear competitive advantage."
      >
        Built Different
      </SectionTitle>
      <motion.div
        variants={rm ? {} : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-7 mt-12"
      >
        {features.map((f, i) => (
          <motion.div key={i} variants={rm ? {} : i % 2 === 0 ? fadeSlideIn : fadeSlideRight}>
            <Card>
              <div className="flex items-start gap-5">
                <ScrollReveal direction="scale" delay={0.1} margin="-40px">
                  <div
                    className="flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-xl border border-white/10"
                    style={{ background: 'rgba(127,181,255,0.1)', color: 'var(--accent-blue-strong)' }}
                  >
                    {f.icon}
                  </div>
                </ScrollReveal>
                <div>
                  <h3
                    className="text-lg font-bold text-white mb-1"
                    style={{ fontFamily: 'Sora, Inter, sans-serif', letterSpacing: '-0.01em' }}
                  >
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
};

/* ──────────────────────────────────────────────────────────
   Project Info / About — fan-out cards
   ────────────────────────────────────────────────────────── */
const aboutCards = [
  { icon: <CpuChipIcon className="w-8 h-8" />, title: 'AI-Powered Feedback', desc: 'Instant, actionable feedback on every answer.' },
  { icon: <CodeBracketIcon className="w-8 h-8" />, title: 'Personalised Practice', desc: 'Dynamic questions tailored to your tech stack.' },
  { icon: <MicrophoneIcon className="w-8 h-8" />, title: 'Voice & Progress', desc: 'Speech to text, voice feedback, and progress reports.' },
  { icon: <ChartBarIcon className="w-8 h-8" />, title: 'Track & Improve', desc: 'Monitor strengths and build confidence for real interviews.' },
];

const ProjectInfo = () => {
  const rm = !!useReducedMotion();
  return (
    <Section id="projectinfo">
      <SectionTitle kicker="About" subtitle="What makes AceMock the smarter choice.">
        About AceMock
      </SectionTitle>
      <motion.div
        variants={rm ? {} : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 mt-12"
      >
        {aboutCards.map((card, i) => (
          <motion.div key={card.title} variants={rm ? {} : cardPop}
            custom={i}
            style={rm ? {} : { '--delay': `${i * 0.1}s` } as React.CSSProperties}
          >
            <Card className="flex flex-col items-center text-center !p-8">
              <ScrollReveal direction="scale" delay={i * 0.08} margin="-40px">
                <div
                  className="mb-5 flex items-center justify-center h-16 w-16 rounded-2xl border border-white/10"
                  style={{ background: 'rgba(232,195,97,0.08)', color: 'var(--accent-gold-strong)' }}
                >
                  {card.icon}
                </div>
              </ScrollReveal>
              <h3
                className="text-base font-bold mb-2"
                style={{ fontFamily: 'Sora, Inter, sans-serif', color: 'var(--accent-gold-strong)' }}
              >
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
                {card.desc}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
};

/* ──────────────────────────────────────────────────────────
   Dev Team
   ────────────────────────────────────────────────────────── */
const devTeam = [
  { name: 'Sai', role: 'Lead Developer', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Vamsi', role: 'AI Engineer', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Surya', role: 'UI/UX Designer', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
];

const DevTeam = () => {
  const rm = !!useReducedMotion();
  return (
    <Section id="devteam">
      <SectionTitle kicker="The Team" subtitle="The people behind the mission.">
        Our Dev Team
      </SectionTitle>
      <motion.div
        variants={rm ? {} : staggerSlow}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-7 max-w-3xl mx-auto mt-12"
      >
        {devTeam.map((m, i) => (
          <motion.div key={m.name} variants={rm ? {} : scaleReveal}>
            <Card className="flex flex-col items-center text-center !p-10">
              <ScrollReveal direction="scale" delay={i * 0.12} margin="-40px">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-24 h-24 rounded-full mb-5 ring-2 ring-[rgba(232,195,97,0.4)] ring-offset-2 ring-offset-transparent"
                />
              </ScrollReveal>
              <h4
                className="text-lg font-bold text-white mb-1"
                style={{ fontFamily: 'Sora, Inter, sans-serif' }}
              >
                {m.name}
              </h4>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>
                {m.role}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
};

/* ──────────────────────────────────────────────────────────
   Final CTA
   ────────────────────────────────────────────────────────── */
const FinalCTA = ({ onStart }: { onStart: () => void }) => {
  return (
    <Section className="!py-16">
      <ScrollReveal direction="scale" margin="-60px">
        <div
          className="p-10 sm:p-16 text-center relative overflow-hidden rounded-[36px] liquid-panel"
        >

          <div className="relative z-10 text-center">
            <ScrollReveal direction="up" margin="-40px">
              <h2
                className="font-extrabold mb-4 text-center"
                style={{
                  fontFamily: 'Sora, Inter, system-ui, sans-serif',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                }}
              >
                Ready to Ace Your Next Interview?
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.12} margin="-40px">
              <p className="text-lg mb-10 max-w-xl mx-auto text-center" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif' }}>
                Start now and get your personalised AI feedback in under 30 minutes.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="scale" delay={0.2} margin="-40px" className="flex justify-center">
              <button
                onClick={onStart}
                className="liquid-button-primary rounded-full px-14 py-5 text-lg font-bold uppercase tracking-wider"
                style={{ color: '#ffffff' }}
              >
                Begin Your Assessment <ArrowRight className="w-5 h-5 ml-1" />
              </button>
            </ScrollReveal>
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
};

/* ──────────────────────────────────────────────────────────
   Root export
   ────────────────────────────────────────────────────────── */
export default function Welcome({ onStart }: WelcomeProps) {
  return (
    <div className="overflow-x-hidden">
      <ScrollProgressBar />
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
