import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Plus, Search, Pencil, Trash2, AlertTriangle, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { listQuizzesByProfessor, deletarQuiz } from '@/services/api';
import CriarQuizModal from '@/pages/Professor/CriarQuizModal.jsx';
import Footer from '@/components/Footer.jsx';
import toast from 'react-hot-toast';

const NIVEL_OPTIONS = ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function QuizzesPage() {
  const { user } = useAuth();
  const isProfessor = user?.role === 'PROFESSOR' || user?.role === 'teacher';
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalAberto, setModalAberto] = useState(false);
  const [quizParaEditar, setQuizParaEditar] = useState(null);
  const [confirmEditQuiz, setConfirmEditQuiz] = useState(null);
  const [confirmDeleteQuiz, setConfirmDeleteQuiz] = useState(null);

  // Filters
  const [busca, setBusca] = useState('');
  const [nivelFiltro, setNivelFiltro] = useState('All');

  useEffect(() => {
    if (user?.id) {
      listQuizzesByProfessor(user.id)
        .then(setQuizzes)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const quizzesFiltrados = useMemo(() => {
    return quizzes.filter((q) => {
      const matchBusca =
        q.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
        q.descricao?.toLowerCase().includes(busca.toLowerCase());
      const matchNivel = nivelFiltro === 'All' || q.nivelIngles === nivelFiltro;
      return matchBusca && matchNivel;
    });
  }, [quizzes, busca, nivelFiltro]);

  function abrirCriar() {
    setQuizParaEditar(null);
    setModalAberto(true);
  }

  function abrirEditar(quiz) {
    setQuizParaEditar(quiz);
    setModalAberto(true);
  }

  function handleEditarClick(quiz) {
    setConfirmEditQuiz(quiz);
  }

  function confirmarEdicao() {
    abrirEditar(confirmEditQuiz);
    setConfirmEditQuiz(null);
  }

  function fecharModal() {
    setModalAberto(false);
    setQuizParaEditar(null);
  }

  function handleQuizSalvo(salvo) {
    setQuizzes((prev) => {
      const existe = prev.some((q) => q.id === salvo.id);
      return existe
        ? prev.map((q) => (q.id === salvo.id ? salvo : q))
        : [salvo, ...prev];
    });
  }

  async function handleDeletar() {
    if (!confirmDeleteQuiz) return;
    try {
      await deletarQuiz(confirmDeleteQuiz.id);
      setQuizzes((prev) => prev.filter((q) => q.id !== confirmDeleteQuiz.id));
      toast.success('Quiz deleted successfully!');
    } catch (err) {
      toast.error(`Error deleting quiz: ${err.message}`);
    } finally {
      setConfirmDeleteQuiz(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      {modalAberto && (
        <CriarQuizModal
          onClose={fecharModal}
          onSaved={(q) => { handleQuizSalvo(q); fecharModal(); }}
          quizParaEditar={quizParaEditar}
        />
      )}

      {confirmDeleteQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <Trash2 size={20} className="text-red-500" />
              </div>
              <div>
                <h2 className="font-black text-[hsl(var(--secondary))] text-lg leading-tight">Delete quiz?</h2>
                <p className="mt-1 text-sm text-gray-500">
                  You are about to permanently delete <span className="font-bold text-[hsl(var(--secondary))]">{confirmDeleteQuiz.titulo}</span>. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteQuiz(null)}
                className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletar}
                className="rounded-xl bg-red-500 px-5 py-2 text-sm font-black text-white hover:bg-red-600 transition-colors"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmEditQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle size={20} className="text-amber-500" />
              </div>
              <div>
                <h2 className="font-black text-[hsl(var(--secondary))] text-lg leading-tight">Edit quiz?</h2>
                <p className="mt-1 text-sm text-gray-500">
                  You are about to edit <span className="font-bold text-[hsl(var(--secondary))]">{confirmEditQuiz.titulo}</span>. Any changes will overwrite the current content.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmEditQuiz(null)}
                className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmarEdicao}
                className="rounded-xl bg-[hsl(var(--primary))] px-5 py-2 text-sm font-black text-white hover:opacity-90 transition-opacity"
              >
                Yes, edit
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-black text-[hsl(var(--secondary))]">Quizzes</h1>
            <p className="text-[hsl(var(--muted-foreground))]">Manage and create your quizzes</p>
          </div>
          {isProfessor && (
            <button
              onClick={abrirCriar}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 font-black text-white hover:opacity-90 transition-opacity shrink-0"
            >
              <Plus size={18} /> New Quiz
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
            />
          </div>
          <select
            value={nivelFiltro}
            onChange={(e) => setNivelFiltro(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] bg-white"
          >
            {NIVEL_OPTIONS.map((n) => (
              <option key={n} value={n}>{n === 'All' ? 'All levels' : n}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-bold">Loading...</div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-black">No quizzes yet</p>
            {isProfessor && (
              <button
                onClick={abrirCriar}
                className="mt-4 rounded-xl bg-[hsl(var(--primary))] px-6 py-2 font-black text-white hover:opacity-90 transition-opacity"
              >
                Create your first quiz
              </button>
            )}
          </div>
        ) : quizzesFiltrados.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-gray-400">
            <Search size={36} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-black">No quizzes match your search</p>
            <button
              onClick={() => { setBusca(''); setNivelFiltro('All'); }}
              className="mt-3 text-sm font-bold text-[hsl(var(--primary))] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-400 font-bold">
              {quizzesFiltrados.length} quiz{quizzesFiltrados.length !== 1 ? 'zes' : ''} found
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {quizzesFiltrados.map((q) => (
                <div
                  key={q.id}
                  className="group flex flex-col rounded-2xl border-2 border-[hsl(var(--border))] bg-white shadow-sm hover:shadow-md hover:border-[hsl(var(--primary))]/40 transition-all overflow-hidden"
                >
                  {/* Card body */}
                  <div className="flex-1 p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full bg-[hsl(var(--secondary))]/10 border border-[hsl(var(--secondary))]/20 px-2.5 py-0.5 text-xs font-black text-[hsl(var(--secondary))]">
                        {q.nivelIngles}
                      </span>
                    </div>
                    <h3 className="font-black text-[hsl(var(--secondary))] text-lg leading-tight mb-1">{q.titulo}</h3>
                    {q.descricao && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{q.descricao}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                      <BookOpen size={12} />
                      <span>{q.questoes?.length ?? 0} question{(q.questoes?.length ?? 0) !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Turma tags */}
                    {q.turmas?.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <Users size={11} className="shrink-0 text-gray-400" />
                        {q.turmas.slice(0, 3).map((turma) => (
                          <span
                            key={turma.idTurma}
                            className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-semibold text-indigo-600 truncate max-w-[120px]"
                            title={turma.nome}
                          >
                            {turma.nome}
                          </span>
                        ))}
                        {q.turmas.length > 3 && (
                          <span className="rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-500">
                            +{q.turmas.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action bar — visible on hover for professors */}
                  {isProfessor && (
                    <div className="flex border-t border-gray-100 divide-x divide-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditarClick(q)}
                        title="Edit quiz"
                        className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50 hover:text-[hsl(var(--secondary))] transition-colors"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteQuiz(q)}
                        title="Delete quiz"
                        className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
