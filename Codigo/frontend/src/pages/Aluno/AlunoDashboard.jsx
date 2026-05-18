import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Footer from '@/components/Footer.jsx';
import { BookOpen, LogOut, Edit, Save, X, Eye, EyeOff, Trash2 } from 'lucide-react';

export default function AlunoDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const alunoId = user?.id || user?.alunoId;

  const [editando, setEditando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [turmas, setTurmas] = useState([]);
  const [carregandoTurmas, setCarregandoTurmas] = useState(true);

  const [aluno, setAluno] = useState({
    nome: '',
    email: '',
    senha: ''
  });

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: ''
  });

  useEffect(() => {
    if (alunoId) {
      carregarAluno();
      carregarTurmas();
    }
  }, [alunoId]);

  async function carregarAluno() {
    try {
      const resposta = await fetch(`http://localhost:8080/alunos/${alunoId}`);
      const dados = await resposta.json();

      setAluno({
        nome: dados.nome || '',
        email: dados.email || '',
        senha: dados.senha || ''
      });

      setForm({
        nome: dados.nome || '',
        email: dados.email || '',
        senha: dados.senha || ''
      });
    } catch (erro) {
      console.error('Error loading student:', erro);
    }
  }

  async function carregarTurmas() {
    try {
      setCarregandoTurmas(true);

      const resposta = await fetch(`http://localhost:8080/alunos/${alunoId}/turmas`);
      const dados = await resposta.json();

      setTurmas(dados);
    } catch (erro) {
      console.error('Error loading classes:', erro);
    } finally {
      setCarregandoTurmas(false);
    }
  }

  function cancelarEdicao() {
    setEditando(false);
    setMostrarSenha(false);

    setForm({
      nome: aluno.nome || '',
      email: aluno.email || '',
      senha: aluno.senha || ''
    });
  }

  async function salvarEdicao() {
    try {
      const resposta = await fetch(`http://localhost:8080/alunos/${alunoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (!resposta.ok) {
        throw new Error('Error updating profile');
      }

      const alunoAtualizado = await resposta.json();

      setAluno({
        nome: alunoAtualizado.nome || form.nome,
        email: alunoAtualizado.email || form.email,
        senha: alunoAtualizado.senha || form.senha
      });

      setForm({
        nome: alunoAtualizado.nome || form.nome,
        email: alunoAtualizado.email || form.email,
        senha: alunoAtualizado.senha || form.senha
      });

      setEditando(false);
      setMostrarSenha(false);

      alert('Profile updated successfully!');
    } catch (erro) {
      console.error(erro);
      alert('Error updating profile.');
    }
  }

  async function deletarAluno() {
  const confirmar = window.confirm('Deseja realmente deletar sua conta?');

  if (!confirmar) return;

  try {
    const resposta = await fetch(`http://localhost:8080/alunos/${alunoId}`, {
      method: 'DELETE'
    });

    if (!resposta.ok) {
      throw new Error('Erro ao deletar aluno');
    }

    alert('Aluno deletado com sucesso!');
    logout();
    navigate('/');
  } catch (erro) {
    console.error(erro);
    alert('Erro ao deletar aluno.');
  }
}

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black text-[hsl(var(--secondary))]">
              Student Dashboard
            </h1>

            <p className="text-[hsl(var(--muted-foreground))]">
              Welcome, <strong>{aluno.nome || user?.nome || 'Student'}</strong>!
            </p>
          </div>

          <button
              onClick={deletarAluno}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
            >
              <Trash2 size={18} />
              Delete Account
            </button>

        </div>
            
        <div className="rounded-2xl border-2 border-[hsl(var(--border))] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-[hsl(var(--secondary))]">
              Profile Information
            </h2>

            {!editando ? (
              <button
                onClick={() => setEditando(true)}
                className="flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-800"
              >
                <Edit size={18} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={salvarEdicao}
                  className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
                >
                  <Save size={18} /> Save
                </button>

                <button
                  onClick={cancelarEdicao}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
                >
                  <X size={18} /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-4 text-sm">
            <CampoPerfil
              label="Name"
              name="nome"
              value={form.nome}
              editando={editando}
              onChange={setForm}
            />

            <CampoPerfil
              label="Email"
              name="email"
              value={form.email}
              editando={editando}
              onChange={setForm}
            />

            <div>
              <strong>Password:</strong>

              {editando ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={form.senha}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        senha: e.target.value
                      }))
                    }
                    className="w-full rounded-xl border-2 border-[hsl(var(--border))] px-3 py-2 outline-none focus:border-[hsl(var(--primary))]"
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="rounded-xl border-2 border-[hsl(var(--border))] px-3 py-2 text-[hsl(var(--primary))]"
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              ) : (
                <span className="ml-2">********</span>
              )}
            </div>

            <p>
              <strong>Role:</strong> Student
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border-2 border-[hsl(var(--border))] bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-[hsl(var(--secondary))]">
            <BookOpen size={24} />
            My Classes
          </h2>

          {carregandoTurmas ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Loading classes...
            </p>
          ) : turmas.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              You are not enrolled in any class yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {turmas.map((turma) => (
                <div
                  key={turma.id}
                  className="rounded-xl border-2 border-[hsl(var(--border))] p-4"
                >
                  <h3 className="font-black text-[hsl(var(--secondary))]">
                    {turma.nome || 'Unnamed class'}
                  </h3>

                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    <strong>Grade:</strong> {turma.serie || '—'}
                  </p>

                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    <strong>Teacher:</strong> {turma.professor || '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function CampoPerfil({ label, name, value, editando, onChange }) {
  return (
    <div>
      <strong>{label}:</strong>

      {editando ? (
        <input
          type="text"
          value={value}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              [name]: e.target.value
            }))
          }
          className="mt-1 w-full rounded-xl border-2 border-[hsl(var(--border))] px-3 py-2 outline-none focus:border-[hsl(var(--primary))]"
        />
      ) : (
        <span className="ml-2">{value || '—'}</span>
      )}
    </div>
  );
}