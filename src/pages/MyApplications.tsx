import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiRequestError, toQuery } from '../lib/api';
import { formatDate, formatSalary } from '../lib/format';
import {
  EmptyState,
  ErrorState,
  FormError,
  Modal,
  Pager,
  SkeletonList,
  StatusBadge,
} from '../components/ui';
import { APPLICATION_STATUSES, type Application, type Paginated } from '../types';

export function MyApplications() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [resumeModalApp, setResumeModalApp] = useState<Application | null>(null);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-warm-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">My applications</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Track status updates, resume parsing status, and interview stages.
          </p>
        </div>
        <select
          className="input w-auto sm:self-end"
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
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <FormError message={error} />
      </div>

      {isLoading ? (
        <div className="mt-6">
          <SkeletonList count={3} />
        </div>
      ) : isError ? (
        <div className="mt-6">
          <ErrorState
            message={queryError instanceof Error ? queryError.message : 'Could not load applications'}
            onRetry={refetch}
          />
        </div>
      ) : data && data.data.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={statusFilter ? `No ${statusFilter} applications` : 'No applications found'}
            description={
              statusFilter
                ? 'Try changing or resetting your status filter to see other submissions.'
                : 'You have not submitted any applications yet. Explore open roles across engineering, product, and design.'
            }
            action={
              !statusFilter && (
                <Link to="/jobs" className="btn-primary">
                  Browse open positions
                </Link>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {data?.data.map((application) => (
              <article key={application._id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    {application.job ? (
                      <Link
                        to={`/jobs/${application.job._id}`}
                        className="text-base font-semibold text-ink hover:text-brand-900"
                      >
                        {application.job.title}
                      </Link>
                    ) : (
                      <p className="text-base font-semibold text-ink-muted">
                        Position no longer active
                      </p>
                    )}
                    {application.job && (
                      <p className="mt-1 text-sm text-ink-muted">
                        {application.job.company} · {application.job.location} ·{' '}
                        {formatSalary(application.job.salaryMin, application.job.salaryMax)}
                      </p>
                    )}
                  </div>
                  <div className="self-start">
                    <StatusBadge status={application.status} />
                  </div>
                </div>

                {/* Parsed Resume Signals */}
                {application.parsedProfile && (
                  <div className="mt-3 rounded border border-warm-border bg-warm-surface p-3 text-xs">
                    <div className="flex items-center justify-between text-ink-muted">
                      <span className="font-semibold text-ink">Extracted Profile Summary</span>
                      <span>{application.parsedProfile.experienceYears} yrs experience identified</span>
                    </div>
                    {application.parsedProfile.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {application.parsedProfile.skills.slice(0, 8).map((sk) => (
                          <span
                            key={sk}
                            className="rounded bg-warm-highlight border border-warm-border px-2 py-0.5 text-xs text-ink"
                          >
                            {sk}
                          </span>
                        ))}
                        {application.parsedProfile.skills.length > 8 && (
                          <span className="text-xs text-ink-muted self-center">
                            +{application.parsedProfile.skills.length - 8} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Audit Trail */}
                {application.history.length > 0 && (
                  <div className="mt-4 border-t border-warm-border pt-3">
                    <p className="text-xs font-semibold text-ink mb-2">Stage Timeline</p>
                    <ol className="space-y-2 border-l border-warm-border pl-3 ml-1 text-xs">
                      {application.history.map((entry, i) => (
                        <li key={`${entry.status}-${i}`} className="text-ink-muted">
                          <span className="font-semibold capitalize text-ink">
                            {entry.status}
                          </span>{' '}
                          · {formatDate(entry.at)}
                          {entry.note && (
                            <span className="block text-ink-muted mt-0.5 italic">
                              "{entry.note}"
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-warm-border pt-3">
                  <div className="flex items-center gap-2">
                    {application.resumeUrl && (
                      <button
                        type="button"
                        onClick={() => setResumeModalApp(application)}
                        className="btn-secondary text-xs"
                      >
                        View resume preview
                      </button>
                    )}
                    <span className="text-xs text-ink-muted">
                      Applied on {formatDate(application.createdAt)}
                    </span>
                  </div>

                  {application.status !== 'offered' && (
                    <button
                      type="button"
                      className="btn-danger text-xs"
                      onClick={() => handleWithdraw(application)}
                      disabled={withdraw.isPending}
                    >
                      Withdraw application
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6">
            <Pager
              page={page}
              totalPages={data?.pagination.totalPages ?? 1}
              onChange={setPage}
            />
          </div>
        </>
      )}

      {/* Resume Viewer Modal */}
      {resumeModalApp && (
        <Modal
          title={`Resume Preview - ${resumeModalApp.job?.title ?? 'Application'}`}
          onClose={() => setResumeModalApp(null)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-ink-muted bg-warm-surface p-2 rounded border border-warm-border">
              <span>Candidate resume record</span>
              <a
                href={resumeModalApp.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-900 hover:underline"
              >
                Download original file
              </a>
            </div>

            <div className="rounded border border-warm-border bg-white p-4">
              <iframe
                src={`/api/applications/${resumeModalApp._id}/resume/view`}
                title="Resume Preview"
                className="w-full h-96 border-0 rounded"
              />
            </div>

            {resumeModalApp.parsedProfile && (
              <div className="rounded border border-warm-border bg-warm-surface p-3 text-xs space-y-2">
                <p className="font-semibold text-ink">Parsed Profile Details</p>
                <p className="text-ink-muted">
                  <strong>Summary:</strong> {resumeModalApp.parsedProfile.summary || 'Summary generated during parsing.'}
                </p>
                {resumeModalApp.parsedProfile.education.length > 0 && (
                  <p className="text-ink-muted">
                    <strong>Education:</strong> {resumeModalApp.parsedProfile.education.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
