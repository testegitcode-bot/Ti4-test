import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpenText,
  CalendarDays,
  GraduationCap,
  Send,
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
  gradeArticleAnswer,
  listAnswersByArticle,
  listAnswersByStudent,
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
  const [notas, setNotas] = useState({});
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

      const notasIniciais = {};
      (respostasArtigo || []).forEach((answer) => {
        notasIniciais[answer.id] = answer.nota ?? "";
      });
      setNotas(notasIniciais);

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
      toast.success("Resposta enviada com sucesso.");
      await carregarDados();
    } catch (err) {
      toast.error(`Erro ao enviar resposta: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function salvarNota(answerId) {
    const nota = Number(notas[answerId]);

    if (Number.isNaN(nota) || nota < 0 || nota > 100) {
      toast.error("A nota deve estar entre 0 e 100.");
      return;
    }

    setSaving(true);

    try {
      await gradeArticleAnswer(answerId, nota);
      toast.success("Nota salva com sucesso.");
      await carregarDados();
    } catch (err) {
      toast.error(`Erro ao salvar nota: ${err.message}`);
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

        <div className="mb-8 flex flex-wrap gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5B3DF5]/30 bg-[#5B3DF5]/10 px-3 py-1 text-[#5B3DF5]">
            <UserRound size={13} />
            {article.nomeProfessor || article.nomeAluno || "Autor não informado"}
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

        {article.url && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="mb-2 text-sm font-black text-blue-700">
              Artigo externo
            </p>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700"
            >
              Acessar artigo original
            </a>
          </div>
        )}

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: article.conteudo,
          }}
        />

        {isStudent && (
          <section className="mt-8 rounded-3xl border-2 border-[hsl(var(--border))] bg-white p-6 shadow-sm">
            {studentAnswers.length === 0 ? (
              <>
                <h2 className="mb-2 text-2xl font-black text-[hsl(var(--secondary))]">
                  Responder artigo
                </h2>

                <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
                  Sua resposta será avaliada pelo professor com nota de 0 a 100.
                </p>

                <form onSubmit={enviarResposta} className="space-y-5">
                <div className="overflow-hidden rounded-2xl border-2 border-[hsl(var(--border))] bg-white">
                  <ReactQuill
                    theme="snow"
                    value={conteudoResposta}
                    onChange={setConteudoResposta}
                    modules={modules}
                    placeholder="Escreva sua resposta aqui..."
                    className="
                      border-none
                      [&_.ql-toolbar]:flex
                      [&_.ql-toolbar]:flex-wrap
                      [&_.ql-toolbar]:gap-1
                      [&_.ql-toolbar]:border-0
                      [&_.ql-toolbar]:border-b
                      [&_.ql-toolbar]:border-[hsl(var(--border))]
                      [&_.ql-container]:min-h-[260px]
                      [&_.ql-container]:border-0
                      [&_.ql-editor]:min-h-[260px]
                      [&_.ql-editor]:text-[15px]
                      max-sm:[&_.ql-container]:min-h-[220px]
                      max-sm:[&_.ql-editor]:min-h-[220px]
                    "
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 font-black text-white hover:bg-[hsl(var(--primary-dark))] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <Send size={18} />
                    {saving ? "Enviando..." : "Enviar resposta"}
                  </button>
                </div>
              </form>
              </>
            ) : (
              <div>
                <h3 className="mb-4 text-xl font-black text-[hsl(var(--secondary))]">
                  Sua resposta
                </h3>

                <div className="grid gap-4">
                  {studentAnswers.map((answer) => (
                    <div
                      key={answer.id}
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="mb-3 text-xs font-bold text-gray-500">
                        Enviada em: {formatDate(answer.dataResposta)}
                      </div>

                      <div
                        className="mb-4 text-sm leading-7 text-gray-700"
                        dangerouslySetInnerHTML={{
                          __html: answer.conteudo,
                        }}
                      />

                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                        <p className="text-sm font-black text-blue-700">
                          Nota:{" "}
                          {answer.nota !== null && answer.nota !== undefined
                            ? `${answer.nota}/100`
                            : "ainda não avaliada"}
                        </p>

                        {answer.dataAvaliacao && (
                          <p className="mt-1 text-xs font-bold text-blue-600">
                            Avaliada em: {formatDate(answer.dataAvaliacao)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {isTeacher && (
          <section className="mt-8 rounded-3xl border-2 border-[hsl(var(--border))] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-black text-[hsl(var(--secondary))]">
              Respostas dos alunos
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
                    </div>

                    <div
                      className="mb-4 text-sm leading-7 text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: answer.conteudo,
                      }}
                    />

                    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-[hsl(var(--secondary))]">
                          Avaliação
                        </p>

                        <p className="text-xs font-semibold text-gray-500">
                          Nota atual:{" "}
                          {answer.nota !== null && answer.nota !== undefined
                            ? `${answer.nota}/100`
                            : "não avaliada"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={notas[answer.id] ?? ""}
                          onChange={(e) =>
                            setNotas((prev) => ({
                              ...prev,
                              [answer.id]: e.target.value,
                            }))
                          }
                          placeholder="0 a 100"
                          className="w-28 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold outline-none focus:border-[hsl(var(--primary))]"
                        />

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => salvarNota(answer.id)}
                          className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-black text-white hover:bg-[hsl(var(--primary-dark))] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Salvar nota
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}