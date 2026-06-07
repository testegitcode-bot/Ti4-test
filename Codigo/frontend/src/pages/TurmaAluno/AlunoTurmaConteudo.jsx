import { useState } from "react";
import { useParams } from "react-router-dom";

import QuizzesAluno from "../QuizzesAluno/QuizzesAluno";
import RankingTurma from "../Ranking/RankingTurma";

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
            onClick={() => setConteudoSelecionado("ranking")}
            className={`rounded-2xl border-2 p-6 text-left shadow-sm transition
            ${
              conteudoSelecionado === "ranking"
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.08] shadow-md"
                : "border-[hsl(var(--border))] bg-white hover:border-[hsl(var(--primary))] hover:shadow-md"
            }`}
          >
            <h2 className="text-2xl font-black text-[hsl(var(--secondary))]">
              Ranking
            </h2>

            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              View the class ranking based on quiz points.
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

        <div className="mt-10">
          {conteudoSelecionado === "ranking" && (
            <RankingTurma idTurma={idTurma} />
          )}

          {conteudoSelecionado === "quizzes" && (
            <QuizzesAluno idTurma={idTurma} />
          )}
        </div>
      </main>
    </div>
  );
}