import React, { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Eye } from 'lucide-react';
import Footer from '@/components/Footer.jsx';
import { GameTutorial } from '@/components/games/GameTutorial.jsx';
import { salvarPontuacao } from "@/services/rankingService";

/* ─── Expanded Word Banks per theme ──────────────────────────────── */
const THEMES = {
  sustainability: {
    label: '🌱 Sustainability',
    words: [
      { word: 'SOLAR',    clue: 'Energy from the sun' },
      { word: 'WATER',    clue: 'Essential liquid for life' },
      { word: 'TREE',     clue: 'Tall plant that produces oxygen' },
      { word: 'WIND',     clue: 'Renewable energy from the air' },
      { word: 'GREEN',    clue: 'Color of nature and eco-friendly' },
      { word: 'RECYCLE',  clue: 'Process used materials again' },
      { word: 'ORGANIC',  clue: 'Natural, without chemicals' },
      { word: 'CLIMATE',  clue: 'Long-term weather patterns' },
      { word: 'OCEAN',    clue: 'Large body of salt water' },
      { word: 'CARBON',   clue: 'Element in CO₂ emissions' },
      { word: 'NATURE',   clue: 'The natural world around us' },
      { word: 'ENERGY',   clue: 'Power for homes and machines' },
      { word: 'REDUCE',   clue: 'Use less to save resources' },
      { word: 'PLANET',   clue: 'Earth is our home ___' },
      { word: 'REUSE',    clue: 'Use something more than once' },
      { word: 'OZONE',    clue: 'Layer that protects the Earth' },
      { word: 'ECOLOGY',  clue: 'Study of organisms and environments' },
      { word: 'TRASH',    clue: 'Waste material to be thrown away' },
      { word: 'BIOME',    clue: 'A large naturally occurring community' },
      { word: 'VEGAN',    clue: 'Diet excluding animal products' }
    ],
  },
  animals: {
    label: '🐾 Animals',
    words: [
      { word: 'LION',     clue: 'King of the jungle' },
      { word: 'EAGLE',    clue: 'Large bird of prey' },
      { word: 'SHARK',    clue: 'Fearsome ocean predator' },
      { word: 'BEAR',     clue: 'Large furry mammal' },
      { word: 'FROG',     clue: 'Amphibian that hops and croaks' },
      { word: 'SNAKE',    clue: 'Legless reptile' },
      { word: 'WHALE',    clue: 'Largest animal on Earth' },
      { word: 'PARROT',   clue: 'Colorful bird that can speak' },
      { word: 'TIGER',    clue: 'Striped big cat from Asia' },
      { word: 'HORSE',    clue: 'Animal used for riding' },
      { word: 'MONKEY',   clue: 'Primate that climbs trees' },
      { word: 'DEER',     clue: 'Graceful forest animal with antlers' },
      { word: 'PANDA',    clue: 'Black and white bear from China' },
      { word: 'ZEBRA',    clue: 'African animal with black and white stripes' },
      { word: 'DOLPHIN',  clue: 'Smart marine mammal that jumps' },
      { word: 'TURTLE',   clue: 'Reptile with a hard shell' },
      { word: 'WOLF',     clue: 'Wild animal related to dogs' },
      { word: 'RABBIT',   clue: 'Small animal with long ears' },
      { word: 'SPIDER',   clue: 'Eight-legged arachnid' },
      { word: 'CAMEL',    clue: 'Desert animal with humps' }
    ],
  },
  food: {
    label: '🍎 Food & Drinks',
    words: [
      { word: 'APPLE',    clue: 'Round red or green fruit' },
      { word: 'BREAD',    clue: 'Baked food made from flour' },
      { word: 'MILK',     clue: 'White drink from cows' },
      { word: 'RICE',     clue: 'Grain eaten across Asia' },
      { word: 'SOUP',     clue: 'Hot liquid meal' },
      { word: 'SALAD',    clue: 'Cold dish of raw vegetables' },
      { word: 'PIZZA',    clue: 'Italian dish with cheese and toppings' },
      { word: 'JUICE',    clue: 'Liquid squeezed from fruit' },
      { word: 'CAKE',     clue: 'Sweet baked dessert' },
      { word: 'GRAPE',    clue: 'Small round fruit in clusters' },
      { word: 'LEMON',    clue: 'Sour yellow citrus fruit' },
      { word: 'BUTTER',   clue: 'Yellow fat spread on bread' },
      { word: 'CHEESE',   clue: 'Dairy product often yellow or white' },
      { word: 'SUGAR',    clue: 'Sweet white or brown crystals' },
      { word: 'ONION',    clue: 'Vegetable that makes you cry when cut' },
      { word: 'WATER',    clue: 'Clear liquid you drink' },
      { word: 'COFFEE',   clue: 'Dark caffeinated morning drink' },
      { word: 'STEAK',    clue: 'A high-quality piece of meat' },
      { word: 'POTATO',   clue: 'Root vegetable used for fries' },
      { word: 'HONEY',    clue: 'Sweet golden liquid made by bees' }
    ],
  },
  school: {
    label: '📚 School',
    words: [
      { word: 'BOOK',     clue: 'You read it to learn' },
      { word: 'PENCIL',   clue: 'Writing tool with graphite' },
      { word: 'DESK',     clue: 'Furniture where you study' },
      { word: 'CLASS',    clue: 'A group of students learning together' },
      { word: 'LESSON',   clue: 'Unit of teaching time' },
      { word: 'EXAM',     clue: 'A test of your knowledge' },
      { word: 'GRADE',    clue: 'Score received for your work' },
      { word: 'RULER',    clue: 'Tool for drawing straight lines' },
      { word: 'ERASER',   clue: 'Removes pencil marks' },
      { word: 'SCIENCE',  clue: 'Study of the natural world' },
      { word: 'MATH',     clue: 'Subject with numbers and equations' },
      { word: 'PAPER',    clue: 'You write on it' },
      { word: 'BOARD',    clue: 'Teacher writes on this at the front' },
      { word: 'BREAK',    clue: 'Time to rest between lessons' },
      { word: 'TEACHER',  clue: 'Person who educates students' },
      { word: 'LIBRARY',  clue: 'Room full of books to borrow' },
      { word: 'HISTORY',  clue: 'Study of past events' },
      { word: 'MUSIC',    clue: 'Class where you sing or play instruments' },
      { word: 'SCISSORS', clue: 'Tool used to cut paper' },
      { word: 'BACKPACK', clue: 'Bag you carry your school stuff in' }
    ],
  },
};

/* ─── Difficulty ─────────────────────────────────────────────────── */
const DIFFICULTIES = {
  easy:   { label: '😊 Easy',   wordCount: 5,  revealHints: 3 },
  medium: { label: '😤 Medium', wordCount: 8,  revealHints: 2 },
  hard:   { label: '🔥 Hard',   wordCount: 12, revealHints: 1 },
};

/* ─── Crossword Generator ────────────────────────────────────────── */
function generateCrossword(entries) {
  const cells = {}; 
  const placed = []; 

  const canPlace = (word, row, col, direction) => {
    const dr = direction === 'down' ? 1 : 0;
    const dc = direction === 'across' ? 1 : 0;
    
    if (cells[`${row - dr},${col - dc}`]) return false;
    
    const er = row + dr * word.length;
    const ec = col + dc * word.length;
    if (cells[`${er},${ec}`]) return false;

    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      const key = `${r},${c}`;
      if (cells[key]) {
        if (cells[key] !== word[i]) return false;
      } else {
        const p1 = direction === 'across' ? `${r - 1},${c}` : `${r},${c - 1}`;
        const p2 = direction === 'across' ? `${r + 1},${c}` : `${r},${c + 1}`;
        if (cells[p1] || cells[p2]) return false;
      }
    }
    return true;
  };

  const doPlace = (word, row, col, direction) => {
    const dr = direction === 'down' ? 1 : 0;
    const dc = direction === 'across' ? 1 : 0;
    for (let i = 0; i < word.length; i++) {
      cells[`${row + dr * i},${col + dc * i}`] = word[i];
    }
    placed.push({ ...entries.find(e => e.word === word), row, col, direction });
  };

  const first = entries[0];
  doPlace(first.word, 0, 0, 'across');

  for (const entry of entries.slice(1)) {
    let placed_flag = false;
    const shuffled = [...placed].sort(() => Math.random() - 0.5);

    for (const existing of shuffled) {
      for (let pi = 0; pi < existing.word.length && !placed_flag; pi++) {
        for (let wi = 0; wi < entry.word.length && !placed_flag; wi++) {
          if (existing.word[pi] !== entry.word[wi]) continue;

          const newDir = existing.direction === 'across' ? 'down' : 'across';
          const dr = existing.direction === 'down' ? 1 : 0;
          const dc = existing.direction === 'across' ? 1 : 0;
          const intersectR = existing.row + dr * pi;
          const intersectC = existing.col + dc * pi;
          const newRow = intersectR - (newDir === 'down' ? wi : 0);
          const newCol = intersectC - (newDir === 'across' ? wi : 0);

          if (canPlace(entry.word, newRow, newCol, newDir)) {
            doPlace(entry.word, newRow, newCol, newDir);
            placed_flag = true;
          }
        }
      }
      if (placed_flag) break;
    }
  }

  const rows = Object.keys(cells).map(k => parseInt(k.split(',')[0]));
  const cols = Object.keys(cells).map(k => parseInt(k.split(',')[1]));
  const minR = Math.min(...rows);
  const minC = Math.min(...cols);

  const normCells = {};
  for (const key in cells) {
    const [r, c] = key.split(',').map(Number);
    normCells[`${r - minR},${c - minC}`] = cells[key];
  }
  const normPlaced = placed.map(p => ({ ...p, row: p.row - minR, col: p.col - minC }));

  const numberMap = {};
  let num = 1;
  const maxR = Math.max(...Object.keys(normCells).map(k => parseInt(k.split(',')[0])));
  const maxC = Math.max(...Object.keys(normCells).map(k => parseInt(k.split(',')[1])));
  for (let r = 0; r <= maxR; r++) {
    for (let c = 0; c <= maxC; c++) {
      if (!normCells[`${r},${c}`]) continue;
      const startsWord = normPlaced.some(p => p.row === r && p.col === c);
      if (startsWord) { numberMap[`${r},${c}`] = num++; }
    }
  }
  const numberedPlaced = normPlaced.map(p => ({
    ...p,
    number: numberMap[`${p.row},${p.col}`],
  }));

  return { cells: normCells, placements: numberedPlaced, rows: maxR + 1, cols: maxC + 1 };
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function CrosswordGame() {
  const [phase, setPhase] = useState('config');
  const [themeKey, setThemeKey] = useState('sustainability');
  const [diffKey, setDiffKey] = useState('easy');
  const [puzzle, setPuzzle] = useState(null);
  const [userInput, setUserInput] = useState({});
  const [activeWord, setActiveWord] = useState(null);
  const [activeDir, setActiveDir] = useState('across');
  const [hintsLeft, setHintsLeft] = useState(3);
  const [revealed, setRevealed] = useState({});
  const [won, setWon] = useState(false);
  
  const pontuacaoEnviadaRef = useRef(false);

  const diff = DIFFICULTIES[diffKey];
  const theme = THEMES[themeKey];

  function calcularPontuacaoFinal() {
  const bonusDificuldade = {
    easy: 500,
    medium: 1000,
    hard: 1500,
  };

  const base = bonusDificuldade[diffKey] || 500;
  const totalPalavras = puzzle?.placements?.length || 0;
  const pontosPorPalavra = totalPalavras * 100;

  const dicasUsadas = diff.revealHints - hintsLeft;
  const penalidadeDicas = dicasUsadas * 150;

  return Math.max(10, base + pontosPorPalavra - penalidadeDicas);
}

  const startGame = useCallback(() => {
    pontuacaoEnviadaRef.current = false;

    // Sorteia o banco de palavras toda vez que o jogo inicia
    const pool = [...theme.words].sort(() => Math.random() - 0.5);
    const selected = pool.slice(0, diff.wordCount);
    const p = generateCrossword(selected);
    
    setPuzzle(p);
    setUserInput({});
    setRevealed({});
    setActiveWord(null);
    setHintsLeft(diff.revealHints);
    setWon(false);
    setPhase('playing');
  }, [themeKey, diffKey, diff, theme]);

  useEffect(() => {
    if (!puzzle || phase !== 'playing') return;
    const allCorrect = Object.entries(puzzle.cells).every(([key, letter]) => {
      return userInput[key] === letter || revealed[key];
    });
    if (allCorrect) setWon(true);
  }, [userInput, revealed, puzzle, phase]);

  const handleCellClick = (r, c) => {
    const key = `${r},${c}`;
    if (!puzzle.cells[key]) return;
    
    const wordsAt = puzzle.placements.filter(p => {
      const dr = p.direction === 'down' ? 1 : 0;
      const dc = p.direction === 'across' ? 1 : 0;
      for (let i = 0; i < p.word.length; i++) {
        if (p.row + dr * i === r && p.col + dc * i === c) return true;
      }
      return false;
    });
    if (!wordsAt.length) return;

    if (activeWord && wordsAt.some(w => w.word === activeWord)) {
      const other = wordsAt.find(w => w.word !== activeWord || w.direction !== activeDir);
      if (other) { setActiveWord(other.word); setActiveDir(other.direction); }
    } else {
      const w = wordsAt.find(w => w.direction === activeDir) || wordsAt[0];
      setActiveWord(w.word);
      setActiveDir(w.direction);
    }
  };

  const handleKeyDown = (e) => {
    if (!activeWord || phase !== 'playing') return;
    const wp = puzzle.placements.find(p => p.word === activeWord && p.direction === activeDir);
    if (!wp) return;

    const key = e.key.toUpperCase();
    if (/^[A-Z]$/.test(key)) {
      const dr = wp.direction === 'down' ? 1 : 0;
      const dc = wp.direction === 'across' ? 1 : 0;
      for (let i = 0; i < wp.word.length; i++) {
        const r = wp.row + dr * i;
        const c = wp.col + dc * i;
        const ck = `${r},${c}`;
        if (!userInput[ck] && !revealed[ck]) {
          setUserInput(prev => ({ ...prev, [ck]: key }));
          return;
        }
      }
    } else if (e.key === 'Backspace') {
      const dr = wp.direction === 'down' ? 1 : 0;
      const dc = wp.direction === 'across' ? 1 : 0;
      for (let i = wp.word.length - 1; i >= 0; i--) {
        const r = wp.row + dr * i;
        const c = wp.col + dc * i;
        const ck = `${r},${c}`;
        if (userInput[ck]) {
          setUserInput(prev => { const n = {...prev}; delete n[ck]; return n; });
          return;
        }
      }
    }
  };

  const handleRevealHint = () => {
    if (hintsLeft <= 0 || !activeWord) return;
    const wp = puzzle.placements.find(p => p.word === activeWord && p.direction === activeDir);
    if (!wp) return;
    const dr = wp.direction === 'down' ? 1 : 0;
    const dc = wp.direction === 'across' ? 1 : 0;
    const newRevealed = {...revealed};
    for (let i = 0; i < wp.word.length; i++) {
      newRevealed[`${wp.row + dr * i},${wp.col + dc * i}`] = true;
    }
    setRevealed(newRevealed);
    setHintsLeft(h => h - 1);
  };

  const getCellState = (r, c) => {
    const key = `${r},${c}`;
    if (!puzzle?.cells[key]) return 'empty';
    const isActive = activeWord && (() => {
      const wp = puzzle.placements.find(p => p.word === activeWord && p.direction === activeDir);
      if (!wp) return false;
      const dr = wp.direction === 'down' ? 1 : 0;
      const dc = wp.direction === 'across' ? 1 : 0;
      for (let i = 0; i < wp.word.length; i++) {
        if (wp.row + dr * i === r && wp.col + dc * i === c) return true;
      }
      return false;
    })();
    const input = userInput[key];
    const rev = revealed[key];
    const correct = (input === puzzle.cells[key]) || rev;
    return { isActive, input, rev, correct, expected: puzzle.cells[key] };
  };

  useEffect(() => {
  if (won && !pontuacaoEnviadaRef.current) {
    pontuacaoEnviadaRef.current = true;

    const pontuacaoFinal = calcularPontuacaoFinal();

    salvarPontuacao("Crossword", pontuacaoFinal)
        .then((resposta) => {
          if (resposta) {
            console.log("Pontuação final do Crossword salva com sucesso");
          }
        })
        .catch((erro) => console.error("Erro ao salvar pontuação:", erro));
    }
  }, [won, diffKey, hintsLeft, puzzle]);

  /* ── CONFIG ─────────────────────────────────────────────────────── */
  if (phase === 'config') {
    return (
      <>
        <Helmet><title>Crossword – NextStep English</title></Helmet>
        <div className="min-h-screen bg-background flex flex-col">
          <section className="flex-grow py-12 px-4">
            <div className="max-w-2xl mx-auto">
              <Link to="/games" className="inline-flex items-center gap-2 mb-8 rounded-full font-bold text-secondary hover:bg-secondary/10 px-4 py-2 transition-all">
                <ArrowLeft className="w-5 h-5" /> Back to Games
              </Link>

              <div className="rounded-3xl border-8 border-secondary shadow-2xl overflow-hidden bg-white">
                <div className="bg-secondary p-8 text-center text-white">
                  <div className="text-5xl mb-3">📝</div>
                  <h1 className="text-4xl font-black mb-2">Crossword</h1>
                  <p className="text-lg font-medium opacity-90">Fill in the vocabulary grid!</p>
                </div>

                <div className="p-8 space-y-8">
                  <div>
                    <p className="text-lg font-black text-secondary mb-3">Theme:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(THEMES).map(([key, t]) => (
                        <button key={key} onClick={() => setThemeKey(key)}
                          className={`rounded-2xl border-4 py-4 font-bold text-base transition-all ${themeKey === key ? 'bg-secondary text-white border-secondary' : 'border-secondary/30 text-secondary hover:bg-secondary/10'}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-lg font-black text-secondary mb-3">Difficulty:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(DIFFICULTIES).map(([key, d]) => (
                        <button key={key} onClick={() => setDiffKey(key)}
                          className={`rounded-2xl border-4 py-4 font-bold text-sm transition-all ${diffKey === key ? 'bg-primary text-white border-primary' : 'border-primary/30 text-primary hover:bg-primary/10'}`}>
                          {d.label}
                          <br />
                          <span className="text-xs opacity-75 font-medium">{d.wordCount} words</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={startGame}
                    className="w-full rounded-full bg-primary hover:bg-primary-dark text-white font-black text-2xl h-20 shadow-[0_8px_0_hsl(1,72%,29%)] active:translate-y-2 active:shadow-none transition-all">
                    Start Crossword! 📝
                  </button>
                </div>
              </div>

              <GameTutorial
                title="Crossword"
                objective="Fill in all the words in the crossword grid using the clues provided!"
                controls="Click a cell to select a word. Type letters on your keyboard to fill them in. Press Backspace to erase."
                rules={[
                  'Numbers in cells mark the start of a word. Match the number to the clue list.',
                  'Click the same cell again to switch between Across and Down.',
                  'Use the Hint button to reveal a whole word (limited uses).',
                  'Green cells = correct. Red cells = wrong letter.',
                  'Complete all words to win!',
                ]}
              />
            </div>
          </section>
          <Footer />
        </div>
      </>
    );
  }

  /* ── WON ─────────────────────────────────────────────────────────── */
  if (won) {
    return (
      <>
        <Helmet><title>Crossword Complete!</title></Helmet>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-white rounded-3xl border-8 border-accent shadow-2xl p-10 text-center">
            <Trophy className="w-20 h-20 text-accent mx-auto mb-4" />
            <h2 className="text-4xl font-black text-secondary mb-2">Crossword Complete!</h2>
            <p className="text-muted-foreground font-medium mb-6">
              You solved all {puzzle.placements.length} words!
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={startGame}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary text-white font-black text-xl h-14 shadow-[0_6px_0_hsl(1,72%,29%)] active:translate-y-1 active:shadow-none transition-all">
                <RotateCcw className="w-5 h-5" /> Play Again
              </button>
              <button onClick={() => setPhase('config')}
                className="w-full rounded-full border-4 border-secondary text-secondary font-black text-xl h-14 hover:bg-secondary/10 transition-all">
                Change Settings
              </button>
              <Link to="/games"
                className="w-full flex items-center justify-center rounded-full bg-muted text-secondary font-bold text-xl h-12 hover:bg-muted/70 transition-all">
                Back to Games
              </Link>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  /* ── PLAYING ────────────────────────────────────────────────────── */
  if (!puzzle) return null;

  // AUMENTO DO TAMANHO DA CÉLULA AQUI
  const CELL_SIZE = 48; 

  const acrossClues = puzzle.placements.filter(p => p.direction === 'across').sort((a,b) => a.number - b.number);
  const downClues   = puzzle.placements.filter(p => p.direction === 'down').sort((a,b) => a.number - b.number);

  return (
    <>
      <Helmet><title>Crossword – Playing</title></Helmet>
      <div
        className="min-h-screen bg-background flex flex-col pb-10"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        {/* Top bar */}
        <div className="max-w-7xl mx-auto w-full px-4 mt-4 flex items-center justify-between">
          <Link to="/games" className="inline-flex items-center gap-1 rounded-full font-bold text-secondary hover:bg-secondary/10 px-3 py-2 text-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-lg font-black text-secondary uppercase tracking-widest">
            📝 {THEMES[themeKey].label} · {DIFFICULTIES[diffKey].label}
          </h1>
          <div className="flex items-center gap-2">
            {hintsLeft > 0 && (
              <button onClick={handleRevealHint}
                className="flex items-center gap-1 rounded-full bg-accent text-secondary font-black text-sm px-4 py-2 hover:bg-accent/80 transition-all">
                <Eye className="w-4 h-4" /> Hint ({hintsLeft})
              </button>
            )}
          </div>
        </div>

        {/* Active clue banner */}
        <AnimatePresence>
          {activeWord && (
            <motion.div
              key={activeWord + activeDir}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto w-full px-4 mt-3"
            >
              <div className="bg-secondary text-white rounded-2xl px-6 py-4 font-bold text-lg shadow-md flex items-center gap-2">
                {(() => {
                  const wp = puzzle.placements.find(p => p.word === activeWord && p.direction === activeDir);
                  return wp ? (
                    <>
                      <span className="text-accent text-xl">{wp.number}. {wp.direction === 'across' ? '→' : '↓'}</span>
                      <span>{wp.clue}</span>
                    </>
                  ) : '';
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto w-full px-4 mt-4 flex flex-col lg:flex-row gap-8">

          {/* Grid - Atualizado para rolagem suave com o novo tamanho */}
          <div className="flex-1 overflow-auto bg-slate-50/50 rounded-3xl border-4 border-secondary/20 p-4 shadow-inner min-h-[500px] flex items-start justify-center">
            <div className="relative bg-secondary rounded-2xl p-1 shadow-2xl flex-shrink-0"
              style={{ width: puzzle.cols * CELL_SIZE + 8, height: puzzle.rows * CELL_SIZE + 8 }}>
              {Array.from({ length: puzzle.rows }, (_, r) =>
                Array.from({ length: puzzle.cols }, (_, c) => {
                  const key = `${r},${c}`;
                  const letter = puzzle.cells[key];
                  if (!letter) return null;
                  
                  const state = getCellState(r, c);
                  const num = puzzle.placements.find(p => p.row === r && p.col === c)?.number;
                  const input = userInput[key];
                  const rev = revealed[key];
                  const correct = input === letter || rev;
                  const wrong = input && input !== letter && !rev;
                  const isActiveCell = state.isActive;

                  return (
                    <div
                      key={key}
                      onClick={() => handleCellClick(r, c)}
                      className={`absolute border border-gray-300 cursor-pointer flex items-center justify-center transition-colors select-none rounded-sm
                        ${isActiveCell ? 'bg-blue-100 border-blue-400 z-10 scale-[1.02] shadow-sm' : ''}
                        ${!isActiveCell && !wrong && !correct ? 'bg-white hover:bg-blue-50' : ''}
                        ${correct ? 'bg-green-100 border-green-400 text-green-800' : ''}
                        ${wrong ? 'bg-red-100 border-red-400 text-red-700' : ''}
                      `}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        left: c * CELL_SIZE + 4,
                        top: r * CELL_SIZE + 4,
                      }}
                    >
                      {num && (
                        <span className="absolute top-1 left-1.5 text-[10px] font-black text-secondary leading-none">{num}</span>
                      )}
                      {/* Letra maior para melhor visualização */}
                      <span className="text-xl font-black">{rev ? letter : (input || '')}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Clues */}
          <div className="lg:w-96 flex flex-col gap-4">
            <div className="bg-white rounded-3xl border-4 border-secondary shadow-xl p-5 flex-1 flex flex-col max-h-[350px]">
              <p className="text-base font-black text-secondary mb-3">→ Across</p>
              <div className="space-y-2 overflow-y-auto pr-2 flex-1 scrollbar-thin">
                {acrossClues.map(p => {
                  const dr = 0; const dc = 1;
                  const allCorrect = Array.from({ length: p.word.length }, (_, i) => {
                    const ck = `${p.row + dr * i},${p.col + dc * i}`;
                    return userInput[ck] === p.word[i] || revealed[ck];
                  }).every(Boolean);
                  return (
                    <button key={p.word + 'across'}
                      onClick={() => { setActiveWord(p.word); setActiveDir('across'); }}
                      className={`w-full text-left rounded-xl px-3 py-2 text-sm font-medium transition-all border-2 ${
                        activeWord === p.word && activeDir === 'across'
                          ? 'bg-secondary text-white border-secondary'
                          : allCorrect
                          ? 'bg-green-50 border-green-300 text-green-800 line-through opacity-70'
                          : 'border-transparent hover:bg-muted text-secondary'
                      }`}>
                      <span className="font-black">{p.number}.</span> {p.clue}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl border-4 border-secondary shadow-xl p-5 flex-1 flex flex-col max-h-[350px]">
              <p className="text-base font-black text-secondary mb-3">↓ Down</p>
              <div className="space-y-2 overflow-y-auto pr-2 flex-1 scrollbar-thin">
                {downClues.map(p => {
                  const dr = 1; const dc = 0;
                  const allCorrect = Array.from({ length: p.word.length }, (_, i) => {
                    const ck = `${p.row + dr * i},${p.col + dc * i}`;
                    return userInput[ck] === p.word[i] || revealed[ck];
                  }).every(Boolean);
                  return (
                    <button key={p.word + 'down'}
                      onClick={() => { setActiveWord(p.word); setActiveDir('down'); }}
                      className={`w-full text-left rounded-xl px-3 py-2 text-sm font-medium transition-all border-2 ${
                        activeWord === p.word && activeDir === 'down'
                          ? 'bg-secondary text-white border-secondary'
                          : allCorrect
                          ? 'bg-green-50 border-green-300 text-green-800 line-through opacity-70'
                          : 'border-transparent hover:bg-muted text-secondary'
                      }`}>
                      <span className="font-black">{p.number}.</span> {p.clue}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={startGame}
                className="flex-1 flex items-center justify-center gap-2 rounded-full border-4 border-secondary text-secondary font-bold text-sm h-12 hover:bg-secondary/10 transition-all">
                <RotateCcw className="w-4 h-4" /> New Puzzle
              </button>
              {hintsLeft > 0 && (
                <button onClick={handleRevealHint} disabled={!activeWord}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-accent text-secondary font-bold text-sm h-12 hover:bg-accent/80 disabled:opacity-40 transition-all">
                  <Eye className="w-4 h-4" /> Hint ({hintsLeft})
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto w-full px-4 mt-6">
          <GameTutorial
            title="Crossword"
            objective="Fill in all the words using the clues on the right!"
            controls="Click a cell → select word → type letters. Backspace to erase."
            rules={[
              'Click a clue or a cell to select a word.',
              'Type letters to fill in the selected word.',
              'Green = correct, Red = wrong letter.',
              'Click the same cell twice to toggle Across ↔ Down.',
              'Use Hint button to reveal an entire word (limited!)',
            ]}
          />
        </div>
        <Footer />
      </div>
    </>
  );
}