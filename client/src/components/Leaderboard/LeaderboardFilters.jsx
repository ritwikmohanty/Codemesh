import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Filter, RefreshCw, GraduationCap, MapPin, School } from 'lucide-react';
import { COUNTRIES } from '../../utils/onboardingConstants';
import { Card, CardContent } from '../ui/card';

const TIERS = [
  'All Tiers',
  'Newbie',
  'Pupil',
  'Specialist',
  'Expert',
  'Candidate Master',
  'Master',
  'Grandmaster',
  'Legendary Grandmaster'
];

// Generate graduation years (current year - 10 to current year + 6)
const currentYear = new Date().getFullYear();
const GRADUATION_YEARS = ['All Years', ...Array.from({ length: 17 }, (_, i) => (currentYear - 10 + i).toString())];

const LeaderboardFilters = ({ 
  selectedTier, 
  onTierChange, 
  selectedCountry,
  onCountryChange,
  selectedCollege,
  onCollegeChange,
  selectedGraduationYear,
  onGraduationYearChange,
  onReset,
  hasActiveFilters
}) => {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Filter Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-sm">Filter Leaderboard</h3>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onReset} className="h-8">
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Reset All
              </Button>
            )}
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Tier Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Filter className="w-3 h-3" />
                Tier
              </label>
              <Select value={selectedTier || 'All Tiers'} onValueChange={onTierChange}>
                <SelectTrigger className="h-9 bg-background border-border hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                Country
              </label>
              <Select value={selectedCountry || 'All Countries'} onValueChange={onCountryChange}>
                <SelectTrigger className="h-9 bg-background border-border hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Countries">All Countries</SelectItem>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Graduation Year Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <GraduationCap className="w-3 h-3" />
                Graduation Year
              </label>
              <Select value={selectedGraduationYear || 'All Years'} onValueChange={onGraduationYearChange}>
                <SelectTrigger className="h-9 bg-background border-border hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {GRADUATION_YEARS.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year === 'All Years' ? 'All Years' : year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* College Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <School className="w-3 h-3" />
                College/Institution
              </label>
              <Input
                type="text"
                placeholder="Type to filter..."
                value={selectedCollege || ''}
                onChange={(e) => onCollegeChange(e.target.value)}
                className="h-9 bg-background border-border hover:border-primary/50 transition-colors focus:border-primary"
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {selectedTier !== 'All Tiers' && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {selectedTier}
                </span>
              )}
              {selectedCountry !== 'All Countries' && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {selectedCountry}
                </span>
              )}
              {selectedCollege && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {selectedCollege}
                </span>
              )}
              {selectedGraduationYear !== 'All Years' && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Class of {selectedGraduationYear}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardFilters;
