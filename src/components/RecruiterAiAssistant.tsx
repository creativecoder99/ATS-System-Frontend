import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, ApiRequestError } from '../lib/api';
import type { Job, Paginated, RecruiterAiResponse } from '../types';

interface RecruiterAiAssistantProps {
  initialJobId?: string;
}

export function RecruiterAiAssistant({ initialJobId }: RecruiterAiAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || 'all');
  const [aiResult, setAiResult] = useState<RecruiterAiResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch recruiter's jobs to populate the dropdown filter
  const { data: myJobsData } = useQuery({
    queryKey: ['my-jobs-for-ai'],
    queryFn: () => api.get<Paginated<Job>>('/jobs?limit=50&sort=newest'),
  });

  const jobsList = myJobsData?.data ?? [];

  const aiMutation = useMutation({
    mutationFn: (promptText: string) =>
      api.post<{ success: boolean; data: RecruiterAiResponse }>('/jobs/recruiter/ai-assistant', {
        prompt: promptText,
        jobId: selectedJobId === 'all' ? undefined : selectedJobId,
      }),
    onSuccess: (res) => {
      setAiResult(res.data);
      setErrorMessage(null);
    },
    onError: (err) => {
      setErrorMessage(
        err instanceof ApiRequestError ? err.message : 'Failed to query Gemini AI assistant'
      );
    },
  });

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    aiMutation.mutate(prompt.trim());
  };

  const handleQuickPrompt = (quickText: string) => {
    setPrompt(quickText);
    aiMutation.mutate(quickText);
  };

  return (
    <section className="card p-6 border-warm-border bg-gradient-to-b from-white to-warm-subtle/30 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-warm-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-900 text-xs font-bold text-white shadow-xs">
              ✦
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-ink">
              Gemini AI Hiring Assistant
            </h2>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Powered by Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-ink-muted">
            Ask Gemini to rank, compare, and recommend the best candidates across all applied applicants.
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="ai-role-select" className="text-xs font-medium text-ink-muted shrink-0">
            Scope:
          </label>
          <select
            id="ai-role-select"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="input py-1 px-2.5 text-xs rounded border-warm-border bg-white text-ink font-medium"
          >
            <option value="all">All Active Roles ({jobsList.length})</option>
            {jobsList.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.applicantCount || 0} applicants)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            placeholder="e.g. 'Who is the best candidate for our Software Developer opening?', 'Find someone with 3+ years experience and strong React/TypeScript skills', 'Compare the top 2 applicants'..."
            className="input w-full text-xs sm:text-sm py-2.5 px-3 resize-none border-warm-border focus:border-brand-900 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-ink-muted mr-1">Quick asks:</span>
            {[
              'Who is the best candidate overall?',
              'Find candidates with 2+ years experience and React expertise',
              'Who has the strongest backend API skills?',
              'Compare top applicants',
            ].map((qp) => (
              <button
                key={qp}
                type="button"
                onClick={() => handleQuickPrompt(qp)}
                disabled={aiMutation.isPending}
                className="chip text-[11px] bg-white hover:bg-warm-subtle hover:text-brand-900 hover:border-brand-900 transition-colors cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={aiMutation.isPending || !prompt.trim()}
            className="btn-primary text-xs sm:text-sm px-4 py-2 shrink-0 flex items-center gap-2"
          >
            {aiMutation.isPending ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Evaluating Candidates...</span>
              </>
            ) : (
              <>
                <span>✦ Ask Gemini</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          {errorMessage}
        </div>
      )}

      {/* Loading Skeleton */}
      {aiMutation.isPending && (
        <div className="space-y-3 pt-2 animate-pulse">
          <div className="h-4 bg-stone-200 rounded w-3/4" />
          <div className="h-4 bg-stone-200 rounded w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="h-28 bg-stone-100 rounded border border-warm-border" />
            <div className="h-28 bg-stone-100 rounded border border-warm-border" />
          </div>
        </div>
      )}

      {/* Results Section */}
      {aiResult && !aiMutation.isPending && (
        <div className="space-y-4 pt-3 border-t border-warm-border animate-fade-in">
          {/* AI Markdown Analysis Box */}
          <div className="rounded-lg border border-warm-border bg-white p-4 text-xs sm:text-sm leading-relaxed text-ink space-y-2 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-warm-border text-xs text-ink-muted">
              <span className="font-semibold text-brand-900">Gemini Synthesis & Recommendation</span>
              <span className="chip text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold">
                {aiResult.usedLlm ? 'Gemini 3.8 Flash' : 'Structured Heuristic'}
              </span>
            </div>
            <div className="whitespace-pre-line text-ink-800">
              {aiResult.answer}
            </div>
          </div>

          {/* Top Candidates Cards */}
          {aiResult.topCandidates && aiResult.topCandidates.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Evaluated Top Candidates ({aiResult.topCandidates.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {aiResult.topCandidates.map((cand, idx) => (
                  <div
                    key={`${cand.applicationId}-${idx}`}
                    className="card p-4 bg-white border-warm-border space-y-3 hover:border-brand-900 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Name and Match Score */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-900 text-xs font-bold text-white shrink-0">
                            {cand.candidateName.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-ink leading-tight">
                              {cand.candidateName}
                            </h4>
                            <p className="text-[11px] text-ink-muted">{cand.jobTitle}</p>
                          </div>
                        </div>

                        <span className="chip text-xs font-bold bg-emerald-50 text-emerald-800 border-emerald-200 shrink-0">
                          {cand.score}% Fit
                        </span>
                      </div>

                      {/* Experience and Location */}
                      <div className="flex flex-wrap gap-2 text-[11px] text-ink-muted pt-2">
                        <span>💼 {cand.experienceYears} yrs experience</span>
                        <span>📍 {cand.location}</span>
                      </div>

                      {/* Skills */}
                      {cand.skills && cand.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {cand.skills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-warm-subtle text-ink border border-warm-border"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Strengths */}
                      {cand.strengths && cand.strengths.length > 0 && (
                        <ul className="pt-2 space-y-1 text-[11px] text-ink-muted list-disc list-inside">
                          {cand.strengths.slice(0, 2).map((str, i) => (
                            <li key={i} className="line-clamp-2">
                              {str}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-warm-border">
                      <Link
                        to={`/recruiter/jobs/${cand.jobId || 'all'}/applicants`}
                        className="btn-secondary w-full text-center text-xs py-1.5 block hover:bg-brand-900 hover:text-white transition-colors"
                      >
                        Inspect Application & Scorecard →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
