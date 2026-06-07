import { useEffect, useState } from "react";

export default function RankingTurma({ idTurma }) {
  const [ranking, setRanking] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarRanking() {
      try {
        setCarregando(true);

        const response = await fetch(
          `http://localhost:8080/resultados-quiz/ranking/turma/${idTurma}`
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar ranking");
        }

        const data = await response.json();
        setRanking(data);
      } catch (error) {
        setErro("Não foi possível carregar o ranking da turma.");
      } finally {
        setCarregando(false);
      }
    }

    if (idTurma) {
      carregarRanking();
    }
  }, [idTurma]);

  if (carregando) {
    return (
      <div className="rounded-2xl border-2 border-[hsl(var(--border))] bg-white p-6">
        <p className="text-sm text-gray-500">Loading ranking...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="rounded-2xl border-2 border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">{erro}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[hsl(var(--border))] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-[hsl(var(--secondary))]">
        Class Ranking
      </h2>

      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Students ranked by total quiz score.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-[hsl(var(--border))]">
        <table className="w-full border-collapse">
          <thead className="bg-[hsl(var(--muted))]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold">Position</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Student</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Points</th>
              <th className="px-4 py-3 text-left text-sm font-bold">Quizzes</th>
            </tr>
          </thead>

          <tbody>
            {ranking.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-sm text-gray-500">
                  No quiz results yet.
                </td>
              </tr>
            ) : (
              ranking.map((aluno, index) => (
                <tr
                  key={aluno.idAluno}
                  className="border-t border-[hsl(var(--border))]"
                >
                  <td className="px-4 py-3 font-bold">
                    {index + 1}º
                  </td>

                  <td className="px-4 py-3">
                    {aluno.nomeAluno}
                  </td>

                  <td className="px-4 py-3 font-bold">
                    {aluno.pontuacaoTotal}
                  </td>

                  <td className="px-4 py-3">
                    {aluno.quizzesRespondidos}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}