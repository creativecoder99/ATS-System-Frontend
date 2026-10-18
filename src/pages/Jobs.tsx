import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, toQuery } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';
import { JobCard } from '../components/JobCard';
import { EmptyState, ErrorState, Pager, Spinner } from '../components/ui';
import type { Job, JobType, Paginated, WorkMode } from '../types';

const JOB_TYPES: JobType[] = ['full-time', 'part-time', 'internship', 'contract'];
const WORK_MODES: WorkMode[] = ['on-site', 'remote', 'hybrid'];

export function Jobs() {
  // The URL is the source of truth for filters, so a filtered search is
  // shareable and survives a refresh or the browser back button.
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const debouncedSearch = useDebounce(searchInput, 400);

  const page = Number(searchParams.get('page') ?? 1);
  const location = searchParams.get('location') ?? '';
  const type = searchParams.get('type') ?? '';
  const workMode = searchParams.get('workMode') ?? '';
  const minSalary = searchParams.get('minSalary') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';

  // Push the debounced text into the URL, resetting to page 1 — staying on
  // page 4 of the previous result set would usually show nothing.
  useEffect(() => {
    const current = searchParams.get('q') ?? '';
    if (debouncedSearch === current) return;

    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set('q', debouncedSearch);
    else next.delete('q');
    next.delete('page');
    setSearchParams(next, { replace: true });
  }, [debouncedSearch, searchParams, setSearchParams]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const queryString = toQuery({
    q: searchParams.get('q') ?? '',
    location,
    type,
    workMode,
    minSalary,
    sort,
    page,
    limit: 10,
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['jobs', queryString],
    queryFn: () => api.get<Paginated<Job>>(`/jobs${queryString}`),
    // Keeps the previous page rendered while the next one loads, so the list
    // does not collapse to a spinner on every filter change.
    placeholderData: keepPreviousData,
  });

  const hasFilters = Array.from(searchParams.keys()).some((k) => k !== 'page');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Browse jobs</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="card h-fit p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="search" className="label">
                Keyword
              </label>
              <input
                id="search"
                className="input"
                placeholder="React, backend…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="location" className="label">
                Location
              </label>
              <input
                id="location"
                className="input"
                placeholder="Bangalore"
                value={location}
                onChange={(e) => setFilter('location', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="type" className="label">
                Job type
              </label>
              <select
                id="type"
                className="input"
                value={type}
                onChange={(e) => setFilter('type', e.target.value)}
              >
                <option value="">Any</option>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="workMode" className="label">
                Work mode
              </label>
              <select
                id="workMode"
                className="input"
                value={workMode}
                onChange={(e) => setFilter('workMode', e.target.value)}
              >
                <option value="">Any</option>
                {WORK_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="minSalary" className="label">
                Minimum salary
              </label>
              <select
                id="minSalary"
                className="input"
                value={minSalary}
                onChange={(e) => setFilter('minSalary', e.target.value)}
              >
                <option value="">Any</option>
                <option value="300000">₹3L+</option>
                <option value="600000">₹6L+</option>
                <option value="1000000">₹10L+</option>
                <option value="2000000">₹20L+</option>
              </select>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              {data ? (
                <>
                  <span className="font-medium text-slate-900">{data.pagination.total}</span> job
                  {data.pagination.total === 1 ? '' : 's'} found
                  {isFetching && <span className="ml-2 text-slate-400">updating…</span>}
                </>
              ) : (
                'Searching…'
              )}
            </p>

            <select
              className="input w-auto"
              value={sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              aria-label="Sort jobs"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="salary">Highest salary</option>
              <option value="relevance">Most relevant</option>
            </select>
          </div>

          {isLoading ? (
            <Spinner label="Loading jobs" />
          ) : isError ? (
            <ErrorState
              message={error instanceof Error ? error.message : 'Could not load jobs'}
              onRetry={refetch}
            />
          ) : data && data.data.length === 0 ? (
            <EmptyState
              title="No jobs match those filters"
              description="Try removing a filter or searching for a broader term."
              action={
                hasFilters && (
                  <button type="button" className="btn-secondary" onClick={clearFilters}>
                    Clear filters
                  </button>
                )
              }
            />
          ) : (
            <>
              <div className="space-y-4">
                {data?.data.map((job) => <JobCard key={job._id} job={job} />)}
              </div>
              <Pager
                page={page}
                totalPages={data?.pagination.totalPages ?? 1}
                onChange={(p) => setFilter('page', String(p))}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
