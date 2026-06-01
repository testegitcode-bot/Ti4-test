import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Heart, CheckCircle2, BookOpen } from 'lucide-react';
import Footer from '@/components/Footer.jsx';
import { GameTutorial } from '@/components/games/GameTutorial.jsx';
import { salvarPontuacao } from "@/services/rankingService";

/* ─── Vocabulary Rounds ─────────────────────────────────────────── */
const ROUNDS = [
  {
    theme: '🐾 Animals',
    targets: [
      { word: 'cat',   hint: 'gato'     },
      { word: 'dog',   hint: 'cachorro' },
      { word: 'bird',  hint: 'pássaro'  },
      { word: 'bear',  hint: 'urso'     },
      { word: 'frog',  hint: 'sapo'     },
      { word: 'lion',  hint: 'leão'     },
    ],
    decoys: ['cloud','fire','storm','ghost','dark','cold','fast','blue','moon','lamp'],
  },
  {
    theme: '🍎 Food & Drinks',
    targets: [
      { word: 'apple', hint: 'maçã'   },
      { word: 'bread', hint: 'pão'    },
      { word: 'milk',  hint: 'leite'  },
      { word: 'rice',  hint: 'arroz'  },
      { word: 'cake',  hint: 'bolo'   },
      { word: 'soup',  hint: 'sopa'   },
    ],
    decoys: ['run','blue','lamp','iron','boat','jump','door','tree','wind','rock'],
  },
  {
    theme: '🎨 Colors',
    targets: [
      { word: 'red',    hint: 'vermelho' },
      { word: 'blue',   hint: 'azul'     },
      { word: 'green',  hint: 'verde'    },
      { word: 'black',  hint: 'preto'    },
      { word: 'white',  hint: 'branco'   },
      { word: 'yellow', hint: 'amarelo'  },
    ],
    decoys: ['fish','tree','moon','wind','star','rock','sand','road','cold','fire'],
  },
  {
    theme: '🏠 Home & Objects',
    targets: [
      { word: 'chair',  hint: 'cadeira' },
      { word: 'table',  hint: 'mesa'    },
      { word: 'door',   hint: 'porta'   },
      { word: 'lamp',   hint: 'lâmpada' },
      { word: 'clock',  hint: 'relógio' },
      { word: 'book',   hint: 'livro'   },
    ],
    decoys: ['swim','cold','eagle','grape','river','smoke','town','play','jump','fast'],
  },
];

/* ─── Difficulty configs ─────────────────────────────────────────── */
const DIFFICULTIES = {
  easy: {
    label: '😊 Easy',
    targetCount: 3,
    decoyCount: 2,
    speedMin: 0.12,
    speedMax: 0.20,
    memorizeTime: 8,
    lives: 5,
    fishFontSize: '1.3rem',
    fishPadding: '10px 16px',
    collisionX: 10,
    collisionY: 9,
  },
  medium: {
    label: '😤 Medium',
    targetCount: 5,
    decoyCount: 5,
    speedMin: 0.22,
    speedMax: 0.38,
    memorizeTime: 6,
    lives: 3,
    fishFontSize: '1.1rem',
    fishPadding: '8px 13px',
    collisionX: 8,
    collisionY: 7,
  },
  hard: {
    label: '🔥 Hard',
    targetCount: 6,
    decoyCount: 9,
    speedMin: 0.38,
    speedMax: 0.60,
    memorizeTime: 4,
    lives: 2,
    fishFontSize: '0.95rem',
    fishPadding: '6px 10px',
    collisionX: 7,
    collisionY: 6,
  },
};

let _idCounter = 0;
function createFish(word, isTarget, direction, yPercent, speed) {
  return {
    id: ++_idCounter,
    word,
    isTarget,
    x: direction === 1 ? -15 : 115,
    y: yPercent,
    speed,
    direction,
    caught: false,
  };
}

const HOOK_X = 50;

export default function FishingGame() {
  const [phase, setPhase]     = useState('start');
  const [diffKey, setDiffKey] = useState('medium');
  const [roundIdx, setRoundIdx] = useState(0);
  const [lives, setLives]     = useState(3);
  const [score, setScore]     = useState(0);
  const [hookY, setHookY]     = useState(50);
  const [fishes, setFishes]   = useState([]);
  const [caughtWords, setCaughtWords] = useState(new Set());
  const [feedback, setFeedback] = useState(null);
  const [memorizeCountdown, setMemorizeCountdown] = useState(6);

  const gameAreaRef   = useRef(null);
  const rafRef        = useRef(null);
  const livesRef      = useRef(3);
  const hookYRef      = useRef(50);
  const caughtRef     = useRef(new Set());
  const spawnerRef    = useRef(null);
  const fishesRef     = useRef([]); // Fonte da verdade para evitar re-renders do Strict Mode
  const pontuacaoEnviadaRef = useRef(false);

  const diff  = DIFFICULTIES[diffKey];
  const round = ROUNDS[roundIdx % ROUNDS.length];

  const activeTargets = useMemo(() => round.targets.slice(0, diff.targetCount), [round.targets, diff.targetCount]);
  const activeDecoys  = useMemo(() => round.decoys.slice(0, diff.decoyCount), [round.decoys, diff.decoyCount]);

  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { hookYRef.current = hookY; }, [hookY]);
  useEffect(() => { caughtRef.current = caughtWords; }, [caughtWords]);

  const handleMouseMove = useCallback((e) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHookY(Math.max(8, Math.min(92, y)));
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setHookY(Math.max(8, Math.min(92, y)));
  }, []);

  const spawnWave = useCallback(() => {
    const pool = [
      ...activeTargets.map(t => ({ word: t.word, isTarget: true })),
      ...activeDecoys.map(d => ({ word: d, isTarget: false })),
    ].sort(() => Math.random() - 0.5);

    pool.forEach((item, i) => {
      setTimeout(() => {
        const dir = Math.random() > 0.5 ? 1 : -1;
        const y   = 12 + Math.random() * 68;
        const spd = diff.speedMin + Math.random() * (diff.speedMax - diff.speedMin);
        
        setFishes(prev => {
          const next = [...prev, createFish(item.word, item.isTarget, dir, y, spd)];
          fishesRef.current = next; // Mantém a ref sincronizada
          return next;
        });
      }, i * 500);
    });
  }, [activeTargets, activeDecoys, diff]);

  const gameLoop = useCallback(() => {
    const cX = diff.collisionX;
    const cY = diff.collisionY;

    let livesLost = 0;
    let scoreGain = 0;
    let newlyCaughtWord = null;
    let feedbackToSet = null;

    const hY = hookYRef.current;
    const currentCaught = caughtRef.current;

    // Lemos e processamos a colisão diretamente do ref (roda 1x por frame)
    const updatedFishes = fishesRef.current
      .map(f => ({ ...f, x: f.x + f.speed * f.direction }))
      .filter(f => {
        if (f.direction === 1 && f.x > 115) return false;
        if (f.direction === -1 && f.x < -15) return false;
        
        const dX = Math.abs(f.x - HOOK_X);
        const dY = Math.abs(f.y - hY);
        
        if (dX < cX && dY < cY) {
          // Colisão detectada!
          if (f.isTarget && !currentCaught.has(f.word)) {
            newlyCaughtWord = f.word;
            scoreGain = 20;
            feedbackToSet = { text: `✅ ${f.word}!`, color: 'text-green-400', y: hY };
          } else if (!f.isTarget) {
            livesLost++; // Incrementa as vidas de forma isolada do React Strict Mode
            feedbackToSet = { text: '❌ Wrong!', color: 'text-red-400', y: hY };
          }
          return false; // Remove o peixe da tela
        }
        return true;
      });

    // Salvamos as posições calculadas e refletimos na interface
    fishesRef.current = updatedFishes;
    setFishes(updatedFishes);

    // Aplicamos as regras de jogo e pontuações
    if (newlyCaughtWord) {
      const newCaught = new Set(caughtRef.current);
      newCaught.add(newlyCaughtWord);
      
      caughtRef.current = newCaught;
      setCaughtWords(newCaught);
      setScore(s => s + scoreGain);
      
      if (newCaught.size >= activeTargets.length) {
        setPhase('levelEnd');
        return; 
      }
    }

    if (feedbackToSet) {
      setFeedback({ ...feedbackToSet, id: Date.now() });
      setTimeout(() => setFeedback(null), 900);
    }

    if (livesLost > 0) {
      const remaining = livesRef.current - livesLost;
      livesRef.current = remaining;
      setLives(remaining);
      
      if (remaining <= 0) { 
        setPhase('over'); 
        return;
      }
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [diff, activeTargets.length]);

  useEffect(() => {
    if (phase === 'playing') rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, gameLoop]);

  useEffect(() => {
    if (phase === 'playing') {
      setFishes([]);
      fishesRef.current = [];
      caughtRef.current = new Set();
      setCaughtWords(new Set());
      spawnWave();
      spawnerRef.current = setInterval(spawnWave, 16000);
    }
    return () => clearInterval(spawnerRef.current);
  }, [phase, spawnWave]);

  useEffect(() => {
    if (phase !== 'memorize') return;
    setMemorizeCountdown(diff.memorizeTime);
    const id = setInterval(() => {
      setMemorizeCountdown(c => {
        if (c <= 1) { clearInterval(id); setPhase('playing'); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, diff.memorizeTime]);

  useEffect(() => {
    const terminouJogo =
      phase === "over" || 
      (phase === "levelEnd" && roundIdx >= ROUNDS.length - 1);

    if (terminouJogo && !pontuacaoEnviadaRef.current) {
      pontuacaoEnviadaRef.current = true;

      salvarPontuacao("Word Fishing", score)
        .then((resposta) => {
          if (resposta) {
            console.log("Pontuação final do Word Fishing salva com sucesso");
          }
        })
        .catch((erro) => console.error("Erro ao salvar pontuação:", erro));
    }
  }, [phase, score, roundIdx]);

  const startRound = (idx = 0, dk = diffKey) => {
    pontuacaoEnviadaRef.current = false;

    setRoundIdx(idx);
    setDiffKey(dk);
    setLives(DIFFICULTIES[dk].lives);
    livesRef.current = DIFFICULTIES[dk].lives;
    setScore(0);
    setFishes([]);
    fishesRef.current = [];
    setCaughtWords(new Set());
    caughtRef.current = new Set();
    setFeedback(null);
    setPhase('memorize');
  };

  const nextRound = () => {
    const next = roundIdx + 1;
    setRoundIdx(next);
    setFishes([]);
    fishesRef.current = [];
    setCaughtWords(new Set());
    caughtRef.current = new Set();
    setFeedback(null);
    setPhase('memorize');
  };

  const BackBtn = () => (
    <Link to="/games" className="inline-flex items-center gap-1 rounded-full font-bold text-secondary hover:bg-secondary/10 px-3 py-2 text-sm transition-all">
      <ArrowLeft className="w-4 h-4" /> Back to Games
    </Link>
  );

  /* ── START ─────────────────────────────────────────────────────── */
  if (phase === 'start') {
    return (
      <>
        <Helmet><title>Word Fishing – NextStep English</title></Helmet>
        <div className="min-h-screen bg-background flex flex-col">
          <section className="flex-grow py-16 px-4">
            <div className="max-w-2xl mx-auto">
              <BackBtn />
              <div className="mt-6 rounded-3xl border-8 border-secondary shadow-2xl overflow-hidden bg-white">
                <div className="bg-secondary p-8 text-center text-white">
                  <div className="text-5xl mb-3">🎣</div>
                  <h1 className="text-5xl font-black mb-3">Word Fishing</h1>
                  <p className="text-xl font-medium opacity-90">Fish the right words to score!</p>
                </div>
                <div className="p-8 space-y-6">
                  {/* Difficulty */}
                  <div>
                    <p className="text-lg font-black text-secondary mb-3">Difficulty:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(DIFFICULTIES).map(([key, d]) => (
                        <button key={key} onClick={() => setDiffKey(key)}
                          className={`rounded-2xl border-4 py-4 font-bold text-sm transition-all ${diffKey === key ? 'bg-primary text-white border-primary' : 'border-primary/30 text-primary hover:bg-primary/10'}`}>
                          {d.label}
                          <br/>
                          <span className="text-xs opacity-75 font-medium">{d.targetCount} targets · {d.lives}❤️</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme */}
                  <p className="text-lg font-black text-secondary mb-2">Choose a theme:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {ROUNDS.map((r, i) => (
                      <button key={i} onClick={() => startRound(i, diffKey)}
                        className="rounded-2xl border-4 border-secondary bg-secondary/5 hover:bg-secondary hover:text-white text-secondary font-bold text-lg py-5 px-4 transition-all shadow-md active:scale-95">
                        {r.theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <GameTutorial
                title="Word Fishing"
                objective="Memorize the target words, then fish them out! Avoid the decoy fish."
                controls="Move mouse/finger up and down inside the water area to raise/lower the hook."
                rules={[
                  'Study the word list — they will swim in the water.',
                  'Blue fish 🐠 = target words. Catch them for +20 pts!',
                  'Dark fish 🐟 = decoy words. Avoid them or lose a life!',
                  'Catch all target words to complete the round.',
                  'Difficulty controls speed, number of words and lives.',
                ]}
              />
            </div>
          </section>
          <Footer />
        </div>
      </>
    );
  }

  /* ── MEMORIZE ─────────────────────────────────────────────────── */
  if (phase === 'memorize') {
    return (
      <>
        <Helmet><title>Memorize! – Word Fishing</title></Helmet>
        <div className="min-h-screen bg-background flex flex-col">
          <div className="max-w-2xl mx-auto w-full px-4 mt-6">
            <BackBtn />
          </div>
          <div className="flex-grow flex flex-col items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl w-full bg-white rounded-3xl border-8 border-secondary shadow-2xl p-10 text-center">
              <BookOpen className="w-16 h-16 text-secondary mx-auto mb-4" />
              <h2 className="text-4xl font-black text-secondary mb-2">Memorize!</h2>
              <p className="text-muted-foreground font-medium mb-1">Theme: <strong>{round.theme}</strong></p>
              <p className="text-muted-foreground font-medium mb-6">
                Game starts in <span className="text-4xl font-black text-primary">{memorizeCountdown}</span>s
              </p>
              <div className="space-y-3 mb-6">
                {activeTargets.map(t => (
                  <div key={t.word} className="flex items-center justify-between bg-blue-50 border-2 border-blue-200 rounded-2xl px-6 py-3">
                    <span className="text-2xl font-black text-secondary">{t.word}</span>
                    <span className="text-lg font-bold text-blue-600">{t.hint}</span>
                  </div>
                ))}
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full" initial={{ width: '100%' }} animate={{ width: '0%' }}
                  transition={{ duration: diff.memorizeTime, ease: 'linear' }} />
              </div>
              <p className="text-sm text-muted-foreground mt-3 font-medium">These words will swim in the water — catch them!</p>
            </motion.div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  /* ── LEVEL END ────────────────────────────────────────────────── */
  if (phase === 'levelEnd') {
    const isLast = roundIdx >= ROUNDS.length - 1;
    return (
      <>
        <Helmet><title>Level Complete!</title></Helmet>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
          <div className="max-w-2xl w-full px-4 mb-6 flex"><BackBtn /></div>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-white rounded-3xl border-8 border-accent shadow-2xl p-10 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl font-black text-secondary mb-2">
              {isLast ? 'All rounds done!' : 'Level Complete!'}
            </h2>
            <div className="bg-muted rounded-3xl p-6 my-6">
              <p className="text-lg font-bold text-secondary/70 mb-1">Score</p>
              <p className="text-5xl font-black text-primary">{score}</p>
              <p className="text-base font-bold text-secondary mt-3">Lives: {'❤️'.repeat(lives)}</p>
            </div>
            <div className="flex flex-col gap-3">
              {!isLast && (
                <button onClick={nextRound}
                  className="w-full rounded-full bg-primary text-white font-black text-xl h-16 shadow-[0_6px_0_hsl(1,72%,29%)] active:translate-y-1 active:shadow-none transition-all">
                  Next Round →
                </button>
              )}
              <button onClick={() => startRound(0, diffKey)}
                className="w-full flex items-center justify-center gap-2 rounded-full border-4 border-secondary text-secondary font-black text-xl h-14 hover:bg-secondary/10 transition-all">
                <RotateCcw className="w-5 h-5" /> Play Again
              </button>
              <Link to="/games" className="w-full flex items-center justify-center rounded-full bg-muted text-secondary font-bold text-xl h-12 hover:bg-muted/70 transition-all">
                Back to Games
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  /* ── GAME OVER ────────────────────────────────────────────────── */
  if (phase === 'over') {
    return (
      <>
        <Helmet><title>Game Over – Word Fishing</title></Helmet>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
          <div className="max-w-2xl w-full px-4 mb-6 flex"><BackBtn /></div>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-white rounded-3xl border-8 border-primary shadow-2xl p-10 text-center">
            <div className="text-6xl mb-4">🎣</div>
            <h2 className="text-4xl font-black text-primary mb-2">Game Over!</h2>
            <div className="bg-muted rounded-3xl p-6 my-6">
              <p className="text-lg font-bold text-secondary/70 mb-1">Final Score</p>
              <p className="text-5xl font-black text-primary">{score}</p>
              <p className="text-base font-bold text-secondary mt-3">
                Words caught: {caughtWords.size} / {activeTargets.length}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => startRound(roundIdx, diffKey)}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary text-white font-black text-xl h-16 shadow-[0_6px_0_hsl(1,72%,29%)] active:translate-y-1 active:shadow-none transition-all">
                <RotateCcw className="w-5 h-5" /> Try Again
              </button>
              <button onClick={() => setPhase('start')}
                className="w-full rounded-full border-4 border-secondary text-secondary font-bold text-xl h-14 hover:bg-secondary/10 transition-all">
                Change Difficulty
              </button>
              <Link to="/games" className="w-full flex items-center justify-center rounded-full bg-muted text-secondary font-bold text-xl h-12 hover:bg-muted/70 transition-all">
                Back to Games
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  /* ── PLAYING ─────────────────────────────────────────────────── */
  return (
    <>
      <Helmet><title>Word Fishing – Playing</title></Helmet>
      <div className="min-h-screen bg-background flex flex-col pb-10">
        <div className="max-w-5xl mx-auto w-full px-4 mt-4 flex justify-between items-center">
          <BackBtn />
          <h1 className="text-lg font-black text-secondary uppercase tracking-widest">
            🎣 {round.theme} · {diff.label}
          </h1>
          <div className="flex gap-1">
            {Array.from({ length: DIFFICULTIES[diffKey].lives }).map((_, i) => (
              <Heart key={i} className={`w-7 h-7 transition-colors ${i < lives ? 'text-primary fill-primary' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full px-4 mt-3">
          <div className="flex flex-wrap gap-3 justify-between items-start bg-white rounded-3xl border-4 border-secondary p-4 shadow-md">
            <div className="text-2xl font-black text-secondary">Score: <span className="text-primary">{score}</span></div>
            <div className="flex flex-wrap gap-2">
              {activeTargets.map(t => (
                <div key={t.word}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 border-2 font-bold transition-all ${
                    caughtWords.has(t.word)
                      ? 'bg-green-100 border-green-400 text-green-700 line-through opacity-60 text-base'
                      : 'bg-blue-50 border-blue-300 text-blue-700 text-base'
                  }`}>
                  {caughtWords.has(t.word) && <CheckCircle2 className="w-3 h-3" />}
                  {t.word}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full px-4 mt-3">
          <div ref={gameAreaRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative w-full overflow-hidden rounded-3xl border-4 border-secondary shadow-2xl cursor-none select-none"
            style={{ height: '520px', background: 'linear-gradient(180deg, #bfdbfe 0%, #1d4ed8 40%, #1e3a8a 100%)' }}>

            {/* Hook line */}
            <div className="absolute left-1/2 w-0.5 bg-white/80 origin-top z-20"
              style={{ top: 0, height: `${hookY}%`, transform: 'translateX(-50%)' }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-7 border-4 border-t-0 border-white rounded-b-full shadow-lg" />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white/60 z-30 animate-pulse"
              style={{ top: `calc(${hookY}% - 10px)` }} />

            {/* Fishes */}
            {fishes.map(fish => (
              <div key={fish.id}
                className={`absolute z-10 flex items-center gap-1 rounded-2xl border-2 shadow-lg font-black select-none transition-none ${
                  fish.isTarget
                    ? 'bg-blue-100 border-blue-400 text-blue-900'
                    : 'bg-slate-700 border-slate-500 text-slate-200'
                }`}
                style={{
                  left: `${fish.x}%`,
                  top: `${fish.y}%`,
                  transform: `translateY(-50%) scaleX(${fish.direction === -1 ? -1 : 1})`,
                  fontSize: diff.fishFontSize,
                  padding: diff.fishPadding,
                  boxShadow: fish.isTarget ? '0 0 12px rgba(59,130,246,0.4)' : undefined,
                }}>
                <span style={{ transform: fish.direction === -1 ? 'scaleX(-1)' : 'none' }}>
                  {fish.isTarget ? '🐠' : '🐟'}
                </span>
                <span style={{ transform: fish.direction === -1 ? 'scaleX(-1)' : 'none' }}>
                  {fish.word}
                </span>
              </div>
            ))}

            <AnimatePresence>
              {feedback && (
                <motion.div key={feedback.id}
                  initial={{ opacity: 1, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -60, scale: 1.3 }}
                  transition={{ duration: 0.9 }}
                  className={`absolute left-1/2 -translate-x-1/2 font-black text-2xl drop-shadow-lg z-40 whitespace-nowrap ${feedback.color}`}
                  style={{ top: `${feedback.y}%` }}>
                  {feedback.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-6 mt-3 justify-center text-sm font-bold">
            <span className="bg-blue-600 text-white rounded-full px-3 py-1">🐠 Target — catch it!</span>
            <span className="bg-slate-700 text-white rounded-full px-3 py-1">🐟 Decoy — avoid!</span>
          </div>

          <GameTutorial
            title="Word Fishing"
            objective="Fish out the target words shown in the blue checklist. Avoid dark decoy fish!"
            controls="Move mouse (or touch) up and down inside the water area to raise/lower the hook."
            rules={[
              'Blue fish 🐠 = target words. Catch them for +20 pts each!',
              'Dark fish 🐟 = decoy words. Catching one costs a life ❤️.',
              'Catch all target words to complete the round.',
              'Difficulty affects fish speed, number of targets/decoys, and lives.',
            ]}
          />
        </div>
        <Footer />
      </div>
    </>
  );
}
