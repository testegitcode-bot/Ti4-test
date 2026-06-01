import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Footer from '@/components/Footer.jsx';
import { Users, BookOpen, BarChart as BarChart3, LogOut, CreditCard as Edit2, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';

export default function ProfessorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const professorId = user?.id || user?.professorId;

  const [professor, setProfessor] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    senha: ''
  });

  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (professorId) {
      carregarProfessor();
    }
  }, [professorId]);

  async function carregarProfessor() {
    try {
      const resposta = await fetch(`http://localhost:8080/professores/${professorId}`);
      const dados = await resposta.json();
      setProfessor({
        nome: dados.nome || '',
        email: dados.email || '',
        senha: dados.senha || ''
      });
    } catch (erro) {
      console.error('Erro ao carregar professor:', erro);
    }
  }

  function abrirModalEdicao() {
    setForm({ nome: professor.nome, email: professor.email, senha: professor.senha });
    setMostrarSenha(false);
    setModalEdicaoAberto(true);
  }

  function fecharModalEdicao() {
    setModalEdicaoAberto(false);
    setMostrarSenha(false);
  }

  async function salvarEdicao() {
    setSalvando(true);
    try {
      const resposta = await fetch(`http://localhost:8080/professores/${professorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!resposta.ok) throw new Error('Erro ao atualizar perfil');

      const atualizado = await resposta.json();
      setProfessor({
        nome: atualizado.nome || form.nome,
        email: atualizado.email || form.email,
        senha: atualizado.senha || form.senha
      });

      setModalEdicaoAberto(false);
      setMostrarSenha(false);
      alert('Dados atualizados com sucesso!');
    } catch (erro) {
      console.error(erro);
      alert('Erro ao atualizar dados.');
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      const resposta = await fetch(`http://localhost:8080/professores/${professorId}`, {
        method: 'DELETE'
      });

      if (!resposta.ok) throw new Error('Erro ao excluir conta');

      alert('Conta excluída com sucesso!');
      logout();
      navigate('/');
    } catch (erro) {
      console.error(erro);
      alert('Erro ao excluir conta.');
    } finally {
      setExcluindo(false);
      setModalExclusaoAberto(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black text-[hsl(var(--secondary))]">Painel do Professor</h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              Bem-vindo, <strong>{professor.nome || user?.nome || 'Professor'}</strong>!
            </p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 rounded-xl border-2 border-[hsl(var(--primary))] px-4 py-2 font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <DashboardCard
            icon={<Users size={32} />}
            title="Turmas"
            description="Gerencie suas turmas de alunos."
            onClick={() => navigate('/turmas')}
          />
          <DashboardCard
            icon={<BookOpen size={32} />}
            title="Quizzes"
            description="Crie, filtre e gerencie seus quizzes."
            onClick={() => navigate('/quizzes')}
          />
          <DashboardCard
            icon={<BarChart3 size={32} />}
            title="Desempenho"
            description="Acompanhe o progresso."
            disabled
          />
        </div>

        <div className="mt-10 rounded-2xl border-2 border-[hsl(var(--border))] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-black text-[hsl(var(--secondary))]">Dados do Perfil</h2>
          <div className="grid gap-2 text-sm">
            <p><strong>Nome:</strong> {professor.nome || user?.nome || '—'}</p>
            <p><strong>E-mail:</strong> {professor.email || user?.email || '—'}</p>
            <p><strong>Cargo:</strong> Professor</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={abrirModalEdicao}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 transition-colors"
            >
              <Edit2 size={18} /> Alterar Dados
            </button>
            <button
              onClick={() => setModalExclusaoAberto(true)}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 size={18} /> Excluir Conta
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal de Edição */}
      {modalEdicaoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-black text-[hsl(var(--secondary))]">Alterar Dados</h3>
              <button
                onClick={fecharModalEdicao}
                className="rounded-xl p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 text-sm">
              <div>
                <label className="mb-1 block font-bold text-[hsl(var(--secondary))]">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                  className="w-full rounded-xl border-2 border-[hsl(var(--border))] px-3 py-2 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-[hsl(var(--secondary))]">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl border-2 border-[hsl(var(--border))] px-3 py-2 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-[hsl(var(--secondary))]">Senha</label>
                <div className="flex items-center gap-2">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={form.senha}
                    onChange={(e) => setForm((prev) => ({ ...prev, senha: e.target.value }))}
                    className="w-full rounded-xl border-2 border-[hsl(var(--border))] px-3 py-2 outline-none focus:border-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="rounded-xl border-2 border-[hsl(var(--border))] px-3 py-2 text-[hsl(var(--primary))]"
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={fecharModalEdicao}
                className="flex items-center gap-2 rounded-xl border-2 border-[hsl(var(--border))] px-4 py-2 font-bold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]"
              >
                <X size={18} /> Cancelar
              </button>
              <button
                onClick={salvarEdicao}
                disabled={salvando}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700 disabled:opacity-60 transition-colors"
              >
                <Save size={18} /> {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {modalExclusaoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-black text-[hsl(var(--secondary))]">Excluir Conta</h3>
            </div>

            <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
              Tem certeza que deseja excluir sua conta? Esta ação é <strong>irreversível</strong> e todos os seus dados serão permanentemente removidos.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalExclusaoAberto(false)}
                className="flex items-center gap-2 rounded-xl border-2 border-[hsl(var(--border))] px-4 py-2 font-bold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]"
              >
                <X size={18} /> Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                disabled={excluindo}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                <Trash2 size={18} /> {excluindo ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardCard({ icon, title, description, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-start gap-3 rounded-2xl border-2 border-[hsl(var(--border))] bg-white p-6 transition hover:border-[hsl(var(--primary))] disabled:opacity-50 disabled:hover:border-[hsl(var(--border))]"
    >
      <div className="text-[hsl(var(--primary))]">{icon}</div>
      <h3 className="font-black text-[hsl(var(--secondary))]">{title}</h3>
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
    </button>
  );
}
