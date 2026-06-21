import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, CheckCircle2, Clock, Search } from 'lucide-react';
import Footer from '@/components/Footer.jsx';
import { salvarPontuacao } from "@/services/rankingService";

/* ─── Expanded Word Banks ─────────────────────────────────────────── */
// Objeto THEMES: Armazena os temas disponíveis no jogo e suas respectivas palavras.
// Cada categoria (ex: sustainability, animals) contém um rótulo visual (label) 
const THEMES = {
  sustainability: {
    label: '🌱 Sustainability',
    words: [
      'RECYCLE','SOLAR','FOREST','WATER','CLIMATE','ORGANIC',
      'REDUCE','REUSE','CARBON','PLANET','GREEN','ENERGY',
      'NATURE','WIND','OCEAN','TREE','CLEAN','ECO','RAIN','AIR',
      'EARTH','OZONE','SOLAR','BIOME','TRASH','VEGAN','WASTE',
      'COMPOST','PLASTIC','GLOBAL','SAVING','HABITAT','RESCUE',
    ],
  },
  animals: {
    label: '🐾 Animals',
    words: [
      'CAT','DOG','BIRD','FISH','BEAR','FROG','LION',
      'WOLF','DEER','EAGLE','SHARK','WHALE','SNAKE','TIGER',
      'HORSE','RABBIT','PARROT','TURTLE','MONKEY','PENGUIN',
      'ZEBRA','PANDA','CAMEL','SPIDER','DOLPHIN','SHEEP','GOAT',
      'MOUSE','GIRAFFE','HIPPO','RHINO','IGUANA','KOALA','SLOTH',
    ],
  },
  food: {
    label: '🍎 Food',
    words: [
      'APPLE','BREAD','MILK','RICE','CAKE','PASTA',
      'SOUP','SALAD','PIZZA','JUICE','MANGO','GRAPE',
      'LEMON','BANANA','CARROT','ONION','CHEESE','BUTTER','COFFEE','TEA',
      'WATER','SUGAR','HONEY','STEAK','POTATO','TOMATO','GARLIC',
      'BACON','CEREAL','YOGURT','MELON','PEACH','BERRY','BEANS',
    ],
  },
  school: {
    label: '📚 School',
    words: [
      'BOOK','PEN','DESK','CLASS','STUDY','WRITE',
      'READ','LEARN','MATH','SCIENCE','PENCIL','ERASER',
      'BOARD','RULER','PAPER','NOTEBOOK','HOMEWORK','EXAM','GRADE','LESSON',
      'TEACHER','MUSIC','HISTORY','ART','SPORTS','RECESS','BREAK',
      'TEST','QUIZ','FOLDER','MARKER','CRAYON','GLUE','CHALK',
    ],
  },
};

/* ─── Difficulty configs (Tamanhos Aumentados) ────────────────────── */
const DIFFICULTIES = {
  easy: {
    label: '😊 Easy',
    gridSize: 9,
    wordCount: 5,
    maxWordLen: 7,
    directions: [[0,1],[1,0]],            // right, down
    cellSize: 56,                         // Aumentado de 44
    fontSize: 'text-3xl font-black',      // Fonte maior
  },
  medium: {
    label: '😤 Medium',
    gridSize: 13,
    wordCount: 8,
    maxWordLen: 9,
    directions: [[0,1],[1,0],[1,1],[1,-1]], // right, down, diag-right, diag-left
    cellSize: 48,                         // Aumentado de 36
    fontSize: 'text-2xl font-bold',       // Fonte maior
  },
  hard: {
    label: '🔥 Hard',
    gridSize: 17,
    wordCount: 12,
    maxWordLen: 14,
    directions: [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]], // all 8
    cellSize: 40,                         // Aumentado de 30
    fontSize: 'text-xl font-bold',        // Fonte maior
  },
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/* ─── Grid Generator ──────────────────────────────────────────────── */
function generateGrid(size, words, directions) {
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const placements = []; // [{word, cells:[{r,c}]}]

  const tryPlace = (word) => {
    const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);
    for (let attempt = 0; attempt < 120; attempt++) {
      const [dr, dc] = shuffledDirs[attempt % shuffledDirs.length];
      const maxR = dr >= 0 ? size - 1 - dr * (word.length - 1) : size - 1;
      const minR = dr < 0 ? Math.abs(dr) * (word.length - 1) : 0;
      const maxC = dc >= 0 ? size - 1 - Math.abs(dc) * (word.length - 1) : size - 1;
      const minC = dc < 0 ? Math.abs(dc) * (word.length - 1) : 0;

      if (maxR < minR || maxC < minC) continue;

      const startR = minR + Math.floor(Math.random() * (maxR - minR + 1));
      const startC = minC + Math.floor(Math.random() * (maxC - minC + 1));

      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const r = startR + dr * i;
        const c = startC + dc * i;
        if (r < 0 || r >= size || c < 0 || c >= size) { ok = false; break; }
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) { ok = false; break; }
      }
      if (!ok) continue;

      const cells = [];
      for (let i = 0; i < word.length; i++) {
        const r = startR + dr * i;
        const c = startC + dc * i;
        grid[r][c] = word[i];
        cells.push({ r, c });
      }
      return cells;
    }
    return null;
  };

  const placed = [];
  for (const word of words) {
    const cells = tryPlace(word);
    if (cells) placed.push({ word, cells });
  }

  // Fill blanks
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c] === '') grid[r][c] = LETTERS[Math.floor(Math.random() * 26)];

  return { grid, placements: placed };
}

/* ─── Helpers ─────────────────────────────────────────────────────── */
function cellKey(r, c) { return `${r},${c}`; }

function getCellsInLine(startR, startC, endR, endC) {
  const dr = endR - startR;
  const dc = endC - startC;
  if (dr === 0 && dc === 0) return [{ r: startR, c: startC }];
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return [];
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  const sr = dr === 0 ? 0 : dr / Math.abs(dr);
  const sc = dc === 0 ? 0 : dc / Math.abs(dc);
  return Array.from({ length: len + 1 }, (_, i) => ({ r: startR + i * sr, c: startC + i * sc }));
}

function sameSet(cells, targetCells) {
  if (cells.length !== targetCells.length) return false;
  const keys = new Set(cells.map(({ r, c }) => cellKey(r, c)));
  return targetCells.every(({ r, c }) => keys.has(cellKey(r, c)));
}

const FOUND_COLORS = [
  'bg-green-400','bg-blue-400','bg-purple-400','bg-orange-400',
  'bg-pink-400','bg-teal-400','bg-yellow-400','bg-red-400',
  'bg-indigo-400','bg-emerald-400','bg-rose-400','bg-cyan-400',
];

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function WordSearchGame() {
  const [phase, setPhase] = useState('config'); // config | playing | won
  const [themeKey, setThemeKey] = useState('sustainability');
  const [diffKey, setDiffKey] = useState('easy');
  const [grid, setGrid] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [foundWords, setFoundWords] = useState([]); // [{word, cells, colorIdx}]
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [previewCells, setPreviewCells] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [flashWrong, setFlashWrong] = useState(false);

  const timerRef = useRef(null);
  const gridRef = useRef(null);
  const isDown = useRef(false);
  const pontuacaoEnviadaRef = useRef(false);
  const diff = DIFFICULTIES[diffKey];
  const theme = THEMES[themeKey];

  /* Timer */
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  function calcularPontuacaoFinal() {
    const dificuldadeBonus = {
      easy: 500,
      medium: 1000,
      hard: 1500,
    };

    const base = dificuldadeBonus[diffKey] || 500;
    const bonusPorPalavra = placements.length * 100;
    const penalidadeTempo = elapsed * 5;

    return Math.max(10, base + bonusPorPalavra - penalidadeTempo);
  }

  /* Start game */
  const startGame = useCallback(() => {
    pontuacaoEnviadaRef.current = false;
    const pool = theme.words.filter(w => w.length <= diff.maxWordLen);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, diff.wordCount);
    const { grid: g, placements: p } = generateGrid(diff.gridSize, selected, diff.directions);
    
    setGrid(g);
    setPlacements(p);
    setFoundWords([]);
    setPreviewCells([]);
    setSelecting(false);
    setStartCell(null);
    setElapsed(0);
    setPhase('playing');
    isDown.current = false;
  }, [themeKey, diffKey, diff, theme]);

  /* Get cell from event */
  const getCellFromEvent = useCallback((e) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const col = Math.floor((clientX - rect.left) / diff.cellSize);
    const row = Math.floor((clientY - rect.top) / diff.cellSize);
    if (row < 0 || row >= diff.gridSize || col < 0 || col >= diff.gridSize) return null;
    return { r: row, c: col };
  }, [diff.cellSize, diff.gridSize]);

  /* Mouse handlers */
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (!cell) return;
    isDown.current = true;
    setSelecting(true);
    setStartCell(cell);
    setPreviewCells([cell]);
  }, [getCellFromEvent]);

  const handlePointerMove = useCallback((e) => {
    if (!isDown.current || !startCell) return;
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (!cell) return;
    const line = getCellsInLine(startCell.r, startCell.c, cell.r, cell.c);
    setPreviewCells(line);
  }, [startCell, getCellFromEvent]);

  const handlePointerUp = useCallback((e) => {
    if (!isDown.current) return;
    isDown.current = false;
    setSelecting(false);

    const selected = previewCells;
    if (selected.length < 2) { setPreviewCells([]); setStartCell(null); return; }

    // Check against placements
    const matched = placements.find(p =>
      sameSet(selected, p.cells) || sameSet([...selected].reverse(), p.cells)
    );

    if (matched && !foundWords.find(f => f.word === matched.word)) {
      const colorIdx = foundWords.length % FOUND_COLORS.length;
      const newFound = [...foundWords, { word: matched.word, cells: matched.cells, colorIdx }];
      setFoundWords(newFound);
      if (newFound.length === placements.length) {
        clearInterval(timerRef.current);
        setPhase('won');
      }
    } else if (!matched) {
      setFlashWrong(true);
      setTimeout(() => setFlashWrong(false), 400);
    }

    setPreviewCells([]);
    setStartCell(null);
  }, [previewCells, placements, foundWords]);

  /* Cell visual state */
  const getCellState = useCallback((r, c) => {
    const key = cellKey(r, c);
    const found = foundWords.find(f => f.cells.some(cell => cellKey(cell.r, cell.c) === key));
    if (found) return { found: true, colorIdx: found.colorIdx };
    const inPreview = previewCells.some(cell => cell.r === r && cell.c === c);
    return { found: false, inPreview };
  }, [foundWords, previewCells]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  useEffect(() => {
    if (phase === "won" && !pontuacaoEnviadaRef.current) {
      pontuacaoEnviadaRef.current = true;

      const pontuacaoFinal = calcularPontuacaoFinal();

      salvarPontuacao("Word Search", pontuacaoFinal)
        .then((resposta) => {
          if (resposta) {
            console.log("Pontuação final do Word Search salva com sucesso");
          }
        })
        .catch((erro) => console.error("Erro ao salvar pontuação:", erro));
    }
  }, [phase, elapsed, diffKey, placements.length]);

  /* ── CONFIG SCREEN ──────────────────────────────────────────────── */
  if (phase === 'config') {
    return (
      <>
        <Helmet><title>Word Search – NextStep English</title></Helmet>
        <div className="min-h-screen bg-background flex flex-col">
          <section className="flex-grow py-12 px-4">
            <div className="max-w-2xl mx-auto">
              <Link to="/games" className="inline-flex items-center gap-2 mb-8 rounded-full font-bold text-secondary hover:bg-secondary/10 px-4 py-2 transition-all">
                <ArrowLeft className="w-5 h-5" /> Back to Games
              </Link>

              <div className="rounded-3xl border-8 border-secondary shadow-2xl overflow-hidden bg-white">
                <div className="bg-secondary p-8 text-center text-white">
                  <div className="text-5xl mb-3">🔎</div>
                  <h1 className="text-4xl font-black mb-2">Word Search</h1>
                  <p className="text-lg font-medium opacity-90">Find all hidden words in the grid!</p>
                </div>

                <div className="p-8 space-y-8">
                  {/* Theme */}
                  <div>
                    <p className="text-lg font-black text-secondary mb-3">Choose a Theme:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(THEMES).map(([key, t]) => (
                        <button key={key} onClick={() => setThemeKey(key)}
                          className={`rounded-2xl border-4 py-4 font-bold text-base transition-all ${themeKey === key ? 'bg-secondary text-white border-secondary' : 'border-secondary/30 text-secondary hover:bg-secondary/10'}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <p className="text-lg font-black text-secondary mb-3">Difficulty:</p>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(DIFFICULTIES).map(([key, d]) => (
                        <button key={key} onClick={() => setDiffKey(key)}
                          className={`rounded-2xl border-4 py-4 font-bold text-sm transition-all ${diffKey === key ? 'bg-primary text-white border-primary' : 'border-primary/30 text-primary hover:bg-primary/10'}`}>
                          {d.label}
                          <br />
                          <span className="text-xs opacity-75 font-medium">
                            {d.gridSize}×{d.gridSize} · {d.wordCount} words
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={startGame}
                    className="w-full rounded-full bg-primary hover:bg-primary-dark text-white font-black text-2xl h-20 shadow-[0_8px_0_hsl(1,72%,29%)] active:translate-y-2 active:shadow-none transition-all">
                    Start Searching! 🔎
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
                      <li>• Find all the hidden English words in the letter grid!</li>
                      <li>• <strong>Click and drag</strong> your mouse (or swipe) across the letters to select a word.</li>
                      <li>• <strong>Release</strong> to confirm your selection.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                    <h3 className="text-lg font-bold text-secondary mb-3 flex items-center gap-2">
                      <span>💡</span> Rules & Tips
                    </h3>
                    <ul className="text-gray-700 space-y-2 text-sm font-medium">
                      <li>• Words can go <strong>horizontally, vertically, or diagonally</strong>.</li>
                      <li>• On <strong>Hard mode</strong>, words may also be written backwards!</li>
                      <li>• <span className="text-green-600 font-bold">Colored highlight</span> = word found! <span className="text-blue-500 font-bold">Blue highlight</span> = currently selecting.</li>
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

  /* ── WON SCREEN ─────────────────────────────────────────────────── */
  if (phase === 'won') {
    return (
      <>
        <Helmet><title>You Won! – Word Search</title></Helmet>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full bg-white rounded-3xl border-8 border-accent shadow-2xl p-10 text-center">
            <Trophy className="w-20 h-20 text-accent mx-auto mb-4" />
            <h2 className="text-4xl font-black text-secondary mb-2">Excellent!</h2>
            <p className="text-muted-foreground font-medium mb-6">You found all {placements.length} words!</p>
            <div className="bg-muted rounded-2xl p-6 mb-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-bold text-muted-foreground">Time</p>
                <p className="text-3xl font-black text-secondary">{fmt(elapsed)}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground">Difficulty</p>
                <p className="text-xl font-black text-primary capitalize">{diffKey}</p>
              </div>
            </div>
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

  /* ── PLAYING SCREEN ─────────────────────────────────────────────── */
  const gridPx = diff.gridSize * diff.cellSize;

  return (
    <>
      <Helmet><title>Word Search – Playing</title></Helmet>
      <div className="min-h-screen bg-background flex flex-col pb-10">

        {/* Top bar */}
        <div className="max-w-7xl mx-auto w-full px-4 mt-4 flex items-center justify-between">
          <Link to="/games" className="inline-flex items-center gap-1 rounded-full font-bold text-secondary hover:bg-secondary/10 px-3 py-2 text-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-lg font-black text-secondary uppercase tracking-widest">
            🔎 {THEMES[themeKey].label} · {DIFFICULTIES[diffKey].label}
          </h1>
          <div className="flex items-center gap-2 bg-white border-4 border-secondary rounded-2xl px-4 py-2">
            <Clock className="w-5 h-5 text-secondary" />
            <span className="text-xl font-black text-secondary">{fmt(elapsed)}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 mt-4 flex flex-col lg:flex-row gap-8">

          {/* Grid Wrapper - Adicionado overflow-auto e estilização de container */}
          <div className="flex-1 overflow-auto bg-slate-50/50 rounded-3xl border-4 border-secondary/20 p-4 shadow-inner min-h-[500px] flex items-start justify-center">
            <div
              ref={gridRef}
              className={`relative select-none border-4 border-secondary rounded-2xl overflow-hidden shadow-xl cursor-crosshair flex-shrink-0 ${flashWrong ? 'animate-pulse' : ''}`}
              style={{ width: gridPx, height: gridPx, touchAction: 'none' }}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            >
              {grid.map((row, r) =>
                row.map((letter, c) => {
                  const state = getCellState(r, c);
                  let bg = 'bg-white hover:bg-blue-50';
                  if (state.found) bg = `${FOUND_COLORS[state.colorIdx]} text-white`;
                  else if (state.inPreview) bg = 'bg-blue-200 text-blue-900 shadow-inner z-10';

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`absolute flex items-center justify-center transition-colors duration-100 ${bg} ${diff.fontSize}`}
                      style={{
                        width: diff.cellSize,
                        height: diff.cellSize,
                        left: c * diff.cellSize,
                        top: r * diff.cellSize,
                        border: '1px solid rgba(0,0,0,0.07)',
                      }}
                    >
                      {letter}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Word list */}
          <div className="lg:w-80 flex flex-col">
            <div className="bg-white rounded-3xl border-4 border-secondary shadow-xl p-6 flex-1 flex flex-col max-h-[500px]">
              <p className="text-lg font-black text-secondary mb-4">
                Words to Find ({foundWords.length}/{placements.length}):
              </p>
              <div className="flex flex-col gap-2 overflow-y-auto pr-2 scrollbar-thin">
                {placements.map(({ word }, i) => {
                  const found = foundWords.find(f => f.word === word);
                  return (
                    <div key={i} className={`flex items-center gap-3 rounded-2xl px-4 py-3 border-2 font-black text-lg transition-all ${found ? `${FOUND_COLORS[found.colorIdx]} text-white border-transparent` : 'border-secondary/20 text-secondary bg-muted/40'}`}>
                      {found && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                      <span className={found ? 'line-through opacity-80' : ''}>{word}</span>
                    </div>
                  );
                })}
              </div>

              <button onClick={() => setPhase('config')}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-full border-4 border-secondary text-secondary font-bold text-base h-12 hover:bg-secondary/10 transition-all flex-shrink-0">
                <RotateCcw className="w-4 h-4" /> New Game
              </button>
            </div>
          </div>
        </div>

        {/* INSTRUÇÕES DO JOGO - TELA PLAYING */}
        <div className="max-w-7xl mx-auto w-full px-4 mt-8 mb-6">
          <div className="bg-white rounded-3xl border-4 border-secondary shadow-xl p-8">
            <h2 className="text-2xl font-black text-secondary mb-2">🎮 How to Play</h2>
            <p className="text-muted-foreground mb-6 font-medium">Follow the instructions on the screen to play.</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                <h3 className="text-lg font-bold text-secondary mb-3 flex items-center gap-2">
                  <span>🎯</span> Objective & Controls
                </h3>
                <ul className="text-gray-700 space-y-2 text-sm font-medium">
                  <li>• Find all the hidden English words in the letter grid!</li>
                  <li>• <strong>Click and drag</strong> your mouse (or swipe) across the letters to select a word.</li>
                  <li>• <strong>Release</strong> to confirm your selection.</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-200">
                <h3 className="text-lg font-bold text-secondary mb-3 flex items-center gap-2">
                  <span>💡</span> Rules & Tips
                </h3>
                <ul className="text-gray-700 space-y-2 text-sm font-medium">
                  <li>• Words can go <strong>horizontally, vertically, or diagonally</strong>.</li>
                  <li>• On <strong>Hard mode</strong>, words may also be written backwards!</li>
                  <li>• <span className="text-green-600 font-bold">Colored highlight</span> = word found! <span className="text-blue-500 font-bold">Blue highlight</span> = currently selecting.</li>
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