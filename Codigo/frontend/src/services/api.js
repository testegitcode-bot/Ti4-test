/**
 * API Service — NextStep English
 *
 * All calls to the Spring Boot backend (port 8080) go through here.
 * Vite's proxy redirects /api → http://localhost:8080 automatically.
 */

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

/* ── AUTH ────────────────────────────────────────────────────── */
export const loginAuth = (body) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const registerAuth = (body) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });

/* ── STUDENTS (Alunos) ──────────────────────────────────────── */
export const listStudents = () => request('/alunos');

export const getStudent = (id) => request(`/alunos/${id}`);

export const criarAluno = (body) =>
  request('/alunos', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateStudent = (id, body) =>
  request(`/alunos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteStudent = (id) =>
  request(`/alunos/${id}`, {
    method: 'DELETE',
  });

export async function loginAluno(matricula, senha) {
  const list = await listStudents();
  const student = list.find(
    (s) => s.matricula === matricula && s.senha === senha
  );

  if (!student) throw new Error('Invalid enrollment number or password.');

  return student;
}

/* ── TEACHERS (Professores) ──────────────────────────────────── */
export const listTeachers = () => request('/professores');

export const getTeacher = (id) => request(`/professores/${id}`);

export const criarProfessor = (body) =>
  request('/professores', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const updateTeacher = (id, body) =>
  request(`/professores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteTeacher = (id) =>
  request(`/professores/${id}`, {
    method: 'DELETE',
  });

/* ── CLASSES (Turmas) ──────────────────────────────────────── */
export const listTurmas = () => request('/turmas');

export const listTurmasByProfessor = (professorId) =>
  request(`/turmas/professor/${professorId}`);

export const listStudentsByTurma = (turmaId) =>
  request(`/turmas/${turmaId}/alunos`);

export const listTurmasByStudent = (studentId) =>
  request(`/alunos/${studentId}/turmas`);

/* ── QUIZZES ─────────────────────────────────────────────────── */
export const listQuizzes = () => request('/quizzes');

export const getQuiz = (id) => request(`/quizzes/${id}`);

export const listQuizzesByProfessor = (profId) =>
  request(`/quizzes/professor/${profId}`);

export const criarQuiz = (body) =>
  request('/quizzes', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const atualizarQuiz = (id, body) =>
  request(`/quizzes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deletarQuiz = (id) =>
  request(`/quizzes/${id}`, {
    method: 'DELETE',
  });

/* ── ARTICLES / ARTIGOS ─────────────────────────────────────── */
export const listArticles = () => request('/artigos');

export const getArticle = (id) => request(`/artigos/${id}`);

export const listArticlesByTeacher = (teacherId) =>
  request(`/artigos/professor/${teacherId}`);

export const listArticlesByClass = (turmaId) =>
  request(`/artigos/turma/${turmaId}`);

export const createArticle = (body) =>
  request('/artigos', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const deleteArticle = (id) =>
  request(`/artigos/${id}`, {
    method: 'DELETE',
  });

/* ── ARTICLE ANSWERS / RESPOSTAS DE ARTIGOS ─────────────────── */
export const createArticleAnswer = (body) =>
  request('/respostas-artigo', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const listAnswersByArticle = (articleId) =>
  request(`/respostas-artigo/artigo/${articleId}`);

export const listAnswersByStudent = (studentId) =>
  request(`/respostas-artigo/aluno/${studentId}`);

export const listPendingArticleAnswers = () =>
  request('/respostas-artigo/pendentes');

export const listFeaturedArticleAnswers = () =>
  request('/respostas-artigo/destaques');

export const approveArticleAnswer = (answerId, destaque = false) =>
  request(`/respostas-artigo/${answerId}/aprovar`, {
    method: 'PUT',
    body: JSON.stringify({
      destaque,
    }),
  });

export const rejectArticleAnswer = (answerId, feedback) =>
  request(`/respostas-artigo/${answerId}/reprovar`, {
    method: 'PUT',
    body: JSON.stringify({
      feedback,
    }),
  });

export const resendArticleAnswer = (answerId, conteudo) =>
  request(`/respostas-artigo/${answerId}/reenviar`, {
    method: 'PUT',
    body: JSON.stringify({
      conteudo,
    }),
  });

/* ── REVIEWS (Resenhas) ─────────────────────────────────────── */
export const listReviews = (articleId) =>
  request(`/artigos/${articleId}/reviews`);

export const createReview = (articleId, body) =>
  request(`/artigos/${articleId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(body),
  });