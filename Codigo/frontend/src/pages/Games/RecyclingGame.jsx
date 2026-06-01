import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Heart, Pause, Play } from 'lucide-react';
import Footer from '@/components/Footer.jsx';
import { GameTutorial } from '@/components/games/GameTutorial.jsx';
import { salvarPontuacao } from "@/services/rankingService";

/* ─── Item types & Configs ───────────────────────────────────────── */
const ITEM_TYPES = [
  {
    id: 'plastic',
    label: 'Plastic',
    emoji: '🧴',
    binLabel: 'PLASTIC [1]',
    shortcut: '1',
    binColor: 'bg-blue-600 border-blue-800',
    activeColor: 'bg-blue-400 border-blue-600 scale-95',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-300',
  },
  {
    id: 'paper',
    label: 'Paper',
    emoji: '📰',
    binLabel: 'PAPER [2]',
    shortcut: '2',
    binColor: 'bg-yellow-500 border-yellow-700',
    activeColor: 'bg-yellow-300 border-yellow-500 scale-95',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-300',
  },
  {
    id: 'organic',
    label: 'Organic',
    emoji: '🍎',
    binLabel: 'ORGANIC [3]',
    shortcut: '3',
    binColor: 'bg-green-600 border-green-800',
    activeColor: 'bg-green-400 border-green-600 scale-95',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50 border-green-300',
  },
  {
    id: 'general',
    label: 'General',
    emoji: '👟',
    binLabel: 'GENERAL [4]',
    shortcut: '4',
    binColor: 'bg-red-600 border-red-800',
    activeColor: 'bg-red-400 border-red-600 scale-95',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50 border-red-300',
  },
];

const ALL_ITEMS = [
  // Plastic
  { id: 'plastic', emoji: '🧴', label: 'Plastic Bottle' },
  { id: 'plastic', emoji: '🪣', label: 'Bucket' },
  { id: 'plastic', emoji: '🥤', label: 'Plastic Cup' },
  { id: 'plastic', emoji: '🛍️', label: 'Plastic Bag' },
  // Paper
  { id: 'paper',   emoji: '📰', label: 'Newspaper' },
  { id: 'paper',   emoji: '📦', label: 'Cardboard Box' },
  { id: 'paper',   emoji: '📄', label: 'Paper Sheet' },
  { id: 'paper',   emoji: '📖', label: 'Old Magazine' },
  // Organic
  { id: 'organic', emoji: '🍎', label: 'Apple Core' },
  { id: 'organic', emoji: '🍌', label: 'Banana Peel' },
  { id: 'organic', emoji: '🥕', label: 'Carrot Top' },
  { id: 'organic', emoji: '🥚', label: 'Eggshell' },
  // General
  { id: 'general', emoji: '👟', label: 'Old Shoe' },
  { id: 'general', emoji: '🪫', label: 'Dead Battery' },
  { id: 'general', emoji: '🪮', label: 'Broken Toy' },
  { id: 'general', emoji: '🧻', label: 'Used Tissue' },
  // Hazards (Do not catch!)
  { id: 'hazard',  emoji: '☢️', label: 'Radioactive' },
  { id: 'hazard',  emoji: '💉', label: 'Syringe' },
  { id: 'hazard',  emoji: '🧪', label: 'Chemicals' },
];

function getRandomItem() {
  const isHazard = Math.random() < 0.15;
  if (isHazard) {
    const hazards = ALL_ITEMS.filter(i => i.id === 'hazard');
    return hazards[Math.floor(Math.random() * hazards.length)];
  }
  const regulars = ALL_ITEMS.filter(i => i.id !== 'hazard');
  return regulars[Math.floor(Math.random() * regulars.length)];
}

const CONTAINER_HEIGHT = 420;

export default function RecyclingGame() {
  const [gameState, setGameState] = useState('start'); 
  const [score, setScore]         = useState(0);
  const [lives, setLives]         = useState(3);
  const [items, setItems]         = useState([]); 
  const [feedback, setFeedback]   = useState(null); 
  const [combo, setCombo]         = useState(0);
  const [activeBin, setActiveBin] = useState(null);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem('recycling_hs') || '0'); } catch { return 0; }
  });

  const livesRef    = useRef(3);
  const scoreRef    = useRef(0);
  const comboRef    = useRef(0);
  const spawnRef    = useRef(null);
  const nextIdRef   = useRef(1);
  const stateRef    = useRef('start');
  const pontuacaoEnviadaRef = useRef(false);

  // Keep refs synced
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { stateRef.current = gameState; }, [gameState]);

  /* ── Spawner ───────────────────────────────────────────── */
  const spawnItem = useCallback(() => {
    if (stateRef.current !== 'playing') return;
    
    const item = getRandomItem();
    const id   = nextIdRef.current++;
    const x    = 10 + Math.random() * 65; 

    // VELOCIDADE VARIÁVEL: Base calculada pelo score, mas com +/- 600ms de variação aleatória
    // Isso impede que itens caiam exatamente grudados um no outro
    const baseFall = Math.max(1500, 3800 - scoreRef.current * 12);
    const speedVariation = (Math.random() * 1200) - 600; 
    const fallDuration = baseFall + speedVariation;

    setItems((prev) => [
      ...prev,
      { ...item, uid: id, x, spawnedAt: Date.now(), fallDuration, caught: null },
    ]);
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') {
      clearTimeout(spawnRef.current);
      return;
    }

    // Usando setTimeout recursivo em vez de setInterval
    // Isso evita o reset de timer quando o componente atualiza e permite intervalos randômicos
    const scheduleNextSpawn = () => {
      spawnItem();
      
      const baseInterval = Math.max(900, 2200 - scoreRef.current * 10);
      const randomOffset = (Math.random() * 600) - 200; // Entre -200ms e +400ms
      const nextInterval = baseInterval + randomOffset;
      
      spawnRef.current = setTimeout(scheduleNextSpawn, nextInterval);
    };

    spawnRef.current = setTimeout(scheduleNextSpawn, 800);
    
    return () => clearTimeout(spawnRef.current);
  }, [gameState, spawnItem]); // Note que removemos 'score' daqui para evitar resets bruscos

  /* ── Game Logic: Remove Item ───────────────────────────── */
  const removeItem = useCallback((uid) => {
    setItems((prev) => prev.filter((i) => i.uid !== uid));
  }, []);

  /* ── Game Logic: Item reaches bottom ───────────────────── */
  const handleItemMissed = useCallback((item) => {
    if (item.caught) return;

    if (item.id === 'hazard') {
      const newScore = scoreRef.current + 20;
      scoreRef.current = newScore;
      setScore(newScore);
      setFeedback({ id: Date.now(), text: '✅ Dodged!', color: 'text-green-400', x: item.x });
      removeItem(item.uid);
    } else {
      const newLives = livesRef.current - 1;
      livesRef.current = newLives;
      setLives(newLives);
      setCombo(0);
      comboRef.current = 0;

      setFeedback({ id: Date.now(), text: '💨 Missed!', color: 'text-gray-500', x: item.x });
      removeItem(item.uid);

      if (newLives <= 0) {
        setGameState('over');
        stateRef.current = 'over';
      }
    }
  }, [removeItem]);

  /* ── Game Logic: Bin Interaction ───────────────────────── */
  const handleBinClick = useCallback((binId) => {
    if (stateRef.current !== 'playing') return;

    setActiveBin(binId);
    setTimeout(() => setActiveBin(null), 150);

    setItems((prev) => {
      const activeItems = prev.filter(i => !i.caught);
      if (activeItems.length === 0) return prev;

      const now = Date.now();
      
      // NOVA LÓGICA DE DETECÇÃO: Encontra o item fisicamente mais abaixo na tela
      // Analisando a porcentagem de progresso em vez de apenas o tempo de vida
      const scored = activeItems.reduce((best, item) => {
        const itemProgress = (now - item.spawnedAt) / item.fallDuration;
        const bestProgress = best ? (now - best.spawnedAt) / best.fallDuration : -Infinity;
        return itemProgress > bestProgress ? item : best;
      }, null);

      if (!scored) return prev;

      // Só permite pegar se já estiver na metade de baixo
      const progress = (now - scored.spawnedAt) / scored.fallDuration;
      if (progress < 0.30) return prev; 

      let newStatus = 'fail';

      if (scored.id === 'hazard') {
        setFeedback({ id: Date.now(), text: '☢️ DANGER!', color: 'text-red-500', x: scored.x });
        const newLives = livesRef.current - 1;
        livesRef.current = newLives;
        setLives(newLives);
        comboRef.current = 0;
        setCombo(0);
        
        if (newLives <= 0) {
          setGameState('over');
          stateRef.current = 'over';
        }
      } else if (scored.id === binId) {
        newStatus = 'success';
        const newCombo = comboRef.current + 1;
        comboRef.current = newCombo;
        setCombo(newCombo);

        const multiplier = Math.floor(newCombo / 5) + 1;
        const pts = 10 * multiplier;
        const newScore = scoreRef.current + pts;
        scoreRef.current = newScore;
        setScore(newScore);

        const comboText = multiplier > 1 ? ` (×${multiplier})` : '';
        setFeedback({ id: Date.now(), text: `+${pts}${comboText}`, color: 'text-green-400', x: scored.x });
      } else {
        setFeedback({ id: Date.now(), text: '❌ Wrong bin!', color: 'text-red-500', x: scored.x });
        comboRef.current = 0;
        setCombo(0);
        const newLives = livesRef.current - 1;
        livesRef.current = newLives;
        setLives(newLives);

        if (newLives <= 0) {
          setGameState('over');
          stateRef.current = 'over';
        }
      }

      return prev.map(i => i.uid === scored.uid ? { ...i, caught: newStatus } : i);
    });
  }, []);

  /* ── Keyboard Controls ─────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (stateRef.current !== 'playing') return;
      
      const keyMap = {
        '1': 'plastic',
        '2': 'paper',
        '3': 'organic',
        '4': 'general',
      };
      
      const binId = keyMap[e.key];
      if (binId) {
        handleBinClick(binId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBinClick]);

  /* ── Start / reset ──────────────────────────────────────── */
  const startGame = () => {
    pontuacaoEnviadaRef.current = false;
    setScore(0);
    setLives(3);
    setItems([]);
    setFeedback(null);
    setCombo(0);
    livesRef.current    = 3;
    scoreRef.current    = 0;
    comboRef.current    = 0;
    stateRef.current    = 'playing';
    nextIdRef.current   = 1;
    setGameState('playing');
  };

  const togglePause = () => {
    setGameState((s) => (s === 'playing' ? 'paused' : 'playing'));
  };

  /* ── Save high score ────────────────────────────────────── */
  useEffect(() => {
    if (gameState === 'over' && score > highScore) {
      setHighScore(score);
      try { localStorage.setItem('recycling_hs', String(score)); } catch {}
    }
  }, [gameState, score, highScore]);

  useEffect(() => {
    if (gameOver && !pontuacaoEnviadaRef.current) {
      pontuacaoEnviadaRef.current = true;

      salvarPontuacao("Typing Game", score)
        .then((resposta) => {
          if (resposta) {
            console.log("Pontuação salva com sucesso");
          }
        })
        .catch((erro) => console.error("Erro ao salvar pontuação:", erro));
    }
  }, [gameOver, score]);

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <>
      <Helmet><title>Recycling Master – NextStep English</title></Helmet>
      <div className="min-h-screen bg-background flex flex-col pb-10">

        {/* Top bar */}
        <div className="max-w-5xl mx-auto w-full px-4 mt-4 flex items-center justify-between">
          <Link
            to="/games"
            className="inline-flex items-center gap-1 rounded-full font-bold text-secondary hover:bg-secondary/10 px-3 py-2 text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-xl font-black text-secondary uppercase tracking-widest">
            ♻️ Recycling Master
          </h1>
          {(gameState === 'playing' || gameState === 'paused') ? (
            <button
              onClick={togglePause}
              className="flex items-center gap-2 rounded-full border-4 border-secondary text-secondary font-bold px-4 py-2 hover:bg-secondary/10 transition-all focus:outline-none"
            >
              {gameState === 'playing'
                ? <><Pause className="w-4 h-4" /> Pause</>
                : <><Play  className="w-4 h-4" /> Resume</>}
            </button>
          ) : <div className="w-24" />}
        </div>

        {/* HUD */}
        <div className="max-w-5xl mx-auto w-full px-4 mt-3">
          <div className="flex items-center justify-between bg-white rounded-3xl border-4 border-secondary px-6 py-3 shadow-md">
            <div className="flex gap-1">
              {[0,1,2].map((i) => (
                <Heart key={i} className={`w-7 h-7 transition-all ${i < lives ? 'text-primary fill-primary' : 'text-gray-300'}`} />
              ))}
            </div>
            <div className="flex items-center gap-6">
              {combo >= 5 && (
                <div className="text-lg font-black text-orange-500 animate-pulse">
                  🔥 Combo ×{combo}
                </div>
              )}
              <div className="text-2xl font-black text-secondary">
                Score: <span className="text-primary">{score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game area */}
        <div className="max-w-5xl mx-auto w-full px-4 mt-3 flex flex-col">
          <div className="relative w-full bg-slate-800 border-4 border-secondary rounded-t-3xl overflow-hidden shadow-inner"
            style={{ height: CONTAINER_HEIGHT }}
          >
            {/* Catch zone visual indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-[45%] left-0 right-0 h-0.5 bg-white/20 border-dashed border-b-2 border-white/30 pointer-events-none" />

            {/* Overlays */}
            <AnimatePresence>
              {gameState === 'over' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-secondary/95 z-40 flex flex-col items-center justify-center gap-4"
                >
                  <Trophy className="w-20 h-20 text-accent" />
                  <h2 className="text-5xl font-black text-white">Game Over!</h2>
                  <p className="text-2xl font-bold text-accent">Score: {score}</p>
                  {score >= highScore && score > 0 && (
                    <p className="text-lg font-bold text-yellow-300">🏆 New High Score!</p>
                  )}
                  <p className="text-base font-medium text-white/70">Best: {highScore}</p>
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 mt-2 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xl h-14 px-8 shadow-[0_6px_0_hsl(1,72%,29%)] active:translate-y-1 active:shadow-none transition-all"
                  >
                    <RotateCcw className="w-5 h-5" /> Play Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {gameState === 'start' && (
              <div className="absolute inset-0 bg-secondary/95 z-40 flex flex-col items-center justify-center gap-6">
                <div className="text-6xl">♻️</div>
                <h2 className="text-4xl font-black text-white">Ready to sort?</h2>
                <button
                  onClick={startGame}
                  className="rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-2xl h-20 px-14 shadow-[0_8px_0_hsl(1,72%,29%)] active:translate-y-2 active:shadow-none transition-all"
                >
                  Start Sorting!
                </button>
              </div>
            )}

            {gameState === 'paused' && (
              <div className="absolute inset-0 bg-secondary/85 backdrop-blur-sm z-40 flex items-center justify-center">
                <h2 className="text-6xl font-black text-white uppercase tracking-widest">Paused</h2>
              </div>
            )}

            {/* Falling items (GPU Accelerated) */}
            {items.map((item) => (
              <FallingItem
                key={item.uid}
                item={item}
                gameState={gameState}
                onMissed={handleItemMissed}
                onRemove={removeItem}
              />
            ))}

            {/* Floating Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  key={feedback.id}
                  initial={{ opacity: 1, y: 0, scale: 0.5 }}
                  animate={{ opacity: 0, y: -80, scale: 1.5 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`absolute font-black text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-30 pointer-events-none ${feedback.color}`}
                  style={{ left: `${feedback.x}%`, bottom: '20%' }}
                >
                  {feedback.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bins */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 bg-muted border-4 border-t-0 border-secondary rounded-b-3xl p-4 shadow-xl relative z-20">
            {ITEM_TYPES.map((bin) => (
              <button
                key={bin.id}
                onClick={() => handleBinClick(bin.id)}
                disabled={gameState !== 'playing'}
                className={`flex flex-col items-center justify-center rounded-2xl border-4 py-4 text-white font-black text-xs sm:text-sm md:text-base tracking-wide shadow-[0_4px_0_rgba(0,0,0,0.2)] transition-all disabled:opacity-40 disabled:cursor-not-allowed outline-none 
                  ${activeBin === bin.id ? bin.activeColor : bin.binColor}`}
                style={{ minHeight: 90 }}
              >
                <span className="text-3xl mb-1 drop-shadow-md">🗑️</span>
                {bin.binLabel}
              </button>
            ))}
          </div>

          {/* Bin legend */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {ITEM_TYPES.map((bin) => (
              <div key={bin.id} className={`rounded-2xl border-2 p-3 text-sm font-bold shadow-sm ${bin.bgColor} ${bin.textColor}`}>
                <p className="font-black mb-1">{bin.binLabel.replace(/\[\d\]/, '')}</p>
                <p className="text-xs font-medium opacity-80">
                  {bin.id === 'plastic' && 'Bottles, cups, buckets'}
                  {bin.id === 'paper'   && 'News, cardboard, sheets'}
                  {bin.id === 'organic' && 'Food scraps & peels'}
                  {bin.id === 'general' && 'Shoes, batteries, toys'}
                </p>
              </div>
            ))}
            <div className="col-span-2 md:col-span-4 rounded-2xl border-2 p-3 text-sm font-bold bg-slate-100 border-slate-300 text-slate-700 shadow-sm flex items-center gap-3">
              <span className="text-2xl">☢️</span>
              <div>
                <p className="font-black mb-1 text-red-600">HAZARDS (Do not touch!)</p>
                <p className="text-xs font-medium opacity-80">Radioactive materials, syringes, and chemicals. Let them fall off the screen safely to earn points!</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <GameTutorial
              title="Recycling Master"
              objective="Sort falling trash items into the correct recycling bins before they hit the ground!"
              controls="Click the bins or use keyboard numbers 1, 2, 3, 4 to catch items in the lower half of the screen."
              rules={[
                'Items falling past the dashed line can be sorted.',
                'Use keys 1 to 4 for lightning-fast sorting.',
                'Watch out for Hazards (☢️ 💉)! Do NOT click any bin when they are at the bottom. Let them drop.',
                'Wrong bin or missing a normal item costs a life ❤️.',
                'The game gets progressively faster. Build combos to multiply your score!',
              ]}
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

/* ─── Sub-component: highly performant falling item ──────────────── */
function FallingItem({ item, gameState, onMissed, onRemove }) {
  const divRef         = useRef(null);
  const rafRef         = useRef(null);
  const pausedRef      = useRef(false);
  const pausedAtRef    = useRef(0);
  const totalPausedRef = useRef(0);

  // Sync pause state
  useEffect(() => {
    if (gameState === 'paused') {
      pausedRef.current = true;
      pausedAtRef.current = Date.now();
    } else if (gameState === 'playing' && pausedRef.current) {
      pausedRef.current = false;
      totalPausedRef.current += Date.now() - pausedAtRef.current;
    }
  }, [gameState]);

  // Main animation loop
  useEffect(() => {
    if (item.caught) return; 

    const animate = () => {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = Date.now() - item.spawnedAt - totalPausedRef.current;
      const progress = elapsed / item.fallDuration;

      if (divRef.current) {
        divRef.current.style.transform = `translate3d(0, ${progress * (CONTAINER_HEIGHT + 100)}px, 0)`;
      }

      if (progress >= 1) {
        onMissed(item);
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [item, onMissed]);

  // Animation on catch
  useEffect(() => {
    if (item.caught && divRef.current) {
      cancelAnimationFrame(rafRef.current);
      
      const el = divRef.current;
      el.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      
      if (item.caught === 'success') {
        el.style.transform += ' scale(0) translateY(50px)';
        el.style.opacity = '0';
      } else if (item.caught === 'fail') {
        el.style.transform += ' scale(1.5) rotate(15deg)';
        el.style.opacity = '0';
        el.style.backgroundColor = '#ef4444'; 
        el.style.borderColor = '#b91c1c';
      }

      const timeout = setTimeout(() => onRemove(item.uid), 300);
      return () => clearTimeout(timeout);
    }
  }, [item.caught, item.uid, onRemove]);

  const typeInfo = ITEM_TYPES.find((t) => t.id === item.id);
  const isHazard = item.id === 'hazard';

  const bgColor = isHazard ? 'bg-slate-900 border-slate-700' : typeInfo?.bgColor || 'bg-white';
  const textColor = isHazard ? 'text-red-500' : typeInfo?.textColor || 'text-secondary';

  return (
    <div
      ref={divRef}
      className="absolute flex flex-col items-center gap-1 pointer-events-none z-10 will-change-transform"
      style={{ left: `${item.x}%`, top: '-80px', marginLeft: '-32px' }} 
    >
      <div
        className={`w-16 h-16 rounded-2xl border-4 flex items-center justify-center text-4xl shadow-lg 
          ${bgColor} ${isHazard ? 'ring-4 ring-red-500 ring-offset-2 animate-pulse' : ''}`}
      >
        {item.emoji}
      </div>
      <span className={`text-xs font-black rounded-full px-2 py-0.5 shadow-sm bg-white/90 border-2 ${textColor}`}>
        {item.label}
      </span>
    </div>
  );
}
