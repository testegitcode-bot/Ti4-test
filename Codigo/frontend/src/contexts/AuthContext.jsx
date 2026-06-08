import React, { createContext, useContext, useState, useEffect } from "react";
import { loginAuth, registerAuth, verifyProfessor, resendVerificationCode } from "@/services/api";

const AuthContext = createContext(null);

const PENDING_KEY = "nextstep_pending_professor";

function formatUser(data) {
  return {
    id: data.alunoId ?? data.professorId ?? data.id,
    nome: data.nome ?? data.name,
    role: data.role,
    email: data.email,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nextstep_user"));
    } catch {
      return null;
    }
  });

  // Persisted email of a professor whose account is awaiting validation
  const [pendingProfessorEmail, setPendingProfessorEmailState] = useState(() => {
    return localStorage.getItem(PENDING_KEY) || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("nextstep_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("nextstep_user");
    }
  }, [user]);

  function setPendingProfessorEmail(email) {
    if (email) {
      localStorage.setItem(PENDING_KEY, email);
    } else {
      localStorage.removeItem(PENDING_KEY);
    }
    setPendingProfessorEmailState(email);
  }

  async function signIn(email, senha) {
    setLoading(true);

    try {
      const loggedUser = await loginAuth({ email, senha });

      // Backend may return requiresVerification for inactive teacher accounts
      if (loggedUser?.requiresVerification) {
        setPendingProfessorEmail(email);
        const err = new Error("REQUIRES_VERIFICATION");
        err.requiresVerification = true;
        throw err;
      }

      const userFormatado = formatUser(loggedUser);
      setUser(userFormatado);
      return userFormatado;
    } catch (err) {
      // 403 = account exists but is inactive — redirect to validation
      if (err.status === 403) {
        setPendingProfessorEmail(email);
        const ve = new Error("REQUIRES_VERIFICATION");
        ve.requiresVerification = true;
        throw ve;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function registerUser(nome, email, senha, role) {
    setLoading(true);

    try {
      const createdUser = await registerAuth({ nome, email, senha, role });

      if (createdUser?.requiresVerification) {
        setPendingProfessorEmail(email);
        const err = new Error("REQUIRES_VERIFICATION");
        err.requiresVerification = true;
        throw err;
      }

      const userFormatado = formatUser(createdUser);
      setUser(userFormatado);
      return userFormatado;
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(code) {
    setLoading(true);
    try {
      const result = await verifyProfessor({ email: pendingProfessorEmail, code });
      setPendingProfessorEmail(null);
      const userFormatado = formatUser(result);
      setUser(userFormatado);
      return userFormatado;
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    return resendVerificationCode({ email: pendingProfessorEmail });
  }

  function logout() {
    setUser(null);
    setPendingProfessorEmail(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        registerUser,
        logout,
        pendingProfessorEmail,
        setPendingProfessorEmail,
        verifyCode,
        resendCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }

  return ctx;
}
