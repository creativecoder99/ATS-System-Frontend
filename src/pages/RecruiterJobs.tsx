import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiRequestError } from '../lib/api';
import { formatDate, formatSalary } from '../lib/format';
import { EmptyState, ErrorState, FormError, Spinner } from '../components/ui';
import type { Job } from '../types';

export function RecruiterJobs() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => api.get<{ data: Job[] }>('/jobs/mine'),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
    queryClient.invalidateQueries({ queryKey: ['recruiter-stats'] });
  };

  const toggleStatus = useMutation({
    mutationFn: (job: Job) =>
      api.patch(`/jobs/${job._id}`, { status: job.status === 'open' ? 'closed' : 'open' }),
    onSuccess: invalidate,
    onError: (err) =>
      setError(err instanceof ApiRequestError ? err.message : 'Could not update the job'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/jobs/${id}`),
    onSuccess: invalidate,
    onError: (err) =>
      setError(err instanceof ApiRequestError ? err.message : 'Could not delete the job'),
  });

  const handleDelete = (job: Job) => {
    setError(null);
    const warning =
      job.applicantCount > 0
        ? `Delete “${job.title}”? Its ${job.applicantCount} application(s) will be permanently removed too.`
        : `Delete “${job.title}”?`;
    if (window.confirm(warning)) remove.mutate(job._id);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-warm-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Active job postings</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manage your open positions, view applicants, and screen candidates.
          </p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn-primary sm:self-end">
          Create new job
        </Link>
      </div>

      <div className="mt-4">
        <FormError message={error} />
      </div>

      {isLoading ? (
        <Spinner label="Loading your postings" />
      ) : isError ? (
        <ErrorState
          message={queryError instanceof Error ? queryError.message : 'Could not load your job postings'}
          onRetry={refetch}
        />
      ) : data && data.data.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No active job postings"
            description="Create your first job listing to start receiving candidate applications and running AI evaluations."
            action={
              <Link to="/recruiter/jobs/new" className="btn-primary">
                Post your first role
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {data?.data.map((job) => (
            <article key={job._id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="text-base font-semibold text-ink hover:text-brand-900"
                    >
                      {job.title}
                    </Link>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                        job.status === 'open'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-warm-highlight text-ink-muted border border-warm-border'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">
                    {job.location} · {formatSalary(job.salaryMin, job.salaryMax)} ·{' '}
                    {job.openings} opening{job.openings === 1 ? '' : 's'} · {job.type}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Created on {formatDate(job.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/recruiter/jobs/${job._id}/applicants`}
                    className="btn-primary text-xs font-medium"
                  >
                    View applicants ({job.applicantCount})
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-warm-border pt-3">
                <div className="flex items-center gap-2">
                  <Link to={`/recruiter/jobs/${job._id}/edit`} className="btn-secondary text-xs">
                    Edit posting
                  </Link>
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    onClick={() => toggleStatus.mutate(job)}
                    disabled={toggleStatus.isPending}
                  >
                    {job.status === 'open' ? 'Close job' : 'Reopen job'}
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-danger text-xs"
                  onClick={() => handleDelete(job)}
                  disabled={remove.isPending}
                >
                  Delete posting
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
