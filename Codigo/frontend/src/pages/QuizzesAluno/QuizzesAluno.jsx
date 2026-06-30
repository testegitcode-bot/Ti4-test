import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./QuizzesAluno.css";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { API_BASE } from "@/services/api";

export default function QuizzesAluno() {
  const { idTurma } = useParams();

  const [quizzes, setQuizzes] = useState([]);
  const [quizzesRespondidos, setQuizzesRespondidos] = useState([]);
  const [avaliando, setAvaliando] = useState(false);
  const [quizSelecionado, setQuizSelecionado] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [finalizado, setFinalizado] = useState(false);
  const [pontuacao, setPontuacao] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    if (idTurma && user?.id) {
      carregarDados();
    }
  }, [idTurma, user]);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      await Promise.all([
        carregarQuizzes(),
        carregarQuizzesRespondidos(),
      ]);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os quizzes dessa turma.");
    } finally {
      setCarregando(false);
    }
  }

  async function carregarQuizzes() {
    const resposta = await fetch(`${API_BASE}/quizzes/turma/${idTurma}`);

    if (!resposta.ok) {
      throw new Error("Erro ao carregar quizzes.");
    }

    const dados = await resposta.json();
    setQuizzes(dados);
  }

  async function carregarQuizzesRespondidos() {
    const resposta = await fetch(`${API_BASE}/resultados-quiz/aluno/${user.id}`);

    if (!resposta.ok) {
      throw new Error("Erro ao carregar quizzes respondidos.");
    }

    const dados = await resposta.json();

    const idsRespondidos = dados.map((resultado) => resultado.quiz.id);

    setQuizzesRespondidos(idsRespondidos);
  }

  function quizJaRespondido(idQuiz) {
    return quizzesRespondidos.includes(idQuiz);
  }

  function iniciarQuiz(quiz) {
    if (quizJaRespondido(quiz.id)) {
      return;
    }

    setQuizSelecionado(quiz);
    setRespostas({});
    setFinalizado(false);
    setPontuacao(0);
  }

  function voltarParaLista() {
    setQuizSelecionado(null);
    setRespostas({});
    setFinalizado(false);
    setPontuacao(0);
  }

  function selecionarAlternativa(idQuestao, idAlternativa) {
    if (finalizado) return;

    setRespostas((prev) => ({
      ...prev,
      [idQuestao]: idAlternativa,
    }));
  }

  async function finalizarQuiz() {
    if (!quizSelecionado || avaliando) return;

    try {
      setAvaliando(true);

      let total = 0;

      quizSelecionado.questoes.forEach((questao) => {
        const idAlternativaSelecionada = respostas[questao.id];

        const alternativaSelecionada = questao.alternativas.find(
          (alternativa) => alternativa.id === idAlternativaSelecionada
        );

        if (alternativaSelecionada?.correta) {
          total += questao.pontos;
        }
      });

      const resposta = await fetch(`${API_BASE}/resultados-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alunoId: user.id,
          quizId: quizSelecionado.id,
          turmaId: idTurma,
          pontuacao: total,
          totalPontos: calcularTotalPontos(quizSelecionado),
          respostas: Object.entries(respostas).map(
            ([questaoId, alternativaId]) => ({
              questaoId: Number(questaoId),
              alternativaId: Number(alternativaId),
            })
          ),
        }),
      });

      if (!resposta.ok) {
        alert("Erro ao salvar resultado do quiz.");
        return;
      }

      setPontuacao(total);
      setFinalizado(true);
      setQuizzesRespondidos((prev) => [...prev, quizSelecionado.id]);
    } catch (error) {
      console.error(error);
      alert("Erro ao avaliar o quiz.");
    } finally {
      setAvaliando(false);
    }
  }

  function calcularTotalPontos(quiz) {
    return quiz.questoes?.reduce((total, questao) => total + questao.pontos, 0) || 0;
  }

  function todasQuestoesRespondidas() {
    if (!quizSelecionado) return false;

    return quizSelecionado.questoes.every((questao) => respostas[questao.id]);
  }

  if (carregando) {
    return (
      <main className="quizzes-page">
        <section className="quizzes-container">
          <p className="loading">Carregando quizzes...</p>
        </section>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="quizzes-page">
        <section className="quizzes-container">
          <div className="erro-box">
            <h2>Ops!</h2>
            <p>{erro}</p>
            <button onClick={carregarDados}>Tentar novamente</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="quizzes-page">
      <section className="quizzes-container">
        {quizzes.length === 0 ? (
          <div className="vazio-card">
            <h2>Nenhum quiz cadastrado</h2>
            <p>Quando o professor criar quizzes para essa turma, eles aparecerão aqui.</p>
          </div>
        ) : (
          <div className="quizzes-grid">
            {quizzes.map((quiz) => {
              const respondido = quizJaRespondido(quiz.id);

              return (
                <article
                  className={`quiz-card ${respondido ? "quiz-bloqueado" : ""}`}
                  key={quiz.id}
                >
                  <div className="quiz-card-topo">
                    <span className="nivel-badge">{quiz.nivelIngles}</span>
                    <span className="questoes-badge">
                      {quiz.questoes?.length || 0} questões
                    </span>
                  </div>

                  <h2>{quiz.titulo}</h2>
                  <p>{quiz.descricao}</p>

                  {respondido && (
                    <p className="quiz-ja-respondido">
                      Você já respondeu este quiz.
                    </p>
                  )}

                  <div className="quiz-card-rodape">
                    <span>{calcularTotalPontos(quiz)} pontos</span>

                    <button
                      onClick={() => iniciarQuiz(quiz)}
                      disabled={respondido}
                      className={respondido ? "btn-bloqueado" : ""}
                    >
                      {respondido ? "Respondido" : "Responder"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {quizSelecionado && (
        <div className="quiz-modal-overlay">
          <div className="quiz-modal">
            <button className="quiz-modal-fechar" onClick={voltarParaLista}>
              ×
            </button>

            <div className="quiz-detalhe-card">
              <span className="nivel-badge">{quizSelecionado.nivelIngles}</span>

              <h1>{quizSelecionado.titulo}</h1>
              <p>{quizSelecionado.descricao}</p>

              <div className="quiz-info">
                <span>{quizSelecionado.questoes?.length || 0} questões</span>
                <span>{calcularTotalPontos(quizSelecionado)} pontos possíveis</span>
              </div>
            </div>

            <div className="questoes-lista">
              {quizSelecionado.questoes?.map((questao, index) => (
                <div className="questao-card" key={questao.id}>
                  <div className="questao-topo">
                    <h3>
                      {index + 1}. {questao.enunciado}
                    </h3>

                    <span className={`dificuldade ${questao.dificuldade?.toLowerCase()}`}>
                      {questao.dificuldade}
                    </span>
                  </div>

                  <p className="pontos-questao">{questao.pontos} ponto(s)</p>

                  <div className="alternativas-lista">
                    {questao.alternativas?.map((alternativa) => {
                      const selecionada = respostas[questao.id] === alternativa.id;

                      let classe = "alternativa";

                      if (selecionada) classe += " selecionada";
                      if (finalizado && alternativa.correta) classe += " correta";
                      if (finalizado && selecionada && !alternativa.correta) {
                        classe += " incorreta";
                      }

                      return (
                        <button
                          key={alternativa.id}
                          className={classe}
                          onClick={() => selecionarAlternativa(questao.id, alternativa.id)}
                          disabled={finalizado}
                        >
                          {alternativa.texto}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!finalizado ? (
             <button className="btn-finalizar"
              onClick={finalizarQuiz}
              disabled={!todasQuestoesRespondidas() || avaliando}
            >
              {avaliando ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Avaliando...
                </span>
              ) : (
                "Finalizar quiz"
              )}
            </button>
            ) : (
              <div className="resultado-card">
                <h2>Resultado</h2>
                <p>
                  Você fez <strong>{pontuacao}</strong> de{" "}
                  <strong>{calcularTotalPontos(quizSelecionado)}</strong> pontos.
                </p>

                <button className="btn-sair-quiz" onClick={voltarParaLista}>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}