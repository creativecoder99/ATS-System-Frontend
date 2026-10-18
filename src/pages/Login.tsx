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
        <div className="mb-4">
          <Link to="/">
            <img
              src="/logo/hirehive-logo.png"
              alt="HireHive"
              className="h-9 w-auto object-contain rounded"
            />
          </Link>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-muted">Sign in to your HireHive workspace.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormError message={error} />

          <div>
            <label htmlFor="email" className="label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="name@company.com"
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
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 rounded border border-warm-border bg-warm-surface p-3.5">
          <p className="text-xs font-semibold text-ink">Demo credentials</p>
          <p className="mt-0.5 text-xs text-ink-muted">Click to auto-fill verified seed accounts:</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="btn-secondary text-xs py-1.5"
              onClick={() => fillDemo('abhinav@example.com')}
            >
              Candidate demo
            </button>
            <button
              type="button"
              className="btn-secondary text-xs py-1.5"
              onClick={() => fillDemo('priya@techcorp.in')}
            >
              Recruiter demo
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Do not have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-900 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
