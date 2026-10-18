import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiRequestError } from '../lib/api';
import { FieldError, FormError, Spinner } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import type { Job, JobType, WorkMode } from '../types';

const JOB_TYPES: JobType[] = ['full-time', 'part-time', 'internship', 'contract'];
const WORK_MODES: WorkMode[] = ['on-site', 'remote', 'hybrid'];

const EMPTY = {
  title: '',
  company: '',
  description: '',
  location: '',
  workMode: 'on-site' as WorkMode,
  type: 'full-time' as JobType,
  skills: '',
  salaryMin: '',
  salaryMax: '',
  experienceMin: '0',
  openings: '1',
};

/** Handles both creating a new posting and editing an existing one. */
export function JobForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get<{ data: Job }>(`/jobs/${id}`),
    enabled: isEdit,
  });

  // Prefill from the loaded job when editing; default the company name from
  // the recruiter's profile when creating.
  useEffect(() => {
    if (data?.data) {
      const job = data.data;
      setForm({
        title: job.title,
        company: job.company,
        description: job.description,
        location: job.location,
        workMode: job.workMode,
        type: job.type,
        skills: job.skills.join(', '),
        salaryMin: String(job.salaryMin || ''),
        salaryMax: String(job.salaryMax || ''),
        experienceMin: String(job.experienceMin),
        openings: String(job.openings),
      });
    } else if (!isEdit && user?.company) {
      setForm((f) => ({ ...f, company: user.company ?? '' }));
    }
  }, [data, isEdit, user?.company]);

  const update = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      isEdit ? api.patch(`/jobs/${id}`, payload) : api.post('/jobs', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-stats'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['job', id] });
      navigate('/recruiter/jobs');
    },
    onError: (err) => {
      if (err instanceof ApiRequestError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError('Could not save the job.');
      }
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    save.mutate({
      title: form.title,
      company: form.company,
      description: form.description,
      location: form.location,
      workMode: form.workMode,
      type: form.type,
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      salaryMin: Number(form.salaryMin) || 0,
      salaryMax: Number(form.salaryMax) || 0,
      experienceMin: Number(form.experienceMin) || 0,
      openings: Number(form.openings) || 1,
    });
  };

  if (isEdit && isLoading) return <Spinner label="Loading job" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">
        {isEdit ? 'Edit job posting' : 'Post a new job'}
      </h1>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
        <FormError message={error} />

        <div>
          <label htmlFor="title" className="label">
            Job title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            className="input"
            placeholder="Full Stack Developer (MERN)"
            value={form.title}
            onChange={(e) => update({ title: e.target.value })}
            required
          />
          <FieldError message={fieldErrors.title} />
        </div>

        <div>
          <label htmlFor="company" className="label">
            Company <span className="text-red-500">*</span>
          </label>
          <input
            id="company"
            className="input"
            value={form.company}
            onChange={(e) => update({ company: e.target.value })}
            required
          />
          <FieldError message={fieldErrors.company} />
        </div>

        <div>
          <label htmlFor="description" className="label">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            className="input min-h-[160px] resize-y"
            placeholder="What will this person work on? What are you looking for?"
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
            required
            minLength={30}
            maxLength={8000}
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {form.description.length}/8000 · minimum 30
          </p>
          <FieldError message={fieldErrors.description} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="location" className="label">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              className="input"
              placeholder="Bangalore"
              value={form.location}
              onChange={(e) => update({ location: e.target.value })}
              required
            />
            <FieldError message={fieldErrors.location} />
          </div>

          <div>
            <label htmlFor="workMode" className="label">
              Work mode
            </label>
            <select
              id="workMode"
              className="input"
              value={form.workMode}
              onChange={(e) => update({ workMode: e.target.value as WorkMode })}
            >
              {WORK_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="label">
              Job type
            </label>
            <select
              id="type"
              className="input"
              value={form.type}
              onChange={(e) => update({ type: e.target.value as JobType })}
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="salaryMin" className="label">
              Salary minimum (₹ per year)
            </label>
            <input
              id="salaryMin"
              type="number"
              min={0}
              step={10000}
              className="input"
              placeholder="800000"
              value={form.salaryMin}
              onChange={(e) => update({ salaryMin: e.target.value })}
            />
            <FieldError message={fieldErrors.salaryMin} />
          </div>

          <div>
            <label htmlFor="salaryMax" className="label">
              Salary maximum (₹ per year)
            </label>
            <input
              id="salaryMax"
              type="number"
              min={0}
              step={10000}
              className="input"
              placeholder="1400000"
              value={form.salaryMax}
              onChange={(e) => update({ salaryMax: e.target.value })}
            />
            <FieldError message={fieldErrors.salaryMax} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="experienceMin" className="label">
              Minimum experience (years)
            </label>
            <input
              id="experienceMin"
              type="number"
              min={0}
              max={40}
              className="input"
              value={form.experienceMin}
              onChange={(e) => update({ experienceMin: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="openings" className="label">
              Number of openings
            </label>
            <input
              id="openings"
              type="number"
              min={1}
              className="input"
              value={form.openings}
              onChange={(e) => update({ openings: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="skills" className="label">
            Required skills
          </label>
          <input
            id="skills"
            className="input"
            placeholder="React, Node.js, MongoDB"
            value={form.skills}
            onChange={(e) => update({ skills: e.target.value })}
          />
          <p className="mt-1 text-xs text-slate-400">Separate skills with commas.</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/recruiter/jobs')}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={save.isPending}>
            {save.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Post job'}
          </button>
        </div>
      </form>
    </div>
  );
}
