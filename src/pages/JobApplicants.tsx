import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiRequestError, BASE_URL, getAccessToken, toQuery } from '../lib/api';
import { formatDate, formatExperience } from '../lib/format';
import {
  EmptyState,
  ErrorState,
  FormError,
  Pager,
  Spinner,
  StatusBadge,
  Tag,
} from '../components/ui';
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationStatus,
  type Job,
  type Paginated,
} from '../types';

/**
 * Mirrors STATUS_TRANSITIONS on the server. The API is still the authority —
 * this only keeps the UI from offering a move it knows will be rejected.
 */
const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  applied: ['shortlisted', 'rejected'],
  shortlisted: ['interview', 'rejected'],
  interview: ['offered', 'rejected'],
  offered: [],
  rejected: [],
};

export function JobApplicants() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const query = toQuery({ status: statusFilter, page, limit: 10 });

  const jobQuery = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get<{ data: Job }>(`/jobs/${id}`),
    enabled: Boolean(id),
  });

  const { data, isLoading, isError, error: queryError, refetch } = useQuery({
    queryKey: ['job-applicants', id, query],
    queryFn: () => api.get<Paginated<Application>>(`/jobs/${id}/applications${query}`),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });

  const updateStatus = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) =>
      api.patch(`/applications/${applicationId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applicants', id] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-stats'] });
    },
    onError: (err) =>
      setError(err instanceof ApiRequestError ? err.message : 'Could not update the status'),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/recruiter/jobs" className="text-sm text-slate-500 hover:text-brand-700">
        ← Back to my jobs
      </Link>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {jobQuery.data?.data.title ?? 'Applicants'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {data ? `${data.pagination.total} application${data.pagination.total === 1 ? '' : 's'}` : '…'}
          </p>
        </div>

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
        <Spinner label="Loading applicants" />
      ) : isError ? (
        <ErrorState
          message={queryError instanceof Error ? queryError.message : 'Could not load applicants'}
          onRetry={refetch}
        />
      ) : data && data.data.length === 0 ? (
        <EmptyState
          title={statusFilter ? `No ${statusFilter} applicants` : 'No applications yet'}
          description={
            statusFilter
              ? 'Try a different status filter.'
              : 'Once candidates apply to this role they will appear here.'
          }
        />
      ) : (
        <>
          <div className="mt-4 space-y-4">
            {data?.data.map((application) => (
              <ApplicantCard
                key={application._id}
                application={application}
                onStatusChange={(status) => {
                  setError(null);
                  updateStatus.mutate({ applicationId: application._id, status });
                }}
                pending={updateStatus.isPending}
              />
            ))}
          </div>

          <Pager page={page} totalPages={data?.pagination.totalPages ?? 1} onChange={setPage} />
        </>
      )}
    </div>
  );
}

function ApplicantCard({
  application,
  onStatusChange,
  pending,
}: {
  application: Application;
  onStatusChange: (status: ApplicationStatus) => void;
  pending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const candidate = application.applicant;
  const nextStatuses = NEXT_STATUSES[application.status];

  /**
   * The resume endpoint requires an Authorization header, so a plain <a> tag
   * would 401. Fetch it as a blob, then hand the browser an object URL.
   */
  const downloadResume = async () => {
    const res = await fetch(`${BASE_URL}/applications/${application._id}/resume`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      credentials: 'include',
    });
    if (!res.ok) {
      window.alert('Could not download this resume.');
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${candidate?.name ?? 'candidate'}-resume`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900">
            {candidate?.name ?? 'Candidate removed'}
          </h2>
          {candidate?.headline && (
            <p className="mt-0.5 text-sm text-slate-600">{candidate.headline}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            {candidate?.email}
            {candidate?.location && ` · ${candidate.location}`}
            {candidate ? ` · ${formatExperience(candidate.experienceYears)}` : ''}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {candidate?.skills && candidate.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {candidate.skills.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400">
        Applied on {formatDate(application.createdAt)}
      </p>

      {application.coverLetter && (
        <div className="mt-3">
          <button
            type="button"
            className="text-xs font-medium text-brand-700 hover:underline"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? 'Hide cover letter' : 'Read cover letter'}
          </button>
          {expanded && (
            <p className="mt-2 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              {application.coverLetter}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <button type="button" className="btn-secondary" onClick={downloadResume}>
          Download resume
        </button>

        {nextStatuses.length === 0 ? (
          <span className="text-xs text-slate-400">
            This application is final and cannot be changed.
          </span>
        ) : (
          nextStatuses.map((status) => (
            <button
              key={status}
              type="button"
              className={status === 'rejected' ? 'btn-danger' : 'btn-primary'}
              onClick={() => onStatusChange(status)}
              disabled={pending}
            >
              {status === 'rejected' ? 'Reject' : `Move to ${status}`}
            </button>
          ))
        )}
      </div>
    </article>
  );
}
