import { useState, type FormEvent } from 'react';
import { Modal, ScorecardRatingBadge, type ScoreRating } from './ui';

export interface ScorecardSubmission {
  candidateId: string;
  candidateName: string;
  stage: string;
  interviewer: string;
  overallRating: ScoreRating;
  attributes: {
    technicalDepth: ScoreRating;
    problemSolving: ScoreRating;
    communication: ScoreRating;
    cultureAlignment: ScoreRating;
  };
  keyStrengths: string;
  areasOfConcern: string;
  submittedAt: string;
}

const RATING_OPTIONS: { id: ScoreRating; label: string }[] = [
  { id: 'strong-yes', label: 'Strong Yes' },
  { id: 'yes', label: 'Yes' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'no', label: 'No' },
  { id: 'strong-no', label: 'Strong No' },
];

export function ScorecardModal({
  isOpen,
  onClose,
  candidateId,
  candidateName,
  jobTitle,
  currentStage,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  currentStage: string;
  onSave?: (scorecard: ScorecardSubmission) => void;
}) {
  const [overallRating, setOverallRating] = useState<ScoreRating>('yes');
  const [technicalDepth, setTechnicalDepth] = useState<ScoreRating>('yes');
  const [problemSolving, setProblemSolving] = useState<ScoreRating>('yes');
  const [communication, setCommunication] = useState<ScoreRating>('neutral');
  const [cultureAlignment, setCultureAlignment] = useState<ScoreRating>('yes');
  const [keyStrengths, setKeyStrengths] = useState('');
  const [areasOfConcern, setAreasOfConcern] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const scorecard: ScorecardSubmission = {
      candidateId,
      candidateName,
      stage: currentStage,
      interviewer: 'Hiring Lead',
      overallRating,
      attributes: {
        technicalDepth,
        problemSolving,
        communication,
        cultureAlignment,
      },
      keyStrengths,
      areasOfConcern,
      submittedAt: new Date().toISOString(),
    };

    onSave?.(scorecard);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Interview Scorecard - ${candidateName}`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Context Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-warm-border bg-warm-subtle p-3 text-xs">
          <div>
            <p className="font-semibold text-ink">{jobTitle}</p>
            <p className="text-ink-muted">Evaluation Stage: <span className="font-medium text-ink capitalize">{currentStage}</span></p>
          </div>
          <div className="text-right">
            <span className="text-ink-muted">Guideline: Structured scorecard prevents subjective bias</span>
          </div>
        </div>

        {/* Overall Recommendation */}
        <div className="rounded-lg border border-warm-border bg-white p-4">
          <label className="label text-ink">Overall Hiring Recommendation</label>
          <p className="text-xs text-ink-muted mb-3">
            Synthesize all interview observations and select your definitive recommendation.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {RATING_OPTIONS.map((opt) => {
              const selected = overallRating === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setOverallRating(opt.id)}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded border text-xs font-semibold transition-all duration-fast ${
                    selected
                      ? 'border-brand-900 bg-brand-900 text-white shadow-sm ring-1 ring-brand-900'
                      : 'border-warm-border bg-warm-subtle text-ink hover:bg-warm-highlight'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Competencies Breakdown */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Attribute & Competency Ratings
          </p>

          {/* Technical Depth */}
          <div className="rounded border border-warm-border p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-ink">Technical Depth & Core Foundations</p>
              <p className="text-[11px] text-ink-muted">Syntax proficiency, architectural patterns, clean abstractions</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTechnicalDepth(opt.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                    technicalDepth === opt.id
                      ? 'border-brand-900 bg-brand-900 text-white'
                      : 'border-warm-border bg-warm-subtle text-ink-700 hover:bg-warm-highlight'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Problem Solving */}
          <div className="rounded border border-warm-border p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-ink">Problem Solving & Decomposition</p>
              <p className="text-[11px] text-ink-muted">Breaks down ambiguity, evaluates trade-offs, verifies edge conditions</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProblemSolving(opt.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                    problemSolving === opt.id
                      ? 'border-brand-900 bg-brand-900 text-white'
                      : 'border-warm-border bg-warm-subtle text-ink-700 hover:bg-warm-highlight'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Communication */}
          <div className="rounded border border-warm-border p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-ink">Communication & Technical Articulation</p>
              <p className="text-[11px] text-ink-muted">Clarity in explaining complexity, active listening, structured answers</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCommunication(opt.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                    communication === opt.id
                      ? 'border-brand-900 bg-brand-900 text-white'
                      : 'border-warm-border bg-warm-subtle text-ink-700 hover:bg-warm-highlight'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Culture Alignment */}
          <div className="rounded border border-warm-border p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-ink">Team Collaboration & Values Alignment</p>
              <p className="text-[11px] text-ink-muted">Constructive feedback receipt, ownership mindset, empathy with users</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCultureAlignment(opt.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                    cultureAlignment === opt.id
                      ? 'border-brand-900 bg-brand-900 text-white'
                      : 'border-warm-border bg-warm-subtle text-ink-700 hover:bg-warm-highlight'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Written Notes */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="keyStrengths" className="label">Key Demonstrations & Strengths</label>
            <textarea
              id="keyStrengths"
              rows={3}
              className="input resize-none"
              placeholder="Concrete examples of excellence during the session..."
              value={keyStrengths}
              onChange={(e) => setKeyStrengths(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="areasOfConcern" className="label">Risks or Topics for Follow-up</label>
            <textarea
              id="areasOfConcern"
              rows={3}
              className="input resize-none"
              placeholder="Gaps noticed to probe in next rounds..."
              value={areasOfConcern}
              onChange={(e) => setAreasOfConcern(e.target.value)}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-warm-border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted">Current rating:</span>
            <ScorecardRatingBadge rating={overallRating} />
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary text-xs" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs" disabled={submitted}>
              {submitted ? 'Scorecard Saved ✓' : 'Submit Scorecard'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
