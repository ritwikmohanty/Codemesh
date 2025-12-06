import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Trophy, Award, Medal } from 'lucide-react';

/**
 * Palette per position: 1=Gold, 2=Silver, 3=Bronze
 */
const getPodiumPalette = (position) => {
  if (position === 1) {
    // Gold
    return {
      topStart: '#D4AF37',   // metallic gold
      topEnd:   '#FFD700',   // web gold
      bodyStart:'#FFF3B0',
      bodyMid:  '#FFD700',
      bodyEnd:  '#D4AF37',
    };
  }
  if (position === 2) {
    // Silver
    return {
      topStart: '#999B9B',   // metallic silver-ish
      topEnd:   '#C0C0C0',   // silver
      bodyStart:'#ECECEC',
      bodyMid:  '#C0C0C0',
      bodyEnd:  '#999B9B',
    };
  }
  // Bronze
  return {
    topStart: '#CD7F32',     // bronze
    topEnd:   '#8C5620',
    bodyStart:'#E6B07E',
    bodyMid:  '#CD7F32',
    bodyEnd:  '#8C5620',
  };
};

/**
 * SVG podium base with per-position palette and unique gradient ids.
 */
const PodiumBase = ({ className, position }) => {
  const palette = getPodiumPalette(position);
  const idSuffix = `p${position}`;
return (
    <div
        className={`w-full rounded-t-xl relative overflow-hidden z-0 ${className}`}
        style={{ minWidth: '80px' }}
    >
        <svg
            viewBox="0 0 353 420"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M73.5711 0L0 32.326H353L292.162 0H73.5711Z" fill={`url(#paint0_linear_${idSuffix})`} />
            <rect y="32" width="353" height="388" fill={`url(#paint1_linear_${idSuffix})`} />
            <path d="M19.5 80H334" stroke="white" strokeOpacity="0.07" />
            <defs>
                <linearGradient id={`paint0_linear_${idSuffix}`} x1="190.077" y1="56.0757" x2="190.077" y2="14.1839" gradientUnits="userSpaceOnUse">
                    <stop offset="0.1" stopColor={palette.topStart} />
                    <stop offset="1" stopColor={palette.topEnd} />
                </linearGradient>
                <linearGradient id={`paint1_linear_${idSuffix}`} x1="176.5" y1="32" x2="176.5" y2="351.054" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor={palette.bodyStart} />
                    <stop offset="0.45" stopColor={palette.bodyMid} />
                    <stop offset="1" stopColor={palette.bodyEnd} />
                </linearGradient>
            </defs>
        </svg>

        {/* Position Number overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-3xl md:text-6xl font-black text-white">#{position}</span>
        </div>
    </div>
);
};

const Podium = ({ topThree = [], platform = null, revealHeight = 160 }) => {
  const navigate = useNavigate();

  const handleCardClick = (username) => {
    navigate(`/portfolio/${username}`);
  };

  // If we don't have exactly 3 users, don't show podium
  if (!topThree || topThree.length < 3) {
    return null;
  }

  const getTrophyColor = (position) => {
    if (position === 1) return 'from-yellow-300 to-amber-600';
    if (position === 2) return 'from-zinc-300 to-zinc-500';
    return 'from-amber-600 to-orange-800';
  };

  const getTrophyIcon = (position) => {
    if (position === 1) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (position === 2) return <Award className="w-7 h-7 text-zinc-400" />;
    return <Medal className="w-7 h-7 text-amber-700" />;
  };

  const getTierColor = (tier) => {
    const colors = {
      'Newbie': 'bg-gray-500/20 text-gray-300 border-gray-500/50',
      'Pupil': 'bg-green-500/20 text-green-300 border-green-500/50',
      'Specialist': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
      'Expert': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      'Candidate Master': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      'Master': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      'Grandmaster': 'bg-red-500/20 text-red-300 border-red-500/50',
      'Legendary Grandmaster': 'bg-rose-500/20 text-rose-300 border-rose-500/50'
    };
    return colors[tier] || colors['Newbie'];
  };

  // Get the rating to display based on platform
  const getRating = (user) => {
    if (platform) {
      // Platform-specific rating
      return user.platformRating || 0;
    }
    // CodeMesh Master Rating
    return user.masterRating || 0;
  };

  const getRatingLabel = () => {
    if (platform === 'codeforces') return 'Codeforces Rating';
    if (platform === 'leetcode') return 'LeetCode Rating';
    return 'Master Rating';
  };

  const PodiumCard = ({ user, position, heightClass }) => {
    if (!user) return null;

    return (
      <div
        className="flex flex-col items-center gap-2 md:gap-4 transition-transform hover:scale-105 duration-300 flex-1 min-w-0 cursor-pointer"
        style={{ paddingBottom: position === 1 ? '0' : '0' }} // Removed padding bottom to align bases
        onClick={() => handleCardClick(user.user?.username)}
      >
        {/* User Info */}
        <div className="flex flex-col items-center gap-1 md:gap-3 relative z-10 w-full">
          {/* Avatar with glow */}
          <div className="relative">
            {/* Glow effect */}
            <div
              className={`absolute inset-0 rounded-xl bg-gradient-to-br ${getTrophyColor(position)} opacity-30 blur-2xl scale-150`}
            />

            {/* Avatar (square) */}
            <Avatar
              className={`relative z-10 ${position === 1 ? 'w-20 h-20 md:w-32 md:h-32' : 'w-14 h-14 md:w-24 md:h-24'} border-2 md:border-4 ${
                position === 1 ? 'border-yellow-500' : position === 2 ? 'border-zinc-400' : 'border-amber-700'
              } rounded-xl overflow-hidden`}
            >
              <AvatarImage
                src={user.user?.avatarUrl}
                alt={user.user?.name}
                className="object-cover"
              />
              <AvatarFallback username={user.user?.username} className="text-lg md:text-2xl font-bold rounded-xl" />
            </Avatar>

            {/* Trophy Icon Badge (above avatar) */}
            <div
              className={`absolute ${position === 1 ? '-top-2 -right-2' : '-top-1 -right-1'} bg-background rounded-full p-1 md:p-2 shadow-lg border-2 ${
                position === 1 ? 'border-yellow-500' : position === 2 ? 'border-zinc-400' : 'border-amber-700'
              } z-20 scale-75 md:scale-100 origin-center`}
            >
              {getTrophyIcon(position)}
            </div>
          </div>

          {/* User Name */}
          <div className="text-center w-full px-1">
            <h3 className={`font-bold text-foreground truncate ${position === 1 ? 'text-sm md:text-2xl' : 'text-xs md:text-xl'}`}>
              {user.user?.name || user.user?.username}
            </h3>
            <p className="text-[10px] md:text-sm text-muted-foreground truncate">@{user.user?.username}</p>
          </div>

          {/* Tier Badge */}
          <Badge variant="outline" className={`${getTierColor(user.tier)} font-semibold text-[10px] md:text-xs px-1 md:px-2 py-0 md:py-0.5 h-5 md:h-auto`}>
            {user.tier}
          </Badge>

          {/* Master Rating */}
          <div className="flex flex-col items-center gap-0 md:gap-1 bg-card/50 backdrop-blur-sm px-2 md:px-6 py-1 md:py-3 rounded-lg border border-border w-full max-w-[90%] md:max-w-none">
            <span
              className={`font-black bg-gradient-to-r ${getTrophyColor(position)} bg-clip-text text-transparent ${
                position === 1 ? 'text-xl md:text-4xl' : 'text-lg md:text-3xl'
              }`}
            >
              {Math.round(getRating(user))}
            </span>
            <span className="text-[8px] md:text-xs text-muted-foreground uppercase tracking-wider text-center leading-tight">{getRatingLabel()}</span>
          </div>

          {/* Stats */}
          <div className="flex gap-2 md:gap-6 text-[10px] md:text-sm justify-center w-full">
            <div className="flex flex-col items-center">
              <span className="font-bold text-foreground">{user.ratingComponents?.totalContests || 0}</span>
              <span className="text-[8px] md:text-xs text-muted-foreground scale-90 md:scale-100">Contests</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-foreground">{user.ratingComponents?.totalSolved || 0}</span>
              <span className="text-[8px] md:text-xs text-muted-foreground scale-90 md:scale-100">Solved</span>
            </div>
          </div>
        </div>

        {/* Podium Base (SVG with gold/silver/bronze) */}
        <PodiumBase className={heightClass} position={position} />
      </div>
    );
  };

  return (
    <div className="w-full md:w-[80%] pt-8 relative mx-auto pb-6">
      {/* Responsive View */}
      <div className="flex items-end justify-center gap-2 md:gap-8 max-w-6xl mx-auto px-2 md:px-4 w-full">
        {/* Second Place */}
        <PodiumCard user={topThree[1]} position={2} heightClass="h-[140px] md:h-[200px]" />

        {/* First Place */}
        <PodiumCard user={topThree[0]} position={1} heightClass="h-[180px] md:h-[260px]" />

        {/* Third Place */}
        <PodiumCard user={topThree[2]} position={3} heightClass="h-[120px] md:h-[160px]" />
      </div>

      {/* Single bottom reveal overlay for all podiums */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-6 z-10"
        style={{
          height: revealHeight,
          background: `linear-gradient(
            to top,
            hsl(var(--background)) 0%,
            hsl(var(--background) / 1) 55%,
            transparent 100%
          )`,
        }}
      />
    </div>
  );
};

export default Podium;
