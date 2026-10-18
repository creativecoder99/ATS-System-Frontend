import { Link } from 'react-router-dom';
import { formatRelativeDate, formatSalary, titleCase } from '../lib/format';
import { Tag } from './ui';
import type { Job } from '../types';

export function JobCard({ job }: { job: Job }) {
  return (
    <article className="card p-5 transition-colors hover:border-stone-400">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/jobs/${job._id}`}
            className="text-base font-semibold text-stone-900 hover:text-[#0f2942]"
          >
            {job.title}
          </Link>
          <p className="mt-0.5 text-xs font-medium text-stone-600">{job.company}</p>
        </div>
        <span className="shrink-0 text-xs text-stone-400">{formatRelativeDate(job.createdAt)}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
        <span>{job.location}</span>
        <span className="text-stone-300">/</span>
        <span>{titleCase(job.workMode)}</span>
        <span className="text-stone-300">/</span>
        <span>{titleCase(job.type)}</span>
        <span className="text-stone-300">/</span>
        <span className="font-semibold text-stone-900">
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

      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
        <span className="text-stone-500">
          {job.experienceMin === 0 ? 'Fresher friendly' : `${job.experienceMin}+ yrs experience`}
          {' · '}
          {job.applicantCount} applicant{job.applicantCount === 1 ? '' : 's'}
        </span>
        <Link
          to={`/jobs/${job._id}`}
          className="font-semibold text-[#0f2942] hover:underline"
        >
          View posting
        </Link>
      </div>
    </article>
  );
}
