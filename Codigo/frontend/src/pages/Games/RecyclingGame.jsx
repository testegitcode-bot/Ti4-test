import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Heart, Pause, Play, Wind } from 'lucide-react';
import Footer from '@/components/Footer.jsx';
import { salvarPontuacao } from "@/services/rankingService";

/* ─── Curiosidades (Trivia) ──────────────────────────────────────── */
// Banco de curiosidades sobre sustentabilidade e reciclagem.
// Essas mensagens educacionais podem ser exibidas durante as partidas 
// ou na tela de fim de jogo para engajar o jogador.
const TRIVIA_BANK = [
  "Did you know? It takes 500 years for a plastic bottle to decompose!",
  "Did you know? Recycling one aluminum can saves enough energy to listen to a full album on your phone!",
  "Did you know? Paper can be recycled up to 7 times before the fibers become too short.",
  "Did you know? Over 8 million tons of plastic enter the oceans every year.",
  "Did you know? Composting organic waste greatly reduces greenhouse gas emissions.",
  "Did you know? Glass is 100% recyclable and can be recycled endlessly without loss in quality or purity.",
  "Did you know? Throwing batteries in the general trash leaks toxic chemicals into the soil and water."
];

/* ─── Configurações de Dificuldade ────────────────────────────────── */
const DIFFICULTIES = {
  easy: {
    label: '😊 Easy',
    lives: 5,
    baseFall: 4600,
    baseInterval: 2600,
    speedMultiplier: 10,
    intervalMultiplier: 8,
    windThreshold: 600,
    hazardChance: 0.08
  },
  medium: {
    label: '😤 Medium',
    lives: 3,
    baseFall: 3800,
    baseInterval: 2200,
    speedMultiplier: 12,
    intervalMultiplier: 10,
    windThreshold: 450,
    hazardChance: 0.15
  },
  hard: {
    label: '🔥 Hard',
    lives: 2,
    baseFall: 3000,
    baseInterval: 1600,
    speedMultiplier: 15,
    intervalMultiplier: 14,
    windThreshold: 300,
    hazardChance: 0.22
  }
};

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

function getRandomItem(hazardChance) {
  const isHazard = Math.random() < hazardChance;
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
  const [diffKey, setDiffKey]     = useState('medium'); // Estado da dificuldade ativa
  const [score, setScore]         = useState(0);
  const [lives, setLives]         = useState(3);
  const [items, setItems]         = useState([]); 
  const [feedback, setFeedback]   = useState(null); 
  const [combo, setCombo]         = useState(0);
  const [activeBin, setActiveBin] = useState(null);
  
  const [trivia, setTrivia]       = useState('');
  const [isWindy, setIsWindy]     = useState(false);
  const [windWarning, setWindWarning] = useState(false);

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
    
    const currentDiff = DIFFICULTIES[diffKey];
    const item = getRandomItem(currentDiff.hazardChance);
    const id   = nextIdRef.current++;
    const x    = 15 + Math.random() * 70; 

    // VELOCIDADE VARIÁVEL adaptada pela dificuldade
    const baseFall = Math.max(1300, currentDiff.baseFall - scoreRef.current * currentDiff.speedMultiplier);
    const speedVariation = (Math.random() * 1200) - 600; 
    const fallDuration = baseFall + speedVariation;

    setItems((prev) => [
      ...prev,
      { ...item, uid: id, x, spawnedAt: Date.now(), fallDuration, caught: null },
    ]);
  }, [diffKey]);

  useEffect(() => {
    if (gameState !== 'playing') {
      clearTimeout(spawnRef.current);
      return;
    }

    const scheduleNextSpawn = () => {
      spawnItem();
      const currentDiff = DIFFICULTIES[diffKey];
      const baseInterval = Math.max(800, currentDiff.baseInterval - scoreRef.current * currentDiff.intervalMultiplier);
      const randomOffset = (Math.random() * 600) - 200; 
      const nextInterval = baseInterval + randomOffset;
      spawnRef.current = setTimeout(scheduleNextSpawn, nextInterval);
    };

    spawnRef.current = setTimeout(scheduleNextSpawn, 800);
    return () => clearTimeout(spawnRef.current);
  }, [gameState, spawnItem, diffKey]); 

  /* ── Game Logic: Remove Item ───────────────────────────── */
  const removeItem = useCallback((uid) => {
    setItems((prev) => prev.filter((i) => i.uid !== uid));
  }, []);

  /* ── Game Over Trigger ─────────────────────────────────── */
  const triggerGameOver = useCallback(() => {
    setGameState('over');
    stateRef.current = 'over';
    setTrivia(TRIVIA_BANK[Math.floor(Math.random() * TRIVIA_BANK.length)]);
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

      if (newLives <= 0) triggerGameOver();
    }
  }, [removeItem, triggerGameOver]);

  /* ── Game Logic: Bin Interaction ───────────────────────── */
  const handleBinClick = useCallback((binId) => {
    if (stateRef.current !== 'playing') return;

    setActiveBin(binId);
    setTimeout(() => setActiveBin(null), 150);

    setItems((prev) => {
      const activeItems = prev.filter(i => !i.caught);
      if (activeItems.length === 0) return prev;

      const now = Date.now();
      
      const scored = activeItems.reduce((best, item) => {
        const itemProgress = (now - item.spawnedAt) / item.fallDuration;
        const bestProgress = best ? (now - best.spawnedAt) / best.fallDuration : -Infinity;
        return itemProgress > bestProgress ? item : best;
      }, null);

      if (!scored) return prev;

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
        
        if (newLives <= 0) triggerGameOver();

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

        if (newLives <= 0) triggerGameOver();
      }

      return prev.map(i => i.uid === scored.uid ? { ...i, caught: newStatus } : i);
    });
  }, [triggerGameOver]);

  /* ── Controle do Vento (Wind Factor) ───────────────────── */
  useEffect(() => {
    const currentDiff = DIFFICULTIES[diffKey];
    if (score >= currentDiff.windThreshold && !isWindy) {
      setIsWindy(true);
      setWindWarning(true);
      setTimeout(() => setWindWarning(false), 3000);
    }
  }, [score, isWindy, diffKey]);

  /* ── Keyboard Controls ─────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (stateRef.current !== 'playing') return;
      const keyMap = { '1': 'plastic', '2': 'paper', '3': 'organic', '4': 'general' };
      const binId = keyMap[e.key];
      if (binId) handleBinClick(binId);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBinClick]);

  /* ── Start / reset ──────────────────────────────────────── */
  const startGame = () => {
    const currentDiff = DIFFICULTIES[diffKey];
    pontuacaoEnviadaRef.current = false;
    setScore(0);
    setLives(currentDiff.lives);
    setItems([]);
    setFeedback(null);
    setCombo(0);
    setIsWindy(false);
    setWindWarning(false);
    setTrivia('');
    
    livesRef.current    = currentDiff.lives;
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
    if (gameState === 'over' && !pontuacaoEnviadaRef.current) {
      pontuacaoEnviadaRef.current = true;
      salvarPontuacao("Recycling Master", score)
        .then((resposta) => { if (resposta) console.log("Pontuação salva"); })
        .catch((erro) => console.error("Erro ao salvar:", erro));
    }
  }, [gameState, score]);

  /* ── Cálculo da Evolução do Cenário ─────────────────────── */
  const cleanProgress = Math.min(1, score / DIFFICULTIES[diffKey].windThreshold);

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
          <h1 className="text-xl font-black text-secondary uppercase tracking-widest flex items-center gap-2">
            ♻️ Recycling Master {gameState === 'playing' && `· ${DIFFICULTIES[diffKey].label}`}
            {isWindy && <Wind className="w-5 h-5 text-blue-500 animate-pulse" />}
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
              {Array.from({ length: DIFFICULTIES[diffKey].lives }).map((_, i) => (
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
            
            {/* ─── SCENARIO EVOLUTION LAYERS ─── */}
            <div className="absolute inset-0 bg-blue-300 transition-colors duration-1000 z-0" />
            
            <div className="absolute rounded-full bg-yellow-300 shadow-[0_0_50px_20px_rgba(253,224,71,0.6)] transition-all duration-1000 z-0"
                 style={{ 
                   width: 100, height: 100, right: '15%', 
                   top: `${40 - cleanProgress * 30}%`, 
                   opacity: cleanProgress 
                 }} />

            <div className="absolute inset-0 bg-slate-800 transition-opacity duration-1000 z-0"
                 style={{ opacity: 1 - cleanProgress }} />

            <div className="absolute bottom-0 w-full h-16 bg-green-500 rounded-t-[100%] transition-all duration-1000 origin-bottom z-0"
                 style={{ transform: `scaleY(${cleanProgress})`, opacity: cleanProgress }} />
            {/* ─────────────────────────────── */}

            {/* Catch zone visual indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-white/20 to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-[45%] left-0 right-0 h-0.5 bg-white/40 border-dashed border-b-2 border-white/60 pointer-events-none z-10" />

            {/* Overlays */}
            <AnimatePresence>
              {gameState === 'over' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-secondary/95 z-40 flex flex-col items-center justify-center p-6 text-center"
                >
                  <Trophy className="w-16 h-16 text-accent mb-2" />
                  <h2 className="text-4xl font-black text-white mb-2">Game Over!</h2>
                  <p className="text-2xl font-bold text-accent mb-4">Score: {score}</p>
                  
                  {trivia && (
                    <div className="bg-blue-50/10 border-2 border-blue-300/30 rounded-2xl p-4 max-w-md w-full mb-6">
                      <p className="text-sm font-black text-blue-300 mb-1 uppercase tracking-wider">💡 Did you know?</p>
                      <p className="text-sm font-medium text-blue-100 leading-snug">{trivia}</p>
                    </div>
                  )}

                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xl h-14 px-8 shadow-[0_6px_0_hsl(1,72%,29%)] active:translate-y-1 active:shadow-none transition-all"
                  >
                    <RotateCcw className="w-5 h-5" /> Play Again
                  </button>
                </motion.div>
              )}

              {windWarning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                  className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center pointer-events-none"
                >
                  <div className="text-center px-10 py-6 bg-white rounded-3xl border-8 border-blue-400 shadow-2xl">
                    <Wind className="w-20 h-20 text-blue-500 mx-auto mb-2 animate-bounce" />
                    <h2 className="text-4xl font-black text-blue-600 italic">WIND WARNING!</h2>
                    <p className="text-lg font-bold text-slate-500 mt-2">Watch out for the swaying items!</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {gameState === 'start' && (
              <div className="absolute inset-0 bg-secondary/95 z-40 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-6xl mb-2">♻️</div>
                <h2 className="text-4xl font-black text-white mb-6">Ready to sort?</h2>
                
                {/* Seletor de Dificuldade */}
                <div className="max-w-md w-full mb-8 bg-white/10 p-4 rounded-3xl border border-white/20">
                  <p className="text-xs font-black text-accent uppercase tracking-wider mb-3">Select Difficulty:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(DIFFICULTIES).map(([key, d]) => (
                      <button
                        key={key}
                        onClick={() => setDiffKey(key)}
                        className={`rounded-2xl border-4 py-3 px-2 font-bold text-xs sm:text-sm transition-all ${
                          diffKey === key 
                            ? 'bg-primary text-white border-primary shadow-lg scale-105' 
                            : 'border-white/30 text-white hover:bg-white/10'
                        }`}
                      >
                        {d.label}
                        <br />
                        <span className="text-[10px] opacity-75 font-medium">{d.lives}❤️</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-2xl h-18 px-14 shadow-[0_8px_0_hsl(1,72%,29%)] active:translate-y-2 active:shadow-none transition-all"
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

            {/* Falling items */}
            {items.map((item) => (
              <FallingItem
                key={item.uid}
                item={item}
                gameState={gameState}
                isWindy={isWindy} 
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

          {/* INSTRUÇÕES DO JOGO */}
          <div className="mt-8 mb-6 bg-white rounded-3xl border-4 border-secondary shadow-xl p-8">
            <h2 className="text-2xl font-black text-secondary mb-2">🎮 How to Play</h2>
            <p className="text-muted-foreground mb-6 font-medium">Follow the instructions on the screen to play.</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                <h3 className="text-lg font-bold text-secondary mb-3 flex items-center gap-2">
                  <span>🎯</span> Objective & Controls
                </h3>
                <ul className="text-gray-700 space-y-2 text-sm font-medium">
                  <li>• Sort falling trash items into the correct recycling bins before they hit the ground!</li>
                  <li>• <strong>Click</strong> the bins or use keyboard numbers <strong>1, 2, 3, 4</strong> to catch items.</li>
                  <li>• Items can only be sorted when they fall past the dashed line.</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                <h3 className="text-lg font-bold text-secondary mb-3 flex items-center gap-2">
                  <span>💡</span> Rules & Tips
                </h3>
                <ul className="text-gray-700 space-y-2 text-sm font-medium">
                  <li>• <span className="text-red-600 font-bold">Hazards (☢️ 💉):</span> Do NOT click any bin when they are at the bottom. Let them drop safely!</li>
                  <li>• Dificuldades mais altas reduzem suas vidas e aceleram a esteira. Fique atento ao alerta de <strong>Wind Warning 🌪️</strong> que surge de acordo com seu score!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

/* ─── Sub-component: highly performant falling item ──────────────── */
function FallingItem({ item, gameState, isWindy, onMissed, onRemove }) {
  const divRef         = useRef(null);
  const rafRef         = useRef(null);
  const pausedRef      = useRef(false);
  const pausedAtRef    = useRef(0);
  const totalPausedRef = useRef(0);

  useEffect(() => {
    if (gameState === 'paused') {
      pausedRef.current = true;
      pausedAtRef.current = Date.now();
    } else if (gameState === 'playing' && pausedRef.current) {
      pausedRef.current = false;
      totalPausedRef.current += Date.now() - pausedAtRef.current;
    }
  }, [gameState]);

  useEffect(() => {
    if (item.caught) return; 

    const animate = () => {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = Date.now() - item.spawnedAt - totalPausedRef.current;
      const progress = elapsed / item.fallDuration;

      const windOffset = isWindy && !item.caught ? Math.sin(elapsed / 250 + item.uid) * 45 : 0;
      const rotate = isWindy && !item.caught ? Math.sin(elapsed / 250 + item.uid) * 15 : 0;

      if (divRef.current) {
        divRef.current.style.transform = `translate3d(${windOffset}px, ${progress * (CONTAINER_HEIGHT + 100)}px, 0) rotate(${rotate}deg)`;
      }

      if (progress >= 1) {
        onMissed(item);
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [item, onMissed, isWindy]);

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
      className="absolute flex flex-col items-center gap-1 pointer-events-none z-20 will-change-transform"
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
