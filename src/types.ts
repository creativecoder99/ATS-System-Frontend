export type Role = 'candidate' | 'recruiter' | 'admin';
export type JobType = 'full-time' | 'part-time' | 'internship' | 'contract';
export type WorkMode = 'on-site' | 'remote' | 'hybrid';
export type JobStatus = 'open' | 'closed';
export type ApplicationStatus = 'applied' | 'shortlisted' | 'interview' | 'offered' | 'rejected';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'applied',
  'shortlisted',
  'interview',
  'offered',
  'rejected',
];

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  headline?: string;
  location?: string;
  skills: string[];
  experienceYears: number;
  company?: string;
  createdAt: string;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  workMode: WorkMode;
  type: JobType;
  skills: string[];
  salaryMin: number;
  salaryMax: number;
  experienceMin: number;
  openings: number;
  status: JobStatus;
  postedBy: string | Pick<User, '_id' | 'name' | 'company' | 'email'>;
  applicantCount: number;
  createdAt: string;
  hasApplied?: boolean;
  isSaved?: boolean;
}

export interface Application {
  _id: string;
  job: Job;
  applicant: User;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl: string;
  history: { status: ApplicationStatus; at: string; note?: string }[];
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface RecruiterStats {
  totals: { jobs: number; openJobs: number; closedJobs: number; applicants: number };
  pipeline: Record<ApplicationStatus, number>;
  topJobs: Pick<Job, '_id' | 'title' | 'company' | 'applicantCount' | 'status'>[];
  trend: { _id: string; count: number }[];
}

export interface CandidateStats {
  totals: { applications: number; responseRate: number };
  pipeline: Record<ApplicationStatus, number>;
  recent: Application[];
}
