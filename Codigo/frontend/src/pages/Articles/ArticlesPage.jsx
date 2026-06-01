import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpenText,
  CalendarDays,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Footer from "@/components/Footer.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";
import {
  createArticle,
  deleteArticle,
  listArticles,
  listArticlesForStudent,
  listArticlesForTeacher,
  listStudentsByTurma,
  listTurmasByProfessor,
  listTurmasByStudent,
} from "@/services/api";

/* ── Tag color helpers ───────────────────────────────────────── */
function authorTagClasses(tipoAutor) {
  if (tipoAutor === "PROFESSOR") {
    return "bg-[#5B3DF5]/10 text-[#5B3DF5] border border-[#5B3DF5]/30";
  }
  return "bg-[#FF4F8B]/10 text-[#FF4F8B] border border-[#FF4F8B]/30";
}

function authorLabel(tipoAutor) {
  if (tipoAutor === "PROFESSOR") return "Professor";
  if (tipoAutor === "ALUNO") return "Aluno";
  return tipoAutor ?? "Autor";
}

export default function ArticlesPage() {
  const { user } = useAuth();

  const isTeacher = user?.role === "teacher" || user?.role === "PROFESSOR";
  const isStudent = user?.role === "student" || user?.role === "ALUNO";

  const [articles, setArticles] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTurma, setSelectedTurma] = useState("");
  const [selectedAluno, setSelectedAluno] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    carregarDadosIniciais();
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (isTeacher && user?.id) {
      carregarArtigosProfessor();
    }
  }, [selectedTurma, selectedAluno]);

  useEffect(() => {
    async function carregarAlunosDaTurma() {
      if (!isTeacher || !selectedTurma) {
        setStudents([]);
        setSelectedAluno("");
        return;
      }

      try {
        const alunos = await listStudentsByTurma(selectedTurma);
        setStudents(alunos || []);
      } catch {
        setStudents([]);
      }
    }

    carregarAlunosDaTurma();
  }, [selectedTurma, isTeacher]);

  async function carregarDadosIniciais() {
    setLoading(true);

    try {
      if (isTeacher && user?.id) {
        const turmasProfessor = await listTurmasByProfessor(user.id);
        setTurmas(turmasProfessor || []);
        await carregarArtigosProfessor();
        return;
      }

      if (isStudent && user?.id) {
        const [turmasAluno, artigosAluno] = await Promise.all([
          listTurmasByStudent(user.id).catch(() => []),
          listArticlesForStudent(user.id),
        ]);

        setTurmas(turmasAluno || []);
        setArticles(artigosAluno || []);
        return;
      }

      const todos = await listArticles();
      setArticles(todos || []);
    } catch (err) {
      toast.error(`Erro ao carregar artigos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function carregarArtigosProfessor() {
    try {
      const data = await listArticlesForTeacher(user.id, {
        turmaId: selectedTurma,
        alunoId: selectedAluno,
      });

      setArticles(data || []);
    } catch (err) {
      toast.error(`Erro ao filtrar artigos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(article) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o artigo "${article.titulo}"?\n\nEsta ação é irreversível.`
    );
    if (!confirmed) return;

    const canDelete =
      isTeacher ||
      (article.tipoAutor === "ALUNO" &&
        isStudent &&
        Number(article.autorId) === Number(user?.id));

    if (!canDelete) {
      toast.error("Você não tem permissão para excluir este artigo.");
      return;
    }

    try {
      await deleteArticle(article.id);
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      if (selectedArticle?.id === article.id) setSelectedArticle(null);
      toast.success("Artigo excluído.");
    } catch (err) {
      toast.error(`Erro ao excluir: ${err.message}`);
    }
  }

  function handleArticleSaved(newArticle) {
    setArticles((prev) => [newArticle, ...prev]);
    setShowForm(false);
  }

  const filteredArticles = useMemo(() => {
    const term = search.toLowerCase().trim();

    let result = articles;

    if (isStudent && selectedTurma) {
      result = result.filter(
        (article) => Number(article.turmaId) === Number(selectedTurma)
      );
    }

    if (!term) return result;

    return result.filter((article) => {
      return (
        article.titulo?.toLowerCase().includes(term) ||
        article.conteudo?.toLowerCase().includes(term) ||
        article.autorNome?.toLowerCase().includes(term) ||
        article.turmaNome?.toLowerCase().includes(term)
      );
    });
  }, [articles, search, selectedTurma, isStudent]);

  function formatDate(value) {
    if (!value) return "Sem data";

    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        
        {/* Top Header Section */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))]/10 px-3 py-1 text-xs font-black text-[hsl(var(--primary))]">
              <BookOpenText size={14} />
              Articles
            </div>
            <h1 className="text-4xl font-black text-[hsl(var(--secondary))]">Artigos</h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              Publique textos e acompanhe os artigos criados por professores e alunos.
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 font-bold text-white transition-colors hover:bg-[hsl(var(--primary-dark))]"
            >
              <Plus size={18} /> Novo Artigo
            </button>
          )}
        </div>

        {/* Filters Section */}
        <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar artigo..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm font-semibold outline-none focus:border-[hsl(var(--primary))]"
              />
            </div>

            {(isTeacher || isStudent) && (
              <select
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-[hsl(var(--primary))]"
              >
                <option value="">Todas as turmas</option>

                {turmas.map((turma) => {
                  const turmaId = turma.idTurma || turma.id;
                  
                  return (
                    <option key={turmaId} value={turmaId}>
                      {turma.nome}
                    </option>
                  );
                })}
              </select>
            )}

            {isTeacher && (
              <select
                value={selectedAluno}
                onChange={(e) => setSelectedAluno(e.target.value)}
                disabled={!selectedTurma}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-[hsl(var(--primary))] disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">Todos os alunos</option>
                
                {students.map((student) => {
                  const studentId = student.id || student.idAluno;
                 
                  return (
                    <option key={studentId} value={studentId}>
                      {student.nome}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </section>

        {/* Content States */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
          </div>
        )}

        {!loading && filteredArticles.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-[hsl(var(--border))] px-6 py-16 text-center">
            <BookOpenText size={40} className="mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
            <p className="font-semibold text-[hsl(var(--muted-foreground))]">
              Nenhum artigo encontrado.
            </p>
          </div>
        )}

        {!loading && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredArticles.map((article) => {
              const canDelete =
                isTeacher ||
                (article.tipoAutor === "ALUNO" &&
                  isStudent &&
                  Number(article.autorId) === Number(user?.id));

              return (
                <ArticleCard
                  key={article.id}
                  article={article}
                  canDelete={canDelete}
                  formatDate={formatDate}
                  onClick={() => setSelectedArticle(article)}
                  onDelete={() => handleDelete(article)}
                />
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Modal: View Full Article */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${authorTagClasses(selectedArticle.tipoAutor)}`}
                >
                  <UserRound size={12} />
                  {authorLabel(selectedArticle.tipoAutor)} · {selectedArticle.autorNome || "Não informado"}
                </span>
                
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  <CalendarDays size={12} />
                  {formatDate(selectedArticle.dataCriacao)}
                </span>

                {selectedArticle.turmaNome && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))]/10 px-3 py-1 text-xs font-bold text-[hsl(var(--secondary))]">
                    <GraduationCap size={12} />
                    {selectedArticle.turmaNome}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6">
              <h2 className="mb-4 text-3xl font-black text-[hsl(var(--secondary))] leading-snug">
                {selectedArticle.titulo}
              </h2>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-[hsl(var(--foreground))]/80">
                {selectedArticle.conteudo}
              </p>
            </div>

            {(isTeacher || (selectedArticle.tipoAutor === "ALUNO" && isStudent && Number(selectedArticle.autorId) === Number(user?.id))) && (
              <div className="sticky bottom-0 border-t border-gray-100 bg-white px-6 py-4 flex justify-end">
                <button
                  onClick={() => handleDelete(selectedArticle)}
                  className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                >
                  <Trash2 size={16} /> Excluir artigo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Creation Form (Maintains original fields layout) */}
      {showForm && (
        <NovoArtigoModal
          user={user}
          turmas={turmas}
          isStudent={isStudent}
          isTeacher={isTeacher}
          onClose={() => setShowForm(false)}
          onSaved={handleArticleSaved}
        />
      )}
    </div>
  );
}

/* ── Sub-componentes Limpos e Formatados (Bolt Style) ────────────────── */

function ArticleCard({ article, canDelete, formatDate, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer flex-col rounded-2xl border-2 border-[hsl(var(--border))] bg-white shadow-sm transition-all hover:border-[hsl(var(--primary))]/40 hover:shadow-md"
    >
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap gap-2 items-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${authorTagClasses(article.tipoAutor)}`}
          >
            <UserRound size={12} />
            {article.autorNome || "Autor não informado"}
          </span>

          <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
            <CalendarDays size={12} />
            {formatDate(article.dataCriacao)}
          </span>

          {article.turmaNome && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))]/10 px-2 py-0.5 text-xs font-black text-[hsl(var(--secondary))]">
              <GraduationCap size={12} />
              {article.turmaNome}
            </span>
          )}
        </div>

        <h2 className="mb-3 text-xl font-black text-[hsl(var(--secondary))] leading-snug group-hover:text-[hsl(var(--primary))] transition-colors">
          {article.titulo}
        </h2>

        {/* MUDANÇA AQUI: Removemos a div de fade-out e usamos line-clamp puro */}
        <p className="text-sm font-medium leading-relaxed text-[hsl(var(--foreground))]/70 whitespace-pre-wrap line-clamp-3">
          {article.conteudo}
        </p>

        <p className="mt-4 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          Clique para ler o artigo completo →
        </p>
      </div>

      {canDelete && (
        <div className="flex items-center justify-end border-t border-[hsl(var(--border))] px-6 py-2.5 bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 size={14} /> Excluir
          </button>
        </div>
      )}
    </div>
  );
}

function NovoArtigoModal({ user, turmas, isStudent, isTeacher, onClose, onSaved }) {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSalvar(e) {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Faça login para criar artigos.");
      return;
    }

    if (!titulo.trim() || !conteudo.trim()) {
      toast.error("Preencha título e conteúdo.");
      return;
    }

    if (isStudent && !turmaId) {
      toast.error("Selecione a turma para publicar o artigo.");
      return;
    }

    setSaving(true);
    try {
      const saved = await createArticle({
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        tipoAutor: isTeacher ? "PROFESSOR" : "ALUNO",
        autorId: user.id,
        turmaId: turmaId || null,
      });

      toast.success("Artigo publicado com sucesso!");
      onSaved(saved);
    } catch (err) {
      toast.error(`Erro ao publicar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="text-2xl font-black text-[hsl(var(--secondary))]">Criar novo artigo</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSalvar} className="px-6 py-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_240px]">
            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título do artigo"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">
                Vincular Turma {isStudent && <span className="text-red-500">*</span>}
              </label>
              <select
                value={turmaId}
                onChange={(e) => setTurmaId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-[hsl(var(--primary))]"
              >
                <option value="">
                  {isStudent ? "Selecione uma turma" : "Sem turma específica"}
                </option>
                {turmas.map((turma) => {
                  const id = turma.idTurma || turma.id;
                  return (
                    <option key={id} value={id}>
                      {turma.nome}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Conteúdo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreva o conteúdo do artigo aqui..."
              rows={8}
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500">
              Publicando como{" "}
              <span
                className={`font-black ${isTeacher ? "text-[#5B3DF5]" : "text-[#FF4F8B]"}`}
              >
                {isTeacher ? "Professor" : "Aluno"}
              </span>
              {user?.nome && (
                <> · <span className="text-gray-700">{user.nome}</span></>
              )}
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-black text-white transition-all hover:bg-[hsl(var(--primary-dark))] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Publicando..." : "Publicar artigo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}