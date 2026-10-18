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

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500">
          HireDesk — a MERN job portal and applicant tracking system.
        </div>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-5xl font-bold text-slate-300">404</h1>
      <p className="mt-4 text-slate-600">We couldn&apos;t find that page.</p>
      <Link to="/" className="btn-primary mt-6">
        Go home
      </Link>
    </div>
  );
}
