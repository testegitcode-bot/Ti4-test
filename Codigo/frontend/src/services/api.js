/**
 * API Service — NextStep English
 *
 * All calls to the Spring Boot backend (port 8080) go through here.
 * Vite's proxy redirects /api → http://localhost:8080 automatically.
 *
 * Available backend endpoints:
 *  POST   /alunos          — register student  { nome, matricula, senha }
 *  GET    /alunos          — list all students
 *  GET    /alunos/:id      — get student by id
 *  PUT    /alunos/:id      — update student
 *  DELETE /alunos/:id      — delete student
 *
 *  POST   /professores     — register teacher  { nome, email }
 *  GET    /professores     — list all teachers
 *  GET    /professores/:id — get teacher by id
 *
 *  GET    /quizzes         — list all quizzes
 *  GET    /quizzes/:id     — get quiz by id
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
export const listStudents  = ()          => request('/alunos');
export const getStudent    = (id)        => request(`/alunos/${id}`);
export const criarAluno    = (body)      => request('/alunos',       { method: 'POST',   body: JSON.stringify(body) });
export const updateStudent = (id, body)  => request(`/alunos/${id}`, { method: 'PUT',    body: JSON.stringify(body) });
export const deleteStudent = (id)        => request(`/alunos/${id}`, { method: 'DELETE' });

/**
 * Student login — filters GET /alunos by matricula + senha.
 * Update only this function once the backend has a dedicated auth endpoint.
 */
export async function loginAluno(matricula, senha) {
  const list = await listStudents();
  const student = list.find((s) => s.matricula === matricula && s.senha === senha);
  if (!student) throw new Error('Invalid enrollment number or password.');
  return student;
}

/* ── TEACHERS (Professores) ──────────────────────────────────── */
export const listTeachers  = ()          => request('/professores');
export const getTeacher    = (id)        => request(`/professores/${id}`);
export const criarProfessor = (body)     => request('/professores',       { method: 'POST',   body: JSON.stringify(body) });
export const updateTeacher = (id, body)  => request(`/professores/${id}`, { method: 'PUT',    body: JSON.stringify(body) });
export const deleteTeacher = (id)        => request(`/professores/${id}`, { method: 'DELETE' });

/* ── CLASSES (Turmas) ──────────────────────────────────────── */
export const listTurmas = ()             => request('/turmas');

/* ── QUIZZES ─────────────────────────────────────────────────── */
export const listQuizzes          = ()          => request('/quizzes');
export const getQuiz              = (id)        => request(`/quizzes/${id}`);
export const listQuizzesByProfessor = (profId)  => request(`/quizzes/professor/${profId}`);
export const criarQuiz            = (body)      => request('/quizzes', { method: 'POST', body: JSON.stringify(body) });
export const atualizarQuiz        = (id, body)  => request(`/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deletarQuiz          = (id)        => request(`/quizzes/${id}`, { method: 'DELETE' });

/* ── ARTICLES / ARTIGOS ─────────────────────────────────────── */
export const listArticles = () => request('/artigos');

export const listArticlesForStudent = (studentId) =>
  request(`/artigos/aluno/${studentId}`);

export const listArticlesForTeacher = (teacherId, filters = {}) => {
  const params = new URLSearchParams();

  if (filters.turmaId) params.append('turmaId', filters.turmaId);
  if (filters.alunoId) params.append('alunoId', filters.alunoId);

  const query = params.toString();

  return request(`/artigos/professor/${teacherId}${query ? `?${query}` : ''}`);
};

export const createArticle = (body) =>
  request('/artigos', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const deleteArticle = (id) =>
  request(`/artigos/${id}`, {
    method: 'DELETE',
  });

export const listTurmasByProfessor = (professorId) =>
  request(`/turmas/professor/${professorId}`);

export const listStudentsByTurma = (turmaId) =>
  request(`/turmas/${turmaId}/alunos`);

export const listTurmasByStudent = (studentId) =>
  request(`/alunos/${studentId}/turmas`);

/* ── REVIEWS (Resenhas) ─────────────────────────────────────── */
export const listReviews = (articleId) =>
  request(`/artigos/${articleId}/reviews`);

export const createReview = (articleId, body) =>
  request(`/artigos/${articleId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
