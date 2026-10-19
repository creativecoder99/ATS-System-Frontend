import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatRelativeDate } from '../lib/format';
import { EmptyState, ErrorState, SkeletonList, StatCard, StatusBadge } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { APPLICATION_STATUSES, type CandidateStats } from '../types';
import { CandidateAiAdvisor } from '../components/CandidateAiAdvisor';

export function CandidateDashboard() {

  const { user } = useAuth();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['candidate-stats'],
    queryFn: () => api.get<{ data: CandidateStats }>('/stats/candidate'),
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

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-xs text-stone-600">
            Overview of your active applications and profile status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/jobs" className="btn-accent text-xs px-3 py-2">
            Explore Open Roles
          </Link>
          <Link to="/profile" className="btn-secondary text-xs px-3 py-2">
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications Sent" value={stats.totals.applications} hint="Total roles applied" />
        <StatCard
          label="Screening Response"
          value={`${stats.totals.responseRate}%`}
          hint="Advanced past applied stage"
        />
        <StatCard label="In Interview" value={stats.pipeline.interview || 0} hint="Active conversations" />
        <StatCard label="Offers Extended" value={stats.pipeline.offered || 0} hint="Congratulations" />
      </div>

      {/* Gemini AI Career Advisor Panel */}
      <CandidateAiAdvisor />

      <div className="grid gap-6 lg:grid-cols-12 items-start">

        {/* Pipeline Distribution */}
        <section className="card p-5 lg:col-span-6 space-y-4 border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Application Progression</h2>
            <Link to="/applications" className="text-xs font-semibold text-[#0f2942] hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {APPLICATION_STATUSES.map((status) => {
              const count = stats.pipeline[status] || 0;
              return (
                <div key={status} className="flex items-center gap-3 text-xs">
                  <div className="w-24 shrink-0">
                    <StatusBadge status={status} />
                  </div>
                  <div className="h-2 flex-1 overflow-hidden rounded bg-stone-100 border border-stone-200">
                    <div
                      className="h-full rounded bg-[#0f2942] transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium tabular-nums text-stone-700">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Profile Strength & Completeness Tracker */}
        <section className="card p-5 lg:col-span-6 space-y-4 border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Profile Readiness</h2>
            <span className="text-xs font-bold text-stone-800">{profileScore}% complete</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded bg-stone-100 border border-stone-200">
            <div
              className="h-full rounded bg-stone-800 transition-all"
              style={{ width: `${profileScore}%` }}
            />
          </div>

          <div className="space-y-2 pt-1 text-xs text-stone-600">
            <div className="flex items-center justify-between">
              <span>Headline & role target</span>
              <span className={user?.headline ? 'text-stone-900 font-medium' : 'text-stone-400'}>
                {user?.headline ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Technical skills inventory</span>
              <span className={user?.skills?.length ? 'text-stone-900 font-medium' : 'text-stone-400'}>
                {user?.skills?.length ? `${user.skills.length} skills listed` : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Verified location</span>
              <span className={user?.location ? 'text-stone-900 font-medium' : 'text-stone-400'}>
                {user?.location ?? 'Not specified'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <Link to="/profile" className="text-xs font-semibold text-[#0f2942] hover:underline">
              Complete profile to increase recruiter match score →
            </Link>
          </div>
        </section>

        {/* Recent Applications Feed */}
        <section className="card p-5 lg:col-span-12 space-y-4 border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Recent Applications</h2>
            <Link to="/applications" className="text-xs font-semibold text-[#0f2942] hover:underline">
              Manage all ({stats.totals.applications})
            </Link>
          </div>

          {stats.recent.length === 0 ? (
            <EmptyState
              title="No applications submitted yet"
              description="Browse active openings and apply with your structured resume."
              action={
                <Link to="/jobs" className="btn-primary text-xs">
                  Browse open positions
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-stone-100 text-xs">
              {stats.recent.map((application) => (
                <li key={application._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-stone-900">
                      {application.job?.title ?? 'Position removed'}
                    </p>
                    <p className="text-stone-500 mt-0.5">
                      {application.job?.company ?? 'Unknown company'} · Applied {formatRelativeDate(application.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={application.status} />
                    <Link
                      to="/applications"
                      className="text-xs font-semibold text-[#0f2942] hover:underline"
                    >
                      Track
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
