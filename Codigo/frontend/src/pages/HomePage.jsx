import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import {
  Gamepad2, BookOpen, ArrowRight,
  Globe2, Recycle, Zap,
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/* ─── Animation variants ──────────────────────────────────────── */
const fadeUp = {
  hidden:  { opacity: 0, y: 44 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring', duration: 0.75, bounce: 0.3, delay: i * 0.1 },
  }),
};

const fadeLeft = {
  hidden:  { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};

/* ─── Static data ─────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Globe2,
    label: 'Global Topics',
    desc: 'Vocabulary about the environment and sustainability',
    style: 'bg-blue-50 text-secondary border-secondary',
    iconColor: 'text-secondary',
  },
  {
    icon: Recycle,
    label: 'Eco Habits',
    desc: 'Learn about recycling and conscious consumption',
    style: 'bg-green-50 text-green-700 border-green-600',
    iconColor: 'text-green-700',
  },
  {
    icon: Zap,
    label: 'Clean Energy',
    desc: 'Discover renewable energy sources',
    style: 'bg-yellow-50 text-yellow-700 border-yellow-500',
    iconColor: 'text-yellow-600',
  },
  {
    icon: Gamepad2,
    label: 'Fun Games',
    desc: 'Interactive missions with real-world vocabulary',
    style: 'bg-red-50 text-primary border-primary',
    iconColor: 'text-primary',
  },
];

const GAMES = [
  {
    emoji: '🌊',
    title: 'Ocean Cleanup',
    desc: 'Catch trash before it pollutes the sea! Learn ocean vocabulary while saving marine life.',
    path: '/games/fishing',
    shadow: 'bg-blue-300',
    rotate: 1.5,
  },
  {
    emoji: '♻️',
    title: 'Recycling Master',
    desc: 'Sort falling items into the right bins! Master recycling words and save the planet.',
    path: '/games/recycling',
    shadow: 'bg-green-300',
    rotate: -1.5,
  },
  {
    emoji: '🌳',
    title: 'Word Climber',
    desc: 'Type fast to climb the giant tree! Build your vocabulary while reaching for the sky.',
    path: '/games/typing',
    shadow: 'bg-yellow-300',
    rotate: 1.5,
  },
];

const STATS = [
  { value: '6+',   label: 'Eco-Games' },
  { value: '100%', label: 'Free to Play' },
  { value: '🌱',   label: 'Eco-Friendly' },
  { value: '∞',    label: 'Adventures' },
];

/* ─── Component ───────────────────────────────────────────────── */
export default function HomePage() {
  const { user } = useAuth();
  const playPath = user ? '/games' : '/login';
  return (
    <div className="min-h-screen bg-background font-outfit">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[92dvh] items-center justify-center overflow-hidden px-4 py-20">

        {/* Background image with gradient overlay */}
        <div className="absolute inset-4 z-0 overflow-hidden rounded-4xl border-8 border-secondary shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=1600&q=80"
            alt="Children learning about nature"
            className="h-full w-full object-cover animate-heroZoom"
            loading="eager"
          />
          <div className="absolute inset-0 bg-secondary/55 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/35 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.82, y: 56 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', duration: 1.1, bounce: 0.38 }}
          >
            {/* Animated badge */}
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
              className="mb-7 inline-block rounded-full bg-accent px-7 py-2.5 text-lg font-black text-accent-foreground shadow-lg"
            >
              🌍 Welcome to the future of learning!
            </motion.div>

            {/* Headline */}
            <h1
              className="mb-8 text-balance text-5xl font-black leading-[1.04] text-white drop-shadow-xl md:text-7xl lg:text-8xl"
              style={{ letterSpacing: '-0.04em' }}
            >
              Learn English.<br />
              <span className="text-accent">Save the Planet.</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-11 max-w-[42ch] text-xl font-medium leading-relaxed text-white/90 drop-shadow-md md:text-2xl">
              Play amazing eco-missions, read real stories and discover how
              you can become an&nbsp;<strong className="text-accent">Earth Hero</strong>!
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
              <Button
                asChild
                className="h-16 rounded-full bg-primary px-10 text-xl font-black text-white shadow-[0_8px_0_hsl(var(--primary-dark))] transition-all hover:translate-y-1 hover:shadow-[0_4px_0_hsl(var(--primary-dark))] active:translate-y-2 active:shadow-none"
              >
                <Link to={playPath}>
                  <Gamepad2 className="h-6 w-6" /> Play Now
                </Link>
              </Button>
              <Button
                asChild
                className="h-16 rounded-full bg-white px-10 text-xl font-black text-secondary shadow-[0_8px_0_#ccc] transition-all hover:translate-y-1 hover:shadow-[0_4px_0_#ccc] active:translate-y-2 active:shadow-none"
              >
                <Link to="/signup">
                  <BookOpen className="h-6 w-6" /> Create Account
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          MISSION — WHY NEXTSTEP
      ══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">

          {/* Text card */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="relative"
          >
            <div className="pointer-events-none absolute -inset-4 rotate-[3deg] rounded-4xl bg-accent/20" />

            <div className="relative rounded-4xl border-4 border-secondary bg-white p-10 shadow-xl">
              <span className="mb-5 inline-block rounded-full bg-secondary px-4 py-1 text-sm font-black text-white">
                Our Mission
              </span>

              <h2
                className="mb-6 text-4xl font-black leading-tight text-secondary md:text-5xl"
                style={{ letterSpacing: '-0.03em' }}
              >
                Why <span className="text-primary">NextStep</span> English?
              </h2>

              <p className="mb-4 text-lg font-medium leading-relaxed text-foreground/75">
                We believe learning should be an adventure! Our platform blends English
                vocabulary with real-world environmental missions.
              </p>
              <p className="text-lg font-medium leading-relaxed text-foreground/75">
                Whether you're sorting recycling or planting virtual trees, every word you
                learn helps you understand and protect our incredible planet.
              </p>
            </div>
          </motion.div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, label, desc, style, iconColor }, i) => (
              <motion.div
                key={label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Card className={`h-full cursor-default border-4 transition-transform duration-300 hover:-translate-y-2 ${style}`}>
                  <CardHeader className="pb-2 text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Icon className={`h-8 w-8 ${iconColor}`} />
                    </div>
                    <CardTitle className="text-lg">{label}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm font-medium opacity-75">{desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mx-4 mb-24 rounded-4xl border-8 border-primary bg-secondary px-6 py-14 shadow-2xl"
      >
        <div className="mx-auto flex max-w-4xl flex-wrap justify-around gap-10">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p
                className="text-5xl font-black leading-none text-accent"
                style={{ letterSpacing: '-0.04em' }}
              >
                {value}
              </p>
              <p className="mt-1 font-bold text-white/80">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          FEATURED GAMES
      ══════════════════════════════════════════════════════ */}
      <section className="mx-4 mb-24 overflow-hidden rounded-4xl border-8 border-primary bg-secondary shadow-2xl">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2
              className="mb-4 text-4xl font-black text-white drop-shadow-lg md:text-6xl"
              style={{ letterSpacing: '-0.03em' }}
            >
              Ready to Play? 🎮
            </h2>
            <p className="mx-auto max-w-2xl text-xl font-medium text-white/75">
              Dive into our most popular games and start your eco-adventure today!
            </p>
          </motion.div>

          {/* Game cards */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {GAMES.map(({ emoji, title, desc, path, shadow, rotate }, i) => (
              <motion.div
                key={title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotate }}
                className="group relative"
              >
                {/* Colored shadow layer */}
                <div
                  className={`absolute inset-0 ${shadow} translate-x-2 translate-y-4 rounded-3xl opacity-60 transition-transform duration-300 group-hover:translate-y-6`}
                />

                {/* White card */}
                <Card className="relative flex h-full flex-col border-4 border-white bg-white p-6 text-secondary shadow-xl">
                  <span className="mb-3 block text-5xl">{emoji}</span>

                  <CardHeader className="p-0 mb-3">
                    <CardTitle style={{ letterSpacing: '-0.02em' }}>{title}</CardTitle>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col p-0">
                    <p className="mb-6 flex-1 text-base font-medium leading-relaxed text-secondary/65">
                      {desc}
                    </p>
                    <Button
                      asChild
                      className="w-full rounded-2xl bg-primary font-black text-lg text-white shadow-[0_4px_0_hsl(var(--primary-dark))] transition-all hover:translate-y-0.5 hover:shadow-[0_2px_0_hsl(var(--primary-dark))] active:translate-y-1 active:shadow-none"
                    >
                      <Link to={path}>Play Now!</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* See all games button */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Button
              asChild
              className="h-16 rounded-full border-4 border-white bg-transparent px-10 text-xl font-black text-white transition-all hover:bg-white hover:text-secondary"
            >
              <Link to={playPath}>
                See All Games <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FINAL CTA — SIGN UP
      ══════════════════════════════════════════════════════ */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mx-auto max-w-3xl px-4 py-20 text-center"
      >
        <h2
          className="mb-4 text-4xl font-black text-secondary md:text-5xl"
          style={{ letterSpacing: '-0.03em' }}
        >
          Ready to become an{' '}
          <span className="text-primary">Earth Hero?</span>
        </h2>
        <p className="mx-auto mb-10 max-w-[42ch] text-lg font-medium leading-relaxed text-foreground/70">
          Join students learning English while making a real difference.
          It's completely free and always fun!
        </p>

        <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Button
            asChild
            className="h-16 rounded-full bg-primary px-10 text-xl font-black text-white shadow-[0_6px_0_hsl(var(--primary-dark))] transition-all hover:translate-y-1 hover:shadow-[0_3px_0_hsl(var(--primary-dark))]"
          >
            <Link to="/signup">🚀 Get Started Free</Link>
          </Button>
          <Button
            asChild
            className="h-16 rounded-full bg-secondary px-10 text-xl font-black text-white shadow-[0_6px_0_hsl(var(--secondary-dark))] transition-all hover:translate-y-1 hover:shadow-[0_3px_0_hsl(var(--secondary-dark))]"
          >
            <Link to="/login">I already have an account</Link>
          </Button>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
