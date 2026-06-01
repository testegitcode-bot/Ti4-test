import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Timer, Zap } from 'lucide-react';
import Footer from '@/components/Footer.jsx';
import { GameTutorial } from '@/components/games/GameTutorial.jsx';
import { salvarPontuacao } from "@/services/rankingService";

/* ── Expanded Word Bank (Sustainability Focus) ── */
const wordBank = [
  // Short (<= 4 letters)
  'tree', 'leaf', 'wind', 'sun', 'dirt', 'rain', 'pure', 'save', 'eco', 'air',
  'seed', 'wood', 'grow', 'soil', 'tide', 'warm', 'cool', 'bird', 'bug', 'pond',
  'lake', 'star', 'moon', 'rock', 'sand', 'dust', 'heat', 'life', 'wild', 'care',
  
  // Medium (5 - 7 letters)
  'water', 'earth', 'green', 'clean', 'plant', 'solar', 'ocean', 'nature', 'forest',
  'planet', 'energy', 'reduce', 'reuse', 'carbon', 'global', 'ozone', 'glass', 'paper',
  'metal', 'trash', 'waste', 'fossil', 'river', 'stream', 'flower', 'animal', 'vegan',
  'safari', 'jungle', 'desert', 'tundra', 'valley', 'breeze', 'storm', 'cloud', 'bloom',

  // Long (8+ letters)
  'recycle', 'compost', 'organic', 'climate', 'habitat', 'ecology', 'wildlife', 'protect',
  'sustainable', 'conservation', 'biodiversity', 'pollution', 'environment', 'renewable',
  'emissions', 'footprint', 'biosphere', 'ecosystem', 'greenhouse', 'preservation',
  'resources', 'atmosphere', 'endangered', 'extinction', 'efficiency', 'deforestation',
  'temperature', 'alternative', 'agriculture', 'upcycling', 'vegetation', 'wilderness'
];

export default function TypingGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [wordsTyped, setWordsTyped] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isLowTime, setIsLowTime] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  // Mantém um registro das palavras já usadas nesta rodada para evitar repetição
  const [usedWords, setUsedWords] = useState(new Set());

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const pontuacaoEnviadaRef = useRef(false);

  /* ── Difficulty & Randomization Logic ── */
  const getRandomWord = useCallback((currentScore, currentUsedSet) => {
    let pool = [];
    
    // Progressão de dificuldade baseada na quantidade de palavras acertadas
    if (currentScore < 5) {
      pool = wordBank.filter((w) => w.length <= 4); // Fase 1: Palavras curtas
    } else if (currentScore < 15) {
      pool = wordBank.filter((w) => w.length >= 5 && w.length <= 7); // Fase 2: Médias
    } else {
      pool = wordBank.filter((w) => w.length >= 8); // Fase 3: Longas
    }

    // Filtra as palavras já usadas
    let availableWords = pool.filter(w => !currentUsedSet.has(w));
    
    // Se esgotar as palavras daquele tamanho, permite repetir limpando o set
    if (availableWords.length === 0) {
      availableWords = pool;
      currentUsedSet.clear(); 
    }

    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    currentUsedSet.add(randomWord);
    return randomWord;
  }, []);

  /* ── Timer ── */
  useEffect(() => {
    if (gameStarted && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current);
            setGameOver(true);
            return 0;
          }
          const t = prev - 0.1;
          setIsLowTime(t <= 3);
          return t;
        });
      }, 100);
    }
    return () => clearInterval(timerRef.current);
  }, [gameStarted, gameOver]);

  /* ── Auto Focus ── */
  useEffect(() => {
    if (gameStarted && !gameOver) {
      inputRef.current?.focus();
    }
  }, [gameStarted, gameOver, currentWord]);

  /* ── Input Handler ── */
  const handleInputChange = (e) => {
    const value = e.target.value.toLowerCase();
    setUserInput(value);
    
    // Verifica acerto
    if (value === currentWord) {
      const newCount = wordsTyped + 1;
      
      // Bônus de tempo decrescente (quanto mais longe, menos tempo ganha)
      const bonus = Math.max(0.5, 3 - newCount * 0.1);
      
      setTimeLeft((prev) => prev + bonus);
      setScore((prev) => prev + currentWord.length * 10);
      setWordsTyped(newCount);
      setUserInput('');
      
      // Sorteia a próxima palavra
      const newWordSet = new Set(usedWords);
      setCurrentWord(getRandomWord(newCount, newWordSet));
      setUsedWords(newWordSet);
      
      setFeedback(`+${bonus.toFixed(1)}s`);
      setTimeout(() => setFeedback(null), 500);
    }
  };

  const handleStart = () => {
    pontuacaoEnviadaRef.current = false;

    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setWordsTyped(0);
    setTimeLeft(10);
    setIsLowTime(false);
    setUserInput('');
    
    // Reseta o set e sorteia a primeira
    const newUsedSet = new Set();
    setCurrentWord(getRandomWord(0, newUsedSet));
    setUsedWords(newUsedSet);
  };

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

  /* ── GAME OVER SCREEN ─────────────────── */
  if (gameOver) {
    return (
      <>
        <Helmet><title>Game Over – Word Climber</title></Helmet>
        <div className="min-h-screen bg-background flex flex-col">
          <section className="flex-grow py-20 px-4 flex items-center justify-center">
            <div className="max-w-xl w-full">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-4xl p-10 border-8 border-secondary shadow-2xl text-center"
              >
                <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Trophy className="w-12 h-12 text-secondary" />
                </div>
                <h2 className="text-5xl font-black text-secondary mb-4">Time's Up!</h2>
                <div className="bg-muted rounded-3xl p-6 mb-8">
                  <p className="text-xl font-bold text-secondary/70 mb-2">Final Score</p>
                  <p className="text-6xl font-black text-primary">{score}</p>
                  <p className="text-lg font-bold text-secondary mt-4">Words Typed: {wordsTyped}</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleStart}
                    className="flex items-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-xl h-16 px-8 shadow-[0_6px_0_hsl(1,72%,29%)] active:translate-y-1 active:shadow-none transition-all"
                  >
                    <RotateCcw className="w-5 h-5" /> Play Again
                  </button>
                  <Link
                    to="/games"
                    className="flex items-center gap-2 rounded-full border-4 border-secondary text-secondary font-bold text-xl h-16 px-8 hover:bg-secondary/10 transition-all"
                  >
                    Exit
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
          <Footer />
        </div>
      </>
    );
  }

  /* ── START SCREEN ─────────────────────── */
  if (!gameStarted) {
    return (
      <>
        <Helmet><title>Word Climber – NextStep English</title></Helmet>
        <div className="min-h-screen bg-background flex flex-col">
          <section className="flex-grow py-20 px-4">
            <div className="max-w-2xl mx-auto">
              <Link
                to="/games"
                className="inline-flex items-center gap-2 mb-8 rounded-full font-bold text-secondary hover:bg-secondary/10 px-4 py-2 transition-all"
              >
                <ArrowLeft className="w-5 h-5" /> Back to Games
              </Link>

              <div className="rounded-4xl border-8 border-secondary shadow-2xl overflow-hidden bg-white">
                <div className="bg-secondary p-8 text-center text-white">
                  <h1 className="text-5xl font-black mb-3">Word Climber</h1>
                  <p className="text-xl font-medium opacity-90">Type fast to beat the clock!</p>
                </div>
                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-6 rounded-3xl border-4 border-blue-200">
                      <Timer className="w-10 h-10 text-blue-500 mb-4" />
                      <h3 className="font-bold text-xl text-secondary mb-2">Beat the Clock</h3>
                      <p className="text-secondary/80 font-medium">Start with 10 seconds. Game ends when time runs out!</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-3xl border-4 border-green-200">
                      <Zap className="w-10 h-10 text-green-500 mb-4" />
                      <h3 className="font-bold text-xl text-secondary mb-2">Earn Time</h3>
                      <p className="text-secondary/80 font-medium">Every correct word adds bonus time. Type fast!</p>
                    </div>
                  </div>
                  <button
                    onClick={handleStart}
                    className="w-full rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-2xl h-20 shadow-[0_8px_0_hsl(1,72%,29%)] active:translate-y-2 active:shadow-none transition-all"
                  >
                    Start Typing!
                  </button>
                </div>
              </div>

              <GameTutorial
                title="Word Climber"
                objective="Type English words related to nature and sustainability before time runs out!"
                controls="Just type in the input field — the word changes automatically when you get it right."
                rules={[
                  'Start with 10 seconds on the clock.',
                  'Each correct word adds bonus time.',
                  'Words get longer and harder as your score increases.',
                  'The game ends when time reaches zero.',
                ]}
              />
            </div>
          </section>
          <Footer />
        </div>
      </>
    );
  }

  /* ── PLAYING ──────────────────────────── */
  // Lógica para colorir a letra que está sendo digitada (Verde = certo, Vermelho = errado)
  const isInputWrong = userInput && !currentWord.startsWith(userInput);

  return (
    <>
      <Helmet><title>Playing – Word Climber</title></Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <section className="flex-grow py-12 px-4 flex items-center justify-center">
          <div className="max-w-4xl w-full">
            {/* HUD */}
            <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-3xl border-4 border-secondary shadow-lg">
              <div className="text-2xl font-black text-secondary">
                Score: <span className="text-primary">{score}</span>
              </div>
              <div
                className={`text-3xl font-black px-6 py-2 rounded-2xl transition-colors ${
                  isLowTime ? 'bg-destructive text-white animate-pulse' : 'bg-accent text-secondary'
                }`}
              >
                {timeLeft.toFixed(1)}s
              </div>
            </div>

            {/* Game Card */}
            <div className="bg-white rounded-4xl border-8 border-secondary shadow-2xl p-12 text-center relative overflow-hidden">
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.5 }}
                    animate={{ opacity: 1, y: -50, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 text-3xl font-black text-green-500 drop-shadow-md z-10"
                  >
                    {feedback}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-12">
                <p className="text-xl font-bold text-secondary/50 mb-4 uppercase tracking-widest">
                  Type this word:
                </p>
                <motion.div
                  key={currentWord}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl md:text-7xl font-black tracking-tight flex justify-center"
                >
                  {/* Destaque visual: pinta de verde as letras certas até o momento */}
                  {currentWord.split('').map((letter, index) => {
                    let colorClass = 'text-secondary'; // default
                    if (index < userInput.length) {
                      colorClass = userInput[index] === letter ? 'text-green-500' : 'text-red-500 opacity-50';
                    }
                    return (
                      <span key={index} className={colorClass}>
                        {letter}
                      </span>
                    );
                  })}
                </motion.div>
              </div>

              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                className={`w-full text-center text-4xl font-bold h-24 rounded-3xl border-4 shadow-inner outline-none transition-colors ${
                  isInputWrong
                    ? 'border-destructive bg-red-50 text-destructive'
                    : 'border-secondary bg-slate-50 text-secondary'
                }`}
                placeholder="Type here..."
                autoFocus
                autoComplete="off"
                spellCheck="false"
              />
              
              {isInputWrong && (
                <p className="text-destructive font-bold mt-4 animate-bounce">
                  Typo! Press Backspace to fix it!
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
