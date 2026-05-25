import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Footer from '@/components/Footer.jsx';
import { Trash2, BookOpen, User, X, Plus } from 'lucide-react';

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
const createArticle = (body) => request('/artigos', { method: 'POST', body: JSON.stringify(body) });
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

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const isProfessor = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

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
      if (selectedArticle?.id === id) setSelectedArticle(null);
    } catch {
      alert('Erro ao excluir o artigo. Tente novamente.');
    }
  }

  function handleArticleSaved(newArticle) {
    setArticles((prev) => [newArticle, ...prev]);
    setShowForm(false);
  }

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
          {(isProfessor || isStudent) && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 font-bold text-white transition-colors hover:bg-[hsl(var(--primary-dark))]"
            >
              <Plus size={18} /> Novo Artigo
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
                onClick={() => setSelectedArticle(article)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Modal: Visualização completa do artigo */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setSelectedArticle(null)}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${authorTagClasses(selectedArticle.tipoAutor)}`}
              >
                <User size={12} />
                {authorLabel(selectedArticle.tipoAutor)}
                {selectedArticle.autorNome && (
                  <span className="font-semibold opacity-75">· {selectedArticle.autorNome}</span>
                )}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6">
              <h2 className="mb-4 text-2xl font-black text-[hsl(var(--secondary))] leading-snug">
                {selectedArticle.titulo}
              </h2>
              <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-[hsl(var(--foreground))]/80">
                {selectedArticle.conteudo}
              </p>
            </div>

            {isProfessor && (
              <div className="sticky bottom-0 border-t border-gray-100 bg-white px-6 py-4 flex justify-end">
                <button
                  onClick={() => handleDelete(selectedArticle.id, selectedArticle.titulo)}
                  className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                >
                  <Trash2 size={16} /> Excluir artigo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Formulário de criação */}
      {showForm && (
        <NovoArtigoModal
          user={user}
          onClose={() => setShowForm(false)}
          onSaved={handleArticleSaved}
        />
      )}
    </div>
  );
}

function ArticleCard({ article, canDelete, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer flex-col rounded-2xl border-2 border-[hsl(var(--border))] bg-white shadow-sm transition-all hover:border-[hsl(var(--primary))]/40 hover:shadow-md"
    >
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

      {/* Delete action — stops propagation so card click doesn't open modal */}
      {canDelete && (
        <div className="flex items-center justify-end border-t border-[hsl(var(--border))] px-6 py-3">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(article.id, article.titulo); }}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
          >
            <Trash2 size={14} /> Excluir
          </button>
        </div>
      )}
    </div>
  );
}

function NovoArtigoModal({ user, onClose, onSaved }) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [salvando, setSalvando] = useState(false);

  const tipoAutor = user?.role === 'teacher' ? 'PROFESSOR' : 'ALUNO';

  async function handleSalvar() {
    if (!titulo.trim()) return alert('Informe o título do artigo.');
    if (!conteudo.trim()) return alert('Informe o conteúdo do artigo.');

    setSalvando(true);
    try {
      const payload = {
        titulo,
        conteudo,
        autorId: user?.id,
        autorNome: user?.nome,
        tipoAutor,
      };
      const saved = await createArticle(payload);
      onSaved(saved);
    } catch (err) {
      alert(`Erro ao salvar o artigo: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="text-2xl font-black text-[hsl(var(--secondary))]">Novo Artigo</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título do artigo"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-gray-700">
              Conteúdo <span className="text-red-500">*</span>
            </label>
            <textarea
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreva o conteúdo do artigo aqui..."
              rows={10}
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20"
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500">
              Publicando como{' '}
              <span
                className={`font-black ${tipoAutor === 'PROFESSOR' ? 'text-[#5B3DF5]' : 'text-[#FF4F8B]'}`}
              >
                {tipoAutor === 'PROFESSOR' ? 'Professor' : 'Aluno'}
              </span>
              {user?.nome && (
                <> · <span className="text-gray-700">{user.nome}</span></>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-gray-100 bg-white px-6 py-4">
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="w-full rounded-xl bg-[hsl(var(--primary))] py-3 font-black text-white hover:bg-[hsl(var(--primary-dark))] disabled:opacity-60"
          >
            {salvando ? 'Publicando...' : 'Publicar Artigo'}
          </button>
        </div>
      </div>
    </div>
  );
}
