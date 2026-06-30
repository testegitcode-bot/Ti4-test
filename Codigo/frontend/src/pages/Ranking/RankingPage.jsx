import { useEffect, useState } from "react";
import "./RankingPage.css";
import { Trophy, Medal, Crown, RefreshCw } from "lucide-react";
import { API_BASE } from "@/services/api";

const jogos = [
  "Global Ranking",
  "Word Climber",
  "Recycling Master",
  "Word Fishing",
  "Word Search",
  "Crossword",
];

export default function RankingPage() {
  const [jogoSelecionado, setJogoSelecionado] = useState("Global Ranking");
  const [ranking, setRanking] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarRanking();
  }, [jogoSelecionado]);

  async function carregarRanking() {
    try {
      setCarregando(true);
      setErro("");

      const url =
        jogoSelecionado === "Global Ranking"
         ? `${API_BASE}/ranking/global`
          : `${API_BASE}/ranking/${encodeURIComponent(jogoSelecionado)}`;

      const resposta = await fetch(url);

      if (!resposta.ok) {
        throw new Error("Erro ao carregar ranking.");
      }

      const dados = await resposta.json();
      setRanking(dados);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar o ranking.");
    } finally {
      setCarregando(false);
    }
  }

  function getIconePosicao(posicao) {
    if (posicao === 1) return <Crown size={28} />;
    if (posicao === 2) return <Medal size={26} />;
    if (posicao === 3) return <Medal size={26} />;
    return <span className="ranking-numero">{posicao}</span>;
  }

  function getPontuacao(item) {
    if (jogoSelecionado === "Global Ranking") {
      return item.pontuacaoTotal;
    }

    return item.maiorPontuacao;
  }

  function getDescricao(item) {
    if (jogoSelecionado === "Global Ranking") {
      return `${item.jogosRegistrados} jogos registrados`;
    }

    return item.nomeJogo;
  }

  return (
    <main className="ranking-page">
      <section className="ranking-container">
        <div className="ranking-hero">
          <div>
            <div className="ranking-title-row">
              <Trophy size={42} />
              <h1>Ranking</h1>
            </div>

            <p>
              {jogoSelecionado === "Global Ranking"
                ? "Veja a pontuação total dos alunos somando todos os jogos."
                : "Veja as maiores pontuações dos alunos por jogo."}
            </p>
          </div>

          <div className="ranking-filtro">
            <label>Filtrar por jogo:</label>

            <select
              value={jogoSelecionado}
              onChange={(e) => setJogoSelecionado(e.target.value)}
            >
              {jogos.map((jogo) => (
                <option key={jogo} value={jogo}>
                  {jogo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ranking-actions">
          <h2>{jogoSelecionado}</h2>

          <button onClick={carregarRanking}>
            <RefreshCw size={18} />
            Atualizar
          </button>
        </div>

        {carregando ? (
          <div className="ranking-empty">
            <p>Carregando ranking...</p>
          </div>
        ) : erro ? (
          <div className="ranking-empty">
            <h2>Ops!</h2>
            <p>{erro}</p>
          </div>
        ) : ranking.length === 0 ? (
          <div className="ranking-empty">
            <h2>Nenhuma pontuação ainda</h2>
            <p>
              {jogoSelecionado === "Global Ranking"
                ? "Quando os alunos jogarem, o ranking global aparecerá aqui."
                : `Quando os alunos jogarem ${jogoSelecionado}, o ranking aparecerá aqui.`}
            </p>
          </div>
        ) : (
          <div className="ranking-lista">
            {ranking.map((item, index) => {
              const posicao = index + 1;

              return (
                <article
                  key={`${item.nomeAluno}-${index}`}
                  className={`ranking-card ranking-pos-${posicao}`}
                >
                  <div className="ranking-posicao">
                    {getIconePosicao(posicao)}
                  </div>

                  <div className="ranking-info">
                    <h3>{item.nomeAluno}</h3>
                    <p>{getDescricao(item)}</p>
                  </div>

                  <div className="ranking-pontos">
                    <strong>{getPontuacao(item)}</strong>
                    <span>pontos</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}