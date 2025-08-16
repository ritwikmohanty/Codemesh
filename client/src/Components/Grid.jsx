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
                 <div className="relative h-64 bg-muted/50 overflow-hidden z-10">
                 <div
    className="absolute right-0 top-0 bottom-0 z-40 h-full w-[100px] bg-gradient-to-l from-[rgba(255,255,255,0.7)] dark:from-[rgba(0,0,0,0.6)] via-[rgba(255,255,255,0.7)] dark:via-[rgba(0,0,0,0.6)] to-transparent pointer-events-none"
  />
                 <div className="absolute top-0 left-0 z-0 transition-transform duration-300 ease-in-out transform translate-x-20 translate-y-[60px] group-hover:translate-x-16 group-hover:translate-y-[40px]">
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
                    </div>
                    <div className="relative z-20 p-6">
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
          <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
            {/* Top visual part with a larger, muted icon */}
            <div className="h-64 bg-muted/50 flex items-center justify-center p-4 text-muted-foreground/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
              </svg>
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
          
          {/* Card 3: Problem Tracking */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
            {/* Text content part - on top */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" />
                  <polyline points="9,11 12,14 22,4" />
                </svg>
                <h3 className="text-lg font-semibold font-sans">Track Every Problem</h3>
              </div>
              <p className="text-sm text-muted-foreground font-sans">
                Monitor your problem-solving progress across all platforms with detailed analytics.
              </p>
            </div>
            {/* Visual part - below */}
            <div className="h-48 bg-muted/50 flex items-center justify-center p-4 text-muted-foreground/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" />
                <polyline points="9,11 12,14 22,4" />
              </svg>
            </div>
          </div>

          {/* Card 4: Performance Analytics */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
            {/* Text content part - on top */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M3 3v18h18" />
                  <path d="M18 17l-5-5-5 5" />
                </svg>
                <h3 className="text-lg font-semibold font-sans">Smart Analytics</h3>
              </div>
              <p className="text-sm text-muted-foreground font-sans">
                Get insights into your coding patterns and identify areas for improvement.
              </p>
            </div>
            {/* Visual part - below */}
            <div className="h-48 bg-muted/50 flex items-center justify-center p-4 text-muted-foreground/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="M18 17l-5-5-5 5" />
              </svg>
            </div>
          </div>

          {/* Card 5: Community Features */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
            {/* Text content part - on top */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <h3 className="text-lg font-semibold font-sans">Connect & Compete</h3>
              </div>
              <p className="text-sm text-muted-foreground font-sans">
                Join leaderboards, compare progress with friends, and stay motivated.
              </p>
            </div>
            {/* Visual part - below */}
            <div className="h-48 bg-muted/50 flex items-center justify-center p-4 text-muted-foreground/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Grid;