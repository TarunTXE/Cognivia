import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">Cognivia</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              AI-powered personalized learning for students. Study smarter, retain more, progress faster.
            </p>
            <p className="mt-3 text-xs text-indigo-600 font-semibold italic">
              "Learn Smarter. Progress Faster."
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Features</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Study Planner', to: '/planner' },
                { label: 'AI Notes', to: '/notes' },
                { label: 'Practice Quiz', to: '/quiz' },
                { label: 'Dashboard', to: '/dashboard' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-500 hover:text-indigo-600 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {['How It Works', 'For Students', 'Study Tips', 'FAQ'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-slate-500 cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400">© 2026 Cognivia. All rights reserved.</p>
          <p className="text-xs text-slate-400">Built by Tarun Harish E.</p>
        </div>
      </div>
    </footer>
  );
}
