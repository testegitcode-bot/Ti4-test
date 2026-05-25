import React, { useEffect, useMemo, useState } from 'react';
import { X, Plus, Trash2, Search } from 'lucide-react';
import { criarQuiz, atualizarQuiz, listTurmas } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext.jsx';
import toast from 'react-hot-toast';

const NIVEL_OPTIONS = [
  { value: 'A1', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', active: 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-200' },
  { value: 'A2', color: 'bg-lime-100 text-lime-700 border-lime-300', active: 'bg-lime-500 text-white border-lime-500 shadow-lime-200' },
  { value: 'B1', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', active: 'bg-yellow-400 text-white border-yellow-400 shadow-yellow-200' },
  { value: 'B2', color: 'bg-amber-100 text-amber-700 border-amber-300', active: 'bg-amber-500 text-white border-amber-500 shadow-amber-200' },
  { value: 'C1', color: 'bg-orange-100 text-orange-700 border-orange-300', active: 'bg-orange-500 text-white border-orange-500 shadow-orange-200' },
  { value: 'C2', color: 'bg-rose-100 text-rose-700 border-rose-300', active: 'bg-rose-600 text-white border-rose-600 shadow-rose-200' },
];
const DIFICULDADE_OPTIONS = [
  { value: 'FACIL', label: 'Easy', emoji: '🟢', points: 1, color: 'bg-emerald-50 text-emerald-700 border-emerald-300', active: 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-200' },
  { value: 'MEDIA', label: 'Medium', emoji: '🟡', points: 2, color: 'bg-amber-50 text-amber-700 border-amber-300', active: 'bg-amber-400 text-white border-amber-400 shadow-amber-200' },
  { value: 'DIFICIL', label: 'Hard', emoji: '🔴', points: 3, color: 'bg-rose-50 text-rose-700 border-rose-300', active: 'bg-rose-500 text-white border-rose-500 shadow-rose-200' },
];

function novaQuestao() {
  return {
    enunciado: '',
    dificuldade: 'FACIL',
    alternativas: [
      { texto: '', correta: true },
      { texto: '', correta: false },
      { texto: '', correta: false },
      { texto: '', correta: false },
    ],
  };
}

function mapQuestoesFromQuiz(quiz) {
  if (!quiz?.questoes?.length) return [novaQuestao()];
  return quiz.questoes.map((q) => ({
    enunciado: q.enunciado || '',
    dificuldade: q.dificuldade || 'FACIL',
    alternativas:
      q.alternativas?.length === 4
        ? q.alternativas.map((a) => ({ texto: a.texto || '', correta: a.correta ?? false }))
        : [
            { texto: '', correta: true },
            { texto: '', correta: false },
            { texto: '', correta: false },
            { texto: '', correta: false },
          ],
  }));
}

function mapTurmaIdsFromQuiz(quiz) {
  if (!quiz?.turmas?.length) return [];
  return quiz.turmas
    .map((turma) => turma.idTurma)
    .filter((id) => id !== null && id !== undefined);
}

export default function CriarQuizModal({ onClose, onSaved, quizParaEditar = null }) {
  const { user } = useAuth();
  const editando = quizParaEditar !== null;

  const [titulo, setTitulo] = useState(quizParaEditar?.titulo || '');
  const [descricao, setDescricao] = useState(quizParaEditar?.descricao || '');
  const [nivelIngles, setNivelIngles] = useState(quizParaEditar?.nivelIngles || 'A1');
  const [questoes, setQuestoes] = useState(() => mapQuestoesFromQuiz(quizParaEditar));
  const [turmasProfessor, setTurmasProfessor] = useState([]);
  const [turmasSelecionadas, setTurmasSelecionadas] = useState(() => mapTurmaIdsFromQuiz(quizParaEditar));
  const [carregandoTurmas, setCarregandoTurmas] = useState(true);
  const [buscarTurma, setBuscarTurma] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarTurmasProfessor() {
      setCarregandoTurmas(true);
      try {
        const turmas = await listTurmas();
        const turmasDoProfessor = turmas.filter((turma) => turma?.professor?.id === user?.id);
        setTurmasProfessor(turmasDoProfessor);
      } catch {
        toast.error('Could not load classes.');
      } finally {
        setCarregandoTurmas(false);
      }
    }

    if (user?.id) {
      carregarTurmasProfessor();
    }
  }, [user?.id]);

  const turmasFiltradas = useMemo(() => {
    const termo = buscarTurma.trim().toLowerCase();
    if (!termo) return turmasProfessor;
    return turmasProfessor.filter((t) => t.nome.toLowerCase().includes(termo));
  }, [turmasProfessor, buscarTurma]);

  const todasTurmasSelecionadas = useMemo(() => {
    if (turmasProfessor.length === 0) return false;
    return turmasSelecionadas.length === turmasProfessor.length;
  }, [turmasProfessor, turmasSelecionadas]);

  function alternarTurma(idTurma) {
    setTurmasSelecionadas((prev) => (
      prev.includes(idTurma)
        ? prev.filter((id) => id !== idTurma)
        : [...prev, idTurma]
    ));
  }

  function alternarSelecionarTodas() {
    setTurmasSelecionadas((prev) => {
      if (prev.length === turmasProfessor.length) return [];
      return turmasProfessor.map((turma) => turma.idTurma);
    });
  }

  /* ── Questão helpers ────────────────────────────────────────── */
  function adicionarQuestao() {
    setQuestoes((prev) => [...prev, novaQuestao()]);
  }

  function removerQuestao(qi) {
    setQuestoes((prev) => prev.filter((_, i) => i !== qi));
  }

  function setEnunciado(qi, valor) {
    setQuestoes((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, enunciado: valor } : q))
    );
  }

  function setDificuldade(qi, valor) {
    setQuestoes((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, dificuldade: valor } : q))
    );
  }

  function setTextoAlt(qi, ai, valor) {
    setQuestoes((prev) =>
      prev.map((q, i) =>
        i !== qi
          ? q
          : {
              ...q,
              alternativas: q.alternativas.map((a, j) =>
                j === ai ? { ...a, texto: valor } : a
              ),
            }
      )
    );
  }

  function setCorreta(qi, ai) {
    setQuestoes((prev) =>
      prev.map((q, i) =>
        i !== qi
          ? q
          : {
              ...q,
              alternativas: q.alternativas.map((a, j) => ({
                ...a,
                correta: j === ai,
              })),
            }
      )
    );
  }

  /* ── Submit ─────────────────────────────────────────────────── */
  async function handleSalvar() {
    if (!titulo.trim()) return toast.error('Inform the quiz title.');
    if (turmasSelecionadas.length === 0) return toast.error('Select at least one class.');
    for (let i = 0; i < questoes.length; i++) {
      const q = questoes[i];
      if (!q.enunciado.trim()) return toast.error(`Question ${i + 1}: inform the question text.`);
      for (let j = 0; j < q.alternativas.length; j++) {
        if (!q.alternativas[j].texto.trim())
          return toast.error(`Question ${i + 1}, Option ${j + 1}: fill in the text.`);
      }
    }

    setSalvando(true);
    try {
      const payload = {
        titulo,
        descricao,
        professorId: user.id,
        nivelIngles,
        turmaIds: turmasSelecionadas,
        questoes,
      };
      const saved = editando
        ? await atualizarQuiz(quizParaEditar.id, payload)
        : await criarQuiz(payload);
      toast.success(editando ? 'Quiz updated successfully!' : 'Quiz created successfully!');
      onSaved?.(saved);
      onClose();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  }

  const PONTOS_MAP = { FACIL: 1, MEDIA: 2, DIFICIL: 3 };
  const totalPontos = questoes.reduce((acc, q) => acc + (PONTOS_MAP[q.dificuldade] ?? 0), 0);

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="text-2xl font-black text-[hsl(var(--secondary))]">{editando ? 'Edit Quiz' : 'Create Quiz'}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Quiz Title */}
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">Quiz Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Irregular Verbs — Level 1"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">Description</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Optional description"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
            />
          </div>

          {/* English Level */}
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">English Level <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {NIVEL_OPTIONS.map((n) => (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => setNivelIngles(n.value)}
                  className={`rounded-xl border-2 py-2.5 text-sm font-black transition-all duration-150 shadow-sm hover:scale-105 active:scale-95 ${
                    nivelIngles === n.value
                      ? `${n.active} shadow-lg`
                      : n.color
                  }`}
                >
                  {n.value}
                </button>
              ))}
            </div>
          </div>

          {/* Classes */}
          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">Classes <span className="text-red-500">*</span></label>

            {carregandoTurmas ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                Loading classes...
              </div>
            ) : turmasProfessor.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                You do not have any classes yet. Create a class before creating a quiz.
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-hidden">

                {/* Search + Select All */}
                <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
                  <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-bold text-[hsl(var(--secondary))]">
                    <input
                      type="checkbox"
                      checked={todasTurmasSelecionadas}
                      onChange={alternarSelecionarTodas}
                      className="accent-[hsl(var(--primary))]"
                    />
                    All
                  </label>
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={buscarTurma}
                      onChange={(e) => setBuscarTurma(e.target.value)}
                      placeholder="Search class..."
                      className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))]/20"
                    />
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    {turmasSelecionadas.length}/{turmasProfessor.length}
                  </span>
                </div>

                {/* Scrollable list */}
                <div className="max-h-44 overflow-y-auto p-2">
                  {turmasFiltradas.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-400">No classes found.</p>
                  ) : (
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {turmasFiltradas.map((turma) => (
                        <label
                          key={turma.idTurma}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                            turmasSelecionadas.includes(turma.idTurma)
                              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={turmasSelecionadas.includes(turma.idTurma)}
                            onChange={() => alternarTurma(turma.idTurma)}
                            className="accent-[hsl(var(--primary))]"
                          />
                          <span className="truncate font-semibold text-gray-700">{turma.nome}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Questions */}
          {questoes.map((q, qi) => (
            <div key={qi} className="rounded-2xl bg-[hsl(var(--muted))] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-[hsl(var(--secondary))]">Question {qi + 1}</span>
                {questoes.length > 1 && (
                  <button
                    onClick={() => removerQuestao(qi)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Question text */}
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Question text <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={q.enunciado}
                  onChange={(e) => setEnunciado(qi, e.target.value)}
                  placeholder="Question text"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))]"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-600">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {DIFICULDADE_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDificuldade(qi, d.value)}
                      className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 py-2.5 text-sm font-bold transition-all duration-150 shadow-sm hover:scale-105 active:scale-95 ${
                        q.dificuldade === d.value
                          ? `${d.active} shadow-md`
                          : d.color
                      }`}
                    >
                      <span>{d.emoji} {d.label}</span>
                      <span className="text-xs font-semibold opacity-80">{d.points} {d.points === 1 ? 'pt' : 'pts'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options 2x2 grid */}
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-600">Options — select the correct one <span className="text-red-500">*</span></label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {q.alternativas.map((alt, ai) => (
                  <label
                    key={ai}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 bg-white px-3 py-2.5 text-sm transition ${
                      alt.correta
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`correta-${qi}`}
                      checked={alt.correta}
                      onChange={() => setCorreta(qi, ai)}
                      className="accent-[hsl(var(--primary))] shrink-0"
                    />
                    <input
                      type="text"
                      value={alt.texto}
                      onChange={(e) => setTextoAlt(qi, ai, e.target.value)}
                      placeholder={`Option ${ai + 1}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent outline-none placeholder-gray-400"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Add Question */}
          <button
            onClick={adicionarQuestao}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-bold text-gray-500 hover:border-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))]"
          >
            <Plus size={16} /> Add Question
          </button>

          {/* Total Points Summary */}
          <div className="rounded-2xl border-2 border-[hsl(var(--primary))]/20 bg-gradient-to-r from-[hsl(var(--primary))]/5 to-[hsl(var(--secondary))]/5 p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Quiz Summary</p>
                <p className="mt-0.5 text-sm text-gray-600">{questoes.length} {questoes.length === 1 ? 'question' : 'questions'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Total Points</p>
                <p className="text-3xl font-black text-[hsl(var(--secondary))]">
                  {totalPontos} <span className="text-base font-semibold text-gray-400">pts</span>
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {DIFICULDADE_OPTIONS.map((d) => {
                const count = questoes.filter((q) => q.dificuldade === d.value).length;
                if (count === 0) return null;
                return (
                  <span key={d.value} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border ${d.color}`}>
                    {d.emoji} {count}x {d.label} = {count * d.points} pts
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-white px-6 py-4">
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="w-full rounded-xl bg-[hsl(var(--primary))] py-3 font-black text-white hover:bg-[hsl(var(--primary-dark))] disabled:opacity-60"
          >
            {salvando ? 'Saving...' : editando ? 'Update Quiz' : 'Save Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
