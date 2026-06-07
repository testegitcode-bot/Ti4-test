import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpenText,
  CalendarDays,
  GraduationCap,
  Send,
  Star,
  UserRound,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "@/components/Footer.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";
import {
  createArticleAnswer,
  getArticle,
  listAnswersByArticle,
  listAnswersByStudent,
  resendArticleAnswer,
} from "@/services/api";

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isStudent = user?.role === "student" || user?.role === "ALUNO";
  const isTeacher = user?.role === "teacher" || user?.role === "PROFESSOR";
  const alunoId = user?.id || user?.alunoId;

  const [article, setArticle] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [conteudoResposta, setConteudoResposta] = useState("");
  const [activeTab, setActiveTab] = useState("CONTENT");
  const [selectedReview, setSelectedReview] = useState(null);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [conteudoReenvio, setConteudoReenvio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const approvedReviews = useMemo(() => {
    return answers
      .filter((answer) => answer.status === "APROVADA")
      .sort((a, b) => {
        if (a.destaque === b.destaque) {
          return new Date(b.dataResposta) - new Date(a.dataResposta);
        }

        return a.destaque ? -1 : 1;
      });
  }, [answers]);

  useEffect(() => {
    carregarDados();
  }, [id, user?.id, user?.role]);

  async function carregarDados() {
    setLoading(true);

    try {
      const artigo = await getArticle(id);
      setArticle(artigo);

      const respostasArtigo = await listAnswersByArticle(id).catch(() => []);
      setAnswers(respostasArtigo || []);

      if (isStudent && alunoId) {
        const respostasAluno = await listAnswersByStudent(alunoId).catch(() => []);

        const respostasDoArtigo = respostasAluno.filter(
          (r) => Number(r.artigoId) === Number(id)
        );

        setStudentAnswers(respostasDoArtigo);
      }
    } catch (err) {
      toast.error(`Erro ao carregar artigo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function enviarResposta(e) {
    e.preventDefault();

    if (!isStudent) {
      toast.error("Apenas alunos podem responder artigos.");
      return;
    }

    if (!conteudoResposta || conteudoResposta === "<p><br></p>") {
      toast.error("Escreva sua resposta antes de enviar.");
      return;
    }

    setSaving(true);

    try {
      await createArticleAnswer({
        artigoId: Number(id),
        alunoId,
        conteudo: conteudoResposta,
      });

      setConteudoResposta("");
      toast.success("Resposta enviada! Ela ficará pendente até aprovação do professor.");
      await carregarDados();
    } catch (err) {
      toast.error(`Erro ao enviar resposta: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function enviarReenvio() {
  if (!editingAnswer) return;

  if (!conteudoReenvio || conteudoReenvio === "<p><br></p>") {
    toast.error("Escreva sua resposta antes de reenviar.");
    return;
  }

  setSaving(true);

  try {
    await resendArticleAnswer(editingAnswer.id, conteudoReenvio);

    toast.success("Resposta reenviada para avaliação.");
    setEditingAnswer(null);
    setConteudoReenvio("");

    await carregarDados();
  } catch (err) {
    toast.error(`Erro ao reenviar resposta: ${err.message}`);
  } finally {
    setSaving(false);
  }
}

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

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
        <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
          <button
            onClick={() => navigate("/articles")}
            className="mb-6 flex items-center gap-2 font-bold text-[hsl(var(--primary))]"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <div className="rounded-2xl border-2 border-dashed border-[hsl(var(--border))] px-6 py-16 text-center">
            <BookOpenText
              size={40}
              className="mx-auto mb-4 text-[hsl(var(--muted-foreground))]"
            />

            <p className="font-semibold text-[hsl(var(--muted-foreground))]">
              Artigo não encontrado.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <button
          onClick={() => navigate("/articles")}
          className="mb-6 flex items-center gap-2 font-bold text-[hsl(var(--primary))]"
        >
          <ArrowLeft size={18} />
          Voltar para artigos
        </button>

        <div className="mb-6 flex overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white shadow-sm">
          <button
            onClick={() => setActiveTab("CONTENT")}
            className={`flex-1 py-4 text-sm font-black transition ${
              activeTab === "CONTENT"
                ? "bg-[hsl(var(--primary))] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Article Content
          </button>

          <button
            onClick={() => setActiveTab("REVIEWS")}
            className={`flex-1 py-4 text-sm font-black transition ${
              activeTab === "REVIEWS"
                ? "bg-[hsl(var(--primary))] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Student Reviews
          </button>
        </div>

        {activeTab === "CONTENT" && (
          <>
            <article className="rounded-3xl border-2 border-[hsl(var(--border))] bg-white p-8 shadow-sm">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))]/10 px-3 py-1 text-xs font-black text-[hsl(var(--primary))]">
                <BookOpenText size={14} />
                Artigo do professor
              </div>

              <h1 className="mb-4 text-4xl font-black leading-tight text-[hsl(var(--secondary))]">
                {article.titulo}
              </h1>

              <div className="mb-8 flex flex-wrap gap-2 text-xs font-bold">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5B3DF5]/30 bg-[#5B3DF5]/10 px-3 py-1 text-[#5B3DF5]">
                  <UserRound size={13} />
                  {article.nomeProfessor || "Professor não informado"}
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                  <CalendarDays size={13} />
                  {formatDate(article.dataCriacao)}
                </span>

                {article.nomeTurma && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))]/10 px-3 py-1 text-[hsl(var(--secondary))]">
                    <GraduationCap size={13} />
                    {article.nomeTurma}
                  </span>
                )}
              </div>

              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: article.conteudo,
                }}
              />
            </article>

            {isStudent && (
              <section className="mt-8 rounded-3xl border-2 border-[hsl(var(--border))] bg-white p-6 shadow-sm">
                {studentAnswers.length === 0 && (
            <>  
                <h2 className="mb-2 text-2xl font-black text-[hsl(var(--secondary))]">
                  Responder artigo
                </h2>

                <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
                  Sua resposta será enviada para análise do professor. Se aprovada,
                  poderá aparecer em Student Reviews.
                </p>

                <form onSubmit={enviarResposta}>
                  <div className="rounded-2xl border-2 border-[hsl(var(--border))] bg-white p-2">
                    <ReactQuill
                      theme="snow"
                      value={conteudoResposta}
                      onChange={setConteudoResposta}
                      modules={modules}
                      placeholder="Escreva sua resposta aqui..."
                      style={{
                        height: "260px",
                        marginBottom: "55px",
                      }}
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 font-black text-white hover:bg-[hsl(var(--primary-dark))] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send size={18} />
                      {saving ? "Enviando..." : "Enviar resposta"}
                    </button>
                  </div>
                </form>
                </>
    )}

                {studentAnswers.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-4 text-xl font-black text-[hsl(var(--secondary))]">
                      Suas respostas
                    </h3>

                    <div className="grid gap-4">
                      {studentAnswers.map((answer) => (
                        <div
                          key={answer.id}
                          className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                        >
                          <div className="mb-3 text-xs font-bold text-gray-500">
                            Status: {answer.status}
                          </div>

                          <div
                            className="mb-4 text-sm leading-7 text-gray-700"
                            dangerouslySetInnerHTML={{
                              __html: answer.conteudo,
                            }}
                          />

                          {answer.status === "REPROVADA" && answer.feedbackProfessor && (
  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
    <p className="mb-1 text-sm font-black text-red-700">
      Feedback do professor
    </p>

    <p className="mb-3 text-sm text-red-700">
      {answer.feedbackProfessor}
    </p>

    {answer.prazoReenvio && (
      <p className="text-xs font-bold text-red-600">
        Prazo para reenviar: {formatDate(answer.prazoReenvio)}
      </p>
    )}

    {answer.prazoReenvio &&
    new Date() <= new Date(answer.prazoReenvio) ? (
      <button
  type="button"
  onClick={() => {
    setEditingAnswer(answer);
    setConteudoReenvio(answer.conteudo);
  }}
  className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white hover:bg-red-700"
>
  Editar e reenviar
</button>
    ) : (
      <p className="mt-3 text-xs font-black text-red-700">
        Prazo de reenvio encerrado.
      </p>
    )}
  </div>
)}

                          {answer.status === "PENDENTE" && (
                            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                              <p className="text-sm font-black text-yellow-700">
                                Aguardando avaliação do professor.
                              </p>
                            </div>
                          )}

                          {answer.status === "APROVADA" && (
                            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                              <p className="text-sm font-black text-green-700">
                                Sua resposta foi aprovada.
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {activeTab === "REVIEWS" && (
          <section className="rounded-3xl border-2 border-[hsl(var(--border))] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[hsl(var(--secondary))]">
                  Student Reviews
                </h2>

                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Respostas aprovadas pelos professores. As respostas em destaque aparecem primeiro.
                </p>
              </div>
            </div>

            {approvedReviews.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[hsl(var(--border))] px-6 py-12 text-center">
                <Star
                  size={34}
                  className="mx-auto mb-3 text-[hsl(var(--muted-foreground))]"
                />

                <p className="font-semibold text-[hsl(var(--muted-foreground))]">
                  Nenhuma resposta aprovada ainda.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {approvedReviews.map((answer) => (
                  <div
                    key={answer.id}
                    onClick={() => setSelectedReview(answer)}
                    className={`cursor-pointer rounded-2xl p-5 shadow-sm transition hover:scale-[1.01] hover:shadow-lg ${
                      answer.destaque
                        ? "border-2 border-yellow-300 bg-yellow-50"
                        : "border border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
                      {answer.destaque && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-200 px-2.5 py-1 text-yellow-800">
                          <Star size={13} />
                          Destaque
                        </span>
                      )}

                      <span>{answer.nomeAluno || "Aluno não informado"}</span>
                      <span>•</span>
                      <span>{formatDate(answer.dataResposta)}</span>
                    </div>

                    <div
                      className="line-clamp-3 text-sm leading-7 text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: answer.conteudo,
                      }}
                    />

                    <p className="mt-3 text-xs font-bold text-[hsl(var(--primary))]">
                      Clique para ler a resposta completa →
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {isTeacher && activeTab === "CONTENT" && (
          <section className="mt-8 rounded-3xl border-2 border-[hsl(var(--border))] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-black text-[hsl(var(--secondary))]">
              Respostas deste artigo
            </h2>

            {answers.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Nenhuma resposta enviada ainda.
              </p>
            ) : (
              <div className="grid gap-4">
                {answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="mb-2 flex flex-wrap gap-2 text-xs font-bold text-gray-500">
                      <span>{answer.nomeAluno || "Aluno não informado"}</span>
                      <span>•</span>
                      <span>{formatDate(answer.dataResposta)}</span>
                      <span>•</span>
                      <span>Status: {answer.status}</span>
                      {answer.destaque && (
                        <>
                          <span>•</span>
                          <span className="text-yellow-600">Destaque</span>
                        </>
                      )}
                    </div>

                    <div
                      className="text-sm leading-7 text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: answer.conteudo,
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

       {selectedReview && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    onClick={() => setSelectedReview(null)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[hsl(var(--secondary))]">
            Resposta de {selectedReview.nomeAluno || "Aluno"}
          </h2>

          <p className="text-sm font-semibold text-gray-500">
            {formatDate(selectedReview.dataResposta)}
          </p>
        </div>

        <button
          onClick={() => setSelectedReview(null)}
          className="rounded-full px-3 py-1 text-2xl font-black text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      {selectedReview.destaque && (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-sm font-black text-yellow-700">
          <Star size={16} />
          Resposta em destaque
        </div>
      )}

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{
          __html: selectedReview.conteudo,
        }}
      />
    </div>
  </div>
)}

{editingAnswer && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    onClick={() => setEditingAnswer(null)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl"
    >
      <h2 className="mb-2 text-2xl font-black text-[hsl(var(--secondary))]">
        Editar e reenviar resposta
      </h2>

      <p className="mb-4 text-sm text-gray-500">
        Faça as correções solicitadas pelo professor e reenvie para nova avaliação.
      </p>

      <div className="rounded-2xl border-2 border-[hsl(var(--border))] bg-white p-2">
        <ReactQuill
          theme="snow"
          value={conteudoReenvio}
          onChange={setConteudoReenvio}
          modules={modules}
          placeholder="Edite sua resposta aqui..."
          style={{
            height: "300px",
            marginBottom: "60px",
          }}
        />
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setEditingAnswer(null);
            setConteudoReenvio("");
          }}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50"
        >
          Cancelar
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={enviarReenvio}
          className="rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-black text-white hover:bg-[hsl(var(--primary-dark))] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Reenviando..." : "Reenviar resposta"}
        </button>
      </div>
    </div>
  </div>
)}

      <Footer />
    </div>
  );
}