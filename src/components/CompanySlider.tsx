export function CompanySlider() {
  const companies = [
    {
      name: 'Stripe',
      category: 'Financial Infrastructure',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.97 15.654.5 12.52.5 6.643.5 2.76 3.655 2.76 8.76c0 5.485 5.568 6.425 8.922 7.742 2.235.882 3.238 1.631 3.238 2.662 0 .973-.87 1.543-2.316 1.543-2.548 0-5.353-1.16-7.272-2.19l-.916 5.594c1.948 1.077 5.093 1.789 8.272 1.789 6.097 0 10.312-3.084 10.312-8.397.001-5.63-5.275-6.793-9.036-8.353z" />
        </svg>
      ),
    },
    {
      name: 'Linear',
      category: 'Engineering & Product',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.5 3.5h17v17h-17z" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <path d="M3.5 12h17M12 3.5v17" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
    },
    {
      name: 'Figma',
      category: 'Design Systems',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM6 6a3 3 0 0 1 6 0v6H6a3 3 0 0 1 0-6zm6 0a3 3 0 1 1 6 0 3 3 0 0 1-6 0zM6 12h6v6a3 3 0 0 1-6 0v-6zm3 6a3 3 0 0 1 3 3 3 3 0 0 1-6 0 3 3 0 0 1 3-3z" />
        </svg>
      ),
    },
    {
      name: 'Vercel',
      category: 'Frontend Cloud',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L24 22H0L12 1Z" />
        </svg>
      ),
    },
    {
      name: 'Notion',
      category: 'Connected Workspace',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.093-.373L17.89 1.64c-.466-.373-.84-.56-1.54-.514L3.619 2.06c-.56.047-.654.373-.42.56l1.26 1.588zm-.84 3.782v13.633c0 .84.42 1.167 1.214 1.12l14.475-.84c.793-.047 1.027-.56 1.027-1.167V6.634c0-.607-.28-.887-.887-.84l-14.94.887c-.607.047-.888.42-.888.906zm13.447.887c.093.42 0 .84-.42.887l-.7.14v10.13c-.607.373-1.214.56-1.727.56-.84 0-1.074-.28-1.727-1.12l-4.762-7.518v7.19l1.4.327c.093.42 0 .84-.42.887l-3.829.233c-.093-.42 0-.84.42-.887l.98-.233V8.877l-1.354-.14c-.094-.42 0-.84.42-.887l3.969-.233 4.95 7.61V8.69l-1.168-.187c-.093-.42 0-.84.42-.887l3.082-.187z" />
        </svg>
      ),
    },
    {
      name: 'Datadog',
      category: 'Cloud Observability',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      ),
    },
    {
      name: 'Supabase',
      category: 'Postgres Platform',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.9 1.1c.3-.4.9-.2 1 .3l2.8 9.3h6.8c.6 0 .9.7.5 1.1l-10.7 11c-.4.4-1.1.1-1-.4l-2.8-9.4H1.7c-.6 0-.9-.7-.5-1.1l10.7-10.8z" />
        </svg>
      ),
    },
    {
      name: 'Retool',
      category: 'Custom Operations',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 4h8v7H3zm10 0h8v7h-8zm-10 9h8v7H3zm10 0h8v7h-8z" />
        </svg>
      ),
    },
    {
      name: 'MongoDB',
      category: 'Developer Data',
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.001 0c-.395 0-.742.203-.94.524-.047.075-4.57 7.294-4.57 12.871 0 5.485 4.382 9.948 9.877 10.499.39.039.633-.105.633-.312 0-.083-.042-.167-.099-.214C16.892 23.36 12 19.344 12 12.63c0-4.707 3.327-10.718 3.51-11.056.09-.168.04-.374-.112-.489C14.773.614 13.415 0 12.001 0z" />
        </svg>
      ),
    },
  ];

  // Duplicate for seamless infinite loop
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <section className="py-10 border-y border-warm-border bg-white/70 overflow-hidden" aria-label="Partner Companies">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          Trusted by high-growth engineering & talent organizations
        </p>
        <p className="text-xs text-ink-muted mt-1">
          Scaling objective evaluations, structured scorecards, and bias-free screening.
        </p>
      </div>

      {/* Marquee Wrapper with left/right fade masks */}
      <div className="relative w-full overflow-hidden">
        {/* Left gradient fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-r from-white via-white/80 to-transparent" />
        {/* Right gradient fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-white via-white/80 to-transparent" />

        {/* Scrolling track */}
        <div className="flex w-max items-center gap-6 animate-marquee hover:[animation-play-state:paused] py-2">
          {duplicatedCompanies.map((company, idx) => (
            <div
              key={`${company.name}-${idx}`}
              className="flex items-center gap-3 rounded-lg border border-warm-border bg-warm-subtle/80 hover:bg-white px-5 py-3 transition-all duration-200 hover:shadow-sm hover:border-brand-900 group"
            >
              <div className="text-ink-muted group-hover:text-brand-900 transition-colors shrink-0">
                {company.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-ink group-hover:text-brand-900 transition-colors">
                  {company.name}
                </span>
                <span className="text-[10px] text-ink-muted group-hover:text-ink transition-colors">
                  {company.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
