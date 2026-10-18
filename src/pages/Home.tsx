import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { JobCard } from '../components/JobCard';
import { SkeletonList } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import type { Job, Paginated } from '../types';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [demoBlindMode, setDemoBlindMode] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', 'latest'],
    queryFn: () => api.get<Paginated<Job>>('/jobs?limit=6&sort=newest'),
  });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/jobs${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  };

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Headline & Search */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded border border-stone-300 bg-stone-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-stone-800">
              Modern Applicant Tracking
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-stone-900 leading-tight">
              Recruit with precision. Track every candidate.
            </h1>

            <p className="text-base text-stone-700 leading-relaxed max-w-xl">
              HireHive pairs candidate job discovery with automated resume extraction, blind evaluation, and semantic applicant search for modern hiring teams.
            </p>

            {/* Quick Search */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-md pt-2">
              <input
                className="input flex-1"
                placeholder="Search by role, skill, or location..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search jobs"
              />
              <button type="submit" className="btn-accent px-5">
                Search
              </button>
            </form>

            {!user && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/register" className="btn-primary">
                  Create account
                </Link>
                <Link to="/jobs" className="btn-secondary">
                  Browse open positions
                </Link>
              </div>
            )}
          </div>

          {/* Actual Product Visual - Working Interactive Preview */}
          <div className="lg:col-span-6">
            <div className="card p-5 border-stone-300 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                    Live Product Preview (Interactive)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDemoBlindMode(!demoBlindMode)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                    demoBlindMode
                      ? 'bg-stone-900 text-white border-stone-900 font-medium'
                      : 'bg-stone-100 text-stone-700 border-stone-300'
                  }`}
                >
                  {demoBlindMode ? 'Blind Review: Active' : 'Toggle Blind Review'}
                </button>
              </div>

              {/* Simulated Candidate Card */}
              <div className="rounded border border-stone-200 bg-stone-50/70 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">
                      {demoBlindMode ? 'Candidate #4192 (Anonymized)' : 'Abhinav Tarigoppula'}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {demoBlindMode ? 'Software Engineer · Verified Profile' : 'Full Stack Developer · Visakhapatnam'}
                    </p>
                  </div>
                  <span className="chip bg-stone-900 text-white border-stone-900 font-semibold">
                    98% Fit
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB'].map((s) => (
                    <span key={s} className="chip bg-white text-stone-800 border-stone-200 text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="rounded border border-stone-200 bg-white p-2.5 text-xs text-stone-700 space-y-1">
                  <div className="font-semibold text-stone-900">AI Match Evaluation:</div>
                  <p className="text-stone-600 leading-snug">
                    Strong skill alignment with MERN architecture requirements. 3 verified years of production experience.
                  </p>
                </div>

                {/* Pipeline visual */}
                <div className="pt-1">
                  <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                    Pipeline Stage
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-medium">
                    <span className="py-1 rounded bg-stone-200 text-stone-800">Applied</span>
                    <span className="py-1 rounded bg-stone-900 text-white font-semibold">Shortlisted</span>
                    <span className="py-1 rounded bg-stone-100 text-stone-400">Interview</span>
                    <span className="py-1 rounded bg-stone-100 text-stone-400">Offered</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <span>Resume parsed automatically</span>
                <span>Semantic search enabled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Architecture & Capabilities */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 border-t border-stone-200/90 pt-12">
        <div className="max-w-2xl mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            How the HireHive workflow operates
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            A structured system designed for reliable candidate screening and auditable status progression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 space-y-2">
            <span className="text-xs font-mono font-semibold text-stone-400">01</span>
            <h3 className="text-sm font-semibold text-stone-900">Structured Postings</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Recruiters publish roles with explicit skill tags, experience floors, work modes, and verified salary ranges.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <span className="text-xs font-mono font-semibold text-stone-400">02</span>
            <h3 className="text-sm font-semibold text-stone-900">Automated Extraction</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Resumes uploaded in PDF or Word formats are parsed asynchronously into structured skill sets and experience metrics.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <span className="text-xs font-mono font-semibold text-stone-400">03</span>
            <h3 className="text-sm font-semibold text-stone-900">Semantic & Blind Review</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Recruiters toggle anonymized review mode to remove name and contact bias, and query candidates using semantic vector matching.
            </p>
          </div>

          <div className="card p-5 space-y-2">
            <span className="text-xs font-mono font-semibold text-stone-400">04</span>
            <h3 className="text-sm font-semibold text-stone-900">Live Status Notifications</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every status move is audited in database history, and candidates receive real-time notifications for interviews and offers.
            </p>
          </div>
        </div>
      </section>

      {/* Live Openings Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 border-t border-stone-200/90 pt-12">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-stone-900">
              Current Open Positions
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Active job listings retrieved directly from the live database.
            </p>
          </div>
          <Link to="/jobs" className="text-xs font-semibold text-[#0f2942] hover:underline">
            View all postings ({data?.pagination.total ?? 0})
          </Link>
        </div>

        {isLoading ? (
          <SkeletonList count={4} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data?.data.map((job) => <JobCard key={job._id} job={job} />)}
          </div>
        )}
      </section>
    </div>
  );
}
