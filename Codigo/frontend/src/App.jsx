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
import AlunoDashboard from './pages/Aluno/AlunoDashboard.jsx';

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

          {/* DASHBOARD ALUNO */}
          <Route path="/dashboard-aluno" element={<AlunoDashboard />} />
          
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}