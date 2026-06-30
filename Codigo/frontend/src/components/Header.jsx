import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext.jsx";

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isTeacher =
  user?.role === "teacher" || user?.role === "PROFESSOR";

  const isStudent =
  user?.role === "student" || user?.role === "ALUNO";

  function getLinks() {
    if (!user) {
      return [
        { label: "Home", to: "/" },
      ];
    }

    if (isTeacher) {
      return [
        { label: "Dashboard", to: "/professor/dashboard" },
        { label: "Classes", to: "/turmas" },
        { label: "Quizzes", to: "/quizzes" },
        { label: "Articles", to: "/articles" },
      ];
    }

    if (isStudent) {
      return [
        { label: "Home", to: "/" },
        { label: "Games", to: "/games" },
        { label: "Ranking", to: "/ranking" },
        { label: "Articles", to: "/articles" },
        { label: "Dashboard", to: "/dashboard-aluno" },
      ];
    }

    return [{ label: "Home", to: "/" }];
  }

  const links = getLinks();

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b-[5px] border-secondary bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg"
            >
              <Sparkles className="h-7 w-7 text-white" />
            </motion.div>

            <span className="text-2xl font-black tracking-tight text-secondary transition-colors group-hover:text-primary">
              Achieve It  <span className="text-primary">Idiomas</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-2xl px-5 py-2.5 text-base font-bold transition-all hover:-translate-y-0.5 ${
                  pathname === link.to
                    ? "bg-secondary text-white shadow-md"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mx-3 h-7 w-px bg-border" />

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-muted-foreground">
                  Hello, <strong>{user.nome}</strong>!
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="rounded-2xl font-bold text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  className="rounded-2xl font-bold text-secondary hover:bg-secondary/10"
                >
                  <Link to="/login">Log In</Link>
                </Button>

                <Button
                  asChild
                  className="rounded-2xl bg-primary font-bold text-white shadow-[0_4px_0_hsl(var(--primary-dark))] transition-all hover:translate-y-0.5 hover:shadow-[0_2px_0_hsl(var(--primary-dark))]"
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>

          <button
            className="rounded-xl p-2 text-secondary md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-7 w-7" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-secondary/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 flex min-h-screen w-72 flex-col gap-3 border-l-4 border-secondary bg-white p-6 shadow-2xl"            
              >

              <button className="self-end" onClick={() => setOpen(false)}>
                <X className="h-7 w-7 text-secondary" />
              </button>

              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-2xl px-4 py-3 text-lg font-bold hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <button
                  onClick={handleLogout}
                  className="rounded-2xl px-4 py-3 text-left text-lg font-bold text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="mr-2 inline h-5 w-5" />
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-2xl px-4 py-3 text-lg font-bold hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    Log In
                  </Link>

                  <Link
                    to="/signup"
                    className="rounded-2xl bg-primary px-4 py-3 text-center text-lg font-bold text-white"
                    onClick={() => setOpen(false)}
                  >
                    Sign Up Free
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}