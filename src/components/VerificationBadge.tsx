import type { VerificationStatus, Role } from '../types';

interface VerificationBadgeProps {
  isVerified?: boolean;
  status?: VerificationStatus;
  role?: Role;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function VerificationBadge({
  isVerified = false,
  status = 'unverified',
  role,
  size = 'md',
  showLabel = true,
  className = '',
}: VerificationBadgeProps) {
  // If isVerified is true, treat as verified
  const effectiveStatus: VerificationStatus = isVerified ? 'verified' : status;

  const roleLabel = role === 'recruiter' ? 'Recruiter' : role === 'candidate' ? 'Candidate' : 'Profile';

  if (effectiveStatus === 'verified') {
    return (
      <span
        title={`Verified ${roleLabel}: Identity & credentials confirmed by HireHive Trust & Safety Team`}
        className={`inline-flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full shadow-2xs transition-all ${
          size === 'sm'
            ? 'px-2 py-0.5 text-[10px]'
            : size === 'lg'
            ? 'px-3 py-1 text-xs'
            : 'px-2.5 py-0.5 text-[11px]'
        } ${className}`}
      >
        <svg
          className={size === 'sm' ? 'w-3 h-3 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
          />
        </svg>
        {showLabel && <span>Verified {roleLabel}</span>}
      </span>
    );
  }

  if (effectiveStatus === 'pending') {
    return (
      <span
        title="Verification documents submitted. Currently under review by HireHive Admin Team."
        className={`inline-flex items-center gap-1.5 font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full transition-all ${
          size === 'sm'
            ? 'px-2 py-0.5 text-[10px]'
            : size === 'lg'
            ? 'px-3 py-1 text-xs'
            : 'px-2.5 py-0.5 text-[11px]'
        } ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
        {showLabel && <span>Verification Pending</span>}
      </span>
    );
  }

  if (effectiveStatus === 'rejected') {
    return (
      <span
        title="Verification documents could not be validated. Please check feedback and re-upload."
        className={`inline-flex items-center gap-1.5 font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-full transition-all ${
          size === 'sm'
            ? 'px-2 py-0.5 text-[10px]'
            : size === 'lg'
            ? 'px-3 py-1 text-xs'
            : 'px-2.5 py-0.5 text-[11px]'
        } ${className}`}
      >
        <svg className="w-3 h-3 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clipRule="evenodd"
          />
        </svg>
        {showLabel && <span>Verification Needs Attention</span>}
      </span>
    );
  }

  // Unverified (default)
  return (
    <span
      title={`Not Verified: Upload verification documents to earn the Verified ${roleLabel} badge.`}
      className={`inline-flex items-center gap-1.5 font-medium text-stone-600 bg-stone-100 border border-stone-200 rounded-full transition-all ${
        size === 'sm'
          ? 'px-2 py-0.5 text-[10px]'
          : size === 'lg'
          ? 'px-3 py-1 text-xs'
          : 'px-2.5 py-0.5 text-[11px]'
      } ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
      {showLabel && <span>Not Verified</span>}
    </span>
  );
}
