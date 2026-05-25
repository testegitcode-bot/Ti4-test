import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./GerenciarTurma.css";

function GerenciarTurma() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [abaAtiva, setAbaAtiva] = useState("alunos");

  const [turma, setTurma] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState("");

  const [quizzes, setQuizzes] = useState([]);
  const [quizSelecionado, setQuizSelecionado] = useState(null);

  const [resultadosQuiz, setResultadosQuiz] = useState([]);
  const [carregandoResultados, setCarregandoResultados] =
    useState(false);

  const [resultadoSelecionado, setResultadoSelecionado] =
    useState(null);

  const [questoesResultado, setQuestoesResultado] =
    useState([]);

  const [editando, setEditando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaSerie, setNovaSerie] = useState("");

  const API_TURMAS = "http://localhost:8080/turmas";
  const API_ALUNOS = "http://localhost:8080/alunos";
  const API_QUIZZES = "http://localhost:8080/quizzes";
  const API_RESULTADOS =
    "http://localhost:8080/resultados-quiz";

  useEffect(() => {
    carregarTurma();
    carregarAlunos();
    carregarQuizzesDaTurma();
  }, [id]);

  async function carregarTurma() {
    const res = await fetch(`${API_TURMAS}/${id}`);
    const data = await res.json();

    setTurma(data);
    setNovoNome(data.nome);
    setNovaSerie(data.serie);
  }

  async function carregarAlunos() {
    const res = await fetch(API_ALUNOS);
    const data = await res.json();

    setAlunos(data);
  }

  async function carregarQuizzesDaTurma() {
    const res = await fetch(
      `${API_QUIZZES}/turma/${id}`
    );

    const data = await res.json();

    setQuizzes(data);
  }

  async function carregarResultadosDoQuiz(quiz) {
    setQuizSelecionado(quiz);

    setResultadoSelecionado(null);

    setCarregandoResultados(true);

    try {
      const res = await fetch(
        `${API_RESULTADOS}/quiz/${quiz.id}`
      );

      const data = await res.json();

      console.log("RESULTADOS:", data);

      setResultadosQuiz(data);
    } catch (erro) {
      console.error(
        "Erro ao carregar resultados:",
        erro
      );

      setResultadosQuiz([]);
    } finally {
      setCarregandoResultados(false);
    }
  }

  async function carregarDetalhesResultado(
    resultado
  ) {
    if (
      resultadoSelecionado?.id === resultado.id
    ) {
      setResultadoSelecionado(null);

      setQuestoesResultado([]);

      return;
    }

    setResultadoSelecionado(resultado);

    try {
      const res = await fetch(
        `http://localhost:8080/resultado-questao/resultado/${resultado.id}`
      );

      const data = await res.json();

      setQuestoesResultado(data);
    } catch (erro) {
      console.error(
        "Erro ao carregar respostas:",
        erro
      );

      setQuestoesResultado([]);
    }
  }

  async function adicionarAluno(idAluno) {
    await fetch(`${API_TURMAS}/${id}/alunos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idAluno }),
    });

    carregarTurma();
  }

  async function removerAluno(idAluno) {
    await fetch(
      `${API_TURMAS}/${id}/alunos/${idAluno}`,
      {
        method: "DELETE",
      }
    );

    carregarTurma();
  }

  async function salvarEdicaoTurma() {
    const body = {
      nome: novoNome,
      serie: novaSerie,
    };

    await fetch(`${API_TURMAS}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    setEditando(false);

    carregarTurma();
  }

  function alunoJaNaTurma(idAluno) {
    return turma.alunos?.some(
      (a) => a.id === idAluno
    );
  }

  function calcularMediaResultados() {
    if (resultadosQuiz.length === 0)
      return 0;

    const soma = resultadosQuiz.reduce(
      (total, resultado) =>
        total + (resultado.percentual || 0),
      0
    );

    return soma / resultadosQuiz.length;
  }

  const alunosFiltrados = alunos.filter(
    (aluno) => {
      const texto = busca.toLowerCase();

      return (
        aluno.nome
          ?.toLowerCase()
          .includes(texto) ||
        aluno.matricula
          ?.toLowerCase()
          .includes(texto)
      );
    }
  );

  if (!turma) {
    return (
      <p className="loading">
        Loading...
      </p>
    );
  }

  return (
    <div className="gerenciar-turma-page">
      <main className="turma-container">
        <button
          className="btn-voltar"
          onClick={() =>
            navigate("/turmas")
          }
        >
          ← Back
        </button>

        <section className="turma-hero">
          <div>
            <span className="turma-label">
              Class
            </span>

            {editando ? (
              <>
                <input
                  className="input-editar"
                  type="text"
                  value={novoNome}
                  onChange={(e) =>
                    setNovoNome(
                      e.target.value
                    )
                  }
                  placeholder="Class name"
                />

                <input
                  className="input-editar"
                  type="text"
                  value={novaSerie}
                  onChange={(e) =>
                    setNovaSerie(
                      e.target.value
                    )
                  }
                  placeholder="Grade"
                />

                <div className="acoes-edicao">
                  <button
                    className="btn-salvar"
                    onClick={
                      salvarEdicaoTurma
                    }
                  >
                    Save
                  </button>

                  <button
                    className="btn-cancelar"
                    onClick={() => {
                      setEditando(false);

                      setNovoNome(
                        turma.nome
                      );

                      setNovaSerie(
                        turma.serie
                      );
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>{turma.nome}</h2>

                <p>
                  Grade:{" "}
                  <strong>
                    {turma.serie}
                  </strong>
                </p>

                <button
                  className="btn-editar-turma"
                  onClick={() =>
                    setEditando(true)
                  }
                >
                  Edit Class
                </button>
              </>
            )}
          </div>

          <div className="turma-icon">
            📚
          </div>
        </section>

        <section className="turma-info-grid">
          <div className="info-card">
            <h3>Students</h3>

            <p>
              {turma.alunos?.length ||
                0}
            </p>
          </div>

          <div className="info-card">
            <h3>Quizzes</h3>

            <p>{quizzes.length}</p>
          </div>

          <div className="info-card">
            <h3>Teacher</h3>

            <p>
              {turma.professor
                ?.nome || "—"}
            </p>
          </div>
        </section>

        <section className="turma-switch">
          <button
            className={
              abaAtiva === "alunos"
                ? "switch-btn ativo"
                : "switch-btn"
            }
            onClick={() =>
              setAbaAtiva("alunos")
            }
          >
            Students
          </button>

          <button
            className={
              abaAtiva === "quizzes"
                ? "switch-btn ativo"
                : "switch-btn"
            }
            onClick={() =>
              setAbaAtiva("quizzes")
            }
          >
            Quizzes
          </button>
        </section>

        {abaAtiva === "quizzes" && (
          <>
            <section className="alunos-section">
              <h3>Class Quizzes</h3>

              <div className="alunos-lista">
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => (
                    <div
                      className="aluno-card"
                      key={quiz.id}
                    >
                      <div>
                        <h4>
                          {quiz.titulo}
                        </h4>

                        <p>
                          {quiz.questoes
                            ?.length || 0}{" "}
                          questions
                        </p>
                      </div>

                      <button
                        className="btn-adicionar"
                        onClick={() =>
                          carregarResultadosDoQuiz(
                            quiz
                          )
                        }
                      >
                        View Results
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-card">
                    No quizzes for this
                    class yet.
                  </div>
                )}
              </div>
            </section>

            {quizSelecionado && (
              <section className="alunos-section">
                <h3>
                  Results -{" "}
                  {
                    quizSelecionado.titulo
                  }
                </h3>

                {carregandoResultados ? (
                  <div className="empty-card">
                    Loading
                    results...
                  </div>
                ) : (
                  <>
                    <section className="turma-info-grid">
                      <div className="info-card">
                        <h3>
                          Answers
                        </h3>

                        <p>
                          {
                            resultadosQuiz.length
                          }
                        </p>
                      </div>

                      <div className="info-card">
                        <h3>
                          Average
                        </h3>

                        <p>
                          {calcularMediaResultados().toFixed(
                            1
                          )}
                          %
                        </p>
                      </div>

                      <div className="info-card">
                        <h3>
                          Total
                          Points
                        </h3>

                        <p>
                          {resultadosQuiz[0]
                            ?.totalPontos ||
                            0}
                        </p>
                      </div>
                    </section>

                    <div className="alunos-lista">
                      {resultadosQuiz.length >
                      0 ? (
                        resultadosQuiz.map(
                          (
                            resultado
                          ) => {
                            const expandido =
                              resultadoSelecionado?.id ===
                              resultado.id;

                            return (
                              <div
                                className="aluno-card"
                                key={
                                  resultado.id
                                }
                              >
                                <div className="resultado-topo">
                                  <div>
                                    <h4>
                                      {resultado
                                        .aluno
                                        ?.nome ||
                                        "Student"}
                                    </h4>

                                    <p>
                                      ID:{" "}
                                      {resultado
                                        .aluno
                                        ?.matricula ||
                                        "—"}
                                    </p>

                                    <p>
                                      Score:{" "}
                                      {
                                        resultado.pontuacao
                                      }
                                      /
                                      {
                                        resultado.totalPontos
                                      }
                                    </p>

                                    <p>
                                      Percentage:{" "}
                                      {resultado.percentual
                                        ? resultado.percentual.toFixed(
                                            1
                                          )
                                        : "0.0"}
                                      %
                                    </p>
                                  </div>

                                  <button
                                    className="btn-adicionar"
                                    onClick={() =>
                                      carregarDetalhesResultado(
                                        resultado
                                      )
                                    }
                                  >
                                    {expandido
                                      ? "Hide Answers"
                                      : "View Answers"}
                                  </button>
                                </div>

                                {expandido && (
                                  <div className="respostas-card">
                                    {questoesResultado.length >
                                    0 ? (
                                      questoesResultado.map(
                                        (
                                          resposta
                                        ) => (
                                          <div
                                            className="resposta-item"
                                            key={
                                              resposta.id
                                            }
                                          >
                                            <h4>
                                              {
                                                resposta
                                                  .questao
                                                  ?.enunciado
                                              }
                                            </h4>

                                            <p>
                                              Selected:{" "}
                                              <strong>
                                                {resposta
                                                  .alternativaSelecionada
                                                  ?.texto ||
                                                  "—"}
                                              </strong>
                                            </p>

                                            <p>
                                              Result:{" "}
                                              <strong
                                                style={{
                                                  color:
                                                    resposta.correta
                                                      ? "green"
                                                      : "red",
                                                }}
                                              >
                                                {resposta.correta
                                                  ? "Correct"
                                                  : "Wrong"}
                                              </strong>
                                            </p>
                                          </div>
                                        )
                                      )
                                    ) : (
                                      <div className="empty-card">
                                        No answers
                                        found.
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )
                      ) : (
                        <div className="empty-card">
                          No students
                          have answered
                          this quiz yet.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </section>
            )}
          </>
        )}

        {abaAtiva === "alunos" && (
          <>
            <section className="alunos-section">
              <h3>
                Class Students
              </h3>

              <div className="alunos-lista">
                {turma.alunos?.length >
                0 ? (
                  turma.alunos.map(
                    (aluno) => (
                      <div
                        className="aluno-card"
                        key={aluno.id}
                      >
                        <div>
                          <h4>
                            {
                              aluno.nome
                            }
                          </h4>

                          <p>
                            ID:{" "}
                            {
                              aluno.matricula
                            }
                          </p>
                        </div>

                        <button
                          className="btn-remover"
                          onClick={() =>
                            removerAluno(
                              aluno.id
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )
                ) : (
                  <div className="empty-card">
                    No students in
                    this class yet.
                  </div>
                )}
              </div>
            </section>

            <section className="form-card">
              <h3>Add Student</h3>

              <input
                className="input-busca"
                type="text"
                placeholder="Search by name or ID..."
                value={busca}
                onChange={(e) =>
                  setBusca(
                    e.target.value
                  )
                }
              />
            </section>

            <section className="alunos-section">
              <h3>
                School Students
              </h3>

              <div className="alunos-lista">
                {alunosFiltrados.length >
                0 ? (
                  alunosFiltrados.map(
                    (aluno) => {
                      const jaTem =
                        alunoJaNaTurma(
                          aluno.id
                        );

                      return (
                        <div
                          className="aluno-card"
                          key={aluno.id}
                        >
                          <div>
                            <h4>
                              {
                                aluno.nome
                              }
                            </h4>

                            <p>
                              ID:{" "}
                              {
                                aluno.matricula
                              }
                            </p>
                          </div>

                          <button
                            className={
                              jaTem
                                ? "btn-adicionado"
                                : "btn-adicionar"
                            }
                            disabled={
                              jaTem
                            }
                            onClick={() =>
                              adicionarAluno(
                                aluno.id
                              )
                            }
                          >
                            {jaTem
                              ? "Added"
                              : "Add"}
                          </button>
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="empty-card">
                    No students
                    found.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default GerenciarTurma;