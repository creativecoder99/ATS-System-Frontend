import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8 text-stone-800">
      <div className="space-y-2 border-b border-stone-200 pb-4">
        <div className="inline-flex items-center rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
          Draft for Review
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Privacy Policy</h1>
        <p className="text-xs text-stone-500">Last updated: October 2026 · Working draft for ATS data practices</p>
      </div>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-stone-900">1. Information We Collect</h2>
        <p>HireHive collects only data necessary to facilitate candidate matching and application review:</p>
        <ul className="list-disc pl-5 space-y-1 text-stone-700">
          <li><strong>Account Details:</strong> Name, email address, password hash (encrypted via bcrypt).</li>
          <li><strong>Professional Profile:</strong> Skills list, years of experience, headline, and general location.</li>
          <li><strong>Resume Files:</strong> Uploaded PDF/DOC documents containing work history and education.</li>
          <li><strong>Application Activity:</strong> Submitted applications, notes, interview progression, and saved jobs.</li>
        </ul>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-stone-900">2. How Candidate Data Is Handled and Redacted</h2>
        <p>
          To mitigate unconscious bias during candidate screening, HireHive provides recruiters with an optional <strong>Blind Review Mode</strong>. In this mode, candidate names, email addresses, phone numbers, and educational institution names are redacted, presenting reviewers with an anonymized candidate identifier and objective skill qualifications.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-stone-900">3. Storage, Cookies, and Security</h2>
        <p>
          Sessions are managed through secure, HTTP-only refresh cookies paired with short-lived in-memory access tokens. Passwords are never stored in plain text. Uploaded resume files are stored on isolated storage volumes with randomized filenames to prevent directory traversal.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-stone-900">4. Third-Party Sharing</h2>
        <p>
          HireHive does not sell or rent candidate personal data to advertisers or third-party data brokers. Candidate profiles and resumes are accessible exclusively to the hiring organization that published the corresponding job vacancy.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-stone-900">5. Candidate Rights and Data Deletion</h2>
        <p>
          You have the right to request deletion of your account and uploaded resumes. When an application is withdrawn or an account is removed, associated resume files and structured profile extractions are purged from active database collections.
        </p>
      </section>

      <div className="pt-6 border-t border-stone-200 text-xs text-stone-500">
        <Link to="/" className="text-[#0f2942] font-semibold hover:underline">
          ← Return to HireHive Home
        </Link>
      </div>
    </div>
  );
}
