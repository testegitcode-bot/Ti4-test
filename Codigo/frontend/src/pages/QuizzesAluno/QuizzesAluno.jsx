import { useEffect, useState } from "react";
import "./QuizzesAluno.css";
import { useAuth } from "@/contexts/AuthContext.jsx";

export default function QuizzesAluno({ idTurma }) {
  const [quizzes, setQuizzes] = useState([]);
  const [quizSelecionado, setQuizSelecionado] = useState(null);
  const [respostas, setRespostas] = useState({});
  const [finalizado, setFinalizado] = useState(false);
  const [pontuacao, setPontuacao] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const { user } = useAuth();
  useEffect(() => {
    if (idTurma) {
      carregarQuizzes();
    }
  }, [idTurma]);

  async function carregarQuizzes() {
    try {
      setCarregando(true);
      setErro("");

      const resposta = await fetch(`/api/quizzes/turma/${idTurma}`);

      if (!resposta.ok) {
        throw new Error("Erro ao carregar quizzes.");
      }

      const dados = await resposta.json();
      setQuizzes(dados);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os quizzes dessa turma.");
    } finally {
      setCarregando(false);
    }
  }

  function iniciarQuiz(quiz) {
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
    if (!quizSelecionado) return;

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

        await fetch("/api/resultados-quiz", {
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

    setPontuacao(total);
    setFinalizado(true);
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
            <button onClick={carregarQuizzes}>Tentar novamente</button>
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
            {quizzes.map((quiz) => (
              <article className="quiz-card" key={quiz.id}>
                <div className="quiz-card-topo">
                  <span className="nivel-badge">{quiz.nivelIngles}</span>
                  <span className="questoes-badge">
                    {quiz.questoes?.length || 0} questões
                  </span>
                </div>

                <h2>{quiz.titulo}</h2>
                <p>{quiz.descricao}</p>

                <div className="quiz-card-rodape">
                  <span>{calcularTotalPontos(quiz)} pontos</span>

                  <button onClick={() => iniciarQuiz(quiz)}>
                    Responder
                  </button>
                </div>
              </article>
            ))}
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
        <button
          className="btn-finalizar"
          onClick={finalizarQuiz}
          disabled={!todasQuestoesRespondidas()}
        >
          Finalizar quiz
        </button>
      ) : (
        <div className="resultado-card">
          <h2>Resultado</h2>
          <p>
            Você fez <strong>{pontuacao}</strong> de{" "}
            <strong>{calcularTotalPontos(quizSelecionado)}</strong> pontos.
          </p>
        </div>
      )}
    </div>
  </div>
)}
    </main>
  );
}