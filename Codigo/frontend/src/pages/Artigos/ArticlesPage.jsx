import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpenText,
  CalendarDays,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  UserRound,
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
    return "bg-[#5B3DF5]/10 text-[#5B3DF5]";
  }
  return "bg-[#FF4F8B]/10 text-[#FF4F8B]";
}

export default function ArticlesPage() {
  const { user } = useAuth();

  const isTeacher = user?.role === "teacher" || user?.role === "PROFESSOR";
  const isStudent = user?.role === "student" || user?.role === "ALUNO";

  const [articles, setArticles] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedTurma, setSelectedTurma] = useState("");
  const [selectedAluno, setSelectedAluno] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    conteudo: "",
    turmaId: "",
  });

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

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Faça login para criar artigos.");
      return;
    }

    if (!form.titulo.trim() || !form.conteudo.trim()) {
      toast.error("Preencha título e conteúdo.");
      return;
    }

    if (isStudent && !form.turmaId) {
      toast.error("Selecione a turma para publicar o artigo.");
      return;
    }

    setSaving(true);

    try {
      const novo = await createArticle({
        titulo: form.titulo.trim(),
        conteudo: form.conteudo.trim(),
        tipoAutor: isTeacher ? "PROFESSOR" : "ALUNO",
        autorId: user.id,
        turmaId: form.turmaId || null,
      });

      setArticles((prev) => [novo, ...prev]);

      setForm({
        titulo: "",
        conteudo: "",
        turmaId: "",
      });

      toast.success("Artigo publicado com sucesso!");
    } catch (err) {
      toast.error(`Erro ao publicar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(article) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o artigo "${article.titulo}"?\n\nEsta ação é irreversível.`
    );
    if (!confirmed) return;

    const canDelete = isTeacher ||
      (article.tipoAutor === "ALUNO" &&
        isStudent &&
        Number(article.autorId) === Number(user?.id));

    if (!canDelete) {
      toast.error("Apenas professores podem excluir artigos.");
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))]/10 px-4 py-2 text-sm font-black text-[hsl(var(--primary))]">
              <BookOpenText size={18} />
              Articles
            </div>

            <h1 className="text-4xl font-black text-[hsl(var(--secondary))]">
              Artigos
            </h1>

            <p className="mt-1 text-[hsl(var(--muted-foreground))]">
              Publique textos e acompanhe os artigos criados por professores e alunos.
            </p>
          </div>
        </div>

        {user && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-white">
                <Plus size={22} />
              </div>

              <div>
                <h2 className="text-xl font-black text-[hsl(var(--secondary))]">
                  Criar novo artigo
                </h2>

                <p className="text-sm text-gray-500">
                  O artigo ficará registrado com autor, turma e data de criação.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_260px]">
              <input
                value={form.titulo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, titulo: e.target.value }))
                }
                placeholder="Título do artigo"
                className="rounded-2xl border border-gray-200 px-4 py-3 font-bold outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
              />

              <select
                value={form.turmaId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, turmaId: e.target.value }))
                }
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 font-bold outline-none focus:border-[hsl(var(--primary))]"
              >
                <option value="">
                  {isStudent ? "Selecione uma turma" : "Sem turma específica"}
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
            </div>

            <textarea
              value={form.conteudo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, conteudo: e.target.value }))
              }
              placeholder="Escreva o conteúdo do artigo..."
              rows={6}
              className="mt-4 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
            />

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-[hsl(var(--primary))] px-6 py-3 font-black text-white shadow-[0_4px_0_hsl(var(--primary-dark))] transition-all hover:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Publicando..." : "Publicar artigo"}
              </button>
            </div>
          </form>
        )}

        <section className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
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
                className="w-full rounded-2xl border border-gray-200 py-3 pl-9 pr-4 text-sm font-semibold outline-none focus:border-[hsl(var(--primary))]"
              />
            </div>

            {(isTeacher || isStudent) && (
              <select
                value={selectedTurma}
                onChange={(e) => setSelectedTurma(e.target.value)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[hsl(var(--primary))]"
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
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[hsl(var(--primary))] disabled:bg-gray-100 disabled:text-gray-400"
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

        {loading ? (
          <div className="py-20 text-center font-bold text-gray-400">
            Carregando artigos...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white py-20 text-center text-gray-400">
            <BookOpenText size={44} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-black">Nenhum artigo encontrado</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredArticles.map((article) => {
              const canDelete = isTeacher ||
                (article.tipoAutor === "ALUNO" &&
                  isStudent &&
                  Number(article.autorId) === Number(user?.id));

              return (
                <article
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="cursor-pointer rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-[hsl(var(--secondary))]">
                        {article.titulo}
                      </h2>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-black">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${authorTagClasses(article.tipoAutor)}`}
                        >
                          <UserRound size={14} />
                          {article.autorNome || "Autor não informado"} ·{" "}
                          {article.tipoAutor}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                          <CalendarDays size={14} />
                          {formatDate(article.dataCriacao)}
                        </span>

                        {article.turmaNome && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))]/10 px-3 py-1 text-[hsl(var(--secondary))]">
                            <GraduationCap size={14} />
                            {article.turmaNome}
                          </span>
                        )}
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(article);
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Excluir
                      </button>
                    )}
                  </div>

                  {/* Content preview with fixed height and fade-out */}
                  <div className="relative max-h-24 overflow-hidden">
                    <p className="whitespace-pre-wrap leading-7 text-gray-700">
                      {article.conteudo}
                    </p>
                    <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t from-white to-transparent" />
                  </div>

                  <p className="mt-3 text-xs font-semibold text-gray-400">
                    Clique para ler o artigo completo
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {selectedArticle && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))]/10 px-4 py-2 text-sm font-black text-[hsl(var(--primary))]">
                  <BookOpenText size={18} />
                  Artigo publicado
                </span>

                <h2 className="text-3xl font-black text-[hsl(var(--secondary))]">
                  {selectedArticle.titulo}
                </h2>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-2xl px-4 py-2 text-xl font-black text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="mb-6 flex flex-wrap gap-2 text-xs font-black">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${authorTagClasses(selectedArticle.tipoAutor)}`}
              >
                <UserRound size={14} />
                {selectedArticle.autorNome || "Autor não informado"} ·{" "}
                {selectedArticle.tipoAutor}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                <CalendarDays size={14} />
                {formatDate(selectedArticle.dataCriacao)}
              </span>

              {selectedArticle.turmaNome && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))]/10 px-3 py-1 text-[hsl(var(--secondary))]">
                  <GraduationCap size={14} />
                  {selectedArticle.turmaNome}
                </span>
              )}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
              <p className="whitespace-pre-wrap text-base leading-8 text-gray-700">
                {selectedArticle.conteudo}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
