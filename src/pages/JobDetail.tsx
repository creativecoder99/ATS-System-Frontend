import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiRequestError } from '../lib/api';
import { formatDate, formatSalary, titleCase } from '../lib/format';
import { ErrorState, FormError, Modal, Spinner, Tag } from '../components/ui';
import { VerificationBadge } from '../components/VerificationBadge';
import { useAuth } from '../hooks/useAuth';
import type { Job } from '../types';

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showApply, setShowApply] = useState(false);
  const [justApplied, setJustApplied] = useState(false);

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

  if (isLoading) return <Spinner label="Loading position details" />;
  if (isError || !job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorState
          message={error instanceof Error ? error.message : 'Position not found'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const canApply = user?.role === 'candidate' && job.status === 'open' && !job.hasApplied;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      <Link to="/jobs" className="text-xs font-semibold text-stone-600 hover:text-stone-900">
        ← Back to positions
      </Link>

      <div className="card p-6 sm:p-8 space-y-6 border-stone-200">
        {(job.hasApplied || justApplied) && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/95 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950 shadow-2xs animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm shadow-xs">
                ✓
              </span>
              <div>
                <p className="text-xs font-bold text-emerald-950">Applied Successfully</p>
                <p className="text-[11px] text-emerald-800">
                  Your application has been submitted to {job.company}. You can monitor review progress in your dashboard.
                </p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="btn-secondary text-xs py-1.5 px-3 bg-white border-emerald-300 text-emerald-900 hover:bg-emerald-100 shrink-0 font-semibold self-start sm:self-center"
            >
              View Application →
            </Link>
          </div>
        )}

        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{job.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-stone-600">{job.company}</span>
              {typeof job.postedBy === 'object' && job.postedBy !== null && (
                <VerificationBadge
                  isVerified={job.postedBy.isVerified}
                  status={job.postedBy.verificationStatus}
                  role="recruiter"
                  size="sm"
                />
              )}
            </div>
          </div>
          {job.status === 'closed' && (
            <span className="chip bg-stone-200 text-stone-700 font-semibold border-stone-300">
              Closed
            </span>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-4 border-y border-stone-100 py-4 sm:grid-cols-4 text-xs">
          <div>
            <dt className="text-stone-500 uppercase font-semibold">Location</dt>
            <dd className="mt-0.5 font-medium text-stone-900">{job.location}</dd>
          </div>
          <div>
            <dt className="text-stone-500 uppercase font-semibold">Work Mode</dt>
            <dd className="mt-0.5 font-medium text-stone-900">{titleCase(job.workMode)}</dd>
          </div>
          <div>
            <dt className="text-stone-500 uppercase font-semibold">Job Type</dt>
            <dd className="mt-0.5 font-medium text-stone-900">{titleCase(job.type)}</dd>
          </div>
          <div>
            <dt className="text-stone-500 uppercase font-semibold">Compensation</dt>
            <dd className="mt-0.5 font-semibold text-stone-900">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </dd>
          </div>
        </dl>

        <div className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
            Role Description
          </h2>
          <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed text-stone-700">
            {job.description}
          </p>
        </div>

        {job.skills.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
              Target Technical Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-xs text-stone-600 sm:grid-cols-3 pt-2">
          <p>
            <span className="text-stone-500">Required Experience:</span>{' '}
            {job.experienceMin === 0 ? 'Fresher friendly' : `${job.experienceMin}+ years`}
          </p>
          <p>
            <span className="text-stone-500">Openings:</span> {job.openings}
          </p>
          <p>
            <span className="text-stone-500">Date Posted:</span> {formatDate(job.createdAt)}
          </p>
        </div>

        {/* Apply Action Bar */}
        <div className="flex flex-wrap items-center gap-3 border-t border-warm-border pt-6">
          {!user && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn-primary text-xs"
                onClick={() => navigate('/login', { state: { from: `/jobs/${id}` } })}
              >
                Log in to submit application
              </button>
              <span className="text-xs text-ink-muted">Sign in as a candidate to apply.</span>
            </div>
          )}

          {(job.hasApplied || justApplied) && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 font-semibold text-emerald-800">
                <span>✓ Applied Successfully</span>
              </span>
              <Link to="/dashboard" className="font-semibold text-brand-900 hover:underline">
                View status in your Candidate Dashboard
              </Link>
            </div>
          )}

          {canApply && !justApplied && (
            <button
              type="button"
              className="btn-primary text-xs px-5 py-2"
              onClick={() => setShowApply(true)}
            >
              Apply for this position
            </button>
          )}

          {user?.role === 'candidate' && (
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() => toggleSave.mutate()}
              disabled={toggleSave.isPending}
            >
              {job.isSaved ? 'Remove bookmark' : 'Bookmark role'}
            </button>
          )}
        </div>
      </div>

      {/* Greenhouse Structured Hiring Process Roadmap */}
      <div className="card p-6 space-y-4">
        <div>
          <span className="chip bg-warm-subtle text-ink font-semibold text-[11px]">
            Greenhouse Candidate Experience
          </span>
          <h2 className="text-base font-bold text-ink mt-1.5">
            What to expect in our interview process
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            We follow a structured evaluation rubric so every candidate receives a fair, predictable, and transparent review.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
          <div className="rounded border border-warm-border bg-warm-subtle p-3 space-y-1">
            <span className="text-[10px] font-bold text-brand-900 uppercase">Step 01</span>
            <p className="text-xs font-semibold text-ink">Resume Triage</p>
            <p className="text-[11px] text-ink-muted">Blind screening to remove bias. Async parsing within 24h.</p>
          </div>

          <div className="rounded border border-warm-border bg-warm-subtle p-3 space-y-1">
            <span className="text-[10px] font-bold text-brand-900 uppercase">Step 02</span>
            <p className="text-xs font-semibold text-ink">Recruiter Connect</p>
            <p className="text-[11px] text-ink-muted">30 min call covering experience, compensation, and career fit.</p>
          </div>

          <div className="rounded border border-warm-border bg-warm-subtle p-3 space-y-1">
            <span className="text-[10px] font-bold text-brand-900 uppercase">Step 03</span>
            <p className="text-xs font-semibold text-ink">Scorecard Kit</p>
            <p className="text-[11px] text-ink-muted">45 min technical session evaluating architecture and problem solving.</p>
          </div>

          <div className="rounded border border-warm-border bg-warm-subtle p-3 space-y-1">
            <span className="text-[10px] font-bold text-brand-900 uppercase">Step 04</span>
            <p className="text-xs font-semibold text-ink">Offer & Next Steps</p>
            <p className="text-[11px] text-ink-muted">Written decision, transparent compensation breakdown, and onboarding.</p>
          </div>
        </div>

        <div className="pt-2 border-t border-warm-border flex flex-wrap items-center justify-between text-[11px] text-ink-muted">
          <span>✓ Equal Opportunity Employer</span>
          <span>✓ Real-time status notifications on candidate dashboard</span>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={showApply}
        onClose={() => setShowApply(false)}
        title={justApplied ? 'Application Status' : `Apply for ${job.title}`}
        maxWidth="max-w-xl"
      >
        <ApplyForm
          job={job}
          onClose={() => setShowApply(false)}
          onSuccessApplied={() => {
            setJustApplied(true);
          }}
        />
      </Modal>
    </div>
  );
}

function ApplyForm({
  job,
  onClose,
  onSuccessApplied,
}: {
  job: Job;
  onClose: () => void;
  onSuccessApplied: () => void;
}) {
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const applyMutation = useMutation({
    mutationFn: (body: FormData) => api.postForm(`/jobs/${job._id}/apply`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', job._id] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-stats'] });
      setAppliedSuccess(true);
      onSuccessApplied();
    },
    onError: (err) =>
      setError(err instanceof ApiRequestError ? err.message : 'Could not submit application'),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resume) {
      setError('Please attach your resume file (PDF or Word document, max 5 MB).');
      return;
    }

    const formData = new FormData();
    if (coverLetter.trim()) formData.append('coverLetter', coverLetter.trim());
    formData.append('resume', resume);

    applyMutation.mutate(formData);
  };

  if (appliedSuccess) {
    return (
      <div className="py-6 px-4 text-center space-y-4 animate-fade-in">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xs">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-ink">Applied Successfully!</h3>
          <p className="text-xs text-ink-muted max-w-md mx-auto">
            Your application for <strong className="text-ink">{job.title}</strong> at{' '}
            <strong className="text-ink">{job.company}</strong> has been received and queued for evaluation.
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-900 max-w-md mx-auto text-left space-y-1.5">
          <p className="font-semibold text-emerald-950">Next steps in your pipeline:</p>
          <ul className="list-disc list-inside space-y-0.5 text-emerald-800 text-[11px]">
            <li>Resume parsed and indexed for objective technical matching</li>
            <li>Recruiter team at {job.company} notified</li>
            <li>Track status updates and interview notifications in your Candidate Dashboard</li>
          </ul>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/dashboard" className="btn-primary text-xs px-4 py-2 font-semibold">
            Go to Candidate Dashboard →
          </Link>
          <button type="button" onClick={onClose} className="btn-secondary text-xs px-4 py-2">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <FormError message={error} />

      <p className="text-stone-600">
        Submitting to <strong>{job.company}</strong> for <strong>{job.title}</strong>. Your resume will be processed asynchronously into an objective technical profile.
      </p>

      <div>
        <label htmlFor="resume" className="label">
          Resume Document <span className="text-red-600">*</span>
        </label>
        <input
          type="file"
          id="resume"
          accept=".pdf,.doc,.docx"
          className="input text-xs cursor-pointer"
          onChange={(e) => setResume(e.target.files?.[0] ?? null)}
          required
        />
        <p className="mt-1 text-[11px] text-stone-500">
          Accepted: PDF, DOC, DOCX. Maximum size: 5 MB.
        </p>
      </div>

      <div>
        <label htmlFor="coverLetter" className="label">
          Cover Note (Optional)
        </label>
        <textarea
          id="coverLetter"
          rows={4}
          className="input text-xs"
          placeholder="Briefly state your relevant accomplishments and interest in this role..."
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          maxLength={3000}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
        <button type="button" className="btn-secondary text-xs" onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn-accent text-xs px-4"
          disabled={applyMutation.isPending}
        >
          {applyMutation.isPending ? 'Submitting Application...' : 'Submit Application'}
        </button>
      </div>
    </form>
  );
}
