import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatRelativeDate } from '../lib/format';
import { EmptyState, ErrorState, Spinner, StatCard, StatusBadge } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { APPLICATION_STATUSES, type CandidateStats } from '../types';

export function CandidateDashboard() {
  const { user } = useAuth();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['candidate-stats'],
    queryFn: () => api.get<{ data: CandidateStats }>('/stats/candidate'),
  });

  if (isLoading) return <Spinner label="Loading your dashboard" />;
  if (isError || !data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load dashboard'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const stats = data.data;
  const maxCount = Math.max(1, ...Object.values(stats.pipeline));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome back, {user?.name.split(' ')[0]}
      </h1>
      <p className="mt-1 text-sm text-slate-500">Here is how your job search is going.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Applications sent" value={stats.totals.applications} />
        <StatCard
          label="Response rate"
          value={`${stats.totals.responseRate}%`}
          hint="Moved past the initial screen"
        />
        <StatCard label="Offers" value={stats.pipeline.offered} />
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-sm font-semibold text-slate-900">Your pipeline</h2>
          <div className="mt-4 space-y-3">
            {APPLICATION_STATUSES.map((status) => {
              const count = stats.pipeline[status];
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-24 shrink-0">
                    <StatusBadge status={status} />
                  </div>
                  {/* Bar width is relative to the largest stage, so the shape
                      of the funnel reads at a glance. */}
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm tabular-nums text-slate-600">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent applications</h2>
            <Link to="/applications" className="text-xs font-medium text-brand-700 hover:underline">
              View all
            </Link>
          </div>

          {stats.recent.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              You haven&apos;t applied to anything yet.{' '}
              <Link to="/jobs" className="font-medium text-brand-700 hover:underline">
                Browse jobs
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {stats.recent.map((application) => (
                <li key={application._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {application.job?.title ?? 'Job removed'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {application.job?.company} · {formatRelativeDate(application.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={application.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {stats.totals.applications === 0 && (
        <div className="mt-8">
          <EmptyState
            title="Start applying"
            description="Search for roles that match your skills and track every application from this dashboard."
            action={
              <Link to="/jobs" className="btn-primary">
                Browse jobs
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
