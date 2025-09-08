import CountUp from '../ui/CountUp'
import { VelocityScroll } from '@/components/ui/scrollbasedvelocity';

export default function Page() {
  const platforms = [
    { name: 'Codeforces', logo: '/Codeforces_logo.svg' },
    { name: 'CodeChef', logo: '/cc-logo.png' },
    { name: 'LeetCode', logo: '/LeetCodeLogo.png' },
    { name: 'AtCoder', logo: '/atcoder_logo.png' },
    { name: 'GeeksforGeeks', logo: '/gfg_logo.png' },
    { name: 'Coding Ninjas', logo: '/coding-ninjas-logo.png' },
    { name: 'HackerRank', logo: '/Hackerrank_Logo.svg' },
    { name: 'CSES', logo: '/cses_logo.png' },
    { name: 'HackerEarth', logo: '/hackerearth_logo.png' },
  ]

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
            platforms={platforms}
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