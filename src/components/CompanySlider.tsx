import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { HiringCompany } from '../types';

interface SliderItem {
  id: string;
  name: string;
  category: string;
  categoryGroup: 'hiring' | 'devtools' | 'fintech' | 'workspace';
  openJobs: number;
  locations?: string[];
  skills?: string[];
  isDynamicHire: boolean;
  searchQuery: string;
  icon?: React.ReactNode;
  brandColor?: string;
}

export function CompanySlider() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [speed, setSpeed] = useState<number>(35); // 35s = normal, 55s = slow, 20s = fast
  const [direction, setDirection] = useState<'normal' | 'reverse'>('normal');
  const [isManuallyPaused, setIsManuallyPaused] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>('');

  // Fetch live companies currently hiring on HireHive from the database
  const { data: response, isLoading } = useQuery<{ success: boolean; data: HiringCompany[] }>({
    queryKey: ['companies', 'active'],
    queryFn: () => api.get<{ success: boolean; data: HiringCompany[] }>('/jobs/companies'),
    staleTime: 60_000,
  });


  const liveCompanies: HiringCompany[] = response?.data ?? [];

  // Curated ecosystem and integration partners
  const staticPartners: SliderItem[] = useMemo(
    () => [
      {
        id: 'stripe',
        name: 'Stripe',
        category: 'Financial Infrastructure',
        categoryGroup: 'fintech',
        openJobs: 0,
        isDynamicHire: false,
        searchQuery: 'Stripe',
        brandColor: '#635bff',
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.97 15.654.5 12.52.5 6.643.5 2.76 3.655 2.76 8.76c0 5.485 5.568 6.425 8.922 7.742 2.235.882 3.238 1.631 3.238 2.662 0 .973-.87 1.543-2.316 1.543-2.548 0-5.353-1.16-7.272-2.19l-.916 5.594c1.948 1.077 5.093 1.789 8.272 1.789 6.097 0 10.312-3.084 10.312-8.397.001-5.63-5.275-6.793-9.036-8.353z" />
          </svg>
        ),
      },
      {
        id: 'linear',
        name: 'Linear',
        category: 'Product & Issue Tracking',
        categoryGroup: 'devtools',
        openJobs: 0,
        isDynamicHire: false,
        searchQuery: 'Linear',
        brandColor: '#5e6ad2',
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3.5 3.5h17v17h-17z" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M3.5 12h17M12 3.5v17" stroke="currentColor" strokeWidth="2" />
          </svg>
        ),
      },
      {
        id: 'figma',
        name: 'Figma',
        category: 'Collaborative Design',
        categoryGroup: 'workspace',
        openJobs: 0,
        isDynamicHire: false,
        searchQuery: 'Figma',
        brandColor: '#f24e1e',
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM6 6a3 3 0 0 1 6 0v6H6a3 3 0 0 1 0-6zm6 0a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM6 12h6v6a3 3 0 0 1-6 0v-6zm3 6a3 3 0 0 1 3 3 3 3 0 0 1-6 0 3 3 0 0 1 3-3z" />
          </svg>
        ),
      },
      {
        id: 'vercel',
        name: 'Vercel',
        category: 'Frontend Cloud & Edge',
        categoryGroup: 'devtools',
        openJobs: 0,
        isDynamicHire: false,
        searchQuery: 'Vercel',
        brandColor: '#000000',
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 1L24 22H0L12 1Z" />
          </svg>
        ),
      },
      {
        id: 'github',
        name: 'GitHub',
        category: 'Developer Platform',
        categoryGroup: 'devtools',
        openJobs: 0,
        isDynamicHire: false,
        searchQuery: 'GitHub',
        brandColor: '#24292f',
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        ),
      },
      {
        id: 'supabase',
        name: 'Supabase',
        category: 'Postgres & Backend Suite',
        categoryGroup: 'devtools',
        openJobs: 0,
        isDynamicHire: false,
        searchQuery: 'Supabase',
        brandColor: '#3ecf8e',
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M11.9 1.1c.3-.4.9-.2 1 .3l2.8 9.3h6.8c.6 0 .9.7.5 1.1l-10.7 11c-.4.4-1.1.1-1-.4l-2.8-9.4H1.7c-.6 0-.9-.7-.5-1.1l10.7-10.8z" />
          </svg>
        ),
      },
      {
        id: 'notion',
        name: 'Notion',
        category: 'Connected Knowledge Base',
        categoryGroup: 'workspace',
        openJobs: 0,
        isDynamicHire: false,
        searchQuery: 'Notion',
        brandColor: '#000000',
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.093-.373L17.89 1.64c-.466-.373-.84-.56-1.54-.514L3.619 2.06c-.56.047-.654.373-.42.56l1.26 1.588zm-.84 3.782v13.633c0 .84.42 1.167 1.214 1.12l14.475-.84c.793-.047 1.027-.56 1.027-1.167V6.634c0-.607-.28-.887-.887-.84l-14.94.887c-.607.047-.888.42-.888.906zm13.447.887c.093.42 0 .84-.42.887l-.7.14v10.13c-.607.373-1.214.56-1.727.56-.84 0-1.074-.28-1.727-1.12l-4.762-7.518v7.19l1.4.327c.093.42 0 .84-.42.887l-3.829.233c-.093-.42 0-.84.42-.887l.98-.233V8.877l-1.354-.14c-.094-.42 0-.84.42-.887l3.969-.233 4.95 7.61V8.69l-1.168-.187c-.093-.42 0-.84.42-.887l3.082-.187z" />
          </svg>
        ),
      },
      {
        id: 'datadog',
        name: 'Datadog',
        category: 'Cloud Observability',
        categoryGroup: 'devtools',
        openJobs: 0,
        isDynamicHire: false,
        searchQuery: 'Datadog',
        brandColor: '#632ca6',
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        ),
      },
      {
        id: 'mongodb',
        name: 'MongoDB',
        category: 'Document Data Platform',
        categoryGroup: 'devtools',
        openJobs: 0,
        isDynamicHire: false,
        searchQuery: 'MongoDB',
        brandColor: '#00ed64',
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.001 0c-.395 0-.742.203-.94.524-.047.075-4.57 7.294-4.57 12.871 0 5.485 4.382 9.948 9.877 10.499.39.039.633-.105.633-.312 0-.083-.042-.167-.099-.214C16.892 23.36 12 19.344 12 12.63c0-4.707 3.327-10.718 3.51-11.056.09-.168.04-.374-.112-.489C14.773.614 13.415 0 12.001 0z" />
          </svg>
        ),
      },
      {
        id: 'retool',
        name: 'Retool',
        category: 'Internal Operations',
        categoryGroup: 'workspace',
        openJobs: 0,
        isDynamicHire: false,
        searchQuery: 'Retool',
        brandColor: '#3d5afe',
        icon: (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 4h8v7H3zm10 0h8v7h-8zm-10 9h8v7H3zm10 0h8v7h-8z" />
          </svg>
        ),
      },
    ],
    [],
  );

  // Transform dynamic live database companies into slider items
  const dynamicItems: SliderItem[] = useMemo(() => {
    return liveCompanies.map((c, index) => {
      // Pick a clean, professional monogram color palette
      const palettes = [
        { bg: 'bg-emerald-900', text: 'text-emerald-100', border: 'border-emerald-700' },
        { bg: 'bg-brand-900', text: 'text-white', border: 'border-brand-700' },
        { bg: 'bg-blue-900', text: 'text-blue-100', border: 'border-blue-700' },
        { bg: 'bg-stone-900', text: 'text-stone-100', border: 'border-stone-700' },
        { bg: 'bg-teal-900', text: 'text-teal-100', border: 'border-teal-700' },
      ];
      const palette = palettes[index % palettes.length];

      // Form 2-letter initials (e.g. "TechCorp India" -> "TC", "FinStack" -> "FS")
      const words = c.name.split(' ').filter(Boolean);
      const initials =
        words.length > 1
          ? `${words[0][0]}${words[1][0]}`.toUpperCase()
          : c.name.slice(0, 2).toUpperCase();

      // Determine category subtitle from skills or company name
      const primarySkill = c.skills?.length ? c.skills.slice(0, 2).join(' · ') : 'Software Engineering';

      // Group classification
      const lower = c.name.toLowerCase();
      let categoryGroup: SliderItem['categoryGroup'] = 'hiring';
      if (lower.includes('fin') || lower.includes('pay') || lower.includes('scale')) {
        categoryGroup = 'fintech';
      } else if (lower.includes('cloud') || lower.includes('tech') || lower.includes('bridge') || lower.includes('corp')) {
        categoryGroup = 'devtools';
      }

      return {
        id: `db-${c.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: c.name,
        category: primarySkill,
        categoryGroup,
        openJobs: c.openJobs,
        locations: c.locations,
        skills: c.skills,
        isDynamicHire: true,
        searchQuery: c.name,
        icon: (
          <div
            className={`flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold tracking-tight shadow-sm ${palette.bg} ${palette.text}`}
          >
            {initials}
          </div>
        ),
      };
    });
  }, [liveCompanies]);

  // Combined full list: Put dynamic employers with active roles front and center
  const allItems: SliderItem[] = useMemo(() => {
    return [...dynamicItems, ...staticPartners];
  }, [dynamicItems, staticPartners]);

  // Calculate quick summary metrics
  const totalOpenRoles = useMemo(() => {
    return liveCompanies.reduce((acc, c) => acc + (c.openJobs || 0), 0);
  }, [liveCompanies]);

  // Filter items based on active category tab & text filter
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Category tab filtering
      if (selectedCategory === 'hiring' && !item.isDynamicHire) return false;
      if (selectedCategory === 'devtools' && item.categoryGroup !== 'devtools') return false;
      if (selectedCategory === 'fintech' && item.categoryGroup !== 'fintech') return false;
      if (selectedCategory === 'workspace' && item.categoryGroup !== 'workspace') return false;

      // Text query filtering
      if (filterText.trim()) {
        const q = filterText.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesLoc = item.locations?.some((l) => l.toLowerCase().includes(q));
        if (!matchesName && !matchesCat && !matchesLoc) return false;
      }

      return true;
    });
  }, [allItems, selectedCategory, filterText]);

  // For infinite marquee to run seamlessly without gaps, repeat list sufficiently
  const duplicatedItems = useMemo(() => {
    if (filteredItems.length === 0) return [];
    if (filteredItems.length < 8) {
      return [...filteredItems, ...filteredItems, ...filteredItems, ...filteredItems];
    }
    return [...filteredItems, ...filteredItems];
  }, [filteredItems]);

  const handleCompanyClick = (company: SliderItem) => {
    navigate(`/jobs?q=${encodeURIComponent(company.searchQuery)}`);
  };

  return (
    <section
      className="py-10 border-y border-warm-border bg-white/80 overflow-hidden"
      aria-label="Active Companies and Partner Ecosystem"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-6">
        {/* Section Header with live metrics */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-warm-border">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Dynamic Hiring Directory & Ecosystem
              </span>
              {isLoading ? (
                <span className="inline-flex items-center gap-1 rounded bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-ping" />
                  Syncing live directory...
                </span>
              ) : totalOpenRoles > 0 ? (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                  {totalOpenRoles} Open Positions Indexed
                </span>
              ) : null}
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink">

              Companies hiring with structured scorecards & bias-free rubrics
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Click any company to inspect active roles or explore open engineering and product positions.
            </p>
          </div>

          {/* Interactive Playback and Speed Controls */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={() => setIsManuallyPaused((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-medium transition-colors ${
                isManuallyPaused
                  ? 'border-amber-400 bg-amber-50 text-amber-900 font-semibold'
                  : 'border-warm-border bg-white text-ink hover:bg-warm-subtle'
              }`}
              title={isManuallyPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
              aria-label={isManuallyPaused ? 'Resume slider' : 'Pause slider'}
            >
              {isManuallyPaused ? (
                <>
                  <svg className="h-3.5 w-3.5 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5 text-ink-muted" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                  <span>Pause</span>
                </>
              )}
            </button>

            {/* Reverse Direction Button */}
            <button
              type="button"
              onClick={() => setDirection((prev) => (prev === 'normal' ? 'reverse' : 'normal'))}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-warm-border bg-white text-ink hover:bg-warm-subtle transition-colors text-xs font-medium"
              title="Reverse scroll direction"
              aria-label="Reverse direction"
            >
              <svg className="h-3.5 w-3.5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>{direction === 'normal' ? 'Left' : 'Right'}</span>
            </button>

            {/* Speed Pills */}
            <div className="inline-flex items-center rounded border border-warm-border bg-warm-subtle/80 p-0.5">
              <button
                type="button"
                onClick={() => setSpeed(55)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  speed === 55 ? 'bg-white shadow-sm font-semibold text-ink' : 'text-ink-muted hover:text-ink'
                }`}
                aria-label="Slow speed"
              >
                0.5x
              </button>
              <button
                type="button"
                onClick={() => setSpeed(35)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  speed === 35 ? 'bg-white shadow-sm font-semibold text-ink' : 'text-ink-muted hover:text-ink'
                }`}
                aria-label="Normal speed"
              >
                1x
              </button>
              <button
                type="button"
                onClick={() => setSpeed(20)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  speed === 20 ? 'bg-white shadow-sm font-semibold text-ink' : 'text-ink-muted hover:text-ink'
                }`}
                aria-label="Fast speed"
              >
                2x
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Category Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Organizations', count: allItems.length },
              { id: 'hiring', label: 'Actively Hiring', count: dynamicItems.length },
              { id: 'devtools', label: 'DevTools & Cloud', count: allItems.filter((i) => i.categoryGroup === 'devtools').length },
              { id: 'fintech', label: 'Fintech & Infra', count: allItems.filter((i) => i.categoryGroup === 'fintech').length },
              { id: 'workspace', label: 'Design & Workspace', count: allItems.filter((i) => i.categoryGroup === 'workspace').length },
            ].map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                    isActive
                      ? 'bg-brand-900 text-white font-semibold shadow-xs'
                      : 'bg-warm-subtle text-ink-muted hover:bg-stone-200 hover:text-ink'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-warm-border text-ink-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Filter Input */}
          <div className="relative max-w-xs">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter company or skill..."
              className="w-full rounded border border-warm-border bg-white px-3 py-1 text-xs text-ink placeholder:text-ink-muted focus:border-brand-900 focus:outline-hidden"
              aria-label="Filter companies in slider"
            />
            {filterText && (
              <button
                type="button"
                onClick={() => setFilterText('')}
                className="absolute right-2 top-1.5 text-xs text-ink-muted hover:text-ink"
                aria-label="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Marquee Wrapper with soft gradient fade masks */}
      <div className="relative w-full overflow-hidden">
        {/* Left gradient fade mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-white via-white/80 to-transparent" />
        {/* Right gradient fade mask */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-white via-white/80 to-transparent" />

        {/* If no matches found */}
        {duplicatedItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-ink-muted">
            No companies matching "{filterText}" found in this category.{' '}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setFilterText('');
              }}
              className="text-brand-900 font-semibold underline ml-1"
            >
              Reset filters
            </button>
          </div>
        ) : (
          /* Dynamic Scrolling Track */
          <div
            className={`flex w-max items-center gap-5 py-3 hover:[animation-play-state:paused] ${
              direction === 'normal' ? 'animate-marquee' : 'animate-marquee-reverse'
            }`}
            style={
              {
                '--marquee-duration': `${speed}s`,
                animationPlayState: isManuallyPaused ? 'paused' : undefined,
              } as React.CSSProperties
            }
          >
            {duplicatedItems.map((company, idx) => (
              <button
                key={`${company.id}-${idx}`}
                type="button"
                onClick={() => handleCompanyClick(company)}
                className="flex items-center gap-3.5 rounded-lg border border-warm-border bg-white hover:bg-warm-subtle/50 px-4 py-3 text-left transition-all duration-200 hover:shadow-md hover:border-brand-900 hover:-translate-y-0.5 group shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-900 cursor-pointer"
                title={`Click to view roles at ${company.name}`}
              >
                {/* Logo Icon */}
                <div className="text-ink-muted group-hover:text-brand-900 transition-colors shrink-0">
                  {company.icon}
                </div>

                {/* Company Details */}
                <div className="flex flex-col min-w-[120px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold tracking-tight text-ink group-hover:text-brand-900 transition-colors">
                      {company.name}
                    </span>
                    {company.isDynamicHire && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-600" title="Actively hiring" />
                    )}
                  </div>
                  <span className="text-[11px] text-ink-muted group-hover:text-ink transition-colors line-clamp-1">
                    {company.category}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="shrink-0 pl-1 border-l border-warm-border flex flex-col items-end">
                  {company.openJobs > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 group-hover:bg-emerald-100 transition-colors">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      {company.openJobs} {company.openJobs === 1 ? 'role' : 'roles'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-ink-muted bg-warm-subtle px-2 py-0.5 rounded border border-warm-border group-hover:border-stone-300 transition-colors">
                      Partner
                    </span>
                  )}
                  <span className="text-[9px] text-brand-900 font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                    View roles →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer ticker note */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-3 flex items-center justify-between text-[11px] text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">Hover over any card</span> to pause and explore active scorecard criteria.
        </div>
        <div className="flex items-center gap-1">
          <span>Are you hiring?</span>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="font-semibold text-brand-900 hover:underline"
          >
            Post a role to list your company →
          </button>
        </div>
      </div>
    </section>
  );
}
