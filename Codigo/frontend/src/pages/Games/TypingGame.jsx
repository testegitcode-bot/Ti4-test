import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Timer, Zap, BookOpen } from 'lucide-react';
import Footer from '@/components/Footer.jsx';
import { salvarPontuacao } from "@/services/rankingService";

/* ── Expanded Word Bank with Translations (Sustainability Focus) ── */
const WORD_TRANSLATIONS = {
  // Short (<= 4 letters)
  'tree': 'árvore', 'leaf': 'folha', 'wind': 'vento', 'sun': 'sol', 'dirt': 'terra', 
  'rain': 'chuva', 'pure': 'puro', 'save': 'salvar', 'eco': 'eco', 'air': 'ar',
  'seed': 'semente', 'wood': 'madeira', 'grow': 'crescer', 'soil': 'solo', 'tide': 'maré', 
  'warm': 'quente', 'cool': 'fresco', 'bird': 'pássaro', 'bug': 'inseto', 'pond': 'lagoa',
  'lake': 'lago', 'star': 'estrela', 'moon': 'lua', 'rock': 'pedra', 'sand': 'areia', 
  'dust': 'poeira', 'heat': 'calor', 'life': 'vida', 'wild': 'selvagem', 'care': 'cuidar',
  
  // Medium (5 - 7 letters)
  'water': 'água', 'earth': 'terra', 'green': 'verde', 'clean': 'limpo', 'plant': 'planta', 
  'solar': 'solar', 'ocean': 'oceano', 'nature': 'natureza', 'forest': 'floresta',
  'planet': 'planeta', 'energy': 'energia', 'reduce': 'reduzir', 'reuse': 'reutilizar', 
  'carbon': 'carbono', 'global': 'global', 'ozone': 'ozônio', 'glass': 'vidro', 'paper': 'papel',
  'metal': 'metal', 'trash': 'lixo', 'waste': 'desperdício', 'fossil': 'fóssil', 'river': 'rio', 
  'stream': 'riacho', 'flower': 'flor', 'animal': 'animal', 'vegan': 'vegano',
  'safari': 'safári', 'jungle': 'selva', 'desert': 'deserto', 'tundra': 'tundra', 'valley': 'vale', 
  'breeze': 'brisa', 'storm': 'tempestade', 'cloud': 'nuvem', 'bloom': 'florescer',

  // Long (8+ letters)
  'recycle': 'reciclar', 'compost': 'compostagem', 'organic': 'orgânico', 'climate': 'clima', 
  'habitat': 'habitat', 'ecology': 'ecologia', 'wildlife': 'vida selvagem', 'protect': 'proteger',
  'sustainable': 'sustentável', 'conservation': 'conservação', 'biodiversity': 'biodiversidade', 
  'pollution': 'poluição', 'environment': 'meio ambiente', 'renewable': 'renovável',
  'emissions': 'emissões', 'footprint': 'pegada', 'biosphere': 'biosfera', 'ecosystem': 'ecossistema', 
  'greenhouse': 'estufa', 'preservation': 'preservação', 'resources': 'recursos', 
  'atmosphere': 'atmosfera', 'endangered': 'ameaçado', 'extinction': 'extinção', 
  'efficiency': 'eficiência', 'deforestation': 'desmatamento', 'temperature': 'temperatura', 
  'alternative': 'alternativa', 'agriculture': 'agricultura', 'upcycling': 'reaproveitamento', 
  'vegetation': 'vegetação', 'wilderness': 'natureza selvagem'
};

const wordBank = Object.keys(WORD_TRANSLATIONS);

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
  
  // States para o histórico e traduções
  const [usedWords, setUsedWords] = useState(new Set());
  const [typedHistory, setTypedHistory] = useState([]);
  const [showTranslations, setShowTranslations] = useState(false);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const pontuacaoEnviadaRef = useRef(false);

  /* ── Difficulty & Randomization Logic ── */
  const getRandomWord = useCallback((wordCount, currentUsedSet) => {
    let pool = [];
    
    // PROGRESSÃO DE DIFICULDADE: Transição mais rápida para palavras difíceis
    if (wordCount < 4) {
      pool = wordBank.filter((w) => w.length <= 4); // Fase 1: Palavras curtas
    } else if (wordCount < 12) {
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
      
      // DIFICULDADE DINÂMICA: Bônus de tempo cai mais rápido e tem um limite inferior menor
      const bonus = Math.max(0.3, 2.8 - newCount * 0.15);
      
      setTimeLeft((prev) => prev + bonus);
      setScore((prev) => prev + currentWord.length * 10);
      setWordsTyped(newCount);
      setUserInput('');
      
      // Atualiza histórico de traduções
      setTypedHistory(prev => [...prev, currentWord]);
      
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
    setTypedHistory([]);
    setShowTranslations(false);
    
    // Reseta o set e sorteia a primeira
    const newUsedSet = new Set();
    setCurrentWord(getRandomWord(0, newUsedSet));
    setUsedWords(newUsedSet);
  };

  useEffect(() => {
    if (gameOver && !pontuacaoEnviadaRef.current) {
      pontuacaoEnviadaRef.current = true;

      salvarPontuacao("Word Climber", score)
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
          <section className="flex-grow py-12 px-4 flex items-center justify-center">
            <div className="max-w-xl w-full">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-4xl p-8 md:p-10 border-8 border-secondary shadow-2xl text-center"
              >
                {!showTranslations ? (
                  <>
                    <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Trophy className="w-12 h-12 text-secondary" />
                    </div>
                    <h2 className="text-5xl font-black text-secondary mb-4">Time's Up!</h2>
                    <div className="bg-muted rounded-3xl p-6 mb-6">
                      <p className="text-xl font-bold text-secondary/70 mb-2">Final Score</p>
                      <p className="text-6xl font-black text-primary">{score}</p>
                      <p className="text-lg font-bold text-secondary mt-4">Words Typed: {wordsTyped}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-3 mb-6 text-secondary">
                      <BookOpen className="w-8 h-8" />
                      <h2 className="text-3xl font-black">Translations</h2>
                    </div>
                    <div className="bg-muted rounded-3xl p-4 mb-6 text-left h-[300px] overflow-y-auto scrollbar-thin border-2 border-secondary/10 shadow-inner">
                      {typedHistory.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {typedHistory.map((word, index) => (
                            <div key={index} className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm">
                              <span className="font-black text-lg text-secondary capitalize">{word}</span>
                              <span className="font-bold text-primary capitalize">{WORD_TRANSLATIONS[word]}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-secondary/50 font-bold">
                          No words typed!
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-3">
                  {wordsTyped > 0 && (
                    <button
                      onClick={() => setShowTranslations(!showTranslations)}
                      className="flex items-center justify-center gap-2 rounded-full border-4 border-secondary text-secondary font-bold text-lg h-14 hover:bg-secondary/10 transition-all"
                    >
                      <BookOpen className="w-5 h-5" />
                      {showTranslations ? 'Hide Translations' : 'View Translations'}
                    </button>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleStart}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-lg h-14 shadow-[0_4px_0_hsl(1,72%,29%)] active:translate-y-1 active:shadow-none transition-all"
                    >
                      <RotateCcw className="w-5 h-5" /> Play Again
                    </button>
                    <Link
                      to="/games"
                      className="flex-1 flex items-center justify-center gap-2 rounded-full bg-slate-200 text-secondary hover:bg-slate-300 font-bold text-lg h-14 transition-all"
                    >
                      Exit
                    </Link>
                  </div>
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

              {/* INSTRUÇÕES DO JOGO - TELA INICIAL */}
              <div className="mt-8 bg-white rounded-3xl border-4 border-secondary shadow-xl p-8">
                <h2 className="text-2xl font-black text-secondary mb-2">🎮 How to Play</h2>
                <p className="text-muted-foreground mb-6 font-medium">Follow the instructions on the screen to play.</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                    <h3 className="text-lg font-bold text-secondary mb-3 flex items-center gap-2">
                      <span>🎯</span> Objective & Controls
                    </h3>
                    <ul className="text-gray-700 space-y-2 text-sm font-medium">
                      <li>• Type English words related to nature and sustainability before time runs out!</li>
                      <li>• <strong>Type</strong> in the input field. The word changes automatically when correct.</li>
                      <li>• Use <strong>Backspace</strong> to fix typos.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                    <h3 className="text-lg font-bold text-secondary mb-3 flex items-center gap-2">
                      <span>💡</span> Rules & Tips
                    </h3>
                    <ul className="text-gray-700 space-y-2 text-sm font-medium">
                      <li>• You start with <strong>10 seconds</strong> on the clock.</li>
                      <li>• Every correct word adds <strong>bonus time</strong>. Faster typing = more time!</li>
                      <li>• Words get longer and harder as your score increases.</li>
                      <li>• <span className="text-red-500 font-bold">Red text</span> means you made a typo.</li>
                    </ul>
                  </div>
                </div>
              </div>
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

            {/* INSTRUÇÕES DO JOGO - TELA PLAYING (Aumento de Margem Superior: mt-16) */}
            <div className="mt-16 mb-6 bg-white rounded-3xl border-4 border-secondary shadow-xl p-8">
              <h2 className="text-2xl font-black text-secondary mb-2">🎮 How to Play</h2>
              <p className="text-muted-foreground mb-6 font-medium">Follow the instructions on the screen to play.</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                  <h3 className="text-lg font-bold text-secondary mb-3 flex items-center gap-2">
                    <span>🎯</span> Objective & Controls
                  </h3>
                  <ul className="text-gray-700 space-y-2 text-sm font-medium">
                    <li>• Type English words related to nature and sustainability before time runs out!</li>
                    <li>• <strong>Type</strong> in the input field. The word changes automatically when correct.</li>
                    <li>• Use <strong>Backspace</strong> to fix typos.</li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                  <h3 className="text-lg font-bold text-secondary mb-3 flex items-center gap-2">
                    <span>💡</span> Rules & Tips
                  </h3>
                  <ul className="text-gray-700 space-y-2 text-sm font-medium">
                    <li>• You start with <strong>10 seconds</strong> on the clock.</li>
                    <li>• Every correct word adds <strong>bonus time</strong>. Faster typing = more time!</li>
                    <li>• Words get longer and harder as your score increases.</li>
                    <li>• <span className="text-red-500 font-bold">Red text</span> means you made a typo.</li>
                  </ul>
                </div>
              </div>
            </div>
            
          </div>
        </section>
      </div>
    </>
  );
}