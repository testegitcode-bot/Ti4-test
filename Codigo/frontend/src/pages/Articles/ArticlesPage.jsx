import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpenText,
  CalendarDays,
  GraduationCap,
  MessageSquare,
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
  createReview,
  deleteArticle,
  listArticles,
  listArticlesForStudent,
  listArticlesForTeacher,
  listReviews,
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
  return tipoAutor ?? "Author";
}

export default function ArticlesPage() {
  const { user } = useAuth();

  const isTeacher = user?.role === "teacher" || user?.role === "PROFESSOR";
  const isStudent = user?.role === "student" || user?.role === "ALUNO";

  const [articles, setArticles] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [students, setStudents] = useState([]);
  const [reviewCounts, setReviewCounts] = useState({});

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
        const artigos = artigosAluno || [];
        setArticles(artigos);
        await carregarReviewCounts(artigos);
        return;
      }

      const todos = await listArticles();
      setArticles(todos || []);
      await carregarReviewCounts(todos || []);
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

      const artigos = data || [];
      setArticles(artigos);
      await carregarReviewCounts(artigos);
    } catch (err) {
      toast.error(`Erro ao filtrar artigos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function carregarReviewCounts(artigos) {
    const professorArticles = artigos.filter((a) => a.tipoAutor === "PROFESSOR");
    if (professorArticles.length === 0) return;

    const counts = await Promise.all(
      professorArticles.map(async (a) => {
        try {
          const reviews = await listReviews(a.id);
          return { id: a.id, count: reviews?.length ?? 0 };
        } catch {
          return { id: a.id, count: 0 };
        }
      })
    );

    setReviewCounts((prev) => {
      const next = { ...prev };
      counts.forEach(({ id, count }) => { next[id] = count; });
      return next;
    });
  }

  const updateReviewCount = useCallback((articleId, delta) => {
    setReviewCounts((prev) => ({
      ...prev,
      [articleId]: (prev[articleId] ?? 0) + delta,
    }));
  }, []);

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
                  reviewCount={reviewCounts[article.id] ?? 0}
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
        <ArticleModal
          article={selectedArticle}
          user={user}
          isStudent={isStudent}
          isTeacher={isTeacher}
          formatDate={formatDate}
          reviewCount={reviewCounts[selectedArticle.id] ?? 0}
          onReviewAdded={() => updateReviewCount(selectedArticle.id, 1)}
          onDelete={() => handleDelete(selectedArticle)}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {/* Modal: Creation Form */}
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

/* ── ArticleCard ─────────────────────────────────────────────── */

function ArticleCard({ article, canDelete, reviewCount, formatDate, onClick, onDelete }) {
  const isProfessorArticle = article.tipoAutor === "PROFESSOR";

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

        <p className="text-sm font-medium leading-relaxed text-[hsl(var(--foreground))]/70 whitespace-pre-wrap line-clamp-3">
          {article.conteudo}
        </p>

        <p className="mt-4 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          Click to read full article →
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-6 py-2.5 bg-gray-50/50 rounded-b-2xl">
        {isProfessorArticle ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <MessageSquare size={13} className="text-gray-400" />
            {reviewCount === 1 ? "1 review" : `${reviewCount} reviews`}
          </span>
        ) : (
          <span />
        )}

        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 size={14} /> Excluir
          </button>
        )}
      </div>
    </div>
  );
}

/* ── ArticleModal ────────────────────────────────────────────── */

function ArticleModal({
  article,
  user,
  isStudent,
  isTeacher,
  formatDate,
  reviewCount,
  onReviewAdded,
  onDelete,
  onClose,
}) {
  const isProfessorArticle = article.tipoAutor === "PROFESSOR";
  const [activeTab, setActiveTab] = useState("content");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localReviewCount, setLocalReviewCount] = useState(reviewCount);

  useEffect(() => {
    setLocalReviewCount(reviewCount);
  }, [reviewCount]);

  async function loadReviews() {
    if (reviewsLoaded) return;
    try {
      const data = await listReviews(article.id);
      setReviews(data || []);
      setReviewsLoaded(true);
    } catch {
      setReviews([]);
      setReviewsLoaded(true);
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "reviews") loadReviews();
  }

  async function handleSubmitReview(e) {
    e.preventDefault();

    if (!reviewText.trim()) {
      toast.error("Write your review before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const saved = await createReview(article.id, {
        conteudo: reviewText.trim(),
        autorId: user.id,
        autorNome: user.nome,
      });

      setReviews((prev) => [saved, ...prev]);
      setLocalReviewCount((c) => c + 1);
      onReviewAdded();
      setReviewText("");
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(`Failed to submit review: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const canDelete =
    isTeacher ||
    (article.tipoAutor === "ALUNO" &&
      isStudent &&
      Number(article.autorId) === Number(user?.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header — metadata */}
        <div className="shrink-0 flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${authorTagClasses(article.tipoAutor)}`}
            >
              <UserRound size={12} />
              {authorLabel(article.tipoAutor)} · {article.autorNome || "Unknown"}
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              <CalendarDays size={12} />
              {formatDate(article.dataCriacao)}
            </span>

            {article.turmaNome && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))]/10 px-3 py-1 text-xs font-bold text-[hsl(var(--secondary))]">
                <GraduationCap size={12} />
                {article.turmaNome}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Article title */}
        <div className="shrink-0 px-6 pt-5 pb-1">
          <h2 className="text-3xl font-black text-[hsl(var(--secondary))] leading-snug">
            {article.titulo}
          </h2>
        </div>

        {/* Tabs — only for professor articles */}
        {isProfessorArticle && (
          <div className="shrink-0 flex gap-1 border-b border-gray-100 px-6 pt-4">
            <button
              onClick={() => handleTabChange("content")}
              className={`pb-3 px-1 text-sm font-bold transition-all border-b-2 -mb-px ${
                activeTab === "content"
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Article Content
            </button>
            <button
              onClick={() => handleTabChange("reviews")}
              className={`pb-3 px-1 ml-4 text-sm font-bold transition-all border-b-2 -mb-px inline-flex items-center gap-1.5 ${
                activeTab === "reviews"
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <MessageSquare size={14} />
              Student Reviews
              <span className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-black min-w-[20px] ${
                activeTab === "reviews"
                  ? "bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {localReviewCount}
              </span>
            </button>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Content Tab (or default for non-professor articles) */}
          {(!isProfessorArticle || activeTab === "content") && (
            <div>
              <p className="whitespace-pre-wrap text-base leading-relaxed text-[hsl(var(--foreground))]/80">
                {article.conteudo}
              </p>

              {/* Review form — only for students on professor articles */}
              {isProfessorArticle && isStudent && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="mb-3 text-sm font-black text-[hsl(var(--secondary))] uppercase tracking-wider">
                    Write a Review
                  </h3>
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your thoughts on this article..."
                      rows={4}
                      className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-black text-white transition-all hover:bg-[hsl(var(--primary-dark))] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {isProfessorArticle && activeTab === "reviews" && (
            <div>
              {!reviewsLoaded && (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
                </div>
              )}

              {reviewsLoaded && reviews.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-gray-200 px-6 py-12 text-center">
                  <MessageSquare size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-400">No reviews yet.</p>
                  <p className="mt-1 text-xs text-gray-400">Be the first to review this article.</p>
                </div>
              )}

              {reviewsLoaded && reviews.length > 0 && (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} formatDate={formatDate} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — delete action */}
        {canDelete && (
          <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4 flex justify-end rounded-b-3xl">
            <button
              onClick={onDelete}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
            >
              <Trash2 size={16} /> Excluir artigo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ReviewCard ──────────────────────────────────────────────── */

function ReviewCard({ review, formatDate }) {
  const initials = review.autorNome
    ? review.autorNome
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/15 text-xs font-black text-[hsl(var(--primary))]">
          {initials}
        </div>
        <div>
          <p className="text-sm font-bold text-[hsl(var(--secondary))]">
            {review.autorNome || "Anonymous"}
          </p>
          <p className="text-xs text-gray-400">{formatDate(review.dataCriacao)}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]/80 whitespace-pre-wrap">
        {review.conteudo}
      </p>
    </div>
  );
}

/* ── NovoArtigoModal ─────────────────────────────────────────── */

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
