import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api, ApiRequestError } from '../lib/api';
import type { CandidateAiResponse } from '../types';

export function CandidateAiAdvisor() {
  const [prompt, setPrompt] = useState('');
  const [aiResult, setAiResult] = useState<CandidateAiResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const aiMutation = useMutation({
    mutationFn: (promptText: string) =>
      api.post<{ success: boolean; data: CandidateAiResponse }>('/jobs/candidate/ai-assistant', {
        prompt: promptText,
      }),
    onSuccess: (res) => {
      setAiResult(res.data);
      setErrorMessage(null);
    },
    onError: (err) => {
      setErrorMessage(
        err instanceof ApiRequestError ? err.message : 'Failed to query AI Career Advisor'
      );
    },
  });

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    aiMutation.mutate(prompt.trim());
  };

  const handleQuickAsk = (text: string) => {
    setPrompt(text);
    aiMutation.mutate(text);
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
              Gemini AI Career Advisor
            </h2>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Powered by Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-ink-muted">
            Ask for tailored job recommendations based on your desired role, preferred location, experience level, or stack.
          </p>
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            placeholder="e.g. 'Recommend all jobs related to software developer', 'Find remote roles for 2 years experience with React and TypeScript', 'Show me entry-level jobs in Bangalore paying above 8 LPA'..."
            className="input w-full text-xs sm:text-sm py-2.5 px-3 resize-none border-warm-border focus:border-brand-900 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-ink-muted mr-1">Suggestions:</span>
            {[
              'Recommend all jobs related to software developer',
              'Find remote React & TypeScript jobs',
              'Show jobs in Bangalore suitable for 1-2 years experience',
              'Roles matching my skills & profile',
            ].map((qp) => (
              <button
                key={qp}
                type="button"
                onClick={() => handleQuickAsk(qp)}
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
                <span>Searching Matches...</span>
              </>
            ) : (
              <>
                <span>✦ Recommend Jobs</span>
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
            <div className="h-32 bg-stone-100 rounded border border-warm-border" />
            <div className="h-32 bg-stone-100 rounded border border-warm-border" />
          </div>
        </div>
      )}

      {/* Results Section */}
      {aiResult && !aiMutation.isPending && (
        <div className="space-y-4 pt-3 border-t border-warm-border animate-fade-in">
          {/* AI Markdown Advice Box */}
          <div className="rounded-lg border border-warm-border bg-white p-4 text-xs sm:text-sm leading-relaxed text-ink space-y-2 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-warm-border text-xs text-ink-muted">
              <span className="font-semibold text-brand-900">Career Advisor Recommendations</span>
              <span className="chip text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold">
                {aiResult.usedLlm ? 'Gemini 3.8 Flash' : 'Smart Heuristic'}
              </span>
            </div>
            <div className="whitespace-pre-line text-ink-800">
              {aiResult.answer}
            </div>
          </div>

          {/* Recommended Jobs Cards */}
          {aiResult.recommendedJobs && aiResult.recommendedJobs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Recommended Opportunities ({aiResult.recommendedJobs.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiResult.recommendedJobs.map((job, idx) => (
                  <div
                    key={`${job.jobId}-${idx}`}
                    className="card p-4 bg-white border-warm-border space-y-3 hover:border-brand-900 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Title, Company and Match Score */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-ink leading-tight">
                            {job.title}
                          </h4>
                          <p className="text-xs text-ink-muted font-medium mt-0.5">{job.company}</p>
                        </div>

                        <span className="chip text-xs font-bold bg-emerald-50 text-emerald-800 border-emerald-200 shrink-0">
                          {job.score}% Match
                        </span>
                      </div>

                      {/* Location, Mode, and Salary */}
                      <div className="flex flex-wrap gap-1.5 pt-2 text-[11px]">
                        <span className="chip bg-warm-subtle text-ink font-medium">
                          📍 {job.location}
                        </span>
                        <span className="chip bg-warm-subtle text-ink font-medium uppercase text-[10px]">
                          {job.workMode}
                        </span>
                        <span className="chip bg-warm-subtle text-ink font-medium">
                          💰 {job.salaryRange}
                        </span>
                        <span className="chip bg-warm-subtle text-ink font-medium">
                          ⏳ {job.experienceRequirement}
                        </span>
                      </div>

                      {/* Match Reasons */}
                      {job.matchReasons && job.matchReasons.length > 0 && (
                        <div className="pt-2 text-[11px] text-ink-muted space-y-1">
                          <p className="font-semibold text-ink">Why it matches:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            {job.matchReasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Required Skills */}
                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {job.requiredSkills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-warm-subtle text-ink-700 border border-warm-border"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-warm-border flex items-center gap-2">
                      <Link
                        to={`/jobs/${job.jobId}`}
                        className="btn-secondary flex-1 text-center text-xs py-1.5"
                      >
                        View Job Details
                      </Link>
                      <Link
                        to={`/jobs/${job.jobId}`}
                        className="btn-primary flex-1 text-center text-xs py-1.5"
                      >
                        Apply Now →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preparation Tips */}
          {aiResult.tips && aiResult.tips.length > 0 && (
            <div className="rounded-lg border border-warm-border bg-warm-subtle/50 p-3 text-xs text-ink-muted space-y-1">
              <span className="font-semibold text-ink">✦ Application Tips:</span>
              <ul className="list-disc list-inside space-y-0.5 pt-0.5">
                {aiResult.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
