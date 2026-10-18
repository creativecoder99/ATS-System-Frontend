import type { ReactNode } from 'react';
import { STATUS_STYLES, titleCase } from '../lib/format';
import type { ApplicationStatus } from '../types';

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-stone-600" role="status">
      <svg className="h-5 w-5 animate-spin text-stone-800" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="text-sm">{label}...</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-5 w-1/3 skeleton" />
        <div className="h-4 w-16 skeleton" />
      </div>
      <div className="h-4 w-1/2 skeleton" />
      <div className="space-y-1.5 pt-2">
        <div className="h-3 w-full skeleton" />
        <div className="h-3 w-4/5 skeleton" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-5 w-16 skeleton" />
        <div className="h-5 w-16 skeleton" />
        <div className="h-5 w-16 skeleton" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card p-8 text-center border-stone-300" role="alert">
      <p className="text-sm font-medium text-stone-800">{message}</p>
      {onRetry && (
        <button type="button" className="btn-secondary mt-4" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="card p-10 text-center border-stone-200">
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`chip ${STATUS_STYLES[status]}`}>{titleCase(status)}</span>;
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="chip bg-stone-100 text-stone-700 border-stone-200">{children}</span>;
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-stone-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-stone-300 bg-stone-100 p-3 text-sm text-stone-800" role="alert">
      {message}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-stone-700 font-medium">{message}</p>;
}

export function Modal({
  isOpen = true,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
}: {
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-lg border border-stone-300 bg-white p-6 shadow-md`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
          <button
            type="button"
            className="rounded p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900 focus-visible:ring-1"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}

export function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
      <button
        type="button"
        className="btn-secondary text-xs"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span className="px-3 text-xs font-medium text-stone-700">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="btn-secondary text-xs"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}

export type ScoreRating = 'strong-yes' | 'yes' | 'neutral' | 'no' | 'strong-no';

export function ScorecardRatingBadge({ rating }: { rating: ScoreRating }) {
  switch (rating) {
    case 'strong-yes':
      return <span className="score-strong-yes">Strong Yes</span>;
    case 'yes':
      return <span className="score-yes">Yes</span>;
    case 'neutral':
      return <span className="score-neutral">Neutral</span>;
    case 'no':
      return <span className="score-no">No</span>;
    case 'strong-no':
      return <span className="score-strong-no">Strong No</span>;
  }
}

export interface PipelineStage {
  id: string;
  label: string;
  count?: number;
}

export function PipelineStepper({
  stages,
  activeStageId,
  onStageSelect,
}: {
  stages: PipelineStage[];
  activeStageId: string;
  onStageSelect?: (stageId: string) => void;
}) {
  const activeIndex = stages.findIndex((s) => s.id === activeStageId);

  return (
    <div className="w-full overflow-x-auto py-2" role="navigation" aria-label="Pipeline Stages">
      <div className="flex items-center min-w-[560px] gap-2">
        {stages.map((stage, idx) => {
          const isDone = idx < activeIndex;
          const isActive = idx === activeIndex;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onStageSelect?.(stage.id)}
              disabled={!onStageSelect}
              className={`flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded text-xs transition-all duration-fast ${
                isActive
                  ? 'bg-brand-900 text-white font-semibold shadow-sm'
                  : isDone
                  ? 'bg-warm-subtle text-ink-800 border border-warm-border hover:bg-warm-highlight'
                  : 'bg-white text-ink-muted border border-warm-border/80 hover:border-warm-border'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                      : 'bg-warm-border text-ink-muted'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </span>
                <span className="truncate">{stage.label}</span>
              </div>
              {stage.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-warm-highlight text-ink-700'
                  }`}
                >
                  {stage.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function KpiTrendCard({
  title,
  value,
  trend,
  trendLabel,
  subtitle,
}: {
  title: string;
  value: string | number;
  trend?: { direction: 'up' | 'down' | 'neutral'; percent: number };
  trendLabel?: string;
  subtitle?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{title}</p>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-semibold ${
              trend.direction === 'up'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : trend.direction === 'down'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '•'}{' '}
            {trend.percent}%
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{value}</p>
      {(trendLabel || subtitle) && (
        <p className="mt-1 text-xs text-ink-muted">{trendLabel || subtitle}</p>
      )}
    </div>
  );
}

export function ActivityFeedItem({
  title,
  author,
  timestamp,
  note,
  type = 'status',
}: {
  title: string;
  author?: string;
  timestamp: string;
  note?: string;
  type?: 'status' | 'interview' | 'scorecard' | 'system';
}) {
  const iconColor =
    type === 'scorecard'
      ? 'bg-purple-100 text-purple-800'
      : type === 'interview'
      ? 'bg-blue-100 text-blue-800'
      : type === 'status'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-stone-100 text-stone-700';

  return (
    <div className="flex gap-3 text-xs">
      <div className="flex flex-col items-center">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-[10px] ${iconColor}`}
        >
          {type === 'scorecard' ? '★' : type === 'interview' ? '◷' : '●'}
        </span>
        <div className="w-px grow bg-warm-border my-1" />
      </div>
      <div className="pb-4 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-ink">{title}</p>
          <span className="text-ink-muted text-[11px] shrink-0">{timestamp}</span>
        </div>
        {author && <p className="text-ink-muted mt-0.5">By {author}</p>}
        {note && (
          <div className="mt-1.5 rounded border border-warm-border bg-warm-subtle p-2 text-ink-800 italic">
            "{note}"
          </div>
        )}
      </div>
    </div>
  );
}
