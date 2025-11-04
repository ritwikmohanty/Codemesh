import React from 'react';

// An icon for the contest calendar
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6 text-primary"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// An icon for the user profile/stats
const ProfileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6 text-primary"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);


const Grid = () => {
  return (
    // Main section with padding
    <section className="p-8">
      <div className="max-w-6xl mx-auto">

        {/* Heading and Subheading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 font-sans text-foreground">
            Master Competitive Programming, Effortlessly
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-sans">
            Organize your prep, monitor progress, and focus on what matters—with all your coding activity and analytics in one place.
          </p>
        </div>

        {/* Grid container: 1 column on mobile, 2 on medium screens and up. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Card 1: Contest Calendar */}
          <div className="relative group bg-card text-card-foreground rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
            {/* Layer 1: Absolutely positioned image for the peeking effect */}
            {/* <div className="absolute top-0 left-0 z-5 transition-transform duration-300 ease-in-out transform translate-x-20 translate-y-[240px] group-hover:translate-x-8 group-hover:translate-y-[200px]">
              <img
                src="/calender_light.png"
                alt="Contest Calendar"
                className="block dark:hidden w-[485px] h-auto object-contain"
                draggable={false}
              />
              <img
                src="/calender_dark.png"
                alt="Contest Calendar"
                className="hidden dark:block w-[485px] h-auto object-contain"
                draggable={false}
              />
            </div> */}
            
            {/* Layer 2: The background visual area */}
            <div className="relative group bg-card text-card-foreground rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
                 <div className="relative h-64 bg-muted/50 overflow-hidden">
                 <div className="absolute top-0 left-0 transition-transform duration-300 ease-in-out transform translate-x-20 translate-y-[60px] group-hover:translate-x-16 group-hover:translate-y-[40px]">
                 <img
                    src="/calender_light.png"
                    alt="Contest Calendar"
                    className="block dark:hidden w-[505px] h-auto object-contain shadow-2xl"
                    draggable={false}
                    />
                    <img
                    src="/calender_dark.png"
                    alt="Contest Calendar"
                    className="hidden dark:block w-[505px] h-auto object-contain shadow-2xl"
                    draggable={false}
                    />
                    </div>
                 <div
    className="absolute right-0 top-0 bottom-0 z-5 h-full w-[100px] bg-gradient-to-l from-[rgba(255,255,255,0.7)] dark:from-[rgba(0,0,0,0.6)] via-[rgba(255,255,255,0.6)] dark:via-[rgba(0,0,0,0.5)] to-transparent pointer-events-none"
  />
                    </div>
                    <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-2">
                    <CalendarIcon />
                    <h3 className="text-lg font-semibold font-sans">Never Miss a Contest Again</h3>
                    </div>
                    <p className="text-sm text-muted-foreground font-sans">
                    Get a unified contest calendar from all major platforms, with time-zone conversion and smart reminders.
                    </p>
                    </div>
                    </div>

          </div>


          {/* Card 2: Consolidated Profile (Unchanged) */}
          <div className="relative group bg-card text-card-foreground rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
            {/* Top visual part with a larger, muted icon */}
            <div className="relative h-64 bg-muted/50 overflow-hidden">
              <div className="absolute top-0 left-0 transition-transform duration-300 ease-in-out transform translate-x-20 translate-y-[60px] group-hover:translate-x-16 group-hover:translate-y-[40px]">
                <img
                  src="/portfolio.png"
                  alt="Portfolio"
                  className="hidden dark:block w-[505px] h-auto object-contain shadow-2xl"
                  draggable={false}
                />
                <img
                  src="/portfolio_light.png"
                  alt="Contest Calendar"
                  className="block dark:hidden w-[505px] h-auto object-contain shadow-2xl"
                  draggable={false}
                />
              </div>
              <div
                className="absolute right-0 top-0 bottom-0 z-5 h-full w-[100px] bg-gradient-to-l from-[rgba(255,255,255,0.7)] dark:from-[rgba(0,0,0,0.6)] via-[rgba(255,255,255,0.6)] dark:via-[rgba(0,0,0,0.5)] to-transparent pointer-events-none"
              />
            </div>
            {/* Text content part */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <ProfileIcon />
                <h3 className="text-lg font-semibold font-sans">See the Big Picture</h3>
              </div>
              <p className="text-sm text-muted-foreground font-sans">
                Consolidate all your ratings, solved problems, and performance stats in one clean profile.
              </p>
            </div>
          </div>

        </div>

        {/* New Three Column Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          
          {/* Card 3: Smarter Practice Plans */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
            {/* Text content part - on top */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44L4.5 18.5A2.5 2.5 0 0 1 2 16V6a2.5 2.5 0 0 1 2.5-2.5L9.5 2Z"/>
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44L19.5 18.5A2.5 2.5 0 0 0 22 16V6a2.5 2.5 0 0 0-2.5-2.5L14.5 2Z"/>
                </svg>
                <h3 className="text-lg font-semibold font-sans">Smarter Practice Plans</h3>
              </div>
              <p className="text-sm text-muted-foreground font-sans">
                Get AI-driven problem recommendations based on your weak topics — no more guesswork, just focused growth.
              </p>
            </div>
            {/* Edit - below */}
            {/* Edit - below */}
<div className="relative h-48 bg-muted/50 overflow-hidden">
  {/* Soft gradient wash from theme tokens */}
  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-secondary/10 to-transparent" />
  {/* Ambient blobs */}
  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-xl" />
  <div className="absolute -left-12 -bottom-10 h-28 w-28 rounded-full bg-chart-4/10 blur-2xl" />

  <div className="relative h-full p-4 flex flex-col justify-between">
    {/* Micro cue: “Targeted practice” ping */}
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-card/70 px-3 py-2 shadow-sm backdrop-blur transition-all hover:shadow-md">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary/40 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
        </span>
        <span className="text-sm font-medium text-foreground/90">Targeted practice</span>
      </span>
    </div>

    {/* Two lightweight tiles */}
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg border border-border/60 bg-card/70 p-3 shadow-sm transition-transform hover:-translate-y-0.5">
        <p className="text-xs text-muted-foreground">Recommended set</p>
        <p className="mt-1 text-sm font-medium">Graphs · 1600–1800</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-muted">
          <div className="h-full w-2/3 bg-primary/70 transition-[width] duration-500 ease-out" />
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card/70 p-3 shadow-sm transition-transform hover:-translate-y-0.5">
        <p className="text-xs text-muted-foreground">Weak topics</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-secondary/70 px-2 py-0.5 text-[11px] text-secondary-foreground/90">DP</span>
          <span className="rounded-full bg-secondary/70 px-2 py-0.5 text-[11px] text-secondary-foreground/90">Graphs</span>
          <span className="rounded-full bg-secondary/70 px-2 py-0.5 text-[11px] text-secondary-foreground/90">Binary Search</span>
        </div>
      </div>
    </div>
  </div>
</div>

          </div>

          {/* Card 4: Fair Competitive Edge */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
            {/* Text content part - on top */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M6 9H2l3-3 3 3z"/>
                  <path d="M18 9h4l-3-3-3 3z"/>
                  <path d="M12 2l3 3h-6l3-3z"/>
                  <path d="M12 22l-3-3h6l-3 3z"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
                <h3 className="text-lg font-semibold font-sans">Fair Competitive Edge</h3>
              </div>
              <p className="text-sm text-muted-foreground font-sans">
                Climb difficulty-weighted leaderboards that reward skill, not just volume. Compete with friends or globally.
              </p>
            </div>
            {/* Edit- below */}
            {/* Edit- below */}
<div className="relative h-48 bg-muted/50 overflow-hidden group">
  <div className="absolute inset-0 bg-gradient-to-tr from-accent/15 via-transparent to-transparent transition-opacity opacity-90 group-hover:opacity-100" />
  <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background:radial-gradient(circle_at_center,hsl(var(--border))_1px,transparent_1px)] [background-size:20px_20px]" />

  <div className="relative h-full p-4 flex flex-col">
    {/* header chip */}
    <div className="inline-flex w-fit items-center gap-2 rounded-md border border-border/60 bg-card/70 px-2.5 py-1 shadow-sm">
      <span className="h-2.5 w-2.5 rounded-full bg-primary/80 animate-pulse" />
      <span className="text-xs font-medium">Skill‑matched pairing</span>
    </div>

    {/* matchup row */}
    <div className="mt-3 flex items-center justify-between">
      {/* left player */}
      <div className="flex items-center gap-2 rounded-md border border-border/60 bg-card/70 px-2.5 py-1.5 shadow-sm transition-transform hover:-translate-y-0.5">
        <div className="h-7 w-7 rounded-full bg-secondary/80 text-secondary-foreground flex items-center justify-center text-[11px] font-semibold">
          AK
        </div>
        <div className="leading-tight">
          <div className="text-xs font-medium">Ankush</div>
          <div className="text-[11px] text-muted-foreground">CF 1642</div>
        </div>
      </div>

      {/* center delta */}
      <div className="mx-2 flex flex-col items-center">
        <div className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/70 px-2 py-1 text-xs shadow-sm">
          <span className="h-2 w-2 rounded-full bg-primary/80 animate-pulse" />
          <span className="font-semibold text-foreground/90">+12</span>
          <span className="text-muted-foreground">ELO</span>
        </div>
        <div className="mt-2 h-1.5 w-24 overflow-hidden rounded bg-muted">
          <div className="h-full w-3/4 bg-primary/80 transition-[width] duration-500 ease-out" />
        </div>
      </div>

      {/* right player */}
      <div className="flex items-center gap-2 rounded-md border border-border/60 bg-card/70 px-2.5 py-1.5 shadow-sm transition-transform hover:-translate-y-0.5">
        <div className="h-7 w-7 rounded-full bg-secondary/80 text-secondary-foreground flex items-center justify-center text-[11px] font-semibold">
          RS
        </div>
        <div className="leading-tight">
          <div className="text-xs font-medium">Rishi</div>
          <div className="text-[11px] text-muted-foreground">CF 1638</div>
        </div>
      </div>
    </div>

    {/* fairness tags */}
    <div className="mt-3 flex flex-wrap gap-2">
      <span className="rounded-full bg-secondary/70 px-2 py-0.5 text-[11px] text-secondary-foreground/90">Difficulty‑weighted</span>
      <span className="rounded-full bg-secondary/70 px-2 py-0.5 text-[11px] text-secondary-foreground/90">Recent‑performance decay</span>
      <span className="rounded-full bg-secondary/70 px-2 py-0.5 text-[11px] text-secondary-foreground/90">Topic parity</span>
    </div>
  </div>
</div>


          </div>

          {/* Card 5: Distraction-Free Focus */}
          {/* Card 5: Distraction-Free Focus */}
<div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
  {/* Text content part - on top */}
  <div className="p-6">
    <div className="flex items-center gap-3 mb-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <h3 className="text-lg font-semibold font-sans">Distraction-Free Focus</h3>
    </div>
    <p className="text-sm text-muted-foreground font-sans">
      Block distracting sites and notifications with Focus Mode — ideal for contests and deep practice sessions.
    </p>
  </div>

  {/* Visual demonstration part - on bottom */}
  <div className="relative h-48 bg-muted/50 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-accent/12 via-transparent to-transparent" />
    <div className="pointer-events-none absolute -left-10 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-primary/15 blur-2xl" />

    <div className="relative h-full p-4 flex flex-col gap-3">
      {/* Header row (takes its natural height) */}
      <div className="flex items-center justify-between">
        <div className="inline-flex h-8 items-center gap-2 rounded-full border border-border/60 bg-card/70 px-2.5 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-primary/35" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-medium leading-none">Focus session</span>
        </div>
        <button
          type="button"
          className="h-8 rounded-full bg-secondary/85 px-3 text-xs text-secondary-foreground transition-all hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-[hsl(var(--card))]"
        >
          Start
        </button>
      </div>

      {/* 3-column grid content (now flexible) */}
      {/* CHANGE: Added flex-1 to make this grid fill remaining vertical space */}
      <div className="flex-1 grid grid-cols-[auto,1fr,1fr] items-stretch gap-4">
        {/* Breathing orb column */}
        <div className="flex items-center justify-center">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full bg-primary/25 motion-safe:animate-ping motion-reduce:hidden" />
            <div className="absolute inset-2 rounded-full border border-border/60 bg-card/80 backdrop-blur shadow-sm" />
            <div
              className="absolute inset-2 rounded-full opacity-80 motion-safe:animate-[spin_20s_linear_infinite]"
              style={{ background: 'conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.15) 120deg, transparent 200deg)' }}
            />
            <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/90" />

          </div>
        </div>

        {/* Blocked apps card */}
        <div className="flex h-[95%] flex-col justify-between rounded-md border border-border/60 bg-card/70 p-3 shadow-sm">
          <div>
            <p className="text-[11px] text-muted-foreground leading-none">Blocked</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex h-6 items-center rounded bg-secondary/70 px-1.5 text-[10px] text-secondary-foreground/90 motion-safe:animate-pulse [animation-delay:120ms]">YouTube</span>
              <span className="inline-flex h-6 items-center rounded bg-secondary/70 px-1.5 text-[10px] text-secondary-foreground/90 motion-safe:animate-pulse [animation-delay:240ms]">Instagram</span>
              <span className="inline-flex h-6 items-center rounded bg-secondary/70 px-1.5 text-[10px] text-secondary-foreground/90 motion-safe:animate-pulse [animation-delay:360ms]">Reddit</span>
            </div>
          </div>
        </div>

        {/* Progress card */}
        <div className="flex h-[95%] flex-col rounded-md border border-border/60 bg-card/70 p-3 shadow-sm">
          <p className="text-[11px] text-muted-foreground leading-none">Progress</p>
          <div className="mt-2 grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="h-1.5 rounded bg-muted" />
            ))}
          </div>
          <div className="mt-1 grid grid-cols-10 gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={`a-${i}`}
                className="h-1.5 rounded bg-primary/80 motion-safe:animate-pulse"
                style={{ animationDelay: `${i * 90}ms` }}
              />
            ))}
          </div>
          <div className="mt-2 h-full flex items-center justify-center">
            <div className="inline-flex h-7 items-center gap-1 rounded-md border border-border/60 bg-card/70 px-2 text-[11px] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-primary/80 motion-safe:animate-pulse" />
              25:00
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

        </div>
      </div>
    </section>
  );
};

export default Grid;