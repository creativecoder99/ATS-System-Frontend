import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';
import { EmptyState, ErrorState, SkeletonList, StatCard, StatusBadge } from '../components/ui';
import { APPLICATION_STATUSES, type RecruiterStats } from '../types';

export function RecruiterDashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['recruiter-stats'],
    queryFn: () => api.get<{ data: RecruiterStats }>('/stats/recruiter'),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <SkeletonList count={3} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <ErrorState
          message={error instanceof Error ? error.message : 'Could not load hiring dashboard'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const stats = data.data;
  const maxPipeline = Math.max(1, ...Object.values(stats.pipeline));
  const maxTrend = Math.max(1, ...stats.trend.map((t) => t.count));
  const totalInTrend = stats.trend.reduce((sum, t) => sum + t.count, 0);

  // Compute conversion metrics
  const totalApplied = stats.pipeline.applied || 0;
  const totalShortlisted = stats.pipeline.shortlisted || 0;
  const totalInterview = stats.pipeline.interview || 0;
  const totalOffered = stats.pipeline.offered || 0;
  const totalCandidates = totalApplied + totalShortlisted + totalInterview + totalOffered + (stats.pipeline.rejected || 0);

  const shortlistRate = totalCandidates > 0 ? Math.round(((totalShortlisted + totalInterview + totalOffered) / totalCandidates) * 100) : 0;
  const interviewConversion = totalShortlisted > 0 ? Math.round(((totalInterview + totalOffered) / totalShortlisted) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Hiring Analytics & Pipeline
          </h1>
          <p className="mt-1 text-xs text-stone-600">
            Active positions, screening conversions, and candidate flow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/recruiter/jobs" className="btn-secondary text-xs px-3 py-2">
            Manage Postings
          </Link>
          <Link to="/recruiter/jobs/new" className="btn-accent text-xs px-3 py-2">
            Post New Position
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Postings" value={stats.totals.openJobs} hint={`${stats.totals.jobs} total registered`} />
        <StatCard label="Total Applicants" value={stats.totals.applicants} hint="Across all postings" />
        <StatCard label="Shortlist Rate" value={`${shortlistRate}%`} hint="Passed initial screening" />
        <StatCard label="Interview Conversion" value={`${interviewConversion}%`} hint="Shortlisted to interview" />
      </div>

      {stats.totals.jobs === 0 ? (
        <EmptyState
          title="No positions created yet"
          description="Create your first job posting to begin receiving and analyzing candidate applications."
          action={
            <Link to="/recruiter/jobs/new" className="btn-primary text-xs">
              Post a job
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Candidate Pipeline Funnel */}
          <section className="card p-5 lg:col-span-7 space-y-4 border-stone-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-900">Candidate Pipeline Stages</h2>
              <span className="text-xs text-stone-500">{totalCandidates} total in pipeline</span>
            </div>

            <div className="space-y-3 pt-1">
              {APPLICATION_STATUSES.map((status) => {
                const count = stats.pipeline[status] || 0;
                const percentage = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-3 text-xs">
                    <div className="w-24 shrink-0">
                      <StatusBadge status={status} />
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded bg-stone-100 border border-stone-200">
                      <div
                        className="h-full rounded bg-[#0f2942] transition-all"
                        style={{ width: `${(count / maxPipeline) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-right tabular-nums text-stone-700">
                      <span className="font-semibold">{count}</span>
                      <span className="text-[11px] text-stone-400 ml-1">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Auditable transition history recorded on every action</span>
            </div>
          </section>

          {/* High Applicant Roles */}
          <section className="card p-5 lg:col-span-5 space-y-4 border-stone-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-900">Highest Volume Roles</h2>
              <Link to="/recruiter/jobs" className="text-xs font-semibold text-[#0f2942] hover:underline">
                View all
              </Link>
            </div>

            {stats.topJobs.length === 0 ? (
              <p className="py-6 text-center text-xs text-stone-500">No applications received yet.</p>
            ) : (
              <ul className="divide-y divide-stone-100 text-xs">
                {stats.topJobs.map((job) => (
                  <li key={job._id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link
                      to={`/recruiter/jobs/${job._id}/applicants`}
                      className="min-w-0 truncate font-medium text-stone-900 hover:text-[#0f2942]"
                    >
                      {job.title}
                    </Link>
                    <span className="shrink-0 px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-semibold tabular-nums border border-stone-200">
                      {job.applicantCount} applicants
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 30-Day Trend Chart */}
          <section className="card p-5 lg:col-span-12 space-y-4 border-stone-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-stone-900">
                  Applications Volume (Last 30 Days)
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Daily incoming application submissions across all published roles.
                </p>
              </div>
              <span className="text-xs font-semibold text-stone-800">
                {totalInTrend} application(s) logged
              </span>
            </div>

            {totalInTrend === 0 ? (
              <p className="py-8 text-center text-xs text-stone-500">
                No applications submitted during this 30-day window.
              </p>
            ) : (
              <div>
                <div className="flex h-36 items-end gap-1 pt-4">
                  {stats.trend.map((point) => (
                    <div
                      key={point._id}
                      className="flex h-full flex-1 items-end group relative"
                    >
                      <div
                        className={`w-full rounded-t transition-colors ${
                          point.count === 0 ? 'bg-stone-200/70' : 'bg-[#0f2942] hover:bg-[#163b60]'
                        }`}
                        style={{
                          height: point.count === 0 ? '3px' : `${Math.max(6, (point.count / maxTrend) * 100)}%`,
                        }}
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-[10px] text-white shadow">
                        {formatDate(point._id)}: {point.count} application(s)
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between text-[11px] text-stone-500 border-t border-stone-100 pt-2">
                  <span>{formatDate(stats.trend[0]._id)}</span>
                  <span>{formatDate(stats.trend[stats.trend.length - 1]._id)}</span>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
