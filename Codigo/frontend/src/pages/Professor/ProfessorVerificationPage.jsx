import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/Footer.jsx";

export default function ProfessorVerificationPage() {
  const navigate = useNavigate();
  const { pendingProfessorEmail, verifyCode, resendCode, logout, loading } = useAuth();

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false); 

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!pendingProfessorEmail) {
      navigate("/login", { replace: true });
    }
  }, [pendingProfessorEmail, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function handleDigitChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((ch, i) => {
      if (i < 6) next[i] = ch;
    });
    setDigits(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");

    const code = digits.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    try {
      await verifyCode(code);
      navigate("/professor/dashboard", { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Invalid or expired code. Please try again.";
      setError(message);
    }
  }

  async function handleResend() {
    setError("");
    setSuccessMsg("");
    setIsResending(true);

    try {
      await resendCode();
      setSuccessMsg("Novo código enviado com sucesso!");
      setResendCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const message = err.response?.data?.message || "Erro ao reenviar. Tente novamente.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[460px] overflow-hidden rounded-[32px] border-[6px] border-[#5B3DF5] bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-[#5B3DF5] px-8 py-10 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-4xl">
              ✉️
            </div>
            <h1 className="text-3xl font-black">Verify Your Account</h1>
            <p className="mt-2 font-semibold text-white/80">
              We sent a 6-digit code to
            </p>
            <p className="mt-1 rounded-xl bg-white/20 px-4 py-2 font-black text-white">
              {pendingProfessorEmail}
            </p>
          </div>

          {/* Body */}
          <form onSubmit={handleVerify} className="space-y-6 px-8 py-8">
            <p className="text-center text-sm font-semibold text-gray-500">
              Enter the 6-digit code below to activate your teacher account.
            </p>

            {/* Code inputs */}
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-14 w-12 rounded-2xl border-4 border-gray-200 text-center text-2xl font-black text-[#24145F] outline-none transition focus:border-[#5B3DF5] focus:bg-[#5B3DF5]/5"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-500">
                {error}
              </p>
            )}

            {successMsg && (
              <p className="rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-bold text-green-600">
                {successMsg}
              </p>
            )}

            {/* Validate */}
            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-full bg-[#5B3DF5] text-lg font-black text-white shadow-[0_7px_0_#3B20C4] transition hover:translate-y-1 hover:shadow-[0_3px_0_#3B20C4] disabled:opacity-70"
            >
              {loading ? "Verifying..." : "Verify Account"}
            </button>

            {/* Resend */}
            <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0} 
            className="h-12 w-full rounded-full border-4 border-[#5B3DF5] bg-white text-sm font-black text-[#5B3DF5] transition hover:bg-[#5B3DF5]/5 disabled:opacity-50"
            
            >
              {isResending? "Enviando...": (resendCooldown > 0 ? `Aguarde (${resendCooldown}s)` : "Reenviar Código")}
              </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-center text-sm font-bold text-gray-400 underline hover:text-gray-600"
            >
              Logout and go back to login
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
