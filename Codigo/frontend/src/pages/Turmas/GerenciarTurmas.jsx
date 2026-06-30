import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./GerenciarTurmas.css";
import { API_BASE } from "@/services/api";

function GerenciarTurmas() {
  const [turmas, setTurmas] = useState([]);
  const [nome, setNome] = useState("");
  const [serie, setSerie] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();
  const API = `${API_BASE}/turmas`;

  useEffect(() => {
    carregarTurmas();
  }, []);

  async function carregarTurmas() {
  try {
    const usuario = JSON.parse(localStorage.getItem("nextstep_user"));
    const idProfessor = usuario?.id;

    if (!idProfessor) {
      toast.error("Teacher not found.");
      return;
    }

    const url = `${API}/professor/${idProfessor}`;

    console.log("Buscando turmas do professor em:", url);

    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error(`Erro ao carregar turmas. Status: ${resposta.status}`);
    }

    const dados = await resposta.json();

    setTurmas(dados);
  } catch (erro) {
    console.error("Erro ao carregar turmas:", erro);
    toast.error("Error loading classes.");
  }
}

  async function criarTurma(e) {
    e.preventDefault();

    toast.dismiss();
    setCarregando(true);

    const usuario = JSON.parse(localStorage.getItem("nextstep_user"));

    const novaTurma = {
      nome,
      serie,
      idProfessor: usuario?.id,
    };

    console.log("USUARIO:", usuario);
    console.log("ID PROFESSOR ENVIADO:", novaTurma.idProfessor);
    console.log("OBJETO ENVIADO:", novaTurma);

    try {
      console.log("Enviando turma para o backend:", novaTurma);

      const resposta = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novaTurma),
      });

      console.log("Status ao criar turma:", resposta.status);

      const textoResposta = await resposta.text();
      console.log("Resposta bruta do backend:", textoResposta);

      if (!resposta.ok) {
        throw new Error(
          `Erro ao criar turma. Status: ${resposta.status}. Resposta: ${textoResposta}`
        );
      }

      toast.success("Class created successfully!");

      setNome("");
      setSerie("");

      await carregarTurmas();
    } catch (erro) {
      console.error("Erro ao criar turma:", erro);
      toast.error("Error creating class.");
    } finally {
      setCarregando(false);
    }
  }

  async function excluirTurma(idTurma) {
    toast.dismiss();

    try {
      console.log("Excluindo turma ID:", idTurma);

      const resposta = await fetch(`${API}/${idTurma}`, {
        method: "DELETE",
      });

      console.log("Status ao excluir turma:", resposta.status);

      if (!resposta.ok) {
        throw new Error(`Erro ao excluir turma. Status: ${resposta.status}`);
      }

      toast.success("Class deleted successfully!");

      await carregarTurmas();
    } catch (erro) {
      console.error("Erro ao excluir turma:", erro);
      toast.error("Error deleting class.");
    }
  }

  function abrirTurma(idTurma) {
    navigate(`/turmas/${idTurma}`);
  }

  return (
    <div className="turmas-page">
      <main className="turmas-container">
        <section className="hero-professor">
          <div>
            <h2>Manage Classes</h2>
            <p>Create classes, organize students, and manage your groups.</p>
          </div>
          <div className="hero-star">☆</div>
        </section>

        <section className="form-card">
          <h3>New Class</h3>

          <form onSubmit={criarTurma}>
            <div className="input-group">
              <label>Class Name</label>
              <input
                type="text"
                placeholder="e.g. Class A"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Grade</label>
              <input
                type="text"
                placeholder="e.g. 7th Grade"
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={carregando}>
              {carregando ? "Creating..." : "Create Class"}
            </button>
          </form>
        </section>

        <section className="turmas-section">
          <h3>My Classes</h3>

          <div className="turmas-grid">
            {turmas.map((turma) => (
              <div className="turma-card" key={turma.idTurma}>
                <div className="turma-header">
                  <span className="tag-serie">{turma.serie}</span>

                  <button
                    className="btn-delete"
                    onClick={() => excluirTurma(turma.idTurma)}
                  >
                    Delete
                  </button>
                </div>

                <h4>{turma.nome}</h4>

                <p>{turma.alunos?.length || 0} students</p>

                <button
                  className="btn-outline"
                  onClick={() => abrirTurma(turma.idTurma)}
                >
                  Manage Class
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default GerenciarTurmas;