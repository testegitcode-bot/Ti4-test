import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext.jsx";
import { Toaster } from "react-hot-toast";

import Header from "./components/Header";
import HomePage from "@/pages/HomePage.jsx";
import GerenciarTurmas from "./pages/Turmas/GerenciarTurmas";
import GerenciarTurma from "./pages/Turmas/GerenciarTurma";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfessorDashboard from "./pages/Professor/ProfessorDashboard";
import QuizzesPage from "./pages/Quiz/QuizzesPage";
import AlunoDashboard from './pages/Aluno/AlunoDashboard.jsx';
import QuizzesAluno from "./pages/QuizzesAluno/QuizzesAluno";
import AlunoTurmaConteudo from "./pages/TurmaAluno/AlunoTurmaConteudo.jsx";
import QuizzesAlunoGeral from "./pages/QuizzesAluno/QuizzesAlunoGeral.jsx";
import RankingPage from "./pages/Ranking/RankingPage.jsx";

// Games
import GamesPage      from "./pages/Games/GamesPage";
import TypingGame     from "./pages/Games/TypingGame";
import FishingGame    from "./pages/Games/FishingGame";
import RecyclingGame  from "./pages/Games/RecyclingGame";
import WordSearchGame from "./pages/Games/WordSearchGame";
import CrosswordGame  from "./pages/Games/CrosswordGame";

function ChatWidget() {
  const { user } = useAuth();
  const isAluno = user?.role === "student";

  React.useEffect(() => {
    const scriptId = "nextstep-english-chat-widget";
    const hostAttr = "data-chatbot";

    // Remove instâncias anteriores ao desmontar ou quando não é aluno
    if (!isAluno) {
      document.querySelectorAll(`[${hostAttr}]`).forEach((el) => el.remove());
      const s = document.getElementById(scriptId);
      if (s) s.remove();
      return;
    }

    // Remove instâncias anteriores (evita duplicação no StrictMode)
    document.querySelectorAll(`[${hostAttr}]`).forEach((el) => el.remove());
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "/chat-widget.js";
    script.async = true;
    script.setAttribute("data-api-url", "http://localhost:3001/api/chat");
    script.setAttribute("data-title", "Tutor NextStep");
    script.setAttribute("data-welcome", "Hello! How can I help you with English today?");
    script.setAttribute("data-autoinit", "true");

    document.body.appendChild(script);

    return () => {
      document.querySelectorAll(`[${hostAttr}]`).forEach((el) => el.remove());
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [isAluno]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: "18px", padding: "16px", fontWeight: "700" },
          }}
        />
        <Routes>
          <Route path="/"                    element={<HomePage />} />
          <Route path="/turmas"              element={<GerenciarTurmas />} />
          <Route path="/turmas/:id"          element={<GerenciarTurma />} />
          <Route path="/login"               element={<LoginPage />} />
          <Route path="/signup"              element={<SignupPage />} />
          <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
          <Route path="/quizzes"             element={<QuizzesPage />} />
          <Route path="/quizzesAluno"        element={<QuizzesAluno />} />
          <Route path="/dashboard-aluno"     element={<AlunoDashboard />} />
          <Route path="/aluno/turmas/:idTurma" element={<AlunoTurmaConteudo />} />
          <Route path="/aluno/quizzes" element={<QuizzesAlunoGeral />} />
          <Route path="/ranking" element={<RankingPage />} />

          {/* GAMES */}
          <Route path="/games"              element={<GamesPage />} />
          <Route path="/games/typing"       element={<TypingGame />} />
          <Route path="/games/fishing"      element={<FishingGame />} />
          <Route path="/games/recycling"    element={<RecyclingGame />} />
          <Route path="/games/wordsearch"   element={<WordSearchGame />} />
          <Route path="/games/crossword"    element={<CrosswordGame />} />
        </Routes>
        <ChatWidget />
      </AuthProvider>
    </BrowserRouter>
  );
}
