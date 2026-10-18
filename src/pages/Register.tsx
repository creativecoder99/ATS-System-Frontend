import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ApiRequestError } from '../lib/api';
import { FieldError, FormError } from '../components/ui';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate' as 'candidate' | 'recruiter',
    company: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const user = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        // Only meaningful for recruiters; omit it entirely otherwise.
        ...(form.role === 'recruiter' && form.company ? { company: form.company } : {}),
      });
      navigate(user.role === 'candidate' ? '/dashboard' : '/recruiter', { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError('Could not create your account. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card p-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-900 text-xs font-bold text-white tracking-wider">
            HH
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink">HireHive</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-ink-muted">Set up your workspace as a candidate or recruiter.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormError message={error} />

          <fieldset>
            <legend className="label">Account role</legend>
            <div className="grid grid-cols-2 gap-2">
              {(['candidate', 'recruiter'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => update({ role })}
                  className={`rounded border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    form.role === role
                      ? 'border-brand-900 bg-brand-900 text-white'
                      : 'border-warm-border bg-warm-surface text-ink hover:bg-warm-highlight'
                  }`}
                  aria-pressed={form.role === role}
                >
                  {role}
                </button>
              ))}
            </div>
          </fieldset>

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
              autoComplete="name"
              placeholder="Full name"
            />
            <FieldError message={fieldErrors.name} />
          </div>

          {form.role === 'recruiter' && (
            <div>
              <label htmlFor="company" className="label">
                Company name
              </label>
              <input
                id="company"
                className="input"
                value={form.company}
                onChange={(e) => update({ company: e.target.value })}
                placeholder="TechCorp Solutions"
              />
              <FieldError message={fieldErrors.company} />
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">
              Work or personal email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => update({ email: e.target.value })}
              required
              autoComplete="email"
              placeholder="name@domain.com"
            />
            <FieldError message={fieldErrors.email} />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => update({ password: e.target.value })}
              required
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-ink-muted">
              At least 8 characters, including a letter and a number.
            </p>
            <FieldError message={fieldErrors.password} />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
