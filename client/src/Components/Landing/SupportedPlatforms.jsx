import CountUp from '../ui/CountUp'
import { VelocityScroll } from '@/components/ui/scrollbasedvelocity';
import { useTheme } from 'next-themes'; 

export default function Page() {
  const { theme } = useTheme(); // Get current theme

  const platforms = [
    { 
      name: 'Codeforces', 
      logoLight: '/Codeforces_logo.svg', 
      logoDark: '/Codeforces_dark.svg' 
    },
    { 
      name: 'CodeChef', 
      logoLight: '/cc-logo.png', 
      logoDark: '/cc-logo.png' 
    },
    { 
      name: 'LeetCode', 
      logoLight: '/LeetCodeLogo.png', 
      logoDark: '/leetcode_dark.svg' 
    },
    { 
      name: 'AtCoder', 
      logoLight: '/Atcoder.svg', 
      logoDark: '/atcode_dark.svg' 
    },
    { 
      name: 'GeeksforGeeks', 
      logoLight: '/gfg_logo.png', 
      logoDark: '/geekforgeeks_dark.svg' 
    },
    { 
      name: 'Coding Ninjas', 
      logoLight: '/coding-ninjas-logo.png', 
      logoDark: '/Codingninjas_dark.svg' 
    },
    { 
      name: 'HackerRank', 
      logoLight: '/Hackerrank_Logo.svg', 
      logoDark: '/hackerrank_dark.svg' 
    },
    { 
      name: 'CSES', 
      logoLight: '/cses_logo.png', 
      logoDark: '/cses_logo.png' 
    },
    { 
      name: 'HackerEarth', 
      logoLight: '/hackerearth_logo.png', 
      logoDark: '/hackerearth_logo.png' 
    },
  ]

  // Map platforms to include the correct logo based on theme
  const themedPlatforms = platforms.map(platform => ({
    ...platform,
    logo: theme === 'dark' ? platform.logoDark : platform.logoLight
  }));

  return (
    <div
      className="h-[400px] mt-40 w-screen overflow-hidden"
      style={{
        backgroundColor: 'hsl(var(--background))',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div className="mx-auto w-screen max-w-6xl">
        <div
          className="text-center text-3xl font-semibold"
          style={{
            color: 'hsl(var(--foreground))',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Supported Across All Major Platforms
        </div>
        <div
          className="text-center text-lg mt-3 max-w-3xl mx-auto"
          style={{
            color: 'hsl(var(--muted-foreground))',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Track, compete, and improve using your profiles from{' '}
          <span
            className="font-semibold"
            style={{
              color: 'hsl(var(--primary))',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <CountUp
              from={0}
              to={9}
              direction="up"
              duration={1}
              style={{
                color: 'hsl(var(--primary))',
                fontFamily: 'var(--font-sans)',
                fontWeight: '600',
              }}
            />
            +
          </span>{' '}
          leading competitive programming sites.
        </div>

        <div className="mt-14 max-w-full mx-auto">
          <VelocityScroll
            className="text-center"
            platforms={themedPlatforms}
            default_velocity={2}
          />
        </div>
      </div>

      <div
        className="relative -mt-32 h-96 w-screen overflow-hidden"
        style={{
          maskImage: 'radial-gradient(50% 50%, white, transparent)',
          WebkitMaskImage: 'radial-gradient(50% 50%, white, transparent)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at bottom center, hsl(var(--primary) / 0.2), transparent 70%)`,
          }}
        />
        <div
          className="absolute top-1/2 -left-1/2 aspect-[1/0.7] w-[200%] rounded-[100%] border-t"
          style={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border) / 0.3)',
          }}
        />
      </div>
    </div>
  )
}