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

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface VerificationDocument {
  _id?: string;
  docType: string;
  title: string;
  fileUrl: string;
  originalName: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  adminNotes?: string;
}

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
  resumeUrl?: string;

  // Contact & Social
  phone?: string;
  bio?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;

  // Candidate Details
  education?: string;
  currentCompany?: string;
  currentRole?: string;

  // Recruiter Details
  designation?: string;
  companyWebsite?: string;
  industry?: string;
  companySize?: string;
  officeAddress?: string;

  // Trust & Verification
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationDocuments?: VerificationDocument[];
  verificationSubmittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationRejectionReason?: string;

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
  postedBy: string | Pick<User, '_id' | 'name' | 'company' | 'email' | 'isVerified' | 'verificationStatus'>;
  applicantCount: number;
  createdAt: string;
  hasApplied?: boolean;
  isSaved?: boolean;
}

export interface HiringCompany {
  name: string;
  openJobs: number;
  locations: string[];
  skills: string[];
  types?: JobType[];
  workModes?: WorkMode[];
  latestJobDate?: string;
}


export interface ParsedProfile {
  skills: string[];
  experienceYears: number;
  education: string[];
  summary: string;
  rawTextSnippet?: string;
  parsedAt?: string;
}

export interface RedactedProfile {
  anonymizedId: string;
  skills: string[];
  experienceYears: number;
  educationDegrees: string[];
  summary: string;
}

export interface AiReview {
  matchScore: number;
  rating: 'Strong Match' | 'Moderate Match' | 'Potential Match' | 'Low Fit';
  strengths: string[];
  gaps: string[];
  interviewQuestions: string[];
  summary: string;
  analyzedAt?: string;
}

export interface Application {
  _id: string;
  job: Job;
  applicant: User;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl: string;
  history: { status: ApplicationStatus; at: string; note?: string }[];
  parsedProfile?: ParsedProfile;
  redactedProfile?: RedactedProfile;
  aiReview?: AiReview;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  recipient: string;
  type: 'status_update' | 'application_received' | 'job_alert' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface SearchApplicantResult {
  application: Application;
  score: number;
  matchedSkills: string[];
  matchSummary: string;
}

export interface RecruiterAiCandidate {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  jobId: string;
  score: number;
  skills: string[];
  experienceYears: number;
  location: string;
  strengths: string[];
  verdict: string;
}

export interface RecruiterAiResponse {
  answer: string;
  topCandidates: RecruiterAiCandidate[];
  suggestedAction?: 'interview' | 'shortlist' | 'review';
  usedLlm: boolean;
}

export interface CandidateAiJob {
  jobId: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  type: string;
  salaryRange: string;
  score: number;
  matchReasons: string[];
  experienceRequirement: string;
  requiredSkills: string[];
}

export interface CandidateAiResponse {
  answer: string;
  recommendedJobs: CandidateAiJob[];
  tips?: string[];
  usedLlm: boolean;
}

export interface CopilotResponse {
  answer: string;
  suggestedAction?: 'shortlist' | 'interview' | 'review';
  topCandidates?: {
    candidateId?: string;
    applicationId?: string;
    name?: string;
    candidateName?: string;
    score: number;
    skills: string[];
    summary?: string;
    verdict?: string;
    strengths?: string[];
  }[];
  usedLlm?: boolean;
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
