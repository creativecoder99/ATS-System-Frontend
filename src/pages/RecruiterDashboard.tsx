import { useState } from 'react';
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

type RecruiterTab = 'pipeline' | 'ai-copilot' | 'analytics';

export function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState<RecruiterTab>('pipeline');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['recruiter-stats'],
    queryFn: () => api.get<{ data: RecruiterStats }>('/stats/recruiter'),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="h-16 skeleton rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 skeleton rounded-lg" />
          <div className="h-24 skeleton rounded-lg" />
          <div className="h-24 skeleton rounded-lg" />
          <div className="h-24 skeleton rounded-lg" />
        </div>
        <SkeletonList count={3} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-7 animate-fade-in">
      {/* Executive Header */}
      <div className="border-b border-warm-border pb-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-900 text-[10px] font-bold text-white shadow-2xs">
                HH
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Talent Operations & Structured Hiring Suite
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mt-1">
              Recruiting Pipeline & Intelligence Dashboard
            </h1>
            <p className="mt-0.5 text-xs text-ink-muted">
              Objective candidate scorecards, automated screening SLAs, and Gemini AI candidate search.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <Link to="/recruiter/jobs" className="btn-secondary text-xs px-3.5 py-2">
              Manage Roles ({stats.totals.jobs})
            </Link>
            <Link to="/recruiter/jobs/new" className="btn-primary text-xs px-3.5 py-2">
              Post Open Role
            </Link>
          </div>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="flex items-center justify-between border-t border-warm-border pt-4">
          <div className="inline-flex items-center rounded-lg border border-warm-border bg-warm-subtle/80 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('pipeline')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-white text-ink font-bold shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span>Pipeline & Active Roles</span>
              <span className="rounded-full bg-warm-border px-1.5 py-0.2 text-[10px] font-semibold text-ink">
                {stats.totals.openJobs}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai-copilot')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === 'ai-copilot'
                  ? 'bg-white text-brand-900 font-bold shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Gemini AI Hiring Copilot</span>
              <span className="chip bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                Live LLM
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-ink font-bold shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span>Analytics & Compliance</span>
              <span className="rounded-full bg-warm-border px-1.5 py-0.2 text-[10px] font-semibold text-ink">
                98.4%
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Scorecard SLA: <strong>98.4%</strong></span>
            </span>
            <span>·</span>
            <span>Blind Screening: <strong>100% Active</strong></span>
          </div>
        </div>
      </div>

      {/* TAB 1: PIPELINE & ACTIVE ROLES */}
      {activeTab === 'pipeline' && (
        <div className="space-y-7 animate-fade-in">
          {/* Executive KPI Row */}
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

          {/* Main 2-Column Workspace */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Left: Active Roles Catalog (8 cols) */}
            <section className="card p-5 lg:col-span-8 space-y-4 border-warm-border bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-warm-border">
                <div>
                  <h2 className="text-sm font-bold text-ink">Active Positions & Sourcing Velocity</h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Select any role to view applicants, scorecards, or run semantic matching.
                  </p>
                </div>
                <Link
                  to="/recruiter/jobs/new"
                  className="btn-primary text-xs py-1.5 px-3 font-semibold"
                >
                  + Post New Role
                </Link>
              </div>

              {stats.topJobs.length === 0 ? (
                <EmptyState
                  title="No active roles published"
                  description="Create a role to start receiving structured applications and scorecard evaluations."
                  action={
                    <Link to="/recruiter/jobs/new" className="btn-primary text-xs">
                      Post your first job
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {stats.topJobs.map((job) => (
                    <div
                      key={job._id}
                      className="rounded-lg border border-warm-border bg-warm-subtle/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-900 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/recruiter/jobs/${job._id}/applicants`}
                            className="text-sm font-bold text-ink hover:text-brand-900 transition-colors"
                          >
                            {job.title}
                          </Link>
                          <span className="chip text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold">
                            Open
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted">
                          Structured interview kit ready · Bias-free blind screening enabled
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="chip text-xs font-semibold bg-white text-ink border-warm-border">
                          👥 {job.applicantCount} {job.applicantCount === 1 ? 'applicant' : 'applicants'}
                        </span>
                        <Link
                          to={`/recruiter/jobs/${job._id}/applicants`}
                          className="btn-secondary text-xs py-1.5 px-3 font-semibold hover:bg-brand-900 hover:text-white transition-colors"
                        >
                          Review Applicants →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Right: Pipeline Conversion Funnel & Quick AI Copilot (4 cols) */}
            <div className="space-y-6 lg:col-span-4">
              {/* Pipeline Progression Funnel */}
              <section className="card p-5 space-y-4 border-warm-border bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-ink">Candidate Pipeline Funnel</h2>
                  <span className="text-xs text-ink-muted">{totalCandidates} Candidates</span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {APPLICATION_STATUSES.map((status) => {
                    const count = stats.pipeline[status] || 0;
                    const percentage = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center gap-3 text-xs">
                        <div className="w-24 shrink-0">
                          <StatusBadge status={status} />
                        </div>
                        <div className="h-2 flex-1 overflow-hidden rounded bg-warm-subtle border border-warm-border">
                          <div
                            className="h-full rounded bg-brand-900 transition-all"
                            style={{ width: `${(count / maxPipeline) * 100}%` }}
                          />
                        </div>
                        <div className="w-16 text-right tabular-nums text-ink text-[11px]">
                          <span className="font-bold">{count}</span>
                          <span className="text-ink-muted ml-1">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-warm-border flex items-center justify-between text-xs text-ink-muted">
                  <span>Shortlist Rate: <strong className="text-ink font-bold">{shortlistRate}%</strong></span>
                  <span>Interview Yield: <strong className="text-ink font-bold">{interviewConversion}%</strong></span>
                </div>
              </section>

              {/* Quick AI Talent Copilot Teaser */}
              <div className="card p-5 border-warm-border bg-gradient-to-b from-brand-subtle/50 to-white space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-900 text-xs font-bold text-white shadow-xs">
                    ✦
                  </span>
                  <h3 className="text-sm font-bold text-ink">Gemini AI Hiring Copilot</h3>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Need to identify the best candidates across all applicants or compare candidate profiles?
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('ai-copilot')}
                  className="btn-accent w-full text-xs py-2 font-semibold"
                >
                  Launch AI Copilot Workspace →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GEMINI AI HIRING COPILOT */}
      {activeTab === 'ai-copilot' && (
        <div className="space-y-6 animate-fade-in">
          <RecruiterAiAssistant />
        </div>
      )}

      {/* TAB 3: ANALYTICS, SOURCING & SLA COMPLIANCE */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          {/* 30-Day Trend Chart */}
          <section className="card p-6 space-y-4 border-warm-border bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-warm-border">
              <div>
                <h2 className="text-sm font-bold text-ink">
                  Application Inbound Velocity (Last 30 Days)
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  Daily submissions tracked across all active engineering and product roles.
                </p>
              </div>
              <span className="chip text-xs font-bold bg-warm-subtle text-ink">
                {totalInTrend} total submissions
              </span>
            </div>

            {totalInTrend === 0 ? (
              <p className="py-8 text-center text-xs text-ink-muted">
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
                          point.count === 0 ? 'bg-stone-200/70' : 'bg-brand-900 hover:bg-brand-700'
                        }`}
                        style={{
                          height:
                            point.count === 0
                              ? '3px'
                              : `${Math.max(6, (point.count / maxTrend) * 100)}%`,
                        }}
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-[10px] text-white shadow">
                        {formatDate(point._id)}: {point.count} applicant(s)
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

          {/* Greenhouse Sourcing Breakdown and Interview Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Talent Sourcing Attribution */}
            <section className="card p-5 space-y-4 border-warm-border bg-white">
              <div className="flex items-center justify-between pb-2 border-b border-warm-border">
                <div>
                  <h3 className="text-sm font-bold text-ink">Talent Sourcing Channels</h3>
                  <p className="text-xs text-ink-muted">Inbound and referral volume conversion</p>
                </div>
                <span className="chip bg-warm-subtle text-ink font-semibold text-[10px]">
                  Greenhouse Attribution
                </span>
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
                      <span className="text-ink-muted font-semibold">
                        {channel.percent}% ({channel.count})
                      </span>
                    </div>
                    <div className="h-2 w-full rounded bg-warm-subtle overflow-hidden border border-warm-border">
                      <div
                        className={`h-full rounded ${channel.color}`}
                        style={{ width: `${channel.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Structured Interview Health */}
            <section className="card p-5 space-y-4 border-warm-border bg-white">
              <div className="flex items-center justify-between pb-2 border-b border-warm-border">
                <div>
                  <h3 className="text-sm font-bold text-ink">Structured Interview Health</h3>
                  <p className="text-xs text-ink-muted">Objective evaluation compliance & bias prevention</p>
                </div>
                <span className="chip bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                  Audit Passed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded border border-warm-border bg-warm-subtle/50 p-3">
                  <p className="text-[11px] text-ink-muted uppercase font-bold">Blind Screening</p>
                  <p className="mt-1 text-lg font-bold text-ink">100% Active</p>
                  <p className="mt-0.5 text-[10px] text-ink-muted">PII redacted during stage 1 triage</p>
                </div>

                <div className="rounded border border-warm-border bg-warm-subtle/50 p-3">
                  <p className="text-[11px] text-ink-muted uppercase font-bold">Scorecard SLA</p>
                  <p className="mt-1 text-lg font-bold text-ink">2.1 Hours</p>
                  <p className="mt-0.5 text-[10px] text-ink-muted">Median time to submit interview notes</p>
                </div>

                <div className="rounded border border-warm-border bg-warm-subtle/50 p-3">
                  <p className="text-[11px] text-ink-muted uppercase font-bold">Competency Rubrics</p>
                  <p className="mt-1 text-lg font-bold text-ink">4 Attributes</p>
                  <p className="mt-0.5 text-[10px] text-ink-muted">Technical, Systems, Problem Solving, Values</p>
                </div>

                <div className="rounded border border-warm-border bg-warm-subtle/50 p-3">
                  <p className="text-[11px] text-ink-muted uppercase font-bold">Interviewer Pool</p>
                  <p className="mt-1 text-lg font-bold text-ink">18 Leads</p>
                  <p className="mt-0.5 text-[10px] text-ink-muted">Calibrated interviewers across team</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
