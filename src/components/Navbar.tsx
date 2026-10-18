import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { formatRelativeDate } from '../lib/format';
import type { AppNotification } from '../types';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () =>
      api.get<{ success: boolean; data: AppNotification[]; unreadCount: number }>('/notifications'),
    enabled: !!user,
    refetchInterval: 30_000,
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-stone-200/80 text-stone-900 font-semibold'
        : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
    }`;

  const unreadCount = notifData?.unreadCount ?? 0;
  const notifications = notifData?.data ?? [];

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/90 bg-[#f8f7f4]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-stone-900">
          <span className="grid h-8 w-8 place-items-center rounded bg-[#0f2942] text-xs font-bold text-white">
            HH
          </span>
          <span>HireHive</span>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
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
              <NavLink to="/recruiter" end className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/recruiter/jobs" end className={linkClass}>
                Postings
              </NavLink>
              <NavLink to="/recruiter/jobs/new" end className={linkClass}>
                Post Job
              </NavLink>
            </>
          )}

          {user ? (
            <div className="ml-2 flex items-center gap-2 sm:gap-3 border-l border-stone-200 pl-3">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative rounded p-1.5 text-stone-600 hover:bg-stone-200/60 hover:text-stone-900 focus-visible:ring-1"
                  aria-label="View notifications"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#0f2942] text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-stone-300 bg-white p-3 shadow-lg z-50">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200">
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                        Notifications {unreadCount > 0 && `(${unreadCount})`}
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="text-xs font-medium text-stone-600 hover:text-stone-900"
                          onClick={() => markAllMutation.mutate()}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="py-6 text-center text-xs text-stone-500">No notifications yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`rounded p-2 text-xs transition-colors ${
                              n.read ? 'bg-transparent text-stone-600' : 'bg-stone-100/80 text-stone-900 font-medium'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-stone-900">{n.title}</span>
                              <span className="text-[10px] text-stone-400 whitespace-nowrap">
                                {formatRelativeDate(n.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-stone-600">{n.message}</p>
                            <div className="mt-2 flex items-center justify-between pt-1">
                              {n.link ? (
                                <Link
                                  to={n.link}
                                  onClick={() => {
                                    if (!n.read) markOneMutation.mutate(n._id);
                                    setNotifOpen(false);
                                  }}
                                  className="text-xs font-medium text-[#0f2942] hover:underline"
                                >
                                  View details
                                </Link>
                              ) : <span />}
                              {!n.read && (
                                <button
                                  type="button"
                                  onClick={() => markOneMutation.mutate(n._id)}
                                  className="text-[11px] text-stone-500 hover:text-stone-800"
                                >
                                  Dismiss
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/profile"
                className="text-xs font-semibold text-stone-800 hover:text-black hidden sm:inline"
              >
                {user.name.split(' ')[0]}
              </Link>
              <button type="button" onClick={handleLogout} className="btn-secondary text-xs py-1.5 px-3">
                Log out
              </button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2 border-l border-stone-200 pl-3">
              <Link to="/login" className="btn-secondary text-xs py-1.5 px-3">
                Log in
              </Link>
              <Link to="/register" className="btn-accent text-xs py-1.5 px-3">
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
