import { Link } from 'react-router-dom';

export function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8 text-stone-800">
      <div className="space-y-2 border-b border-stone-200 pb-4">
        <div className="inline-flex items-center rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
          Draft for Review
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Terms of Service</h1>
        <p className="text-xs text-stone-500">Last updated: October 2026 · Working draft for ATS operations</p>
      </div>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-stone-900">1. Nature of the Platform</h2>
        <p>
          HireHive provides applicant tracking and job discovery software. Candidates can submit resumes and track their applications. Recruiters can publish job vacancies, review resumes, evaluate candidates, and maintain hiring pipeline records.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-stone-900">2. Candidate Submissions & Resume Data</h2>
        <p>
          When you upload a resume or cover letter to HireHive, you grant the platform and the prospective employer permission to process, extract, store, and evaluate the contents solely for the purpose of job application review. You confirm that all submitted details reflect authentic qualifications and experience.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-stone-900">3. Automated Processing & AI Assistance</h2>
        <p>
          HireHive utilizes automated parsing and semantic matching algorithms to assist recruiters in categorizing skills, scoring relevance, and generating interview questions. These algorithmic evaluations serve strictly as supportive tooling for human decision-makers. Final hiring, shortlisting, and rejection decisions remain the sole responsibility of the prospective employer.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-stone-900">4. Recruiter & Employer Responsibilities</h2>
        <p>
          Recruiters agree to use candidate data strictly for legitimate hiring inquiries. Unsolicited marketing, discriminatory hiring practices, or scraping candidate contact details without consent is prohibited.
        </p>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="text-base font-semibold text-stone-900">5. Account Termination & Application Withdrawal</h2>
        <p>
          Candidates may withdraw active applications at any point prior to receiving a formal job offer. Recruiters may delete job postings they have created, which safely cascades to unneeded application records.
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
