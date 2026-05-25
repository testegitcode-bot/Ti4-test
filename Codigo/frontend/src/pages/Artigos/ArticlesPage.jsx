import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Footer from '@/components/Footer.jsx';
import { Trash2, BookOpen, User } from 'lucide-react';

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data || `Error ${res.status}`);
  return data;
}

const listArticles = () => request('/artigos');
const deleteArticle = (id) => request(`/artigos/${id}`, { method: 'DELETE' });

function authorTagClasses(tipoAutor) {
  if (tipoAutor === 'PROFESSOR') {
    return 'bg-[#5B3DF5]/10 text-[#5B3DF5] border border-[#5B3DF5]/30';
  }
  return 'bg-[#FF4F8B]/10 text-[#FF4F8B] border border-[#FF4F8B]/30';
}

function authorLabel(tipoAutor) {
  if (tipoAutor === 'PROFESSOR') return 'Professor';
  if (tipoAutor === 'ALUNO') return 'Aluno';
  return tipoAutor ?? 'Autor';
}

export default function ArticlesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    setError('');
    try {
      const data = await listArticles();
      setArticles(data ?? []);
    } catch {
      setError('Não foi possível carregar os artigos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, titulo) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o artigo "${titulo}"?\n\nEsta ação é irreversível.`
    );
    if (!confirmed) return;

    try {
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert('Erro ao excluir o artigo. Tente novamente.');
    }
  }

  const isProfessor = user?.role === 'teacher';

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12">

        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-black text-[hsl(var(--secondary))]">Artigos</h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              Leia e explore os artigos publicados na plataforma.
            </p>
          </div>
          {isProfessor && (
            <button
              onClick={() => navigate('/artigos/novo')}
              className="flex items-center gap-2 rounded-xl bg-[#5B3DF5] px-5 py-3 font-bold text-white transition-colors hover:bg-[#4a2fd4]"
            >
              <BookOpen size={18} /> Novo Artigo
            </button>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-red-50 px-6 py-5 text-center font-semibold text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-[hsl(var(--border))] px-6 py-16 text-center">
            <BookOpen size={40} className="mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
            <p className="font-semibold text-[hsl(var(--muted-foreground))]">
              Nenhum artigo publicado ainda.
            </p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                canDelete={isProfessor}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function ArticleCard({ article, canDelete, onDelete }) {
  return (
    <div className="group flex flex-col rounded-2xl border-2 border-[hsl(var(--border))] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-1 flex-col p-6">

        {/* Author tag */}
        <div className="mb-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${authorTagClasses(article.tipoAutor)}`}
          >
            <User size={12} />
            {authorLabel(article.tipoAutor)}
            {article.autorNome && (
              <span className="font-semibold opacity-75">· {article.autorNome}</span>
            )}
          </span>
        </div>

        {/* Title */}
        <h2 className="mb-3 text-lg font-black text-[hsl(var(--secondary))] leading-snug">
          {article.titulo}
        </h2>

        {/* Content preview with fixed height and fade-out */}
        <div className="relative max-h-24 overflow-hidden">
          <p className="text-sm font-medium leading-relaxed text-[hsl(var(--foreground))]/70">
            {article.conteudo}
          </p>
          <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Read more hint */}
        <p className="mt-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          Clique para ler o artigo completo
        </p>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-6 py-3">
        <button
          onClick={() => {/* navigate to article detail */}}
          className="text-sm font-bold text-[hsl(var(--primary))] transition-colors hover:text-[hsl(var(--primary))]/80"
        >
          Ler artigo →
        </button>

        {canDelete && (
          <button
            onClick={() => onDelete(article.id, article.titulo)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 size={14} /> Excluir
          </button>
        )}
      </div>
    </div>
  );
}
