import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiRequestError, toQuery } from '../lib/api';
import { formatDate, formatSalary } from '../lib/format';
import {
  EmptyState,
  ErrorState,
  FormError,
  Pager,
  Spinner,
  StatusBadge,
} from '../components/ui';
import { APPLICATION_STATUSES, type Application, type Paginated } from '../types';

export function MyApplications() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const query = toQuery({ status: statusFilter, page, limit: 10 });

  const { data, isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: ['my-applications', query],
    queryFn: () => api.get<Paginated<Application>>(`/applications/mine${query}`),
    placeholderData: keepPreviousData,
  });

  const withdraw = useMutation({
    mutationFn: (id: string) => api.delete(`/applications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-stats'] });
    },
    onError: (err) => {
      setError(err instanceof ApiRequestError ? err.message : 'Could not withdraw the application');
    },
  });

  const handleWithdraw = (application: Application) => {
    setError(null);
    const title = application.job?.title ?? 'this job';
    if (window.confirm(`Withdraw your application for ${title}? This cannot be undone.`)) {
      withdraw.mutate(application._id);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">My applications</h1>
        <select
          className="input w-auto"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <FormError message={error} />
      </div>

      {isLoading ? (
        <Spinner label="Loading applications" />
      ) : isError ? (
        <ErrorState
          message={queryError instanceof Error ? queryError.message : 'Could not load applications'}
          onRetry={refetch}
        />
      ) : data && data.data.length === 0 ? (
        <EmptyState
          title={statusFilter ? `No ${statusFilter} applications` : 'No applications yet'}
          description={
            statusFilter
              ? 'Try a different status filter.'
              : 'Once you apply to a job it will show up here, along with its progress.'
          }
          action={
            !statusFilter && (
              <Link to="/jobs" className="btn-primary">
                Browse jobs
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="mt-4 space-y-4">
            {data?.data.map((application) => (
              <article key={application._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {application.job ? (
                      <Link
                        to={`/jobs/${application.job._id}`}
                        className="text-base font-semibold text-slate-900 hover:text-brand-700"
                      >
                        {application.job.title}
                      </Link>
                    ) : (
                      <p className="text-base font-semibold text-slate-500">
                        This job has been removed
                      </p>
                    )}
                    {application.job && (
                      <p className="mt-0.5 text-sm text-slate-600">
                        {application.job.company} · {application.job.location} ·{' '}
                        {formatSalary(application.job.salaryMin, application.job.salaryMax)}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={application.status} />
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Applied on {formatDate(application.createdAt)}
                </p>

                {application.history.length > 1 && (
                  <ol className="mt-4 space-y-2 border-l-2 border-slate-100 pl-4">
                    {application.history.map((entry, i) => (
                      <li key={`${entry.status}-${i}`} className="text-xs text-slate-600">
                        <span className="font-medium capitalize text-slate-800">
                          {entry.status}
                        </span>{' '}
                        · {formatDate(entry.at)}
                        {entry.note && <span className="block text-slate-500">“{entry.note}”</span>}
                      </li>
                    ))}
                  </ol>
                )}

                {/* An accepted offer is a commitment; the API rejects the
                    withdrawal, so the button is hidden rather than failing. */}
                {application.status !== 'offered' && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleWithdraw(application)}
                      disabled={withdraw.isPending}
                    >
                      Withdraw
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          <Pager
            page={page}
            totalPages={data?.pagination.totalPages ?? 1}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
