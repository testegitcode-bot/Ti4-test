import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Footer from '@/components/Footer.jsx';
import { Users, BookOpen, BarChart3, LogOut } from 'lucide-react';

export default function ProfessorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black text-[hsl(var(--secondary))]">Painel do Professor</h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              Bem-vindo, <strong>{user?.nome || 'Professor'}</strong>!
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
            <p><strong>Nome:</strong> {user?.nome || '—'}</p>
            <p><strong>E-mail:</strong> {user?.email || '—'}</p>
            <p><strong>Cargo:</strong> Professor</p>
          </div>
        </div>
      </main>

      <Footer />
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
