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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">My job postings</h1>
        <Link to="/recruiter/jobs/new" className="btn-primary">
          Post a job
        </Link>
      </div>

      <div className="mt-4">
        <FormError message={error} />
      </div>

      {isLoading ? (
        <Spinner label="Loading your jobs" />
      ) : isError ? (
        <ErrorState
          message={queryError instanceof Error ? queryError.message : 'Could not load your jobs'}
          onRetry={refetch}
        />
      ) : data && data.data.length === 0 ? (
        <EmptyState
          title="No jobs posted yet"
          description="Create your first posting and start receiving applications."
          action={
            <Link to="/recruiter/jobs/new" className="btn-primary">
              Post a job
            </Link>
          }
        />
      ) : (
        <div className="mt-4 space-y-4">
          {data?.data.map((job) => (
            <article key={job._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-base font-semibold text-slate-900 hover:text-brand-700"
                  >
                    {job.title}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {job.location} · {formatSalary(job.salaryMin, job.salaryMax)} ·{' '}
                    {job.openings} opening{job.openings === 1 ? '' : 's'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Posted {formatDate(job.createdAt)}
                  </p>
                </div>
                <span
                  className={`chip ${
                    job.status === 'open'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {job.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                <Link to={`/recruiter/jobs/${job._id}/applicants`} className="btn-primary">
                  Applicants ({job.applicantCount})
                </Link>
                <Link to={`/recruiter/jobs/${job._id}/edit`} className="btn-secondary">
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => toggleStatus.mutate(job)}
                  disabled={toggleStatus.isPending}
                >
                  {job.status === 'open' ? 'Close' : 'Reopen'}
                </button>
                <button
                  type="button"
                  className="btn-danger ml-auto"
                  onClick={() => handleDelete(job)}
                  disabled={remove.isPending}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
