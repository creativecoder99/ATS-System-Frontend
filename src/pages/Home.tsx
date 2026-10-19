import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { JobCard } from '../components/JobCard';
import { CompanySlider } from '../components/CompanySlider';
import {
  ScorecardRatingBadge,
  SkeletonList,
  type ScoreRating,
} from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import type { Job, Paginated } from '../types';

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Interactive Greenhouse Product Demo State
  const [activeStage, setActiveStage] = useState('screen');
  const [demoScorecardRating, setDemoScorecardRating] = useState<ScoreRating>('strong-yes');
  const [demoBlindReview, setDemoBlindReview] = useState(false);

  // Hiring ROI Calculator State
  const [openRolesCount, setOpenRolesCount] = useState(12);
  const [avgCycleDays, setAvgCycleDays] = useState(38);

  // AI Dual Intelligence Showcase State
  const [aiShowcaseTab, setAiShowcaseTab] = useState<'candidate' | 'recruiter'>('candidate');
  const [sampleJobQuery, setSampleJobQuery] = useState<'fullstack' | 'frontend' | 'backend'>('fullstack');
  const [screeningBlindMode, setScreeningBlindMode] = useState(true);

  const sampleRecommendedJobs = {
    fullstack: {
      title: 'Full Stack Developer (MERN)',
      company: 'TechCorp India',
      location: 'Bangalore (Hybrid)',
      matchScore: 98,
      salary: '₹8,00,000 - ₹14,00,000',
      matchedSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
      reasoning:
        'Direct alignment on core skills: React, Node.js, and MongoDB. Candidate matches the 1+ years experience threshold and compensation expectations perfectly.',
    },
    frontend: {
      title: 'Frontend Engineer - React',
      company: 'FinStack',
      location: 'Pune (Remote)',
      matchScore: 95,
      salary: '₹9,00,000 - ₹16,00,000',
      matchedSkills: ['React', 'TypeScript', 'CSS', 'Vitest'],
      reasoning:
        'Exemplary score in responsive UI architecture, accessible design tokens, and modern React component performance.',
    },
    backend: {
      title: 'Software Engineer - Platform',
      company: 'CloudBridge',
      location: 'Bangalore (Hybrid)',
      matchScore: 92,
      salary: '₹12,00,000 - ₹22,00,000',
      matchedSkills: ['Node.js', 'Docker', 'AWS', 'CI/CD'],
      reasoning:
        'Solid background in distributed API microservices, containerization, and relational database indexing.',
    },
  };

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', 'latest'],
    queryFn: () => api.get<Paginated<Job>>('/jobs?limit=8&sort=newest'),
  });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/jobs${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  };

  // Filter jobs by department keyword if selected
  const allJobs = data?.data ?? [];
  const filteredJobs =
    selectedDept === 'All'
      ? allJobs
      : allJobs.filter((job) => {
          const t = `${job.title} ${job.description}`.toLowerCase();
          if (selectedDept === 'Engineering')
            return t.includes('engineer') || t.includes('developer') || t.includes('full stack') || t.includes('backend');
          if (selectedDept === 'Product & Design')
            return t.includes('product') || t.includes('design') || t.includes('ui') || t.includes('ux');
          if (selectedDept === 'Data & Cloud')
            return t.includes('data') || t.includes('devops') || t.includes('cloud') || t.includes('ai');
          return true;
        });

  // Calculate ROI
  const daysSavedPerHire = Math.max(8, Math.round(avgCycleDays * 0.42));
  const totalHoursSavedYearly = openRolesCount * 28;
  const pipelineCostReduction = openRolesCount * 145000;

  return (
    <div className="space-y-20 py-8 sm:py-14 animate-fade-in">
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Headline & Search */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-warm-border bg-warm-subtle px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-700">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              Dual AI Hiring Intelligence
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold tracking-tight text-ink leading-[1.2]">
                AI Job Recommendations.
                <span className="block text-brand-900 mt-1">
                  Precision Screening for Recruiters.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-ink-muted leading-relaxed max-w-xl">
                Smart vector matching connects candidates with their ideal career moves, while automated resume parsing and 0-100 fit scores help recruiters identify top talent with zero bias.
              </p>
            </div>

            {/* AI Dual Intelligence Feature Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-900 shadow-xs">
                <span className="text-blue-600 font-bold">✦</span>
                <span>AI Job Recommender for Candidates</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-900 shadow-xs">
                <span className="text-emerald-600 font-bold">🎯</span>
                <span>AI Candidate Screening for Recruiters</span>
              </span>
            </div>

            {/* Quick Search */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-md pt-1">
              <input
                className="input flex-1 text-xs sm:text-sm"
                placeholder="Search by job title, skill, or location..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search jobs"
              />
              <button type="submit" className="btn-primary px-5 text-xs sm:text-sm shrink-0">
                Search Roles
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {!user ? (
                <>
                  <Link to="/register" className="btn-primary text-xs sm:text-sm">
                    Start Hiring
                  </Link>
                  <Link to="/jobs" className="btn-secondary text-xs sm:text-sm">
                    Browse 12+ Open Roles
                  </Link>
                </>
              ) : user.role === 'recruiter' ? (
                <Link to="/recruiter" className="btn-primary text-xs sm:text-sm">
                  Go to Recruiting Pipeline →
                </Link>
              ) : (
                <Link to="/dashboard" className="btn-primary text-xs sm:text-sm">
                  Go to Candidate Dashboard →
                </Link>
              )}
            </div>

            {/* Quick trust metrics */}
            <div className="pt-2 border-t border-warm-border flex flex-wrap items-center gap-6 text-xs text-ink-muted">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-ink">98.4%</span> Scorecard SLA
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-ink">0%</span> Subjective Bias
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-ink">WCAG 2.2</span> AA Accessible
              </div>
            </div>
          </div>

          {/* Interactive Greenhouse ATS Simulator */}
          <div className="lg:col-span-6">
            <div className="card-interactive p-5 shadow-sm space-y-4 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-warm-border">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-900 text-xs font-bold text-white">
                    HH
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink">
                    Interactive Scorecard Simulator
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDemoBlindReview(!demoBlindReview)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                    demoBlindReview
                      ? 'bg-brand-900 text-white border-brand-900 font-semibold'
                      : 'bg-warm-subtle text-ink-700 border-warm-border hover:bg-warm-highlight'
                  }`}
                >
                  {demoBlindReview ? 'Blind Review: On' : 'Enable Blind Review'}
                </button>
              </div>

              {/* Interactive Pipeline Stage Bar */}
              <div>
                <p className="text-[11px] font-semibold text-ink-muted uppercase mb-1.5">
                  Click stage to preview candidate evaluation:
                </p>
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                  {[
                    { id: 'applied', label: '1. Review' },
                    { id: 'screen', label: '2. Phone Screen' },
                    { id: 'scorecard', label: '3. Scorecard' },
                    { id: 'offer', label: '4. Offer Stage' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setActiveStage(st.id)}
                      className={`py-1.5 px-2 rounded font-medium transition-all duration-fast ${
                        activeStage === st.id
                          ? 'bg-brand-900 text-white shadow-sm font-semibold'
                          : 'bg-warm-subtle text-ink-muted hover:bg-warm-highlight border border-warm-border'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Candidate Card with Dynamic Stage Info */}
              <div className="rounded border border-warm-border bg-warm-subtle/80 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-ink">
                        {demoBlindReview ? 'Candidate #8042 (Redacted)' : 'Abhinav Tarigoppula'}
                      </h3>
                      <ScorecardRatingBadge rating={demoScorecardRating} />
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {demoBlindReview
                        ? 'Full Stack Engineer · 3 Years Experience'
                        : 'Senior Full Stack Developer · Visakhapatnam, India'}
                    </p>
                  </div>
                  <span className="chip bg-brand-900 text-white border-brand-900 font-bold text-xs">
                    98% Match
                  </span>
                </div>

                {/* Scorecard Competencies Demo */}
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex justify-between text-ink-muted">
                    <span className="font-medium text-ink">System Architecture & APIs:</span>
                    <span className="font-semibold text-emerald-800">Strong Yes (4.9/5)</span>
                  </div>
                  <div className="h-1.5 w-full rounded bg-warm-border overflow-hidden">
                    <div className="h-full bg-emerald-700 rounded" style={{ width: '96%' }} />
                  </div>

                  <div className="flex justify-between text-ink-muted pt-1">
                    <span className="font-medium text-ink">Collaborative Problem Solving:</span>
                    <span className="font-semibold text-emerald-800">Yes (4.5/5)</span>
                  </div>
                  <div className="h-1.5 w-full rounded bg-warm-border overflow-hidden">
                    <div className="h-full bg-emerald-700 rounded" style={{ width: '88%' }} />
                  </div>
                </div>

                {/* Interactive Rating Pills */}
                <div className="pt-2 border-t border-warm-border">
                  <p className="text-[11px] font-semibold text-ink-muted mb-1.5">
                    Test Interviewer Overall Recommendation:
                  </p>
                  <div className="flex flex-wrap gap-1 text-xs">
                    {(['strong-yes', 'yes', 'neutral', 'no'] as ScoreRating[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setDemoScorecardRating(r)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          demoScorecardRating === r
                            ? 'ring-2 ring-brand-900 font-semibold'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <ScorecardRatingBadge rating={r} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded border border-warm-border bg-white p-2.5 text-xs text-ink-700 space-y-1">
                  <div className="font-semibold text-ink">Scorecard Takeaway (Stage: {activeStage}):</div>
                  <p className="text-ink-muted text-[11px] leading-relaxed">
                    "Candidate articulated distributed state caching tradeoffs cleanly. Demonstrated rigorous automated test suites and high alignment with engineering values."
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-ink-muted pt-1">
                <span>✓ Automated PDF text extraction</span>
                <span>✓ Blind PII Redaction ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Associated Companies Infinite Logo Slider */}
      <CompanySlider />

      {/* AI Intelligence Showcase Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="card border-warm-border bg-gradient-to-br from-white via-warm-subtle/40 to-white p-6 sm:p-10 shadow-sm space-y-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-warm-border">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-900/20 bg-brand-900/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-900">
                <span className="flex h-2 w-2 rounded-full bg-brand-900 animate-ping" />
                Dual AI Intelligence
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                AI Job Recommender & AI Candidate Screening
              </h2>
              <p className="text-sm text-ink-muted leading-relaxed">
                Experience dual-sided artificial intelligence: candidates discover personalized career matches with vector semantic recommendations, while recruiters screen, rank, and evaluate applicants in seconds.
              </p>
            </div>

            {/* Perspective Switcher Tabs */}
            <div className="inline-flex rounded-lg border border-warm-border bg-warm-subtle p-1 self-start md:self-auto shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => setAiShowcaseTab('candidate')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-md transition-all ${
                  aiShowcaseTab === 'candidate'
                    ? 'bg-brand-900 text-white shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-white/60'
                }`}
              >
                <span>✦</span>
                <span>For Candidates: AI Recommender</span>
              </button>
              <button
                type="button"
                onClick={() => setAiShowcaseTab('recruiter')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-md transition-all ${
                  aiShowcaseTab === 'recruiter'
                    ? 'bg-brand-900 text-white shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-white/60'
                }`}
              >
                <span>🎯</span>
                <span>For Recruiters: AI Screening</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Candidate AI Job Recommender View */}
          {aiShowcaseTab === 'candidate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Candidate Advantage
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-ink">
                    Stop applying blindly. Let AI match your true superpowers.
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                    Our AI parses your background, verified certificates, and GitHub projects into high-dimensional semantic embeddings. It continuously scans live job openings to find where you will excel the most.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      1
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-ink">Vector Semantic Alignment</h4>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Matches your real skills and experience beyond just simple keyword matching, surfacing opportunities that genuinely fit your career path.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      2
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-ink">AI Career Advisor (Gemini 3.8 Flash)</h4>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Get real-time feedback on salary benchmarks, missing competencies to upskill, and personalized interview prep insights.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      3
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-ink">Verified Profile Visibility Boost</h4>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Verified candidate documents grant a trusted badge that places your application at the top of recruiter shortlists.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Try Sample Filter */}
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-2">
                    Simulate Candidate Search Profile:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'fullstack', label: 'MERN Full Stack (Abhinav)' },
                      { key: 'frontend', label: 'React / Frontend (Sneha)' },
                      { key: 'backend', label: 'DevOps / Platform (Karthik)' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSampleJobQuery(item.key as any)}
                        className={`px-3 py-1 rounded text-xs font-medium border transition-all ${
                          sampleJobQuery === item.key
                            ? 'bg-blue-900 text-white border-blue-900 font-semibold shadow-xs'
                            : 'bg-white text-ink-muted border-warm-border hover:bg-warm-highlight'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Link to="/jobs" className="btn-primary text-xs">
                    Browse AI Recommended Openings →
                  </Link>
                </div>
              </div>

              {/* Interactive Simulator: Recommended Job Card */}
              <div className="lg:col-span-6">
                <div className="rounded-xl border border-blue-200/80 bg-white p-5 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/10 rounded-bl-full pointer-events-none" />

                  <div className="flex items-center justify-between pb-3 border-b border-warm-border">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        AI Recommended Role
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold border border-emerald-300">
                      ★ {sampleRecommendedJobs[sampleJobQuery].matchScore}% Match Score
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-ink">
                      {sampleRecommendedJobs[sampleJobQuery].title}
                    </h4>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {sampleRecommendedJobs[sampleJobQuery].company} · {sampleRecommendedJobs[sampleJobQuery].location}
                    </p>
                    <p className="text-xs font-semibold text-brand-900 mt-1">
                      {sampleRecommendedJobs[sampleJobQuery].salary}
                    </p>
                  </div>

                  {/* Skills Alignment */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-ink-muted uppercase">
                      Skill Compatibility:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {sampleRecommendedJobs[sampleJobQuery].matchedSkills.map((sk) => (
                        <span
                          key={sk}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium"
                        >
                          <span className="text-[10px]">✓</span> {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Reasoning Box */}
                  <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                      <span>✦</span>
                      <span>AI Match Analysis</span>
                    </div>
                    <p className="text-[11px] text-blue-950/80 leading-relaxed">
                      "{sampleRecommendedJobs[sampleJobQuery].reasoning}"
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-warm-border">
                    <span className="text-[11px] text-ink-muted">
                      Semantic Cosine Similarity: 0.94
                    </span>
                    <Link
                      to="/jobs"
                      className="text-xs font-bold text-brand-900 hover:underline flex items-center gap-1"
                    >
                      View Role & Apply →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Recruiter AI Candidate Screening View */}
          {aiShowcaseTab === 'recruiter' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in">
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Recruiter Superpower
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-ink">
                    Find the perfect candidate in minutes, not weeks.
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                    Say goodbye to manually reviewing hundreds of PDF resumes. Our AI screening engine automatically extracts skills, calculates composite qualification scores, and flags gaps with complete objectivity.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      1
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-ink">Instant Automated Resume Parsing</h4>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Deep text extraction maps candidate education, years of experience, and demonstrable skill sets directly to your job scorecard.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      2
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-ink">Composite Fit Score & Gap Breakdown</h4>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Receive a calibrated 0-100 score highlighting core skill matches, missing prerequisites, and relevant career milestones.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      3
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-ink">Bias-Free Blind Triage Mode</h4>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Instantly redact candidate names and demographics with a single toggle, ensuring every applicant is evaluated purely on merit.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Link to="/register" className="btn-primary text-xs">
                    Post a Role & Screen with AI →
                  </Link>
                  <Link to="/jobs" className="btn-secondary text-xs">
                    Explore Candidate Pipeline
                  </Link>
                </div>
              </div>

              {/* Interactive Simulator: Screened Candidate Card */}
              <div className="lg:col-span-6">
                <div className="rounded-xl border border-emerald-200/80 bg-white p-5 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/10 rounded-bl-full pointer-events-none" />

                  <div className="flex items-center justify-between pb-3 border-b border-warm-border">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-700 text-white text-[10px] font-bold">
                        AI
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-700">
                        Candidate Screening Result
                      </span>
                    </div>

                    {/* Blind Review Toggle */}
                    <button
                      type="button"
                      onClick={() => setScreeningBlindMode(!screeningBlindMode)}
                      className={`text-[11px] px-2.5 py-1 rounded font-semibold border transition-all ${
                        screeningBlindMode
                          ? 'bg-brand-900 text-white border-brand-900 shadow-xs'
                          : 'bg-warm-subtle text-ink-muted border-warm-border hover:bg-warm-highlight'
                      }`}
                    >
                      {screeningBlindMode ? 'Blind Mode: Active (Redacted)' : 'Blind Mode: Off'}
                    </button>
                  </div>

                  {/* Candidate Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-ink">
                        {screeningBlindMode ? 'Candidate #8042 (Redacted)' : 'Abhinav Tarigoppula'}
                      </h4>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {screeningBlindMode
                          ? 'Full Stack Engineer · 3 Years Experience · Verified Credentials'
                          : 'Senior Full Stack Developer · Visakhapatnam, India · Verified'}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold border border-emerald-300">
                      98/100 Fit Score
                    </span>
                  </div>

                  {/* Multi-factor Score Breakdown */}
                  <div className="space-y-2 pt-1 text-xs">
                    <div>
                      <div className="flex justify-between text-ink-muted mb-1 text-[11px]">
                        <span className="font-semibold text-ink">Core Skill Overlap (React, Node, Mongo, TS):</span>
                        <span className="font-bold text-emerald-800">100% Match</span>
                      </div>
                      <div className="h-1.5 w-full bg-warm-border rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-ink-muted mb-1 text-[11px]">
                        <span className="font-semibold text-ink">Experience Threshold (Req: 1 yr / Cand: 3 yrs):</span>
                        <span className="font-bold text-emerald-800">Exceeds Requirement</span>
                      </div>
                      <div className="h-1.5 w-full bg-warm-border rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: '95%' }} />
                      </div>
                    </div>
                  </div>

                  {/* AI Screening Takeaway */}
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                      <span>✓</span>
                      <span>AI Screening Assessment (Strong Match)</span>
                    </div>
                    <p className="text-[11px] text-emerald-950/80 leading-relaxed">
                      "Candidate demonstrates production-level proficiency across React, Node.js, and MongoDB. Passed identity and academic document verification. Recommended for technical phone screen."
                    </p>
                  </div>

                  {/* Suggested Interview Question */}
                  <div className="rounded-lg border border-warm-border bg-warm-subtle/60 p-2.5 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      Suggested Interview Question:
                    </span>
                    <p className="text-[11px] text-ink leading-relaxed">
                      "Can you describe your experience implementing role-based authentication and rate limiting in high-throughput Express APIs?"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Greenhouse Structured Hiring Pillars */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-4">
        <div className="max-w-2xl mb-10">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            The Greenhouse Standard
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
            Four pillars of structured hiring excellence
          </h2>
          <p className="mt-2 text-sm text-ink-muted leading-relaxed">
            Eliminate guesswork. Define role criteria upfront, gather calibrated team scorecards,
            and empower every interviewer with structured question kits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="card p-5 space-y-3 bg-white">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-900 text-xs font-bold text-white">
              01
            </span>
            <h3 className="text-sm font-bold text-ink">Structured Job Scorecards</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Define the exact competencies, core skills, and cultural values needed for the role
              before the first resume is ever screened.
            </p>
            <span className="text-[11px] font-semibold text-brand-900">100% Calibrated</span>
          </div>

          <div className="card p-5 space-y-3 bg-white">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-900 text-xs font-bold text-white">
              02
            </span>
            <h3 className="text-sm font-bold text-ink">Objective Interview Kits</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Equip every engineer and manager with behavioral question kits and 5-tier rubrics:
              Strong Yes, Yes, Neutral, No, Strong No.
            </p>
            <span className="text-[11px] font-semibold text-brand-900">Zero Guesswork</span>
          </div>

          <div className="card p-5 space-y-3 bg-white">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-900 text-xs font-bold text-white">
              03
            </span>
            <h3 className="text-sm font-bold text-ink">Bias Reduction & Blind Triage</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Instantly redact candidate names, locations, and personal identifiers to evaluate purely
              on demonstrable technical experience and skill metrics.
            </p>
            <span className="text-[11px] font-semibold text-brand-900">Equal Opportunity</span>
          </div>

          <div className="card p-5 space-y-3 bg-white">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-900 text-xs font-bold text-white">
              04
            </span>
            <h3 className="text-sm font-bold text-ink">Pipeline Velocity Analytics</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Track real-time conversion rates across sourcing channels, time in stage, and interviewer
              scorecard response velocity with 30-day continuous trends.
            </p>
            <span className="text-[11px] font-semibold text-brand-900">Actionable Data</span>
          </div>
        </div>
      </section>

      {/* Interactive Hiring Velocity & ROI Calculator (Greenhouse Signature Tool) */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="card p-6 sm:p-8 bg-white border-warm-border space-y-6">
          <div className="max-w-xl">
            <span className="chip bg-warm-subtle text-ink font-semibold text-xs">
              Greenhouse Velocity Model
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mt-2">
              Calculate your team's hiring velocity gains
            </h2>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              See how replacing ad-hoc interviews with HireHive's structured scorecard workflows saves time and increases quality of hire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-ink mb-2">
                  <span>Planned Open Roles (Yearly):</span>
                  <span className="text-base font-bold text-brand-900">{openRolesCount} positions</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="60"
                  step="1"
                  value={openRolesCount}
                  onChange={(e) => setOpenRolesCount(Number(e.target.value))}
                  className="w-full h-2 bg-warm-border rounded-lg appearance-none cursor-pointer accent-brand-900"
                />
                <div className="flex justify-between text-[11px] text-ink-muted mt-1">
                  <span>2 roles</span>
                  <span>30 roles</span>
                  <span>60 roles</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-ink mb-2">
                  <span>Current Average Time-to-Hire:</span>
                  <span className="text-base font-bold text-brand-900">{avgCycleDays} days</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="75"
                  step="1"
                  value={avgCycleDays}
                  onChange={(e) => setAvgCycleDays(Number(e.target.value))}
                  className="w-full h-2 bg-warm-border rounded-lg appearance-none cursor-pointer accent-brand-900"
                />
                <div className="flex justify-between text-[11px] text-ink-muted mt-1">
                  <span>15 days</span>
                  <span>45 days</span>
                  <span>75 days</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-warm-border bg-warm-subtle p-4">
                <p className="text-xs font-semibold uppercase text-ink-muted">Days Saved / Hire</p>
                <p className="text-2xl sm:text-3xl font-bold text-ink mt-1">-{daysSavedPerHire} Days</p>
                <p className="text-[11px] text-ink-muted mt-1">Accelerated stage transitions</p>
              </div>

              <div className="rounded-lg border border-warm-border bg-warm-subtle p-4">
                <p className="text-xs font-semibold uppercase text-ink-muted">Recruiter Hours Saved</p>
                <p className="text-2xl sm:text-3xl font-bold text-ink mt-1">{totalHoursSavedYearly} hrs</p>
                <p className="text-[11px] text-ink-muted mt-1">Via automated resume parsing</p>
              </div>

              <div className="rounded-lg border border-warm-border bg-warm-subtle p-4">
                <p className="text-xs font-semibold uppercase text-ink-muted">Scorecard Compliance</p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-800 mt-1">98.4%</p>
                <p className="text-[11px] text-ink-muted mt-1">Calibrated rubrics submitted</p>
              </div>

              <div className="rounded-lg border border-warm-border bg-warm-subtle p-4">
                <p className="text-xs font-semibold uppercase text-ink-muted">Cost Savings</p>
                <p className="text-2xl sm:text-3xl font-bold text-brand-900 mt-1">₹{(pipelineCostReduction / 100000).toFixed(1)}L</p>
                <p className="text-[11px] text-ink-muted mt-1">Estimated annual sourcing fee savings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Openings Section with Department Filtering */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 border-t border-warm-border pt-12">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              Current Open Roles
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              Live positions verified in database catalog with clear salary tiers and requirements.
            </p>
          </div>
          <Link to="/jobs" className="text-xs font-semibold text-brand-900 hover:underline">
            View all postings ({allJobs.length}) →
          </Link>
        </div>

        {/* Department Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', 'Engineering', 'Product & Design', 'Data & Cloud'].map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all duration-fast ${
                selectedDept === dept
                  ? 'bg-brand-900 text-white shadow-sm'
                  : 'bg-warm-subtle text-ink-muted border border-warm-border hover:bg-warm-highlight hover:text-ink'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {isLoading ? (
          <SkeletonList count={4} />
        ) : filteredJobs.length === 0 ? (
          <div className="card p-8 text-center text-xs text-ink-muted">
            No openings found under {selectedDept}. Click "All" to browse all listings.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <div key={job._id} className="card-interactive">
                <JobCard job={job} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

