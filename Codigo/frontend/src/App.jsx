import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext.jsx";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header";
import HomePage from "@/pages/HomePage.jsx";
import GerenciarTurmas from "./pages/Turmas/GerenciarTurmas";
import GerenciarTurma from "./pages/Turmas/GerenciarTurma";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfessorDashboard from "./pages/Professor/ProfessorDashboard";
import QuizzesPage from "./pages/Quiz/QuizzesPage";
import AlunoDashboard from "./pages/Aluno/AlunoDashboard.jsx";
import QuizzesAluno from "./pages/QuizzesAluno/QuizzesAluno";
import AlunoTurmaConteudo from "./pages/TurmaAluno/AlunoTurmaConteudo.jsx";
import ArticlesPage from "./pages/Articles/ArticlesPage.jsx";

// Games
import GamesPage from "./pages/Games/GamesPage";
import TypingGame from "./pages/Games/TypingGame";
import FishingGame from "./pages/Games/FishingGame";
import RecyclingGame from "./pages/Games/RecyclingGame";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "18px",
              padding: "16px",
              fontWeight: "700",
            },
          }}
        />

        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* TURMAS */}
          <Route path="/turmas" element={<GerenciarTurmas />} />
          <Route path="/turmas/:id" element={<GerenciarTurma />} />

          {/* AUTH */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* PROFESSOR */}
          <Route path="/professor/dashboard" element={<ProfessorDashboard />} />

          {/* QUIZZES */}
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/quizzesAluno" element={<QuizzesAluno />} />

          {/* ALUNO / DASHBOARD */}
          <Route path="/dashboard-aluno" element={<AlunoDashboard />} />
          <Route
            path="/aluno/turmas/:idTurma"
            element={<AlunoTurmaConteudo />}
          />

          {/* GAMES */}
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/typing" element={<TypingGame />} />
          <Route path="/games/fishing" element={<FishingGame />} />
          <Route path="/games/recycling" element={<RecyclingGame />} />

          {/* ARTICLES */}
          <Route path="/articles" element={<ArticlesPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}