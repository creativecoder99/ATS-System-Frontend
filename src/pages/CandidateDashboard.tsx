import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatRelativeDate } from '../lib/format';
import { EmptyState, ErrorState, SkeletonList, StatusBadge } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { APPLICATION_STATUSES, type ApplicationStatus, type CandidateStats } from '../types';
import { CandidateAiAdvisor } from '../components/CandidateAiAdvisor';
import { VerificationBadge } from '../components/VerificationBadge';

type DashboardTab = 'overview' | 'ai-advisor' | 'profile';

export function CandidateDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['candidate-stats'],
    queryFn: () => api.get<{ data: CandidateStats }>('/stats/candidate'),
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
          message={error instanceof Error ? error.message : 'Could not load your candidate dashboard'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const stats = data.data;
  const maxCount = Math.max(1, ...Object.values(stats.pipeline));

  // Compute profile completeness score
  let profileScore = 20; // baseline for having account
  if (user?.headline) profileScore += 25;
  if (user?.skills && user.skills.length > 0) profileScore += 25;
  if (user?.experienceYears && user.experienceYears > 0) profileScore += 15;
  if (user?.location) profileScore += 15;

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CA';

  // Helper for visual step progress in cards
  const getStepStatus = (
    currentStatus: ApplicationStatus,
    targetStep: ApplicationStatus
  ): 'done' | 'active' | 'upcoming' => {
    const order: ApplicationStatus[] = ['applied', 'shortlisted', 'interview', 'offered'];
    const curIdx = order.indexOf(currentStatus);
    const targetIdx = order.indexOf(targetStep);

    if (currentStatus === 'rejected') {
      return targetStep === 'applied' ? 'done' : 'upcoming';
    }
    if (curIdx === targetIdx) return 'active';
    if (curIdx > targetIdx) return 'done';
    return 'upcoming';
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-7 animate-fade-in">
      {/* Workspace Breadcrumb & Header */}
      <div className="border-b border-warm-border pb-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* User Profile Overview */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-900 text-base font-bold text-white shadow-xs">
                {userInitials}
              </div>
              <span
                className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-600"
                title="Active Profile"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                  Welcome back, {user?.name.split(' ')[0]}
                </h1>
                <VerificationBadge
                  isVerified={user?.isVerified}
                  status={user?.verificationStatus}
                  role="candidate"
                  size="sm"
                />
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                {user?.headline || 'Software Engineering Candidate'}
                {user?.location && ` · 📍 ${user.location}`}
              </p>
            </div>
          </div>

          {/* Header Action Toolbar */}
          <div className="flex items-center gap-2">
            <Link to="/jobs" className="btn-secondary text-xs px-3.5 py-2">
              Browse Roles Catalog
            </Link>
            <Link to="/profile" className="btn-primary text-xs px-3.5 py-2">
              Edit Profile & Resume
            </Link>
          </div>
        </div>

        {/* Segmented Navigation Tabs */}
        <div className="flex items-center justify-between border-t border-warm-border pt-4">
          <div className="inline-flex items-center rounded-lg border border-warm-border bg-warm-subtle/80 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-ink font-bold shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span>Applications & Pipeline</span>
              <span className="rounded-full bg-warm-border px-1.5 py-0.2 text-[10px] font-semibold text-ink">
                {stats.totals.applications}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai-advisor')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === 'ai-advisor'
                  ? 'bg-white text-brand-900 font-bold shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>HireHive AI Career Advisor</span>
              <span className="chip bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                Live LLM
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-ink font-bold shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span>Profile Readiness</span>
              <span className="rounded-full bg-warm-border px-1.5 py-0.2 text-[10px] font-semibold text-ink">
                {profileScore}%
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-ink-muted">
            <span>SLA Response Rate:</span>
            <strong className="text-ink font-bold">{stats.totals.responseRate}%</strong>
          </div>
        </div>
      </div>

      {/* TAB 1: APPLICATIONS & PIPELINE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-7 animate-fade-in">
          {/* Top Metric Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="card p-5 border-warm-border bg-white space-y-1">
              <div className="flex items-center justify-between text-xs text-ink-muted font-semibold uppercase tracking-wider">
                <span>Applications Sent</span>
                <span>📋</span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
                {stats.totals.applications}
              </p>
              <p className="text-xs text-ink-muted">Total verified role submissions</p>
            </div>

            <div className="card p-5 border-warm-border bg-white space-y-1">
              <div className="flex items-center justify-between text-xs text-ink-muted font-semibold uppercase tracking-wider">
                <span>Screening Response</span>
                <span>⚡</span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
                {stats.totals.responseRate}%
              </p>
              <p className="text-xs text-ink-muted">Passed initial resume triage</p>
            </div>

            <div className="card p-5 border-warm-border bg-white space-y-1">
              <div className="flex items-center justify-between text-xs text-ink-muted font-semibold uppercase tracking-wider">
                <span>Active Interviews</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-emerald-800 tabular-nums">
                {stats.pipeline.interview || 0}
              </p>
              <p className="text-xs text-ink-muted">Active interview conversations</p>
            </div>

            <div className="card p-5 border-warm-border bg-white space-y-1">
              <div className="flex items-center justify-between text-xs text-ink-muted font-semibold uppercase tracking-wider">
                <span>Offers Extended</span>
                <span>🎉</span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
                {stats.pipeline.offered || 0}
              </p>
              <p className="text-xs text-ink-muted">Formal hiring offers extended</p>
            </div>
          </div>

          {/* Main 2-Column Split */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            {/* Left Column: Recent Applications with Stage Steppers (8 cols) */}
            <section className="card p-5 lg:col-span-8 space-y-4 border-warm-border bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-warm-border">
                <div>
                  <h2 className="text-sm font-bold text-ink">Active Application Milestones</h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Track your candidate evaluation progress and stage movements.
                  </p>
                </div>
                <Link
                  to="/applications"
                  className="btn-secondary text-xs py-1 px-2.5 font-semibold text-brand-900"
                >
                  View All ({stats.totals.applications})
                </Link>
              </div>

              {stats.recent.length === 0 ? (
                <EmptyState
                  title="No applications submitted yet"
                  description="Explore live openings and submit your structured profile for objective evaluation."
                  action={
                    <Link to="/jobs" className="btn-primary text-xs">
                      Browse open positions
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {stats.recent.map((application) => {
                    const isRejected = application.status === 'rejected';

                    return (
                      <div
                        key={application._id}
                        className="rounded-lg border border-warm-border bg-warm-subtle/30 p-4 space-y-3 hover:border-brand-900 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <h3 className="text-sm font-bold text-ink leading-tight">
                              {application.job?.title ?? 'Position removed'}
                            </h3>
                            <p className="text-xs text-ink-muted">
                              <span className="font-semibold text-ink">
                                {application.job?.company ?? 'Company'}
                              </span>
                              {' · '}
                              Submitted {formatRelativeDate(application.createdAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={application.status} />
                            <Link
                              to="/applications"
                              className="btn-secondary text-xs py-1 px-2.5 hover:bg-brand-900 hover:text-white transition-colors"
                            >
                              Track Details →
                            </Link>
                          </div>
                        </div>

                        {/* Interactive 4-Stage Pipeline Progress Bar */}
                        <div className="pt-2 border-t border-warm-border">
                          {isRejected ? (
                            <div className="rounded bg-rose-50 border border-rose-200 p-2 text-xs text-rose-800 flex items-center justify-between">
                              <span>Application was archived or not advanced</span>
                              <Link to="/jobs" className="font-semibold underline">
                                Browse Other Roles
                              </Link>
                            </div>
                          ) : (
                            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                              {[
                                { id: 'applied', label: '1. Applied' },
                                { id: 'shortlisted', label: '2. Screened' },
                                { id: 'interview', label: '3. Interview' },
                                { id: 'offered', label: '4. Offer' },
                              ].map((step) => {
                                const stepStatus = getStepStatus(
                                  application.status,
                                  step.id as ApplicationStatus
                                );
                                return (
                                  <div
                                    key={step.id}
                                    className={`py-1 rounded font-semibold transition-all ${
                                      stepStatus === 'active'
                                        ? 'bg-brand-900 text-white shadow-xs'
                                        : stepStatus === 'done'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : 'bg-warm-subtle text-ink-muted border border-warm-border'
                                    }`}
                                  >
                                    {step.label}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Right Column: Pipeline Distribution & AI Teaser (4 cols) */}
            <div className="space-y-6 lg:col-span-4">
              {/* Pipeline Funnel Distribution */}
              <section className="card p-5 space-y-4 border-warm-border bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-ink">Pipeline Distribution</h2>
                  <span className="text-xs text-ink-muted">
                    {stats.totals.applications} Total
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {APPLICATION_STATUSES.map((status) => {
                    const count = stats.pipeline[status] || 0;
                    return (
                      <div key={status} className="flex items-center gap-3 text-xs">
                        <div className="w-24 shrink-0">
                          <StatusBadge status={status} />
                        </div>
                        <div className="h-2 flex-1 overflow-hidden rounded bg-warm-subtle border border-warm-border">
                          <div
                            className="h-full rounded bg-brand-900 transition-all"
                            style={{ width: `${(count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="w-6 text-right font-bold tabular-nums text-ink">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* AI Career Advisor Teaser Card */}
              <div className="card p-5 border-warm-border bg-gradient-to-b from-brand-subtle/50 to-white space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-900 text-xs font-bold text-white shadow-xs">
                    ✦
                  </span>
                  <h3 className="text-sm font-bold text-ink">HireHive AI Career Advisor</h3>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Looking for roles matching your specific stack, city, or experience? Ask HireHive AI to curate opportunities.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('ai-advisor')}
                  className="btn-accent w-full text-xs py-2 font-semibold"
                >
                  Open AI Advisor & Recommend Jobs →
                </button>
              </div>

              {/* Profile Readiness Tracker */}
              <section className="card p-5 space-y-3.5 border-warm-border bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-ink">Profile Readiness</h3>
                  <span className="chip text-xs font-bold bg-emerald-50 text-emerald-800 border-emerald-200">
                    {profileScore}%
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded bg-warm-subtle border border-warm-border">
                  <div
                    className="h-full rounded bg-brand-900 transition-all"
                    style={{ width: `${profileScore}%` }}
                  />
                </div>

                <div className="space-y-2 text-xs text-ink-muted pt-1">
                  <div className="flex justify-between items-center">
                    <span>Target headline & title:</span>
                    <span className={user?.headline ? 'font-bold text-ink' : 'text-stone-400'}>
                      {user?.headline ? '✓ Added' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Verified competencies:</span>
                    <span className={user?.skills?.length ? 'font-bold text-ink' : 'text-stone-400'}>
                      {user?.skills?.length ? `✓ ${user.skills.length} skills` : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Primary location:</span>
                    <span className={user?.location ? 'font-bold text-ink' : 'text-stone-400'}>
                      {user?.location ?? 'Not specified'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-warm-border">
                  <Link
                    to="/profile"
                    className="text-xs font-bold text-brand-900 hover:underline block text-center"
                  >
                    Update Profile & Upload Resume →
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HIREHIVE AI CAREER ADVISOR */}
      {activeTab === 'ai-advisor' && (
        <div className="space-y-6 animate-fade-in">
          <CandidateAiAdvisor />
        </div>
      )}

      {/* TAB 3: PROFILE & COMPETENCIES */}
      {activeTab === 'profile' && (
        <div className="card p-6 border-warm-border bg-white space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-border">
            <div>
              <h2 className="text-lg font-bold text-ink">Technical Profile & Skills Inventory</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                These credentials are used by HireHive's semantic matching and AI career advisor to recommend relevant jobs.
              </p>
            </div>
            <Link to="/profile" className="btn-primary text-xs px-4 py-2">
              Edit Full Resume & Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="card p-4 bg-warm-subtle/50 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Professional Details
              </span>
              <p className="text-sm font-bold text-ink">{user?.name}</p>
              <p className="text-ink-muted">{user?.email}</p>
              <p className="text-ink-muted">📍 {user?.location || 'Location not specified'}</p>
              <p className="text-ink-muted">💼 {user?.experienceYears || 0} years experience</p>
            </div>

            <div className="card p-4 bg-warm-subtle/50 space-y-2 md:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Verified Technical Skills ({user?.skills?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {user?.skills && user.skills.length > 0 ? (
                  user.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-ink border border-warm-border shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-ink-muted italic">
                    No skills added yet. Add your skills to get accurate role matches.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
