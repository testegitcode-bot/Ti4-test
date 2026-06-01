import { useState } from "react";
import { useParams } from "react-router-dom";

import QuizzesAluno from "../QuizzesAluno/QuizzesAluno";
// futuramente:
// import ArtigosAluno from "../ArtigosAluno/ArtigosAluno";

export default function AlunoTurmaConteudo() {
  const { idTurma } = useParams();

  const [conteudoSelecionado, setConteudoSelecionado] = useState(null);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] px-4 py-12">
      <main className="mx-auto max-w-5xl">

        <h1 className="text-4xl font-black text-[hsl(var(--secondary))]">
          Class Content
        </h1>

        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          Choose what you want to access.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">

          <button
            onClick={() => setConteudoSelecionado("artigos")}
            className={`rounded-2xl border-2 p-6 text-left shadow-sm transition
            ${
                conteudoSelecionado === "artigos"
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.08] shadow-md"
                : "border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--primary))] hover:shadow-md"
            }`}
          >
            <h2 className="text-2xl font-black text-[hsl(var(--secondary))]">
              Articles
            </h2>

            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              View articles for this class.
            </p>
          </button>

          <button
            onClick={() => setConteudoSelecionado("quizzes")}
            className={`rounded-2xl border-2 p-6 text-left shadow-sm transition
            ${
                conteudoSelecionado === "quizzes"
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.08] shadow-md"
                : "border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--primary))] hover:shadow-md"
            }`}
          >
            <h2 className="text-2xl font-black text-[hsl(var(--secondary))]">
              Quizzes
            </h2>

            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Answer quizzes from this class.
            </p>
          </button>

        </div>

        {/* SWITCH */}

        <div className="mt-10">

          {conteudoSelecionado === "artigos" && (
            <div className="rounded-2xl border-2 border-[hsl(var(--border))] bg-white p-6">
              <h2 className="text-2xl font-black">
                Articles
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Articles page here...
              </p>
            </div>
          )}

          {conteudoSelecionado === "quizzes" && (
            <QuizzesAluno idTurma={idTurma} />
          )}

        </div>

      </main>
    </div>
  );
}