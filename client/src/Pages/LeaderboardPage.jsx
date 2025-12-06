import React, { useState, useEffect } from "react";
import { AppSidebar } from '../components/sidebar/app-sidebar.jsx';
import Podium from '../components/Leaderboard/Podium';
import LeaderboardFilters from '../components/Leaderboard/LeaderboardFilters';
import LeaderboardTable from '../components/Leaderboard/LeaderboardTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Trophy, TrendingUp, Users, Target, Filter } from 'lucide-react';
import * as leaderboardService from '../services/leaderboardService';

const LeaderboardPage = () => {
    // State for CodeMesh Master Rating
    const [topThree, setTopThree] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [totalFilteredUsers, setTotalFilteredUsers] = useState(0);
    const [stats, setStats] = useState(null);
    
    // State for Codeforces
    const [cfTopThree, setCfTopThree] = useState([]);
    const [cfLeaderboardData, setCfLeaderboardData] = useState([]);
    const [cfTotalFilteredUsers, setCfTotalFilteredUsers] = useState(0);
    
    // State for LeetCode
    const [lcTopThree, setLcTopThree] = useState([]);
    const [lcLeaderboardData, setLcLeaderboardData] = useState([]);
    const [lcTotalFilteredUsers, setLcTotalFilteredUsers] = useState(0);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters
    const [selectedTier, setSelectedTier] = useState('All Tiers');
    const [selectedCountry, setSelectedCountry] = useState('All Countries');
    const [selectedCollege, setSelectedCollege] = useState('');
    const [selectedGraduationYear, setSelectedGraduationYear] = useState('All Years');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState('codemesh');

    // Check if any filter is active
    const hasActiveFilters = selectedTier !== 'All Tiers' || 
                             selectedCountry !== 'All Countries' || 
                             selectedCollege !== '' || 
                             selectedGraduationYear !== 'All Years';

    // Count active filters
    const activeFilterCount = [
        selectedTier !== 'All Tiers',
        selectedCountry !== 'All Countries',
        selectedCollege !== '',
        selectedGraduationYear !== 'All Years'
    ].filter(Boolean).length;

    // Get current filter options
    const getFilterOptions = () => ({
        tier: selectedTier === 'All Tiers' ? null : selectedTier,
        country: selectedCountry === 'All Countries' ? null : selectedCountry,
        college: selectedCollege || null,
        graduationYear: selectedGraduationYear === 'All Years' ? null : parseInt(selectedGraduationYear)
    });

    // Fetch top 3 users for CodeMesh Master Rating (with filters)
    const fetchTopUsers = async () => {
        try {
            const filters = getFilterOptions();
            const response = await leaderboardService.getTopUsers(3, filters);
            if (response.success && response.data) {
                setTopThree(response.data);
            }
        } catch (err) {
            console.error('Error fetching top users:', err);
        }
    };

    // Fetch leaderboard data for CodeMesh
    const fetchLeaderboard = async () => {
        setLoading(true);
        setError(null);

        try {
            const filters = getFilterOptions();

            const response = await leaderboardService.getLeaderboard({
                page: currentPage,
                limit: 50,
                ...filters
            });

            if (response.success) {
                const allData = response.data || [];
                const totalUsers = response.pagination?.totalEntries || allData.length;
                setTotalFilteredUsers(totalUsers);
                
                // If more than 3 users, filter out top 3 from table (they appear in podium)
                // If 3 or fewer, show all in table
                if (totalUsers > 3) {
                    const dataFromRank4 = allData.filter(user => user.currentRank > 3);
                    setLeaderboardData(dataFromRank4);
                } else {
                    setLeaderboardData(allData);
                }
                setTotalPages(response.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            setError('Failed to load leaderboard. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Codeforces leaderboard
    const fetchCodeforcesLeaderboard = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const filters = getFilterOptions();
            
            // Fetch top 3
            const topResponse = await leaderboardService.getTopUsersByPlatform('codeforces', 3, filters);
            if (topResponse.success && topResponse.data) {
                setCfTopThree(topResponse.data);
            }
            
            // Fetch full leaderboard
            const response = await leaderboardService.getPlatformLeaderboard('codeforces', {
                page: currentPage,
                limit: 50,
                ...filters
            });
            
            if (response.success) {
                const allData = response.data || [];
                const totalUsers = response.pagination?.totalEntries || allData.length;
                setCfTotalFilteredUsers(totalUsers);
                
                // If more than 3 users, filter out top 3 from table
                if (totalUsers > 3) {
                    const dataFromRank4 = allData.filter(user => user.platformRank > 3);
                    setCfLeaderboardData(dataFromRank4);
                } else {
                    setCfLeaderboardData(allData);
                }
                setTotalPages(response.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error('Error fetching Codeforces leaderboard:', err);
            setError('Failed to load Codeforces leaderboard.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch LeetCode leaderboard
    const fetchLeetCodeLeaderboard = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const filters = getFilterOptions();
            
            // Fetch top 3
            const topResponse = await leaderboardService.getTopUsersByPlatform('leetcode', 3, filters);
            if (topResponse.success && topResponse.data) {
                setLcTopThree(topResponse.data);
            }
            
            // Fetch full leaderboard
            const response = await leaderboardService.getPlatformLeaderboard('leetcode', {
                page: currentPage,
                limit: 50,
                ...filters
            });
            
            if (response.success) {
                const allData = response.data || [];
                const totalUsers = response.pagination?.totalEntries || allData.length;
                setLcTotalFilteredUsers(totalUsers);
                
                // If more than 3 users, filter out top 3 from table
                if (totalUsers > 3) {
                    const dataFromRank4 = allData.filter(user => user.platformRank > 3);
                    setLcLeaderboardData(dataFromRank4);
                } else {
                    setLcLeaderboardData(allData);
                }
                setTotalPages(response.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error('Error fetching LeetCode leaderboard:', err);
            setError('Failed to load LeetCode leaderboard.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch leaderboard stats
    const fetchStats = async () => {
        try {
            const response = await leaderboardService.getLeaderboardStats();
            if (response.success) {
                setStats(response.stats);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    // Initial load
    useEffect(() => {
        fetchStats();
        fetchCodeforcesLeaderboard();
        fetchLeetCodeLeaderboard();
    }, []);

    // Fetch leaderboard when filters change
    useEffect(() => {
        if (activeTab === 'codemesh') {
            fetchTopUsers();
            fetchLeaderboard();
        } else if (activeTab === 'codeforces') {
            fetchCodeforcesLeaderboard();
        } else if (activeTab === 'leetcode') {
            fetchLeetCodeLeaderboard();
        }
    }, [currentPage, selectedTier, selectedCountry, selectedCollege, selectedGraduationYear, activeTab]);

    const handleTierChange = (tier) => {
        setSelectedTier(tier);
        setCurrentPage(1);
    };

    const handleCountryChange = (country) => {
        setSelectedCountry(country);
        setCurrentPage(1);
    };

    const handleCollegeChange = (college) => {
        setSelectedCollege(college);
        setCurrentPage(1);
    };

    const handleGraduationYearChange = (year) => {
        setSelectedGraduationYear(year);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setSelectedTier('All Tiers');
        setSelectedCountry('All Countries');
        setSelectedCollege('');
        setSelectedGraduationYear('All Years');
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
              <div>
                  <AppSidebar variant="inset">
            
            {/* Main Content */}
            <div className="max-w-6xl mx-auto w-full">
                <div className="container mx-auto px-4 py-6 space-y-6">
                    
                    {/* Header */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
                          <p className="text-muted-foreground">
                            Compete with the best coders across multiple platforms
                          </p>
                        </div>
                        {hasActiveFilters && (
                          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                            <Filter className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                              {activeFilterCount} {activeFilterCount === 1 ? 'Filter' : 'Filters'} Active
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats Cards */}
                    {/* {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">
                                        {stats.totalUsers?.toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Top Rating</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">
                                        {Math.round(stats.topRating)}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                                    <Target className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">
                                        {Math.round(stats.averageRating)}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Grandmasters</CardTitle>
                                    <Trophy className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-primary">
                                        {(stats.tierDistribution?.['Grandmaster'] || 0) + 
                                         (stats.tierDistribution?.['Legendary Grandmaster'] || 0)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )} */}

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 gap-1.5 bg-muted/50 rounded-lg">
                        <TabsTrigger 
                          value="codemesh" 
                          className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 text-sm font-medium transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4" />
                            <span className="hidden sm:inline">CodeMesh Master</span>
                            <span className="sm:hidden">Master</span>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="codeforces" 
                          className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 text-sm font-medium transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-15c0-.828.672-1.5 1.5-1.5h3zm9 7.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z"/>
                            </svg>
                            <span className="hidden sm:inline">Codeforces</span>
                            <span className="sm:hidden">CF</span>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="leetcode" 
                          className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 text-sm font-medium transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
                            </svg>
                            <span className="hidden sm:inline">LeetCode</span>
                            <span className="sm:hidden">LC</span>
                          </div>
                        </TabsTrigger>
                    </TabsList>

                        {/* CodeMesh Master Rating Tab */}
                        <TabsContent value="codemesh" className="space-y-6">
                            {/* Filters */}
                            <LeaderboardFilters
                                selectedTier={selectedTier}
                                onTierChange={handleTierChange}
                                selectedCountry={selectedCountry}
                                onCountryChange={handleCountryChange}
                                selectedCollege={selectedCollege}
                                onCollegeChange={handleCollegeChange}
                                selectedGraduationYear={selectedGraduationYear}
                                onGraduationYearChange={handleGraduationYearChange}
                                onReset={handleReset}
                                hasActiveFilters={hasActiveFilters}
                            />

                            {/* Podium - show if we have top 3 users and total > 3 */}
                            {topThree.length >= 3 && totalFilteredUsers > 3 && (
                                <div className="-mt-2">
                                    <Podium topThree={topThree} platform={null} />
                                </div>
                            )}

                            {/* Leaderboard Table */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl">Rankings</CardTitle>
                                    <CardDescription>
                                        {topThree.length >= 3 && totalFilteredUsers > 3
                                            ? 'Ranked by CodeMesh Master Rating' 
                                            : totalFilteredUsers > 0 ? `Showing ${totalFilteredUsers} user${totalFilteredUsers !== 1 ? 's' : ''} matching filters` : 'Ranked by CodeMesh Master Rating'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Error Alert */}
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Leaderboard Table */}
                                    <LeaderboardTable
                                        data={leaderboardData}
                                        loading={loading}
                                        currentPage={currentPage}
                                        onPageChange={handlePageChange}
                                        totalPages={totalPages}
                                        platform={null}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Codeforces Rating Tab */}
                        <TabsContent value="codeforces" className="space-y-6">
                            {/* Filters */}
                            <LeaderboardFilters
                                selectedTier={selectedTier}
                                onTierChange={handleTierChange}
                                selectedCountry={selectedCountry}
                                onCountryChange={handleCountryChange}
                                selectedCollege={selectedCollege}
                                onCollegeChange={handleCollegeChange}
                                selectedGraduationYear={selectedGraduationYear}
                                onGraduationYearChange={handleGraduationYearChange}
                                onReset={handleReset}
                                hasActiveFilters={hasActiveFilters}
                            />

                            {/* Podium - show if we have at least 3 users */}
                            {cfTopThree.length >= 3 && cfTotalFilteredUsers > 3 && (
                                <div className="-mt-2">
                                    <Podium topThree={cfTopThree} platform="codeforces" />
                                </div>
                            )}

                            {/* Leaderboard Table */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl">Rankings</CardTitle>
                                    <CardDescription>
                                        {cfTopThree.length >= 3 && cfTotalFilteredUsers > 3
                                            ? 'Ranked by Codeforces Rating'
                                            : cfTotalFilteredUsers > 0 ? `Showing ${cfTotalFilteredUsers} user${cfTotalFilteredUsers !== 1 ? 's' : ''} with Codeforces data` : 'Ranked by Codeforces Rating'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                        </div>
                                    ) : (cfTopThree.length > 0 || cfLeaderboardData.length > 0) ? (
                                        <LeaderboardTable
                                            data={cfLeaderboardData}
                                            loading={loading}
                                            currentPage={currentPage}
                                            onPageChange={handlePageChange}
                                            totalPages={totalPages}
                                            platform="codeforces"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
                                            <p>No Codeforces rankings available yet...</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* LeetCode Rating Tab */}
                        <TabsContent value="leetcode" className="space-y-6">
                            {/* Filters */}
                            <LeaderboardFilters
                                selectedTier={selectedTier}
                                onTierChange={handleTierChange}
                                selectedCountry={selectedCountry}
                                onCountryChange={handleCountryChange}
                                selectedCollege={selectedCollege}
                                onCollegeChange={handleCollegeChange}
                                selectedGraduationYear={selectedGraduationYear}
                                onGraduationYearChange={handleGraduationYearChange}
                                onReset={handleReset}
                                hasActiveFilters={hasActiveFilters}
                            />

                            {/* Podium - show if we have at least 3 users */}
                            {lcTopThree.length >= 3 && lcTotalFilteredUsers > 3 && (
                                <div className="-mt-2">
                                    <Podium topThree={lcTopThree} platform="leetcode" />
                                </div>
                            )}

                            {/* Leaderboard Table */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl">Rankings</CardTitle>
                                    <CardDescription>
                                        {lcTopThree.length >= 3 && lcTotalFilteredUsers > 3
                                            ? 'Ranked by LeetCode Rating'
                                            : lcTotalFilteredUsers > 0 ? `Showing ${lcTotalFilteredUsers} user${lcTotalFilteredUsers !== 1 ? 's' : ''} with LeetCode data` : 'Ranked by LeetCode Rating'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                        </div>
                                    ) : (lcTopThree.length > 0 || lcLeaderboardData.length > 0) ? (
                                        <LeaderboardTable
                                            data={lcLeaderboardData}
                                            loading={loading}
                                            currentPage={currentPage}
                                            onPageChange={handlePageChange}
                                            totalPages={totalPages}
                                            platform="leetcode"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
                                            <p>No LeetCode rankings available yet...</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                   
                </div>
            </div>
            </AppSidebar>
        </div>
    );
};

export default LeaderboardPage;
