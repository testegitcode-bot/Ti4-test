import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/Footer.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setPendingVerification(false);

    try {
      const loggedUser = await signIn(email, senha);
      if (loggedUser?.role === 'teacher') {
        navigate('/professor/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err?.requiresVerification) {
        setPendingVerification(true);
        return;
      }
      setError('Invalid email or password.');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[420px] overflow-hidden rounded-[32px] border-[6px] border-[#5B3DF5] bg-white shadow-2xl"
        >
          <div className="bg-[#5B3DF5] px-8 py-10 text-center text-white">
            <h1 className="text-4xl font-black">Welcome Back!</h1>
            <p className="mt-2 font-semibold text-white/80">
              Ready for another adventure?
            </p>
          </div>

          <div className="space-y-5 px-8 py-8">
            <div>
              <label className="mb-2 block text-sm font-extrabold text-[#24145F]">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 w-full rounded-2xl border-4 border-gray-200 px-4 font-semibold outline-none focus:border-[#5B3DF5]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold text-[#24145F]">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="h-14 w-full rounded-2xl border-4 border-gray-200 px-4 font-semibold outline-none focus:border-[#5B3DF5]"
                required
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-500">
                {error}
              </p>
            )}

            {pendingVerification && (
              <div className="rounded-xl bg-yellow-50 px-4 py-4 text-sm font-bold text-yellow-800">
                <p>This teacher account is pending activation.</p>
                <button
                  type="button"
                  onClick={() => navigate('/verify-professor')}
                  className="mt-2 rounded-full bg-[#5B3DF5] px-4 py-2 text-xs font-black text-white"
                >
                  Go to verification
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-16 w-full rounded-full bg-[#FF4F8B] text-xl font-black text-white shadow-[0_7px_0_#C92E63] transition hover:translate-y-1 hover:shadow-[0_3px_0_#C92E63] disabled:opacity-70"
            >
              {loading ? 'Logging in...' : 'Log In!'}
            </button>

            <p className="text-center text-sm font-semibold text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="font-black text-[#FF4F8B] underline">
                Sign up free
              </Link>
            </p>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
