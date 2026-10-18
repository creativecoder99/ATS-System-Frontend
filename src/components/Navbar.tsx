import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm text-white">
            HD
          </span>
          HireDesk
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/jobs" className={linkClass}>
            Jobs
          </NavLink>

          {user?.role === 'candidate' && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/applications" className={linkClass}>
                Applications
              </NavLink>
              <NavLink to="/saved" className={linkClass}>
                Saved
              </NavLink>
            </>
          )}

          {(user?.role === 'recruiter' || user?.role === 'admin') && (
            <>
              {/* `end` matters on these three: without it NavLink treats the
                  path as a prefix, so /recruiter would stay highlighted on
                  /recruiter/jobs and two tabs would look active at once. */}
              <NavLink to="/recruiter" end className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/recruiter/jobs" end className={linkClass}>
                My Jobs
              </NavLink>
              <NavLink to="/recruiter/jobs/new" end className={linkClass}>
                Post a Job
              </NavLink>
            </>
          )}

          {user ? (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
              <Link
                to="/profile"
                className="text-sm font-medium text-slate-700 hover:text-brand-700"
              >
                {user.name.split(' ')[0]}
              </Link>
              <button type="button" onClick={handleLogout} className="btn-secondary">
                Log out
              </button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
              <Link to="/login" className="btn-secondary">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
