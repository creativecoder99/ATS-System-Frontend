import { Link, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Jobs } from './pages/Jobs';
import { JobDetail } from './pages/JobDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { MyApplications } from './pages/MyApplications';
import { SavedJobs } from './pages/SavedJobs';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { RecruiterJobs } from './pages/RecruiterJobs';
import { JobForm } from './pages/JobForm';
import { JobApplicants } from './pages/JobApplicants';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4] text-stone-900">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Any signed-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Candidates only */}
          <Route element={<ProtectedRoute roles={['candidate']} />}>
            <Route path="/dashboard" element={<CandidateDashboard />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/saved" element={<SavedJobs />} />
          </Route>

          {/* Recruiters and admins */}
          <Route element={<ProtectedRoute roles={['recruiter', 'admin']} />}>
            <Route path="/recruiter" element={<RecruiterDashboard />} />
            <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
            <Route path="/recruiter/jobs/new" element={<JobForm />} />
            <Route path="/recruiter/jobs/:id/edit" element={<JobForm />} />
            <Route path="/recruiter/jobs/:id/applicants" element={<JobApplicants />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="border-t border-stone-200/90 bg-[#f8f7f4] py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2 font-medium text-stone-700">
            <span className="grid h-5 w-5 place-items-center rounded bg-[#0f2942] text-[10px] font-bold text-white">
              HH
            </span>
            <span>HireHive Applicant Tracking System</span>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/jobs" className="hover:text-stone-900 transition-colors">
              Jobs
            </Link>
            <Link to="/terms" className="hover:text-stone-900 transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-stone-900 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-stone-300">404</h1>
      <p className="mt-3 text-sm text-stone-600">The requested page does not exist.</p>
      <Link to="/" className="btn-primary mt-5 text-xs">
        Return home
      </Link>
    </div>
  );
}
