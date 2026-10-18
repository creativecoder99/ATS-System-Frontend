import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiRequestError, BASE_URL, getAccessToken, toQuery } from '../lib/api';
import { formatDate, formatExperience } from '../lib/format';
import {
  ActivityFeedItem,
  EmptyState,
  ErrorState,
  FormError,
  Modal,
  Pager,
  PipelineStepper,
  ScorecardRatingBadge,
  SkeletonList,
  StatusBadge,
  Tag,
} from '../components/ui';
import { ScorecardModal, type ScorecardSubmission } from '../components/ScorecardModal';
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationStatus,
  type Job,
  type Paginated,
  type SearchApplicantResult,
  type CopilotResponse,
  type AiReview,
} from '../types';

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

  // Feature States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'semantic' | 'keyword'>('semantic');
  const [isSearching, setIsSearching] = useState(false);
  const [blindMode, setBlindMode] = useState(false);

  // Resume Viewer Modal State
  const [previewResumeAppId, setPreviewResumeAppId] = useState<string | null>(null);

  // Greenhouse Scorecard State
  const [scorecardApp, setScorecardApp] = useState<Application | null>(null);
  const [scorecards, setScorecards] = useState<Record<string, ScorecardSubmission>>({});

  // Activity Log Drawer State
  const [expandedActivityAppId, setExpandedActivityAppId] = useState<string | null>(null);

  // AI Evaluation Modal State
  const [evalApp, setEvalApp] = useState<Application | null>(null);
  const [evalData, setEvalData] = useState<AiReview | null>(null);

  // AI Copilot Panel State
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState('');
  const [copilotResponse, setCopilotResponse] = useState<CopilotResponse | null>(null);

  const query = toQuery({ status: statusFilter, page, limit: 10 });

  const jobQuery = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get<{ data: Job }>(`/jobs/${id}`),
    enabled: Boolean(id),
  });

  const applicantsQuery = useQuery({
    queryKey: ['job-applicants', id, query],
    queryFn: () => api.get<Paginated<Application>>(`/jobs/${id}/applications${query}`),
    enabled: Boolean(id) && !isSearching,
    placeholderData: keepPreviousData,
  });

  // Semantic Search Query
  const searchQueryHook = useQuery({
    queryKey: ['applicant-search', id, searchQuery, searchMode],
    queryFn: () =>
      api.get<{ success: boolean; data: SearchApplicantResult[] }>(
        `/jobs/${id}/applicants/search?query=${encodeURIComponent(searchQuery)}&mode=${searchMode}`
      ),
    enabled: Boolean(id) && isSearching && searchQuery.trim().length > 0,
  });

  const updateStatus = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) =>
      api.patch(`/applications/${applicationId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applicants', id] });
      queryClient.invalidateQueries({ queryKey: ['applicant-search', id] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-stats'] });
    },
    onError: (err) =>
      setError(err instanceof ApiRequestError ? err.message : 'Could not update status'),
  });

  const runAiEvaluation = useMutation({
    mutationFn: (applicationId: string) =>
      api.post<{ success: boolean; data: AiReview }>(`/applications/${applicationId}/ai-eval`),
    onSuccess: (res) => {
      setEvalData(res.data);
      queryClient.invalidateQueries({ queryKey: ['job-applicants', id] });
    },
    onError: (err) =>
      setError(err instanceof ApiRequestError ? err.message : 'AI Evaluation failed'),
  });

  const askCopilotMutation = useMutation({
    mutationFn: (promptText: string) =>
      api.post<{ success: boolean; data: CopilotResponse }>(`/jobs/${id}/ai-assistant`, {
        prompt: promptText,
      }),
    onSuccess: (res) => {
      setCopilotResponse(res.data);
    },
    onError: (err) =>
      setError(err instanceof ApiRequestError ? err.message : 'Copilot query failed'),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const downloadResume = async (application: Application) => {
    const res = await fetch(`${BASE_URL}/applications/${application._id}/resume`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      credentials: 'include',
    });
    if (!res.ok) {
      window.alert('Could not download resume.');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const name = blindMode
      ? application.redactedProfile?.anonymizedId ?? 'candidate'
      : application.applicant.name;
    link.download = `${name.replace(/\s+/g, '-').toLowerCase()}-resume`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openEvaluation = (app: Application) => {
    setEvalApp(app);
    if (app.aiReview) {
      setEvalData(app.aiReview);
    } else {
      setEvalData(null);
      runAiEvaluation.mutate(app._id);
    }
  };

  const job = jobQuery.data?.data;
  const applications = isSearching
    ? searchQueryHook.data?.data.map((r) => r.application) ?? []
    : applicantsQuery.data?.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      {/* Back link */}
      <div>
        <Link to="/recruiter/jobs" className="text-xs font-semibold text-stone-600 hover:text-stone-900">
          ← Back to active postings
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            {job?.title ?? 'Applicants'}
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            {job ? `${job.company} · ${job.location} · ${job.applicantCount} total applicant(s)` : 'Loading...'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Copilot Button */}
          <button
            type="button"
            onClick={() => setCopilotOpen(true)}
            className="btn-accent text-xs px-3 py-2"
          >
            AI Hiring Assistant
          </button>

          {/* Blind Mode Toggle */}
          <button
            type="button"
            onClick={() => setBlindMode(!blindMode)}
            className={`btn-secondary text-xs px-3 py-2 border ${
              blindMode ? 'bg-stone-900 text-white border-stone-900 font-semibold' : 'text-stone-700'
            }`}
          >
            {blindMode ? 'Blind Review: Active' : 'Enable Blind Review'}
          </button>
        </div>
      </div>

      {/* Greenhouse Pipeline Stage Stepper */}
      <div className="card p-3">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-warm-border text-xs">
          <span className="font-semibold text-ink">Greenhouse Stage Progression</span>
          <span className="text-ink-muted">Click stage to filter pipeline</span>
        </div>
        <PipelineStepper
          stages={[
            { id: '', label: 'All Candidates' },
            { id: 'applied', label: 'Application Review' },
            { id: 'shortlisted', label: 'Recruiter Screen' },
            { id: 'interview', label: 'Technical Interview' },
            { id: 'offered', label: 'Offer Stage' },
            { id: 'rejected', label: 'Archived' },
          ]}
          activeStageId={statusFilter}
          onStageSelect={(stageId) => {
            setStatusFilter(stageId);
            setPage(1);
          }}
        />
      </div>

      {/* Search and Filters Toolbar */}
      <div className="card p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              className="input pr-8 text-xs"
              placeholder="Search by keywords, technical stack, or semantic phrase (e.g. React microservices backend)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search applicants"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              className="input text-xs w-auto py-2"
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value as 'semantic' | 'keyword')}
              aria-label="Search mode"
            >
              <option value="semantic">Semantic AI Match</option>
              <option value="keyword">Exact Keyword Match</option>
            </select>

            <button type="submit" className="btn-primary text-xs px-4 py-2">
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 pt-1">
          <div className="flex items-center gap-2">
            <span>Filter stage:</span>
            <select
              className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              disabled={isSearching}
              aria-label="Filter status"
            >
              <option value="">All stages</option>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            {isSearching ? (
              <span className="font-medium text-stone-800">
                Found {applications.length} result(s) for "{searchQuery}"
              </span>
            ) : (
              <span>Showing {applications.length} applicant(s)</span>
            )}
          </div>
        </div>
      </div>

      <FormError message={error} />

      {/* Main Applicant List */}
      {applicantsQuery.isLoading || (isSearching && searchQueryHook.isLoading) ? (
        <SkeletonList count={3} />
      ) : applicantsQuery.isError ? (
        <ErrorState
          message="Could not load applicants for this job."
          onRetry={() => applicantsQuery.refetch()}
        />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applicants found"
          description={
            isSearching
              ? `No applicants matched the query "${searchQuery}". Try different keywords or switch to Semantic mode.`
              : 'There are no candidate applications for this position under the selected criteria.'
          }
          action={
            isSearching ? (
              <button type="button" onClick={handleClearSearch} className="btn-secondary text-xs">
                Clear search filter
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const next = NEXT_STATUSES[application.status];
            const searchResult = isSearching
              ? searchQueryHook.data?.data.find((r) => r.application._id === application._id)
              : null;

            const displayName = blindMode
              ? application.redactedProfile?.anonymizedId ?? 'Candidate'
              : application.applicant.name;

            const displaySummary = blindMode
              ? application.redactedProfile?.summary ?? application.parsedProfile?.summary
              : application.applicant.headline || application.parsedProfile?.summary;

            const displaySkills = application.parsedProfile?.skills?.length
              ? application.parsedProfile.skills
              : application.applicant.skills ?? [];

            const expYears = application.parsedProfile?.experienceYears ?? application.applicant.experienceYears;

            return (
              <article key={application._id} className="card p-5 space-y-4 border-stone-200">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-stone-900">{displayName}</h2>
                      <StatusBadge status={application.status} />

                      {/* Greenhouse Scorecard Badge */}
                      {scorecards[application._id] && (
                        <ScorecardRatingBadge rating={scorecards[application._id].overallRating} />
                      )}

                      {/* Search Score or AI Match Score */}
                      {searchResult ? (
                        <span className="chip bg-stone-900 text-white font-semibold text-[11px]">
                          {searchResult.score}% Query Fit
                        </span>
                      ) : application.aiReview ? (
                        <span className="chip bg-stone-800 text-stone-100 text-[11px]">
                          {application.aiReview.matchScore}% AI Fit
                        </span>
                      ) : null}
                    </div>

                    {displaySummary && (
                      <p className="mt-1 text-xs text-stone-600 max-w-2xl leading-relaxed">
                        {displaySummary}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                      <span>{formatExperience(expYears)}</span>
                      {!blindMode && application.applicant.location && (
                        <>
                          <span>·</span>
                          <span>{application.applicant.location}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>Applied {formatDate(application.createdAt)}</span>
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="btn-secondary text-xs px-2.5 py-1.5"
                      onClick={() => setPreviewResumeAppId(application._id)}
                    >
                      View Resume
                    </button>
                    <button
                      type="button"
                      className="btn-secondary text-xs px-2.5 py-1.5"
                      onClick={() => downloadResume(application)}
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      className="btn-secondary text-xs px-2.5 py-1.5"
                      onClick={() => setScorecardApp(application)}
                    >
                      {scorecards[application._id] ? 'Scorecard ✓' : 'Scorecard'}
                    </button>
                    <button
                      type="button"
                      className="btn-subtle text-xs px-2.5 py-1.5 font-semibold"
                      onClick={() => openEvaluation(application)}
                    >
                      AI Review
                    </button>
                  </div>
                </div>

                {/* Skills tags */}
                {displaySkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {displaySkills.slice(0, 8).map((skill) => (
                      <Tag key={skill}>{skill}</Tag>
                    ))}
                    {displaySkills.length > 8 && <Tag>+{displaySkills.length - 8} more</Tag>}
                  </div>
                )}

                {/* Cover letter snippet */}
                {application.coverLetter && (
                  <div className="rounded border border-stone-200 bg-stone-50/60 p-3 text-xs text-stone-700">
                    <span className="font-semibold text-stone-800 block mb-1">Cover Note:</span>
                    <p className="line-clamp-2">{application.coverLetter}</p>
                  </div>
                )}

                {/* Greenhouse Activity & Audit Trail Drawer */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedActivityAppId(
                        expandedActivityAppId === application._id ? null : application._id
                      )
                    }
                    className="text-xs text-brand-900 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    {expandedActivityAppId === application._id
                      ? '▲ Hide Stage Timeline & Notes'
                      : '▼ View Stage History & Interview Log'}
                  </button>

                  {expandedActivityAppId === application._id && (
                    <div className="mt-3 rounded border border-warm-border bg-warm-subtle p-3.5 space-y-2 animate-slide-down">
                      <p className="text-xs font-semibold text-ink mb-2">Stage Timeline & Activity Log</p>
                      <ActivityFeedItem
                        title="Application Received"
                        author={blindMode ? 'Candidate' : application.applicant.name}
                        timestamp={formatDate(application.createdAt)}
                        type="system"
                        note="Candidate applied via HireHive job portal."
                      />
                      {application.parsedProfile && (
                        <ActivityFeedItem
                          title="Resume Extracted"
                          author="HireHive Parser"
                          timestamp={formatDate(application.parsedProfile.parsedAt || application.createdAt)}
                          type="system"
                          note={`Extracted ${application.parsedProfile.skills.length} skills and ${application.parsedProfile.experienceYears} years experience.`}
                        />
                      )}
                      {scorecards[application._id] && (
                        <ActivityFeedItem
                          title={`Scorecard Submitted: ${scorecards[application._id].overallRating.toUpperCase()}`}
                          author={scorecards[application._id].interviewer}
                          timestamp={formatDate(scorecards[application._id].submittedAt)}
                          type="scorecard"
                          note={scorecards[application._id].keyStrengths || 'Structured evaluation recorded.'}
                        />
                      )}
                      {application.history.map((entry, idx) => (
                        <ActivityFeedItem
                          key={idx}
                          title={`Stage: ${entry.status.toUpperCase()}`}
                          author="Hiring Team"
                          timestamp={formatDate(entry.at)}
                          type="status"
                          note={entry.note}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Pipeline Advancement Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3 text-xs">
                  <div className="text-stone-500">
                    {application.history.length > 0 && (
                      <span>
                        Latest event: {application.history[application.history.length - 1].status} on{' '}
                        {formatDate(application.history[application.history.length - 1].at)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {next.map((target) => (
                      <button
                        key={target}
                        type="button"
                        disabled={updateStatus.isPending}
                        onClick={() =>
                          updateStatus.mutate({ applicationId: application._id, status: target })
                        }
                        className={
                          target === 'rejected'
                            ? 'btn-danger text-xs py-1 px-2.5'
                            : 'btn-primary text-xs py-1 px-2.5'
                        }
                      >
                        Advance to {target}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isSearching && applicantsQuery.data && (
        <Pager
          page={page}
          totalPages={applicantsQuery.data.pagination.totalPages}
          onChange={(p) => setPage(p)}
        />
      )}

      {/* Resume Inline Preview Modal */}
      <Modal
        isOpen={Boolean(previewResumeAppId)}
        onClose={() => setPreviewResumeAppId(null)}
        title="Resume Document Preview"
        maxWidth="max-w-4xl"
      >
        {previewResumeAppId && (
          <div className="space-y-4">
            <div className="h-[65vh] w-full rounded border border-stone-200 overflow-hidden bg-stone-100">
              <iframe
                src={`${BASE_URL}/applications/${previewResumeAppId}/resume/view`}
                title="Candidate Resume"
                className="h-full w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="btn-secondary text-xs"
                onClick={() => setPreviewResumeAppId(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* AI Candidate Evaluation Modal */}
      <Modal
        isOpen={Boolean(evalApp)}
        onClose={() => {
          setEvalApp(null);
          setEvalData(null);
        }}
        title={`AI Candidate Fit Evaluation`}
        maxWidth="max-w-2xl"
      >
        {runAiEvaluation.isPending ? (
          <div className="py-8 text-center text-xs text-stone-600">
            Analyzing candidate resume against {job?.title ?? 'job'} requirements...
          </div>
        ) : evalData ? (
          <div className="space-y-4 text-xs">
            {/* Score header */}
            <div className="rounded border border-stone-200 bg-stone-50 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-stone-500">Evaluation Rating</p>
                <p className="text-lg font-bold text-stone-900">{evalData.rating}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase font-semibold text-stone-500">Match Score</p>
                <p className="text-2xl font-bold text-stone-900">{evalData.matchScore}%</p>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <span className="font-semibold text-stone-800">Executive Assessment:</span>
              <p className="text-stone-600 leading-relaxed">{evalData.summary}</p>
            </div>

            {/* Strengths */}
            <div className="space-y-1.5">
              <span className="font-semibold text-stone-800">Key Strengths:</span>
              <ul className="list-disc pl-4 space-y-1 text-stone-600">
                {evalData.strengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div className="space-y-1.5">
              <span className="font-semibold text-stone-800">Identified Skill Gaps / Scrutiny:</span>
              <ul className="list-disc pl-4 space-y-1 text-stone-600">
                {evalData.gaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>

            {/* Suggested Interview Questions */}
            <div className="space-y-1.5 pt-2 border-t border-stone-200">
              <span className="font-semibold text-stone-800">Recommended Interview Questions:</span>
              <ol className="list-decimal pl-4 space-y-1 text-stone-600">
                {evalData.interviewQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Recruiter AI Copilot Assistant Modal */}
      <Modal
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        title="Recruiter AI Assistant Copilot"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-stone-600">
            Ask questions about the candidate pool for <strong>{job?.title}</strong>. The assistant evaluates real applicant resumes and skills.
          </p>

          <div className="flex flex-wrap gap-1.5 text-xs">
            <span className="text-stone-400">Quick prompts:</span>
            {[
              'Who is the top candidate?',
              'Compare top 2 applicants',
              'Who has the most experience?',
            ].map((qp) => (
              <button
                key={qp}
                type="button"
                onClick={() => {
                  setCopilotPrompt(qp);
                  askCopilotMutation.mutate(qp);
                }}
                className="chip bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300 cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (copilotPrompt.trim()) askCopilotMutation.mutate(copilotPrompt);
            }}
            className="flex gap-2"
          >
            <input
              className="input text-xs"
              placeholder="Ask the AI assistant about candidates..."
              value={copilotPrompt}
              onChange={(e) => setCopilotPrompt(e.target.value)}
            />
            <button
              type="submit"
              disabled={askCopilotMutation.isPending || !copilotPrompt.trim()}
              className="btn-accent text-xs px-4"
            >
              Ask
            </button>
          </form>

          {askCopilotMutation.isPending && (
            <div className="py-6 text-center text-xs text-stone-500">
              Analyzing applicant data...
            </div>
          )}

          {copilotResponse && (
            <div className="rounded border border-stone-200 bg-stone-50 p-4 space-y-3 text-xs">
              <div className="whitespace-pre-wrap text-stone-800 leading-relaxed">
                {copilotResponse.answer}
              </div>

              {copilotResponse.topCandidates && copilotResponse.topCandidates.length > 0 && (
                <div className="pt-2 border-t border-stone-200 space-y-2">
                  <span className="font-semibold text-stone-900">Ranked Matches:</span>
                  {copilotResponse.topCandidates.map((c) => (
                    <div key={c.candidateId} className="flex items-center justify-between p-2 rounded bg-white border border-stone-200">
                      <div>
                        <span className="font-semibold text-stone-900">{c.name}</span>
                        <p className="text-[11px] text-stone-500">{c.skills.slice(0, 4).join(', ')}</p>
                      </div>
                      <span className="chip bg-stone-900 text-white font-bold">{c.score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Greenhouse Scorecard Modal */}
      {scorecardApp && (
        <ScorecardModal
          isOpen={Boolean(scorecardApp)}
          onClose={() => setScorecardApp(null)}
          candidateId={scorecardApp._id}
          candidateName={
            blindMode
              ? scorecardApp.redactedProfile?.anonymizedId ?? 'Candidate'
              : scorecardApp.applicant.name
          }
          jobTitle={job?.title ?? 'Position'}
          currentStage={scorecardApp.status}
          onSave={(card) => {
            setScorecards((prev) => ({ ...prev, [card.candidateId]: card }));
          }}
        />
      )}
    </div>
  );
}
