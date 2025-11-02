import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Filter, RefreshCw } from 'lucide-react';

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

const LeaderboardFilters = ({ 
  selectedTier, 
  onTierChange, 
  searchQuery, 
  onSearchChange, 
  onSearch,
  onReset 
}) => {
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const handleReset = () => {
    setLocalSearch('');
    onReset();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {/* Tier Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedTier || 'All Tiers'} onValueChange={onTierChange}>
            <SelectTrigger className="w-[180px] bg-card border-border">
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

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 sm:flex-initial">
          <div className="relative flex-1 sm:w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search username..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <Button type="submit" variant="secondary" size="icon">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {/* Reset Button */}
        {(selectedTier !== 'All Tiers' || searchQuery) && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default LeaderboardFilters;
