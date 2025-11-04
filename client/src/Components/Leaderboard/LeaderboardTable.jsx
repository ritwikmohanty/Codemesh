import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Minus, Trophy, Award, Medal } from 'lucide-react';
import { Button } from '../ui/button';

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

const getRankIcon = (rank) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Award className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return null;
};

const RankChangeIndicator = ({ change }) => {
  if (!change || change === 0) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="w-4 h-4" />
        <span className="text-xs">-</span>
      </div>
    );
  }

  if (change > 0) {
    return (
      <div className="flex items-center gap-1 text-green-500">
        <TrendingUp className="w-4 h-4" />
        <span className="text-xs font-semibold">+{change}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-red-500">
      <TrendingDown className="w-4 h-4" />
      <span className="text-xs font-semibold">{change}</span>
    </div>
  );
};

const LeaderboardTable = ({ data, loading, currentPage, onPageChange, totalPages, platform = null }) => {
  // Helper function to get the correct rating field based on platform
  const getRating = (entry) => {
    return platform ? entry.platformRating : entry.masterRating;
  };

  // Helper function to get the correct rank field based on platform
  const getRank = (entry) => {
    return platform ? entry.platformRank : entry.currentRank;
  };

  // Helper function to get the rating label
  const getRatingLabel = () => {
    if (!platform) return 'Master Rating';
    if (platform === 'codeforces') return 'Codeforces Rating';
    if (platform === 'leetcode') return 'LeetCode Rating';
    return 'Rating';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg">No users found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 ">
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-card hover:bg-card">
              <TableHead className="w-[80px] text-center">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="hidden sm:table-cell">Tier</TableHead>
              <TableHead className="text-right">{getRatingLabel()}</TableHead>
              <TableHead className="hidden md:table-cell text-center">Change</TableHead>
              <TableHead className="hidden lg:table-cell text-center">Contests</TableHead>
              <TableHead className="hidden lg:table-cell text-center">Problems</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry) => (
              <TableRow 
                key={entry._id} 
                className="hover:bg-accent/50 transition-colors cursor-pointer"
              >
                {/* Rank */}
                <TableCell className="text-center font-semibold">
                  <div className="flex items-center justify-center gap-2">
                    {getRankIcon(getRank(entry))}
                    <span className={getRank(entry) <= 3 ? 'text-lg' : ''}>
                      #{getRank(entry)}
                    </span>
                  </div>
                </TableCell>

                {/* User */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={entry.user?.avatarUrl} alt={entry.user?.name} />
                      <AvatarFallback username={entry.user?.username} />
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">
                        {entry.user?.name || entry.user?.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        @{entry.user?.username}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Tier */}
                <TableCell className="hidden sm:table-cell">
                  <Badge 
                    variant="outline" 
                    className={`${getTierColor(entry.tier)} font-semibold`}
                  >
                    {entry.tier}
                  </Badge>
                </TableCell>

                {/* Rating */}
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-primary">
                      {Math.round(getRating(entry))}
                    </span>
                    {!platform && entry.performanceMetrics?.peakRating > entry.masterRating && (
                      <span className="text-xs text-muted-foreground">
                        Peak: {Math.round(entry.performanceMetrics.peakRating)}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Rank Change */}
                <TableCell className="hidden md:table-cell">
                  <div className="flex justify-center">
                    <RankChangeIndicator change={entry.rankChange} />
                  </div>
                </TableCell>

                {/* Contests */}
                <TableCell className="hidden lg:table-cell text-center">
                  <span className="text-muted-foreground">
                    {entry.ratingComponents?.totalContests || 0}
                  </span>
                </TableCell>

                {/* Problems Solved */}
                <TableCell className="hidden lg:table-cell text-center">
                  <span className="text-muted-foreground">
                    {entry.ratingComponents?.totalSolved || 0}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTable;
