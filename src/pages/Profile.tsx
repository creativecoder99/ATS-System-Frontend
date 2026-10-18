import { useState, type FormEvent } from 'react';
import { api, ApiRequestError } from '../lib/api';
import { FieldError, FormError } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';

export function Profile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name ?? '',
    headline: user?.headline ?? '',
    location: user?.location ?? '',
    company: user?.company ?? '',
    experienceYears: user?.experienceYears ?? 0,
    skills: (user?.skills ?? []).join(', '),
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const update = (patch: Partial<typeof form>) => {
    setForm((f) => ({ ...f, ...patch }));
    setStatus('idle');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setStatus('saving');

    try {
      const res = await api.patch<{ data: User }>('/auth/me', {
        name: form.name,
        headline: form.headline,
        location: form.location,
        experienceYears: Number(form.experienceYears),
        // Comma-separated input is friendlier than a tag widget here; split
        // and clean it before it reaches the API.
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        ...(user?.role === 'recruiter' ? { company: form.company } : {}),
      });
      updateUser(res.data);
      setStatus('saved');
    } catch (err) {
      setStatus('idle');
      if (err instanceof ApiRequestError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError('Could not save your profile.');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Your profile</h1>
      <p className="mt-1 text-sm text-slate-500">
        Signed in as {user.email} · <span className="capitalize">{user.role}</span>
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
        <FormError message={error} />

        <div>
          <label htmlFor="name" className="label">
            Full name
          </label>
          <input
            id="name"
            className="input"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            required
          />
          <FieldError message={fieldErrors.name} />
        </div>

        <div>
          <label htmlFor="headline" className="label">
            Headline
          </label>
          <input
            id="headline"
            className="input"
            placeholder="Final-year CSE student · MERN developer"
            value={form.headline}
            onChange={(e) => update({ headline: e.target.value })}
            maxLength={140}
          />
          <FieldError message={fieldErrors.headline} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="location" className="label">
              Location
            </label>
            <input
              id="location"
              className="input"
              placeholder="Visakhapatnam"
              value={form.location}
              onChange={(e) => update({ location: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="experienceYears" className="label">
              Years of experience
            </label>
            <input
              id="experienceYears"
              type="number"
              min={0}
              max={60}
              className="input"
              value={form.experienceYears}
              onChange={(e) => update({ experienceYears: Number(e.target.value) })}
            />
            <FieldError message={fieldErrors.experienceYears} />
          </div>
        </div>

        {user.role === 'recruiter' && (
          <div>
            <label htmlFor="company" className="label">
              Company
            </label>
            <input
              id="company"
              className="input"
              value={form.company}
              onChange={(e) => update({ company: e.target.value })}
            />
          </div>
        )}

        <div>
          <label htmlFor="skills" className="label">
            Skills
          </label>
          <input
            id="skills"
            className="input"
            placeholder="React, Node.js, MongoDB"
            value={form.skills}
            onChange={(e) => update({ skills: e.target.value })}
          />
          <p className="mt-1 text-xs text-slate-400">Separate skills with commas.</p>
          <FieldError message={fieldErrors.skills} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save changes'}
          </button>
          {status === 'saved' && <span className="text-sm text-emerald-600">Saved ✓</span>}
        </div>
      </form>
    </div>
  );
}
