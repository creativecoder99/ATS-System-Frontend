import { Link } from 'react-router-dom';
import { formatRelativeDate, formatSalary, titleCase } from '../lib/format';
import { Tag } from './ui';
import type { Job } from '../types';

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/jobs/${job._id}`}
            className="text-base font-semibold text-slate-900 hover:text-brand-700"
          >
            {job.title}
          </Link>
          <p className="mt-0.5 text-sm text-slate-600">{job.company}</p>
        </div>
        <span className="shrink-0 text-xs text-slate-400">{formatRelativeDate(job.createdAt)}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
        <span>{job.location}</span>
        <span className="text-slate-300">·</span>
        <span>{titleCase(job.workMode)}</span>
        <span className="text-slate-300">·</span>
        <span>{titleCase(job.type)}</span>
        <span className="text-slate-300">·</span>
        <span className="font-medium text-slate-800">
          {formatSalary(job.salaryMin, job.salaryMax)}
        </span>
      </div>

      {job.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 5).map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
          {job.skills.length > 5 && <Tag>+{job.skills.length - 5}</Tag>}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-500">
          {job.experienceMin === 0 ? 'Fresher friendly' : `${job.experienceMin}+ yrs experience`}
          {' · '}
          {job.applicantCount} applicant{job.applicantCount === 1 ? '' : 's'}
        </span>
        <Link to={`/jobs/${job._id}`} className="text-sm font-medium text-brand-700 hover:underline">
          View details →
        </Link>
      </div>
    </article>
  );
}
