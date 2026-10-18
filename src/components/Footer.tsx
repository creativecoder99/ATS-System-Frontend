import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-warm-border bg-white text-ink pt-14 pb-10" aria-label="Site Footer">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-warm-border">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block group">
              <img
                src="/logo/hirehive-logo.png"
                alt="HireHive Applicant Tracking System"
                className="h-9 sm:h-10 w-auto object-contain rounded transition-transform group-hover:scale-105"
              />
            </Link>

            <p className="text-xs text-ink-muted leading-relaxed max-w-sm">
              HireHive delivers structured applicant tracking, calibrated interview kits, objective scorecards,
              and blind candidate screening to empower fair, data-driven hiring decisions.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-800 font-semibold text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                All Systems Operational
              </span>
              <span className="text-ink-muted text-[11px]">WCAG 2.2 AA Compliant</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-ink">Product</p>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <Link to="/jobs" className="hover:text-brand-900 transition-colors">
                  Job Board Discovery
                </Link>
              </li>
              <li>
                <span className="hover:text-brand-900 transition-colors cursor-pointer">
                  Structured Scorecards
                </span>
              </li>
              <li>
                <span className="hover:text-brand-900 transition-colors cursor-pointer">
                  Blind Resume Screening
                </span>
              </li>
              <li>
                <span className="hover:text-brand-900 transition-colors cursor-pointer">
                  Semantic Vector Search
                </span>
              </li>
              <li>
                <span className="hover:text-brand-900 transition-colors cursor-pointer">
                  AI Hiring Assistant
                </span>
              </li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-ink">Solutions</p>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <span className="hover:text-brand-900 transition-colors cursor-pointer">
                  High-Growth Tech
                </span>
              </li>
              <li>
                <span className="hover:text-brand-900 transition-colors cursor-pointer">
                  Enterprise Recruitment
                </span>
              </li>
              <li>
                <span className="hover:text-brand-900 transition-colors cursor-pointer">
                  Engineering Scorecards
                </span>
              </li>
              <li>
                <span className="hover:text-brand-900 transition-colors cursor-pointer">
                  Equal Opportunity Hiring
                </span>
              </li>
              <li>
                <span className="hover:text-brand-900 transition-colors cursor-pointer">
                  Async Resume Extraction
                </span>
              </li>
            </ul>
          </div>

          {/* Compliance & Trust */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-ink">Trust & Legal</p>
            <ul className="space-y-2 text-xs text-ink-muted">
              <li>
                <Link to="/terms" className="hover:text-brand-900 transition-colors font-medium text-ink">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-brand-900 transition-colors font-medium text-ink">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="hover:text-brand-900 transition-colors cursor-pointer">
                  Data Protection & GDPR
                </span>
              </li>
              <li>
                <span className="hover:text-brand-900 transition-colors cursor-pointer">
                  Security Architecture
                </span>
              </li>
              <li>
                <span className="hover:text-brand-900 transition-colors cursor-pointer">
                  Audit Logs & Compliance
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <p>© {new Date().getFullYear()} HireHive Technologies. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-brand-900 transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-brand-900 transition-colors">
              Privacy
            </Link>
            <Link to="/jobs" className="hover:text-brand-900 transition-colors">
              Careers
            </Link>
            <a
              href="#top"
              className="hover:text-brand-900 transition-colors font-medium"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
