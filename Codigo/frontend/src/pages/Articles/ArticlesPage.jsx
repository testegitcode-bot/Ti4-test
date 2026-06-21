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
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  createArticle,
  deleteArticle,
  listArticles,
  listArticlesByClass,
  listTurmasByProfessor,
  listTurmasByStudent,
} from "@/services/api";

export default function ArticlesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isTeacher = user?.role === "teacher" || user?.role === "PROFESSOR";
  const isStudent = user?.role === "student" || user?.role === "ALUNO";

  const [articles, setArticles] = useState([]);
  const [turmas, setTurmas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTurma, setSelectedTurma] = useState("");
  const [filterMode, setFilterMode] = useState("ESCOLA");

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    carregarDadosIniciais();
  }, [user?.id, user?.role]);

  useEffect(() => {
    carregarArtigosPorFiltro();
  }, [filterMode, selectedTurma]);

  async function carregarDadosIniciais() {
    setLoading(true);

    try {
      if (isTeacher && user?.id) {
        const [turmasProfessor, todosArtigos] = await Promise.all([
          listTurmasByProfessor(user.id).catch(() => []),
          listArticles(),
        ]);

        setTurmas(turmasProfessor || []);
        setArticles(todosArtigos || []);
        return;
      }

      if (isStudent && user?.id) {
        const [turmasAluno, todosArtigos] = await Promise.all([
          listTurmasByStudent(user.id).catch(() => []),
          listArticles(),
        ]);

        setTurmas(turmasAluno || []);
        setArticles(todosArtigos || []);
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

  async function carregarArtigosPorFiltro() {
    if (!user) return;

    try {
      if (isStudent && filterMode === "MINHA_TURMA") {
        if (!selectedTurma) {
          setArticles([]);
          return;
        }

        const data = await listArticlesByClass(selectedTurma);
        setArticles(data || []);
        return;
      }

      if (isStudent && filterMode === "ESCOLA") {
        const data = await listArticles();
        setArticles(data || []);
        return;
      }

      if (isTeacher) {
        const data = selectedTurma
          ? await listArticlesByClass(selectedTurma)
          : await listArticles();

        setArticles(data || []);
      }
    } catch (err) {
      toast.error(`Erro ao filtrar artigos: ${err.message}`);
    }
  }

  function handleArticleSaved(newArticle) {
    setArticles((prev) => [newArticle, ...prev]);
    setShowForm(false);
  }

  async function handleDelete(article) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o artigo "${article.titulo}"?`
    );

    if (!confirmed) return;

    try {
      await deleteArticle(article.id);
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      toast.success("Artigo excluído.");
    } catch (err) {
      toast.error(`Erro ao excluir: ${err.message}`);
    }
  }

  const filteredArticles = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (isStudent && filterMode === "MINHA_TURMA" && !selectedTurma) {
      return [];
    }

    let result = articles;

    if (isStudent && filterMode === "MINHA_TURMA" && selectedTurma) {
      result = result.filter(
        (article) => Number(article.turmaId) === Number(selectedTurma)
      );
    }

    if (!term) return result;

    return result.filter((article) => {
      return (
        article.titulo?.toLowerCase().includes(term) ||
        article.conteudo?.toLowerCase().includes(term) ||
        article.nomeProfessor?.toLowerCase().includes(term) ||
        article.nomeTurma?.toLowerCase().includes(term)
      );
    });
  }, [articles, search, filterMode, selectedTurma, isStudent]);

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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))]/10 px-3 py-1 text-xs font-black text-[hsl(var(--primary))]">
              <BookOpenText size={14} />
              Articles
            </div>

            <h1 className="text-4xl font-black text-[hsl(var(--secondary))]">
              Artigos
            </h1>

            <p className="text-[hsl(var(--muted-foreground))]">
              Leia artigos dos professores e responda às atividades propostas.
            </p>
          </div>

          {isTeacher && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 font-bold text-white transition-colors hover:bg-[hsl(var(--primary-dark))]"
            >
              <Plus size={18} />
              Novo Artigo
            </button>
          )}
        </div>

        <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm font-semibold outline-none focus:border-[hsl(var(--primary))]"
              />
            </div>

            {isStudent && (
              <select
                value={filterMode}
                onChange={(e) => {
                  setFilterMode(e.target.value);
                  setSelectedTurma("");
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-[hsl(var(--primary))]"
              >
                <option value="ESCOLA">Professores da escola toda</option>
                <option value="MINHA_TURMA">Professores da minha turma</option>
              </select>
            )}

            {(isTeacher || (isStudent && filterMode === "MINHA_TURMA")) && (
              <select
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-[hsl(var(--primary))]"
              >
                <option value="">
                  {isTeacher ? "Todas as turmas" : "Selecione uma turma"}
                </option>

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
          </div>
        </section>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
          </div>
        )}

        {!loading && filteredArticles.length === 0 && (
          <EmptyState text="Nenhum artigo encontrado." />
        )}

        {!loading && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                isTeacher={isTeacher}
                formatDate={formatDate}
                onClick={() => navigate(`/articles/${article.id}`)}
                onDelete={() => handleDelete(article)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {showForm && (
        <NovoArtigoModal
          user={user}
          turmas={turmas}
          onClose={() => setShowForm(false)}
          onSaved={handleArticleSaved}
        />
      )}
    </div>
  );
}

function ArticleCard({ article, isTeacher, formatDate, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer flex-col rounded-2xl border-2 border-[hsl(var(--border))] bg-white shadow-sm transition-all hover:border-[hsl(var(--primary))]/40 hover:shadow-md"
    >
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5B3DF5]/30 bg-[#5B3DF5]/10 px-2.5 py-0.5 text-xs font-bold text-[#5B3DF5]">
            <UserRound size={12} />
            {article.nomeProfessor || "Professor não informado"}
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
            <CalendarDays size={12} />
            {formatDate(article.dataCriacao)}
          </span>

          {article.nomeTurma && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))]/10 px-2 py-0.5 text-xs font-black text-[hsl(var(--secondary))]">
              <GraduationCap size={12} />
              {article.nomeTurma}
            </span>
          )}
        </div>

        <h2 className="mb-3 text-xl font-black leading-snug text-[hsl(var(--secondary))] transition-colors group-hover:text-[hsl(var(--primary))]">
          {article.titulo}
        </h2>

        <div
          className="line-clamp-3 text-sm font-medium leading-relaxed text-[hsl(var(--foreground))]/70"
          dangerouslySetInnerHTML={{
            __html: article.conteudo,
          }}
        />

        <p className="mt-4 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          Clique para ler e responder →
        </p>
      </div>

      {isTeacher && (
        <div className="flex items-center justify-end rounded-b-2xl border-t border-[hsl(var(--border))] bg-gray-50/50 px-6 py-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 size={14} />
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[hsl(var(--border))] px-6 py-16 text-center">
      <BookOpenText
        size={40}
        className="mx-auto mb-4 text-[hsl(var(--muted-foreground))]"
      />

      <p className="font-semibold text-[hsl(var(--muted-foreground))]">
        {text}
      </p>
    </div>
  );
}

function NovoArtigoModal({ user, turmas, onClose, onSaved }) {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [saving, setSaving] = useState(false);
  const [url, setUrl] = useState("");


  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ size: ["small", false, "large", "huge"] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };

  async function handleSalvar(e) {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Faça login para criar artigos.");
      return;
    }

    if (!titulo.trim()) {
      toast.error("Preencha o título.");
      return;
    }

    if (!conteudo.trim() && !url.trim()) {
      toast.error("Preencha o conteúdo ou informe uma URL.");
      return;
    }

    setSaving(true);

    try {
      const saved = await createArticle({
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        url: url.trim() || null,
        professorId: user.id || user.professorId,
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
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="text-2xl font-black text-[hsl(var(--secondary))]">
            Criar novo artigo
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSalvar} className="space-y-4 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-[1fr_240px]">
            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">
                Tema/Título <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Tema do artigo"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">
                Turma
              </label>

              <select
                value={turmaId}
                onChange={(e) => setTurmaId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-[hsl(var(--primary))]"
              >
                <option value="">Escola toda</option>

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

            <div>
              <label className="mb-1 block text-sm font-bold text-gray-700">
                URL do artigo/site
              </label>

              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Conteúdo <span className="text-red-500">*</span>
            </label>

            <ReactQuill
              theme="snow"
              value={conteudo}
              onChange={setConteudo}
              modules={modules}
              placeholder="Escreva o conteúdo do artigo aqui..."
              style={{
                height: "300px",
                marginBottom: "60px",
              }}
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500">
              Publicando como{" "}
              <span className="font-black text-[#5B3DF5]">Professor</span>
              {user?.nome && (
                <>
                  {" "}
                  · <span className="text-gray-700">{user.nome}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-2">
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