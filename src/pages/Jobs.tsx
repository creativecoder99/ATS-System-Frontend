import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, toQuery } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';
import { JobCard } from '../components/JobCard';
import { EmptyState, ErrorState, Pager, SkeletonList } from '../components/ui';
import type { Job, JobType, Paginated, WorkMode } from '../types';

const JOB_TYPES: JobType[] = ['full-time', 'part-time', 'internship', 'contract'];
const WORK_MODES: WorkMode[] = ['on-site', 'remote', 'hybrid'];

export function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  const debouncedSearch = useDebounce(searchInput, 400);

  const page = Number(searchParams.get('page') ?? 1);
  const location = searchParams.get('location') ?? '';
  const type = searchParams.get('type') ?? '';
  const workMode = searchParams.get('workMode') ?? '';
  const minSalary = searchParams.get('minSalary') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';

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
    placeholderData: keepPreviousData,
  });

  const hasFilters = Array.from(searchParams.keys()).some((k) => k !== 'page');

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Available Positions
        </h1>
        <p className="mt-1 text-xs text-stone-600">
          Search roles by technology, work mode, or geographic preference.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] items-start">
        {/* Filters Sidebar */}
        <aside className="card p-5 space-y-4 border-stone-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-900">Filters</h2>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-[#0f2942] hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <label htmlFor="search" className="label">
                Keyword
              </label>
              <input
                id="search"
                className="input text-xs"
                placeholder="React, TypeScript, Go..."
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
                className="input text-xs"
                placeholder="Bangalore, Remote..."
                value={location}
                onChange={(e) => setFilter('location', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="type" className="label">
                Job Type
              </label>
              <select
                id="type"
                className="input text-xs"
                value={type}
                onChange={(e) => setFilter('type', e.target.value)}
              >
                <option value="">Any type</option>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="workMode" className="label">
                Work Mode
              </label>
              <select
                id="workMode"
                className="input text-xs"
                value={workMode}
                onChange={(e) => setFilter('workMode', e.target.value)}
              >
                <option value="">Any mode</option>
                {WORK_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="minSalary" className="label">
                Minimum Annual CTC
              </label>
              <select
                id="minSalary"
                className="input text-xs"
                value={minSalary}
                onChange={(e) => setFilter('minSalary', e.target.value)}
              >
                <option value="">Any salary</option>
                <option value="300000">₹3L+</option>
                <option value="600000">₹6L+</option>
                <option value="1000000">₹10L+</option>
                <option value="1500000">₹15L+</option>
                <option value="2500000">₹25L+</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Results List */}
        <div>
          <div className="flex items-center justify-between pb-3 text-xs text-stone-500">
            <span>
              {data ? `${data.pagination.total} position(s) found` : 'Loading...'}
              {isFetching && !isLoading && ' (updating...)'}
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="font-medium text-stone-700">
                Sort:
              </label>
              <select
                id="sort"
                className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-900"
                value={sort}
                onChange={(e) => setFilter('sort', e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="salary">Highest salary</option>
                <option value="relevance">Keyword relevance</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <SkeletonList count={4} />
          ) : isError ? (
            <ErrorState
              message={error instanceof Error ? error.message : 'Could not load job postings.'}
              onRetry={refetch}
            />
          ) : data?.data.length === 0 ? (
            <EmptyState
              title="No positions match your criteria"
              description="Try adjusting your keyword, location, or salary filters to see more results."
              action={
                hasFilters ? (
                  <button type="button" onClick={clearFilters} className="btn-secondary text-xs">
                    Clear all filters
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              {data?.data.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}

              <Pager
                page={page}
                totalPages={data?.pagination.totalPages ?? 1}
                onChange={(p) => setFilter('page', String(p))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
