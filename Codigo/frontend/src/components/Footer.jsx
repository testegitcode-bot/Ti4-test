import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mx-4 mb-4 mt-16 overflow-hidden rounded-4xl border-4 border-primary bg-secondary text-secondary-foreground shadow-2xl">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid grid-cols-1 gap-10 border-b border-white/20 pb-10 md:grid-cols-3">

          <div>
            <Link to="/" className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-black text-white">
                NextStep <span className="text-accent">English</span>
              </span>
            </Link>
            <p className="text-sm font-medium leading-relaxed text-white/70">
              Learning English through eco-adventures.<br />
              One word at a time, one planet at a time.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-black text-white">Navigation</h4>
            <ul className="flex flex-col gap-2 text-sm font-medium text-white/70">
              <li><Link to="/"       className="hover:text-accent transition-colors">Home</Link></li>
              <li><Link to="/login"  className="hover:text-accent transition-colors">Log In</Link></li>
              <li><Link to="/signup" className="hover:text-accent transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-black text-white">Project</h4>
            <p className="text-sm font-medium leading-relaxed text-white/70">
              Undergraduate Software Engineering Project<br />
              PUC Minas · TI4 · 2026/1
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-sm text-white/40 sm:flex-row">
          <span>© 2026 NextStep English. All rights reserved.</span>
          <span>Made with <span className="text-accent">♥</span> for our planet</span>
        </div>
      </div>
    </footer>
  );
}
