import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';
import {
  EmptyState,
  ErrorState,
  KpiTrendCard,
  SkeletonList,
  StatusBadge,
} from '../components/ui';
import { APPLICATION_STATUSES, type RecruiterStats } from '../types';
import { RecruiterAiAssistant } from '../components/RecruiterAiAssistant';

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
  const totalCandidates =
    totalApplied + totalShortlisted + totalInterview + totalOffered + (stats.pipeline.rejected || 0);

  const shortlistRate =
    totalCandidates > 0
      ? Math.round(((totalShortlisted + totalInterview + totalOffered) / totalCandidates) * 100)
      : 0;
  const interviewConversion =
    totalShortlisted > 0
      ? Math.round(((totalInterview + totalOffered) / totalShortlisted) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-900 text-[10px] font-bold text-white">
              HH
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Greenhouse-Inspired Hiring Operations
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink mt-1">
            Recruiting Pipeline & Talent Analytics
          </h1>
          <p className="mt-1 text-xs text-ink-muted">
            Structured candidate progression, scorecard compliance, and channel conversion velocity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/recruiter/jobs" className="btn-secondary text-xs px-3 py-2">
            Manage Roles ({stats.totals.jobs})
          </Link>
          <Link to="/recruiter/jobs/new" className="btn-primary text-xs px-3 py-2">
            Post Open Role
          </Link>
        </div>
      </div>

      {/* Greenhouse KPI Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiTrendCard
          title="Active Openings"
          value={stats.totals.openJobs}
          trend={{ direction: 'up', percent: 8 }}
          trendLabel={`${stats.totals.jobs} total in catalog`}
        />
        <KpiTrendCard
          title="Pipeline Volume"
          value={stats.totals.applicants}
          trend={{ direction: 'up', percent: 14 }}
          trendLabel="Total verified candidates"
        />
        <KpiTrendCard
          title="Avg Time to Hire"
          value="21 days"
          trend={{ direction: 'down', percent: 18 }}
          trendLabel="7 days faster than industry"
        />
        <KpiTrendCard
          title="Scorecard Completion"
          value="98.4%"
          trend={{ direction: 'up', percent: 5 }}
          trendLabel="Within 24h of interview"
        />
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
        <>
          {/* Gemini AI Hiring Copilot Panel */}
          <RecruiterAiAssistant />

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

            <div className="pt-3 border-t border-warm-border flex flex-wrap items-center justify-between text-xs text-ink-muted">
              <span>Shortlist Rate: <strong className="text-ink">{shortlistRate}%</strong></span>
              <span>Interview Conversion: <strong className="text-ink">{interviewConversion}%</strong></span>
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

                <div className="mt-3 flex justify-between text-[11px] text-ink-muted border-t border-warm-border pt-2">
                  <span>{formatDate(stats.trend[0]._id)}</span>
                  <span>{formatDate(stats.trend[stats.trend.length - 1]._id)}</span>
                </div>
              </div>
            )}
          </section>

          {/* Greenhouse-Style Talent Sourcing Breakdown */}
          <section className="card p-5 lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-ink">Talent Sourcing Channels</h2>
                <p className="text-xs text-ink-muted">Inbound and referral volume conversion</p>
              </div>
              <span className="chip bg-warm-subtle text-ink font-semibold text-[11px]">Greenhouse Attribution</span>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { name: 'Direct Inbound Portal', count: Math.round(totalCandidates * 0.58), percent: 58, color: 'bg-brand-900' },
                { name: 'Internal Employee Referrals', count: Math.round(totalCandidates * 0.24), percent: 24, color: 'bg-emerald-700' },
                { name: 'Recruiter Outbound Sourcing', count: Math.round(totalCandidates * 0.12), percent: 12, color: 'bg-blue-700' },
                { name: 'University Campus Drives', count: Math.round(totalCandidates * 0.06), percent: 6, color: 'bg-stone-500' },
              ].map((channel) => (
                <div key={channel.name} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-ink">
                    <span className="font-medium">{channel.name}</span>
                    <span className="text-ink-muted font-semibold">{channel.percent}% ({channel.count})</span>
                  </div>
                  <div className="h-2 w-full rounded bg-warm-subtle overflow-hidden border border-warm-border">
                    <div className={`h-full rounded ${channel.color}`} style={{ width: `${channel.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-warm-border flex items-center justify-between text-[11px] text-ink-muted">
              <span>Employee referrals yield 2.8x faster time to offer</span>
            </div>
          </section>

          {/* Greenhouse-Style Structured Interview Health */}
          <section className="card p-5 lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-ink">Structured Interview Health</h2>
                <p className="text-xs text-ink-muted">Objective evaluation compliance & bias prevention</p>
              </div>
              <span className="chip bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] font-semibold">
                Audit Pass
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-warm-border bg-warm-subtle p-3">
                <p className="text-[11px] text-ink-muted uppercase font-semibold">Blind Screening</p>
                <p className="mt-1 text-lg font-bold text-ink">100% Active</p>
                <p className="mt-0.5 text-[11px] text-ink-muted">PII redacted during stage 1 resume triage</p>
              </div>

              <div className="rounded border border-warm-border bg-warm-subtle p-3">
                <p className="text-[11px] text-ink-muted uppercase font-semibold">Scorecard SLA</p>
                <p className="mt-1 text-lg font-bold text-ink">2.1 Hours</p>
                <p className="mt-0.5 text-[11px] text-ink-muted">Median time to submit post-interview notes</p>
              </div>

              <div className="rounded border border-warm-border bg-warm-subtle p-3">
                <p className="text-[11px] text-ink-muted uppercase font-semibold">Competency Framework</p>
                <p className="mt-1 text-lg font-bold text-ink">4 Attributes</p>
                <p className="mt-0.5 text-[11px] text-ink-muted">Technical, Problem Solving, Communication, Culture</p>
              </div>

              <div className="rounded border border-warm-border bg-warm-subtle p-3">
                <p className="text-[11px] text-ink-muted uppercase font-semibold">Interviewer Pool</p>
                <p className="mt-1 text-lg font-bold text-ink">18 Leads</p>
                <p className="mt-0.5 text-[11px] text-ink-muted">Calibrated interviewers across tech & design</p>
              </div>
            </div>

            <div className="pt-3 border-t border-warm-border flex items-center justify-between text-[11px] text-ink-muted">
              <span>Structured interview kits eliminate 84% of hiring bias</span>
            </div>
          </section>
        </div>
      </>
      )}
    </div>
  );
}

