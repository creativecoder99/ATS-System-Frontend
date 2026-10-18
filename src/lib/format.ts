import type { ApplicationStatus } from '../types';

/**
 * Formats salary in Indian Lakhs (L) without em dashes or en dashes.
 * Example: "₹8L to ₹14L".
 */
export function formatSalary(min: number, max: number): string {
  if (!min && !max) return 'Not disclosed';
  const lakh = (n: number) => {
    const value = n / 100_000;
    return `₹${Number.isInteger(value) ? value : value.toFixed(1)}L`;
  };
  if (min && max) return `${lakh(min)} to ${lakh(max)}`;
  return lakh(min || max);
}

export function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);

  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Restrained status styling without rainbow pastels.
 */
export const STATUS_STYLES: Record<ApplicationStatus, string> = {
  applied: 'bg-stone-100 text-stone-700 border-stone-200',
  shortlisted: 'bg-stone-200 text-stone-800 border-stone-300 font-medium',
  interview: 'bg-stone-800 text-stone-100 border-stone-900',
  offered: 'bg-[#0f2942] text-white border-[#0f2942] font-medium',
  rejected: 'bg-stone-100 text-stone-500 border-stone-200',
};

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatExperience(years: number): string {
  if (years <= 0) return 'Fresher';
  return `${years} ${years === 1 ? 'year' : 'years'} experience`;
}
