import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ApiRequestError } from '../lib/api';
import { FormError } from '../components/ui';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const user = await login(email, password);
      // Send them back where they came from, or to the dashboard for their role.
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? (user.role === 'candidate' ? '/dashboard' : '/recruiter'), { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Could not log in. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to your HireDesk account.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormError message={error} />

          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-600">Demo accounts (after running the seed)</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="btn-secondary flex-1 text-xs"
              onClick={() => fillDemo('abhinav@example.com')}
            >
              Candidate
            </button>
            <button
              type="button"
              className="btn-secondary flex-1 text-xs"
              onClick={() => fillDemo('priya@techcorp.in')}
            >
              Recruiter
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-brand-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
