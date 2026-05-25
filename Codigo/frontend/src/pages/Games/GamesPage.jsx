import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Keyboard, Fish, Recycle, ArrowRight, Gamepad2 } from 'lucide-react';
import Footer from '@/components/Footer.jsx';

const games = [
  {
    id: 'quiz',
    title: 'Vocabulary Quiz',
    description:
      'Test your English knowledge with multiple-choice quizzes created by your professor. Answer fast and score high!',
    icon: Brain,
    color: 'bg-primary/10 text-primary border-primary/30',
    badge: 'bg-primary text-white',
    path: '/quizzesAluno',
  },
  {
    id: 'typing',
    title: 'Word Climber',
    description:
      'Type English words correctly to beat the clock! Every correct word buys you more time — how far can you climb?',
    icon: Keyboard,
    color: 'bg-secondary/10 text-secondary border-secondary/30',
    badge: 'bg-secondary text-white',
    path: '/games/typing',
  },
  {
    id: 'fishing',
    title: 'Word Fishing',
    description:
      'You receive a list of English words to memorize — then fish them out of the water! Watch out for decoy words that will cost you a life.',
    icon: Fish,
    color: 'bg-blue-500/10 text-blue-600 border-blue-300',
    badge: 'bg-blue-500 text-white',
    path: '/games/fishing',
  },
  {
    id: 'recycling',
    title: 'Recycling Master',
    description:
      'Items fall from the sky. Click the correct recycling bin before they hit the ground. Speed and accuracy matter!',
    icon: Recycle,
    color: 'bg-green-500/10 text-green-700 border-green-300',
    badge: 'bg-green-600 text-white',
    path: '/games/recycling',
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function GamesPage() {
  return (
    <>
      <Helmet>
        <title>Games – NextStep English</title>
        <meta
          name="description"
          content="Play interactive English-learning games on NextStep English."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden bg-secondary py-20 text-white">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            {['🎮', '🐟', '♻️', '⌨️', '🧠'].map((emoji, i) => (
              <span
                key={i}
                className="absolute text-6xl"
                style={{
                  top: `${10 + i * 18}%`,
                  left: `${5 + i * 20}%`,
                  transform: `rotate(${-20 + i * 10}deg)`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-bold uppercase tracking-widest text-accent"
            >
              <Gamepad2 className="h-4 w-4" />
              Play &amp; Learn
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-4xl font-black leading-tight md:text-6xl"
            >
              Interactive{' '}
              <span className="text-accent">Learning</span> Games
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="mx-auto mt-5 max-w-xl text-lg font-medium text-white/80"
            >
              Choose a game below and start building your English vocabulary while having fun!
            </motion.p>
          </div>
        </section>

        {/* Game Cards */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2"
          >
            {games.map((game) => {
              const Icon = game.icon;
              return (
                <motion.div key={game.id} variants={cardVariants}>
                  <Link
                    to={game.path}
                    className={`group flex h-full flex-col rounded-3xl border-2 bg-white p-8 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${game.color}`}
                  >
                    <div className="mb-5 flex items-start justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${game.color}`}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${game.badge}`}
                      >
                        Play
                      </span>
                    </div>

                    <h2 className="mb-3 text-2xl font-black text-foreground">
                      {game.title}
                    </h2>
                    <p className="flex-1 text-base font-medium leading-relaxed text-muted-foreground">
                      {game.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 font-bold text-secondary group-hover:gap-3 transition-all duration-200">
                      Play now
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 rounded-3xl bg-muted/60 p-10 text-center"
          >
            <h2 className="mb-3 text-2xl font-bold text-foreground">
              How do the games work?
            </h2>
            <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-muted-foreground">
              Each game is designed to reinforce English vocabulary through active play. Follow
              the on-screen instructions, complete challenges, and track your progress. The more
              you play, the more you learn!
            </p>
          </motion.div>
        </section>

        <Footer />
      </div>
    </>
  );
}
