import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { JobCard } from '../components/JobCard';
import { Spinner } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import type { Job, Paginated } from '../types';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', 'latest'],
    queryFn: () => api.get<Paginated<Job>>('/jobs?limit=6&sort=newest'),
  });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/jobs${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  };

  return (
    <div>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Find the role. Track every application.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            HireDesk is a job board and applicant tracking system in one — candidates apply and
            follow their progress, recruiters post roles and manage their hiring pipeline.
          </p>

          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl gap-2">
            <input
              className="input flex-1"
              placeholder="Search by role, company, or skill…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search jobs"
            />
            <button type="submit" className="btn-primary px-6">
              Search
            </button>
          </form>

          {!user && (
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
              <Link to="/jobs" className="btn-secondary">
                Browse all jobs
              </Link>
            </div>
          )}

          {/* Live counts rather than invented marketing numbers — these come
              from the same listing query that feeds the section below. */}
          <dl className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-slate-100 pt-8">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Open roles</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {data?.pagination.total ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Hiring stages</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">5</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Applied instantly</dt>
              <dd className="mt-1 text-2xl font-semibold text-slate-900">1 click</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Latest openings</h2>
          <Link to="/jobs" className="text-sm font-medium text-brand-700 hover:underline">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <Spinner label="Loading jobs" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data?.data.map((job) => <JobCard key={job._id} job={job} />)}
          </div>
        )}
      </section>
    </div>
  );
}
