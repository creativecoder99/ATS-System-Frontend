import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { JobCard } from '../components/JobCard';
import { EmptyState, ErrorState, Spinner } from '../components/ui';
import type { Job } from '../types';

export function SavedJobs() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => api.get<{ data: Job[] }>('/jobs/saved'),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Saved jobs</h1>

      {isLoading ? (
        <Spinner label="Loading saved jobs" />
      ) : isError ? (
        <div className="mt-6">
          <ErrorState
            message={error instanceof Error ? error.message : 'Could not load saved jobs'}
            onRetry={refetch}
          />
        </div>
      ) : data && data.data.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing saved yet"
            description="Bookmark a job from its detail page and it will appear here for later."
            action={
              <Link to="/jobs" className="btn-primary">
                Browse jobs
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {data?.data.map((job) => <JobCard key={job._id} job={job} />)}
        </div>
      )}
    </div>
  );
}
