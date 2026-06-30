/**
 * API Service — NextStep English
 *
 * All calls to the Spring Boot backend (port 8080) go through here.
 * Vite's proxy redirects /api → http://localhost:8080 automatically.
 */

export const API_BASE = import.meta.env.VITE_API_URL || "";

const BASE = API_BASE;

async function request(path, options = {}) {
  const url = `${BASE}${path}`;

  console.log("API REQUEST INICIOU:", {
    base: BASE,
    path,
    url,
    options,
  });

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  console.log("API RESPONSE CHEGOU:", {
    status: res.status,
    ok: res.ok,
    url,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch((err) => {
    console.log("ERRO AO LER JSON:", err);
    return null;
  });

  console.log("API DATA:", data);

  if (!res.ok) {
    const err = new Error(data?.message || data || `Error ${res.status}`);
    err.status = res.status;
    err.data = data;
    console.log("API VAI LANÇAR ERRO:", err);
    throw err;
  }

  return data;
}

/* ── AUTH ────────────────────────────────────────────────────── */

export async function loginAuth(body) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.message || data || `Error ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const registerAuth = (body) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const verifyProfessor = (body) =>
  request('/auth/verify-professor', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const resendVerificationCode = (body) =>
  request('/auth/resend-code', {
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

export const gradeArticleAnswer = (answerId, nota) =>
  request(`/respostas-artigo/${answerId}/nota`, {
    method: 'PUT',
    body: JSON.stringify({
      nota,
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