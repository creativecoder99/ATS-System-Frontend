import { useState, useEffect, type FormEvent } from 'react';
import { api, ApiRequestError } from '../lib/api';
import { FieldError, FormError } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { VerificationBadge } from '../components/VerificationBadge';
import type { User, VerificationDocument } from '../types';

type ProfileTab = 'details' | 'verification' | 'admin-console';

export function Profile() {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<ProfileTab>('details');

  // Form State
  const [form, setForm] = useState({
    name: user?.name ?? '',
    headline: user?.headline ?? '',
    location: user?.location ?? '',
    phone: user?.phone ?? '',
    bio: user?.bio ?? '',
    experienceYears: user?.experienceYears ?? 0,
    skills: (user?.skills ?? []).join(', '),
    linkedinUrl: user?.linkedinUrl ?? '',
    portfolioUrl: user?.portfolioUrl ?? '',
    githubUrl: user?.githubUrl ?? '',
    education: user?.education ?? '',
    currentCompany: user?.currentCompany ?? '',
    currentRole: user?.currentRole ?? '',
    company: user?.company ?? '',
    designation: user?.designation ?? '',
    companyWebsite: user?.companyWebsite ?? '',
    industry: user?.industry ?? '',
    companySize: user?.companySize ?? '',
    officeAddress: user?.officeAddress ?? '',
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Document Upload State
  const defaultDocType = user?.role === 'recruiter' ? 'company_registration' : 'government_id';
  const [docType, setDocType] = useState<string>(defaultDocType);
  const [docTitle, setDocTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docMessage, setDocMessage] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // Admin Verification Console State
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [loadingAdminUsers, setLoadingAdminUsers] = useState(false);
  const [adminActionStatus, setAdminActionStatus] = useState<string | null>(null);

  // Keep form in sync if user changes
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        headline: user.headline ?? '',
        location: user.location ?? '',
        phone: user.phone ?? '',
        bio: user.bio ?? '',
        experienceYears: user.experienceYears ?? 0,
        skills: (user.skills ?? []).join(', '),
        linkedinUrl: user.linkedinUrl ?? '',
        portfolioUrl: user.portfolioUrl ?? '',
        githubUrl: user.githubUrl ?? '',
        education: user.education ?? '',
        currentCompany: user.currentCompany ?? '',
        currentRole: user.currentRole ?? '',
        company: user.company ?? '',
        designation: user.designation ?? '',
        companyWebsite: user.companyWebsite ?? '',
        industry: user.industry ?? '',
        companySize: user.companySize ?? '',
        officeAddress: user.officeAddress ?? '',
      });
    }
  }, [user]);

  // Load admin verifications if admin
  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'admin-console') {
      fetchAdminVerifications();
    }
  }, [user?.role, activeTab]);

  const fetchAdminVerifications = async () => {
    setLoadingAdminUsers(true);
    try {
      const res = await api.get<{ success: boolean; data: User[] }>('/admin/verifications');
      setAdminUsers(res.data);
    } catch (err) {
      console.error('Failed to load admin verification list:', err);
    } finally {
      setLoadingAdminUsers(false);
    }
  };

  const update = (patch: Partial<typeof form>) => {
    setForm((f) => ({ ...f, ...patch }));
    setSaveStatus('idle');
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaveStatus('saving');

    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        headline: form.headline.trim() || undefined,
        location: form.location.trim() || undefined,
        phone: form.phone.trim() || undefined,
        bio: form.bio.trim() || undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        portfolioUrl: form.portfolioUrl.trim() || undefined,
        githubUrl: form.githubUrl.trim() || undefined,
      };

      if (user?.role === 'candidate') {
        payload.experienceYears = Number(form.experienceYears);
        payload.education = form.education.trim() || undefined;
        payload.currentCompany = form.currentCompany.trim() || undefined;
        payload.currentRole = form.currentRole.trim() || undefined;
        payload.skills = form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (user?.role === 'recruiter') {
        payload.company = form.company.trim() || undefined;
        payload.designation = form.designation.trim() || undefined;
        payload.companyWebsite = form.companyWebsite.trim() || undefined;
        payload.industry = form.industry.trim() || undefined;
        payload.companySize = form.companySize || undefined;
        payload.officeAddress = form.officeAddress.trim() || undefined;
      }

      const res = await api.patch<{ data: User }>('/auth/me', payload);
      updateUser(res.data);
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('idle');
      if (err instanceof ApiRequestError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError('Could not save your profile details.');
      }
    }
  };

  const handleDocumentUpload = async (e: FormEvent) => {
    e.preventDefault();
    setDocError(null);
    setDocMessage(null);

    if (!selectedFile) {
      setDocError('Please select a file to upload (PDF, Word, or Image).');
      return;
    }
    if (!docTitle.trim()) {
      setDocError('Please enter a descriptive document title.');
      return;
    }

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('docType', docType);
      formData.append('title', docTitle.trim());

      const res = await api.postForm<{ success: boolean; data: User }>('/auth/me/verification-docs', formData);
      updateUser(res.data);
      setDocMessage('Document uploaded successfully. It is ready for admin verification.');
      setSelectedFile(null);
      setDocTitle('');
      // Reset file input
      const fileInput = document.getElementById('verification-file-input') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setDocError(err instanceof ApiRequestError ? err.message : 'Failed to upload verification document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to remove this verification document?')) return;
    try {
      const res = await api.delete<{ success: boolean; data: User }>(`/auth/me/verification-docs/${docId}`);
      updateUser(res.data);
      setDocMessage('Verification document removed.');
    } catch (err) {
      setDocError(err instanceof ApiRequestError ? err.message : 'Could not delete document');
    }
  };

  const handleSubmitVerification = async () => {
    setDocError(null);
    setDocMessage(null);
    setSubmittingVerification(true);
    try {
      const res = await api.post<{ success: boolean; data: User }>('/auth/me/submit-verification', {});
      updateUser(res.data);
      setDocMessage('Your verification request has been submitted to the admin team for review.');
    } catch (err) {
      setDocError(err instanceof ApiRequestError ? err.message : 'Could not submit verification request');
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleAdminReview = async (userId: string, status: 'verified' | 'rejected', notes?: string) => {
    try {
      setAdminActionStatus(`Updating user status to ${status}...`);
      await api.patch(`/admin/verifications/${userId}`, { status, notes });
      setAdminActionStatus(`User successfully marked as ${status}.`);
      fetchAdminVerifications();
    } catch (err) {
      setAdminActionStatus(err instanceof ApiRequestError ? err.message : 'Admin action failed');
    }
  };

  if (!user) return null;

  const docs = user.verificationDocuments ?? [];
  const isVerified = user.isVerified || user.verificationStatus === 'verified';
  const roleTitle = user.role === 'recruiter' ? 'Recruiter' : user.role === 'candidate' ? 'Candidate' : 'Administrator';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="card p-6 border-warm-border bg-gradient-to-b from-white to-warm-subtle/30 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-lg font-bold text-white shadow-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">{user.name}</h1>
                <VerificationBadge
                  isVerified={user.isVerified}
                  status={user.verificationStatus}
                  role={user.role}
                  size="md"
                />
              </div>
              <p className="text-xs text-ink-muted">
                {user.email} · <span className="capitalize font-semibold text-ink">{roleTitle}</span>
                {user.company && ` · ${user.company}`}
              </p>
              {user.headline && <p className="text-xs text-ink-800 font-medium">{user.headline}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isVerified && (
              <button
                type="button"
                onClick={() => setActiveTab('verification')}
                className="btn-accent text-xs px-3.5 py-2 flex items-center gap-1.5"
              >
                <span>Upload Verification Docs</span>
              </button>
            )}
            {isVerified && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                <span>✓ Verified Profile</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-warm-border mt-6 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'details'
                ? 'bg-brand-900 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-warm-subtle'
            }`}
          >
            Profile Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'verification'
                ? 'bg-brand-900 text-white shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-warm-subtle'
            }`}
          >
            <span>Document Verification</span>
            <VerificationBadge
              isVerified={user.isVerified}
              status={user.verificationStatus}
              role={user.role}
              size="sm"
              showLabel={false}
            />
          </button>
          {user.role === 'admin' && (
            <button
              type="button"
              onClick={() => setActiveTab('admin-console')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'admin-console'
                  ? 'bg-brand-900 text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink hover:bg-warm-subtle'
              }`}
            >
              <span>Admin Verification Console</span>
              <span className="rounded bg-white/20 px-1 text-[10px]">Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: PROFILE DETAILS */}
      {activeTab === 'details' && (
        <form onSubmit={handleProfileSubmit} className="card p-6 border-warm-border bg-white shadow-xs space-y-6">
          <div className="border-b border-warm-border pb-3">
            <h2 className="text-base font-bold text-ink">Account & Personal Details</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Keep your profile credentials up to date. Recruiters and candidates see verified details across HireHive.
            </p>
          </div>

          <FormError message={error} />

          {/* Basic Identity */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">
                Full Name <span className="text-red-500">*</span>
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
              <label htmlFor="phone" className="label">
                Contact Phone
              </label>
              <input
                id="phone"
                className="input"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => update({ phone: e.target.value })}
              />
              <FieldError message={fieldErrors.phone} />
            </div>
          </div>

          <div>
            <label htmlFor="headline" className="label">
              Professional Headline
            </label>
            <input
              id="headline"
              className="input"
              placeholder={
                user.role === 'recruiter'
                  ? 'Lead Technical Recruiter at FinStack | Hiring Cloud & Backend Engineers'
                  : 'Full Stack Engineer | React, TypeScript, Node.js & Generative AI'
              }
              value={form.headline}
              onChange={(e) => update({ headline: e.target.value })}
              maxLength={140}
            />
            <FieldError message={fieldErrors.headline} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="location" className="label">
                Primary Location
              </label>
              <input
                id="location"
                className="input"
                placeholder="Bangalore, India"
                value={form.location}
                onChange={(e) => update({ location: e.target.value })}
              />
              <FieldError message={fieldErrors.location} />
            </div>

            {user.role === 'candidate' ? (
              <div>
                <label htmlFor="experienceYears" className="label">
                  Total Experience (Years)
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
            ) : (
              <div>
                <label htmlFor="designation" className="label">
                  Designation / Role Title
                </label>
                <input
                  id="designation"
                  className="input"
                  placeholder="VP of Talent Acquisition / Senior Technical Recruiter"
                  value={form.designation}
                  onChange={(e) => update({ designation: e.target.value })}
                />
                <FieldError message={fieldErrors.designation} />
              </div>
            )}
          </div>

          {/* CANDIDATE SPECIFIC FIELDS */}
          {user.role === 'candidate' && (
            <div className="space-y-4 pt-2 border-t border-warm-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Academic & Employment Credentials
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="education" className="label">
                    Highest Education / Degree
                  </label>
                  <input
                    id="education"
                    className="input"
                    placeholder="B.Tech in Computer Science & Engineering, 2026"
                    value={form.education}
                    onChange={(e) => update({ education: e.target.value })}
                  />
                  <FieldError message={fieldErrors.education} />
                </div>

                <div>
                  <label htmlFor="currentRole" className="label">
                    Current Position / Role
                  </label>
                  <input
                    id="currentRole"
                    className="input"
                    placeholder="Frontend Engineer / Intern / Student"
                    value={form.currentRole}
                    onChange={(e) => update({ currentRole: e.target.value })}
                  />
                  <FieldError message={fieldErrors.currentRole} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="currentCompany" className="label">
                    Current Company / University
                  </label>
                  <input
                    id="currentCompany"
                    className="input"
                    placeholder="TechCorp Labs / IIT Madras"
                    value={form.currentCompany}
                    onChange={(e) => update({ currentCompany: e.target.value })}
                  />
                  <FieldError message={fieldErrors.currentCompany} />
                </div>

                <div>
                  <label htmlFor="portfolioUrl" className="label">
                    Portfolio / Personal Website URL
                  </label>
                  <input
                    id="portfolioUrl"
                    type="url"
                    className="input"
                    placeholder="https://yourportfolio.dev"
                    value={form.portfolioUrl}
                    onChange={(e) => update({ portfolioUrl: e.target.value })}
                  />
                  <FieldError message={fieldErrors.portfolioUrl} />
                </div>
              </div>

              <div>
                <label htmlFor="skills" className="label">
                  Key Technical Skills
                </label>
                <input
                  id="skills"
                  className="input"
                  placeholder="React, TypeScript, Node.js, Express, MongoDB, Python, TailwindCSS"
                  value={form.skills}
                  onChange={(e) => update({ skills: e.target.value })}
                />
                <p className="mt-1 text-[11px] text-ink-muted">Separate skills with commas.</p>
                <FieldError message={fieldErrors.skills} />
              </div>
            </div>
          )}

          {/* RECRUITER SPECIFIC FIELDS */}
          {user.role === 'recruiter' && (
            <div className="space-y-4 pt-2 border-t border-warm-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Company & Organization Credentials
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="company" className="label">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="company"
                    className="input"
                    placeholder="TechCorp India"
                    value={form.company}
                    onChange={(e) => update({ company: e.target.value })}
                    required
                  />
                  <FieldError message={fieldErrors.company} />
                </div>

                <div>
                  <label htmlFor="companyWebsite" className="label">
                    Company Website URL
                  </label>
                  <input
                    id="companyWebsite"
                    type="url"
                    className="input"
                    placeholder="https://company.com"
                    value={form.companyWebsite}
                    onChange={(e) => update({ companyWebsite: e.target.value })}
                  />
                  <FieldError message={fieldErrors.companyWebsite} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="industry" className="label">
                    Industry Sector
                  </label>
                  <input
                    id="industry"
                    className="input"
                    placeholder="Software & SaaS / Fintech / Healthcare"
                    value={form.industry}
                    onChange={(e) => update({ industry: e.target.value })}
                  />
                  <FieldError message={fieldErrors.industry} />
                </div>

                <div>
                  <label htmlFor="companySize" className="label">
                    Company Size (Employees)
                  </label>
                  <select
                    id="companySize"
                    className="input cursor-pointer"
                    value={form.companySize}
                    onChange={(e) => update({ companySize: e.target.value })}
                  >
                    <option value="">Select Company Size</option>
                    <option value="1-10">1-10 employees (Early Startup)</option>
                    <option value="11-50">11-50 employees (Growth)</option>
                    <option value="51-200">51-200 employees (Mid-market)</option>
                    <option value="201-500">201-500 employees (Scale-up)</option>
                    <option value="500-1000">500-1000 employees (Enterprise)</option>
                    <option value="1000+">1000+ employees (Global Enterprise)</option>
                  </select>
                  <FieldError message={fieldErrors.companySize} />
                </div>
              </div>

              <div>
                <label htmlFor="officeAddress" className="label">
                  Headquarters / Office Address
                </label>
                <input
                  id="officeAddress"
                  className="input"
                  placeholder="Embassy TechVillage, Outer Ring Road, Bangalore 560103"
                  value={form.officeAddress}
                  onChange={(e) => update({ officeAddress: e.target.value })}
                />
                <FieldError message={fieldErrors.officeAddress} />
              </div>
            </div>
          )}

          {/* Social Profiles & Bio */}
          <div className="space-y-4 pt-2 border-t border-warm-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Professional Links & Bio
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="linkedinUrl" className="label">
                  LinkedIn Profile URL
                </label>
                <input
                  id="linkedinUrl"
                  type="url"
                  className="input"
                  placeholder="https://linkedin.com/in/yourname"
                  value={form.linkedinUrl}
                  onChange={(e) => update({ linkedinUrl: e.target.value })}
                />
                <FieldError message={fieldErrors.linkedinUrl} />
              </div>

              {user.role === 'candidate' && (
                <div>
                  <label htmlFor="githubUrl" className="label">
                    GitHub Profile URL
                  </label>
                  <input
                    id="githubUrl"
                    type="url"
                    className="input"
                    placeholder="https://github.com/yourusername"
                    value={form.githubUrl}
                    onChange={(e) => update({ githubUrl: e.target.value })}
                  />
                  <FieldError message={fieldErrors.githubUrl} />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="bio" className="label">
                {user.role === 'recruiter' ? 'About Your Organization & Hiring Goals' : 'Professional Summary / Bio'}
              </label>
              <textarea
                id="bio"
                rows={3}
                className="input leading-relaxed"
                placeholder={
                  user.role === 'recruiter'
                    ? 'Share what makes your team exceptional, current expansion plans, and culture...'
                    : 'Highlight your technical background, major achievements, and areas of engineering passion...'
                }
                value={form.bio}
                onChange={(e) => update({ bio: e.target.value })}
                maxLength={2000}
              />
              <p className="mt-1 text-[11px] text-ink-muted">Up to 2,000 characters.</p>
              <FieldError message={fieldErrors.bio} />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center gap-3 pt-4 border-t border-warm-border">
            <button type="submit" className="btn-primary text-xs px-5 py-2.5 font-semibold" disabled={saveStatus === 'saving'}>
              {saveStatus === 'saving' ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
            {saveStatus === 'saved' && (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md animate-fade-in">
                ✓ Changes saved successfully
              </span>
            )}
          </div>
        </form>
      )}

      {/* TAB 2: DOCUMENT VERIFICATION */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          {/* Trust & Safety Status Overview Card */}
          <div className="card p-6 border-warm-border bg-gradient-to-b from-white to-warm-subtle/30 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900 text-white font-bold text-sm shadow-xs">
                  🛡️
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink">Trust & Identity Verification</h2>
                  <p className="text-xs text-ink-muted">
                    Reviewed and confirmed by the HireHive Admin Trust & Safety Team.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-muted">Current Status:</span>
                <VerificationBadge
                  isVerified={user.isVerified}
                  status={user.verificationStatus}
                  role={user.role}
                  size="md"
                />
              </div>
            </div>

            {/* Status Explanations */}
            {isVerified ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <span>✓ Your account is officially verified!</span>
                </p>
                <p className="text-emerald-800">
                  All job postings and candidate applications submitted with this account feature the trusted Verified badge.
                  {user.verifiedAt && ` Verified on ${new Date(user.verifiedAt).toLocaleDateString()}.`}
                </p>
              </div>
            ) : user.verificationStatus === 'pending' ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                  <span>Documents Under Review by Admin Team</span>
                </p>
                <p className="text-amber-800">
                  Your submitted credentials are being reviewed by the HireHive verification team. You will receive an
                  in-app notification once the review is completed.
                </p>
              </div>
            ) : user.verificationStatus === 'rejected' ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-rose-950">
                  <span>✕ Verification Review Feedback:</span>
                </p>
                <p className="text-rose-800">
                  {user.verificationRejectionReason || 'Please review your uploaded documents and submit valid credentials.'}
                </p>
                <p className="text-rose-700 text-[11px] pt-1">
                  You can upload replacement documents below and re-submit for admin verification anytime.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-warm-border bg-warm-subtle/50 p-4 text-xs text-ink space-y-1">
                <p className="font-bold text-ink">Account Not Verified Yet</p>
                <p className="text-ink-muted">
                  {user.role === 'recruiter'
                    ? 'Upload your Certificate of Incorporation or Business Registration to get the Verified Recruiter tag on your job openings.'
                    : 'Upload your National ID proof, Academic Certificate, or Relieving Letter to earn the Verified Candidate tag on your applications.'}
                </p>
              </div>
            )}
          </div>

          {/* Document Upload Form */}
          <form onSubmit={handleDocumentUpload} className="card p-6 border-warm-border bg-white shadow-xs space-y-4">
            <div className="border-b border-warm-border pb-3">
              <h3 className="text-sm font-bold text-ink">Upload Verification Document</h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Supported formats: PDF, Word (.doc, .docx), Images (JPG, PNG, WEBP). Maximum file size: 10 MB.
              </p>
            </div>

            {docError && (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                {docError}
              </div>
            )}
            {docMessage && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                {docMessage}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="docType" className="label">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="docType"
                  className="input cursor-pointer"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  required
                >
                  {user.role === 'recruiter' ? (
                    <>
                      <option value="company_registration">Certificate of Incorporation / Registration</option>
                      <option value="tax_id">GSTIN / Corporate Tax ID / PAN Card</option>
                      <option value="corporate_id">Corporate ID Badge / Official Authorization Letter</option>
                      <option value="other">Utility Bill / Lease Agreement / Other</option>
                    </>
                  ) : (
                    <>
                      <option value="government_id">National ID Proof (Passport / Aadhaar / Driver License)</option>
                      <option value="degree_certificate">Academic Degree / College Bonafide Certificate</option>
                      <option value="experience_letter">Previous Employment Offer / Relieving Letter</option>
                      <option value="other">Professional Certification / Other</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="docTitle" className="label">
                  Document Title / Description <span className="text-red-500">*</span>
                </label>
                <input
                  id="docTitle"
                  className="input"
                  placeholder={
                    user.role === 'recruiter'
                      ? 'e.g. Certificate of Incorporation 2024'
                      : 'e.g. Passport Photo Page / B.Tech Degree'
                  }
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  maxLength={120}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="verification-file-input" className="label">
                Select File Document <span className="text-red-500">*</span>
              </label>
              <input
                id="verification-file-input"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                className="input cursor-pointer text-xs"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                required
              />
              {selectedFile && (
                <p className="mt-1.5 text-[11px] font-medium text-ink-muted">
                  Selected: <span className="text-ink font-semibold">{selectedFile.name}</span> (
                  {(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={uploadingDoc || !selectedFile || !docTitle.trim()}
                className="btn-primary text-xs px-4 py-2 font-semibold flex items-center gap-2"
              >
                {uploadingDoc ? (
                  <>
                    <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Uploading Document...</span>
                  </>
                ) : (
                  <span>✦ Upload Document</span>
                )}
              </button>
            </div>
          </form>

          {/* Uploaded Documents List */}
          <div className="card p-6 border-warm-border bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-warm-border">
              <div>
                <h3 className="text-sm font-bold text-ink">Uploaded Verification Credentials ({docs.length})</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  These records are secured and accessible only by you and the HireHive Admin Team.
                </p>
              </div>

              {docs.length > 0 && !isVerified && user.verificationStatus !== 'pending' && (
                <button
                  type="button"
                  onClick={handleSubmitVerification}
                  disabled={submittingVerification}
                  className="btn-accent text-xs px-3.5 py-1.5 font-semibold"
                >
                  {submittingVerification ? 'Submitting...' : 'Submit All to Admin Team →'}
                </button>
              )}
            </div>

            {docs.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-muted bg-warm-subtle/30 rounded-lg border border-dashed border-warm-border">
                <p className="font-semibold text-ink">No verification documents uploaded yet.</p>
                <p className="mt-1">
                  Upload your identity or company registration credentials above to start the verification process.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-warm-border">
                {docs.map((doc: VerificationDocument, idx: number) => (
                  <div key={doc._id ?? idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warm-subtle text-base font-bold text-ink border border-warm-border">
                        📄
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-ink">{doc.title}</p>
                          <span
                            className={`chip text-[10px] font-bold ${
                              doc.status === 'verified'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : doc.status === 'rejected'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {doc.status === 'verified'
                              ? 'Verified'
                              : doc.status === 'rejected'
                              ? 'Rejected'
                              : 'Under Review'}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-muted">
                          {doc.originalName} · Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                          {doc.fileSize && ` · ${(doc.fileSize / 1024).toFixed(0)} KB`}
                        </p>
                        {doc.adminNotes && (
                          <p className="text-[11px] text-amber-800 font-medium">Note: {doc.adminNotes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-[11px] px-2.5 py-1"
                      >
                        View File ↗
                      </a>
                      {!isVerified && (
                        <button
                          type="button"
                          onClick={() => doc._id && handleDeleteDocument(doc._id)}
                          className="text-[11px] text-rose-700 hover:text-rose-900 px-2 py-1 font-medium transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ADMIN VERIFICATION CONSOLE (VISIBLE ONLY TO ADMINS) */}
      {user.role === 'admin' && activeTab === 'admin-console' && (
        <div className="space-y-5">
          <div className="card p-6 border-warm-border bg-white shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-border">
              <div>
                <h2 className="text-base font-bold text-ink">Admin Trust & Safety Verification Queue</h2>
                <p className="text-xs text-ink-muted">
                  Review submitted verification documents and grant official Verified Candidate and Verified Recruiter badges.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAdminVerifications}
                className="btn-secondary text-xs px-3 py-1.5"
                disabled={loadingAdminUsers}
              >
                {loadingAdminUsers ? 'Refreshing...' : '↻ Refresh List'}
              </button>
            </div>

            {adminActionStatus && (
              <div className="rounded-md border border-brand-200 bg-brand-subtle/50 p-3 text-xs text-brand-900">
                {adminActionStatus}
              </div>
            )}

            {loadingAdminUsers ? (
              <div className="py-8 text-center text-xs text-ink-muted animate-pulse">
                Loading verification requests...
              </div>
            ) : adminUsers.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-muted">
                No users currently in verification queue.
              </div>
            ) : (
              <div className="divide-y divide-warm-border">
                {adminUsers.map((u) => {
                  const userDocs = u.verificationDocuments ?? [];
                  return (
                    <div key={u._id} className="py-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-ink">{u.name}</h3>
                            <span className="chip text-[10px] font-bold uppercase tracking-wider bg-warm-subtle text-ink">
                              {u.role}
                            </span>
                            <VerificationBadge
                              isVerified={u.isVerified}
                              status={u.verificationStatus}
                              role={u.role}
                              size="sm"
                            />
                          </div>
                          <p className="text-xs text-ink-muted">
                            {u.email} {u.company && `· ${u.company}`}
                            {u.phone && `· ${u.phone}`}
                          </p>
                          {u.headline && <p className="text-xs text-ink-800">{u.headline}</p>}
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAdminReview(u._id, 'verified')}
                            className="btn-primary text-xs px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white"
                          >
                            ✓ Approve & Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt('Enter rejection feedback for candidate/recruiter:');
                              if (reason !== null) handleAdminReview(u._id, 'rejected', reason);
                            }}
                            className="btn-secondary text-xs px-3 py-1.5 text-rose-700 hover:bg-rose-50 border-rose-200"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>

                      {/* User's Documents */}
                      {userDocs.length > 0 ? (
                        <div className="rounded-lg bg-warm-surface/70 border border-warm-border p-3 space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                            Submitted Documents ({userDocs.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {userDocs.map((d, dIdx) => (
                              <div
                                key={d._id ?? dIdx}
                                className="flex items-center gap-2 rounded bg-white px-2.5 py-1.5 border border-warm-border text-xs"
                              >
                                <span className="font-semibold text-ink">{d.title}</span>
                                <span className="text-[10px] text-ink-muted">({d.docType})</span>
                                <a
                                  href={d.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-900 font-bold hover:underline"
                                >
                                  Open ↗
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-ink-muted italic">No documents attached yet.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
