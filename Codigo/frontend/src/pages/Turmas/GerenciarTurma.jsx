import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./GerenciarTurma.css";

function GerenciarTurma() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [turma, setTurma] = useState(null);
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState("");

  const [editando, setEditando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaSerie, setNovaSerie] = useState("");

  const API_TURMAS = "http://localhost:8080/turmas";
  const API_ALUNOS = "http://localhost:8080/alunos";

  useEffect(() => {
    carregarTurma();
    carregarAlunos();
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
    await fetch(`${API_TURMAS}/${id}/alunos/${idAluno}`, {
      method: "DELETE",
    });

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
    return turma.alunos?.some((a) => a.id === idAluno);
  }

  const alunosFiltrados = alunos.filter((aluno) => {
    const texto = busca.toLowerCase();

    return (
      aluno.nome?.toLowerCase().includes(texto) ||
      aluno.matricula?.toLowerCase().includes(texto)
    );
  });

  if (!turma) return <p className="loading">Loading...</p>;

  return (
    <div className="gerenciar-turma-page">
      <main className="turma-container">
        <button className="btn-voltar" onClick={() => navigate("/turmas")}>
          ← Back
        </button>

        <section className="turma-hero">
          <div>
            <span className="turma-label">Class</span>

            {editando ? (
              <>
                <input
                  className="input-editar"
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Class name"
                />

                <input
                  className="input-editar"
                  type="text"
                  value={novaSerie}
                  onChange={(e) => setNovaSerie(e.target.value)}
                  placeholder="Grade"
                />

                <div className="acoes-edicao">
                  <button className="btn-salvar" onClick={salvarEdicaoTurma}>
                    Save
                  </button>

                  <button
                    className="btn-cancelar"
                    onClick={() => {
                      setEditando(false);
                      setNovoNome(turma.nome);
                      setNovaSerie(turma.serie);
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
                  Grade: <strong>{turma.serie}</strong>
                </p>

                <button
                  className="btn-editar-turma"
                  onClick={() => setEditando(true)}
                >
                  Edit Class
                </button>
              </>
            )}
          </div>

          <div className="turma-icon">📚</div>
        </section>

        <section className="turma-info-grid">
          <div className="info-card">
            <h3>Students</h3>
            <p>{turma.alunos?.length || 0}</p>
          </div>

          <div className="info-card">
            <h3>ID</h3>
            <p>{turma.idTurma}</p>
          </div>

          <div className="info-card">
            <h3>Teacher</h3>
            <p>{turma.professor?.nome || "—"}</p>
          </div>
        </section>

        <section className="alunos-section">
          <h3>Class Students</h3>

          <div className="alunos-lista">
            {turma.alunos?.length > 0 ? (
              turma.alunos.map((aluno) => (
                <div className="aluno-card" key={aluno.id}>
                  <div>
                    <h4>{aluno.nome}</h4>
                    <p>ID: {aluno.matricula}</p>
                  </div>

                  <button
                    className="btn-remover"
                    onClick={() => removerAluno(aluno.id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-card">No students in this class yet.</div>
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
            onChange={(e) => setBusca(e.target.value)}
          />
        </section>

        <section className="alunos-section">
          <h3>School Students</h3>

          <div className="alunos-lista">
            {alunosFiltrados.length > 0 ? (
              alunosFiltrados.map((aluno) => {
                const jaTem = alunoJaNaTurma(aluno.id);

                return (
                  <div className="aluno-card" key={aluno.id}>
                    <div>
                      <h4>{aluno.nome}</h4>
                      <p>ID: {aluno.matricula}</p>
                    </div>

                    <button
                      className={jaTem ? "btn-adicionado" : "btn-adicionar"}
                      disabled={jaTem}
                      onClick={() => adicionarAluno(aluno.id)}
                    >
                      {jaTem ? "Added" : "Add"}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="empty-card">No students found.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default GerenciarTurma;