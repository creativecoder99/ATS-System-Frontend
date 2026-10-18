import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';
import { EmptyState, ErrorState, Spinner, StatCard, StatusBadge } from '../components/ui';
import { APPLICATION_STATUSES, type RecruiterStats } from '../types';

export function RecruiterDashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['recruiter-stats'],
    queryFn: () => api.get<{ data: RecruiterStats }>('/stats/recruiter'),
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
  const maxPipeline = Math.max(1, ...Object.values(stats.pipeline));
  const maxTrend = Math.max(1, ...stats.trend.map((t) => t.count));
  const totalInTrend = stats.trend.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hiring dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Your jobs and candidate pipeline.</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn-primary">
          Post a job
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Total jobs" value={stats.totals.jobs} />
        <StatCard label="Open" value={stats.totals.openJobs} />
        <StatCard label="Closed" value={stats.totals.closedJobs} />
        <StatCard label="Applicants" value={stats.totals.applicants} />
      </div>

      {stats.totals.jobs === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="You haven't posted a job yet"
            description="Post your first role and applicants will start showing up here."
            action={
              <Link to="/recruiter/jobs/new" className="btn-primary">
                Post a job
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <h2 className="text-sm font-semibold text-slate-900">Candidate pipeline</h2>
            <div className="mt-4 space-y-3">
              {APPLICATION_STATUSES.map((status) => {
                const count = stats.pipeline[status];
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className="w-24 shrink-0">
                      <StatusBadge status={status} />
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all"
                        style={{ width: `${(count / maxPipeline) * 100}%` }}
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
              <h2 className="text-sm font-semibold text-slate-900">Most applied roles</h2>
              <Link
                to="/recruiter/jobs"
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                Manage jobs
              </Link>
            </div>

            {stats.topJobs.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500">No applications yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {stats.topJobs.map((job) => (
                  <li key={job._id} className="flex items-center justify-between gap-3 py-3">
                    <Link
                      to={`/recruiter/jobs/${job._id}/applicants`}
                      className="min-w-0 truncate text-sm font-medium text-slate-900 hover:text-brand-700"
                    >
                      {job.title}
                    </Link>
                    <span className="shrink-0 text-sm tabular-nums text-slate-600">
                      {job.applicantCount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Applications received (last 30 days)
            </h2>

            {totalInTrend === 0 ? (
              <p className="mt-6 text-sm text-slate-500">
                No applications in the last 30 days.
              </p>
            ) : (
              <>
                {/* A lightweight inline bar chart — no charting dependency is
                    warranted for a single 30-bucket series. */}
                <div className="mt-6 flex h-32 items-end gap-[3px]">
                  {stats.trend.map((point) => (
                    <div
                      key={point._id}
                      className="flex h-full flex-1 items-end"
                      title={`${formatDate(point._id)}: ${point.count} application${
                        point.count === 1 ? '' : 's'
                      }`}
                    >
                      <div
                        className={`w-full rounded-t transition-colors ${
                          point.count === 0
                            ? 'bg-slate-100'
                            : 'bg-brand-500 hover:bg-brand-600'
                        }`}
                        // Zero days keep a 2px sliver as a baseline tick rather
                        // than vanishing, which would leave gaps in the axis.
                        style={{
                          height: point.count === 0 ? '2px' : `${(point.count / maxTrend) * 100}%`,
                        }}
                      >
                        <span className="sr-only">
                          {point._id}: {point.count} applications
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>{formatDate(stats.trend[0]._id)}</span>
                  <span>{formatDate(stats.trend[stats.trend.length - 1]._id)}</span>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
