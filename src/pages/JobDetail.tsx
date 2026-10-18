import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiRequestError } from '../lib/api';
import { formatDate, formatSalary, titleCase } from '../lib/format';
import { ErrorState, FormError, Spinner, Tag } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import type { Job } from '../types';

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showApply, setShowApply] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get<{ data: Job }>(`/jobs/${id}`),
    enabled: Boolean(id),
  });

  const job = data?.data;

  const toggleSave = useMutation({
    mutationFn: () =>
      job?.isSaved ? api.delete(`/jobs/${id}/save`) : api.post(`/jobs/${id}/save`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
  });

  if (isLoading) return <Spinner label="Loading job" />;
  if (isError || !job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorState
          message={error instanceof Error ? error.message : 'Job not found'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const canApply = user?.role === 'candidate' && job.status === 'open' && !job.hasApplied;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/jobs" className="text-sm text-slate-500 hover:text-brand-700">
        ← Back to jobs
      </Link>

      <div className="card mt-4 p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <p className="mt-1 text-slate-600">{job.company}</p>
          </div>
          {job.status === 'closed' && (
            <span className="chip bg-red-100 text-red-700">Closed</span>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-100 py-5 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-slate-500">Location</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-900">{job.location}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Work mode</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-900">{titleCase(job.workMode)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Type</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-900">{titleCase(job.type)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Salary</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-900">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-900">About the role</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {job.description}
          </p>
        </div>

        {job.skills.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-900">Skills</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-600 sm:grid-cols-3">
          <p>
            <span className="text-slate-400">Experience:</span>{' '}
            {job.experienceMin === 0 ? 'Fresher friendly' : `${job.experienceMin}+ years`}
          </p>
          <p>
            <span className="text-slate-400">Openings:</span> {job.openings}
          </p>
          <p>
            <span className="text-slate-400">Posted:</span> {formatDate(job.createdAt)}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
          {!user && (
            <>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate('/login', { state: { from: `/jobs/${id}` } })}
              >
                Log in to apply
              </button>
              <p className="text-sm text-slate-500">You need a candidate account to apply.</p>
            </>
          )}

          {job.hasApplied && (
            <div className="flex items-center gap-3">
              <span className="chip bg-emerald-100 text-emerald-700">Applied</span>
              <Link to="/applications" className="text-sm text-brand-700 hover:underline">
                Track your application →
              </Link>
            </div>
          )}

          {canApply && (
            <button type="button" className="btn-primary" onClick={() => setShowApply(true)}>
              Apply now
            </button>
          )}

          {user?.role === 'candidate' && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => toggleSave.mutate()}
              disabled={toggleSave.isPending}
            >
              {job.isSaved ? 'Saved ✓' : 'Save job'}
            </button>
          )}

          {user?.role === 'recruiter' && job.status === 'open' && (
            <p className="text-sm text-slate-500">
              Recruiter accounts cannot apply to jobs.
            </p>
          )}
        </div>
      </div>

      {showApply && <ApplyDialog jobId={job._id} onClose={() => setShowApply(false)} />}
    </div>
  );
}

function ApplyDialog({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = useMutation({
    mutationFn: (formData: FormData) => api.postForm(`/jobs/${jobId}/apply`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-stats'] });
      onClose();
    },
    onError: (err) => {
      setError(err instanceof ApiRequestError ? err.message : 'Could not submit your application');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resume) {
      setError('Please attach your resume (PDF or Word, max 5 MB).');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resume);
    if (coverLetter.trim()) formData.append('coverLetter', coverLetter.trim());
    apply.mutate(formData);
  };

  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-title"
    >
      <div className="card w-full max-w-lg p-6">
        <h2 id="apply-title" className="text-lg font-semibold text-slate-900">
          Apply to this role
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <FormError message={error} />

          <div>
            <label htmlFor="resume" className="label">
              Resume <span className="text-red-500">*</span>
            </label>
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className="input file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm"
              onChange={(e) => setResume(e.target.files?.[0] ?? null)}
              required
            />
            <p className="mt-1 text-xs text-slate-400">PDF or Word document, up to 5 MB.</p>
          </div>

          <div>
            <label htmlFor="coverLetter" className="label">
              Cover letter <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              id="coverLetter"
              className="input min-h-[120px] resize-y"
              maxLength={3000}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Why are you a good fit for this role?"
            />
            <p className="mt-1 text-right text-xs text-slate-400">{coverLetter.length}/3000</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={apply.isPending}>
              {apply.isPending ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
