import React, { useState, useEffect } from "react";
import { AppSidebar } from '../components/sidebar/app-sidebar.jsx';
import Podium from '../components/Leaderboard/Podium';
import LeaderboardFilters from '../components/Leaderboard/LeaderboardFilters';
import LeaderboardTable from '../components/Leaderboard/LeaderboardTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';
import * as leaderboardService from '../services/leaderboardService';

const LeaderboardPage = () => {
    // State for CodeMesh Master Rating
    const [topThree, setTopThree] = useState([]);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [stats, setStats] = useState(null);
    
    // State for Codeforces
    const [cfTopThree, setCfTopThree] = useState([]);
    const [cfLeaderboardData, setCfLeaderboardData] = useState([]);
    
    // State for LeetCode
    const [lcTopThree, setLcTopThree] = useState([]);
    const [lcLeaderboardData, setLcLeaderboardData] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters
    const [selectedTier, setSelectedTier] = useState('All Tiers');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState('codemesh');

    // Fetch top 3 users for CodeMesh Master Rating
    const fetchTopUsers = async () => {
        try {
            const response = await leaderboardService.getTopUsers(3);
            if (response.success && response.data) {
                setTopThree(response.data);
            }
        } catch (err) {
            console.error('Error fetching top users:', err);
        }
    };

    // Fetch leaderboard data for CodeMesh (starting from rank 4)
    const fetchLeaderboard = async () => {
        setLoading(true);
        setError(null);

        try {
            const tier = selectedTier === 'All Tiers' ? null : selectedTier;
            const search = searchQuery.trim() || null;

            const response = await leaderboardService.getLeaderboard({
                page: currentPage,
                limit: 50,
                tier,
                search
            });

            if (response.success) {
                // Filter out top 3 from the table data
                const allData = response.data || [];
                const dataFromRank4 = allData.filter(user => user.currentRank > 3);
                setLeaderboardData(dataFromRank4);
                setTotalPages(response.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            setError('Failed to load leaderboard. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // TODO: Fetch Codeforces leaderboard
    const fetchCodeforcesLeaderboard = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Fetch top 3
            const topResponse = await leaderboardService.getTopUsersByPlatform('codeforces', 3);
            if (topResponse.success && topResponse.data) {
                setCfTopThree(topResponse.data);
            }
            
            // Fetch full leaderboard (starting from rank 4)
            const response = await leaderboardService.getPlatformLeaderboard('codeforces', {
                page: currentPage,
                limit: 50
            });
            
            if (response.success) {
                // Filter out top 3 from the table data
                const allData = response.data || [];
                const dataFromRank4 = allData.filter(user => user.platformRank > 3);
                setCfLeaderboardData(dataFromRank4);
                setTotalPages(response.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error('Error fetching Codeforces leaderboard:', err);
            setError('Failed to load Codeforces leaderboard.');
        } finally {
            setLoading(false);
        }
    };

    // TODO: Fetch LeetCode leaderboard
    const fetchLeetCodeLeaderboard = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Fetch top 3
            const topResponse = await leaderboardService.getTopUsersByPlatform('leetcode', 3);
            if (topResponse.success && topResponse.data) {
                setLcTopThree(topResponse.data);
            }
            
            // Fetch full leaderboard (starting from rank 4)
            const response = await leaderboardService.getPlatformLeaderboard('leetcode', {
                page: currentPage,
                limit: 50
            });
            
            if (response.success) {
                // Filter out top 3 from the table data
                const allData = response.data || [];
                const dataFromRank4 = allData.filter(user => user.platformRank > 3);
                setLcLeaderboardData(dataFromRank4);
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
        fetchTopUsers();
        fetchStats();
        fetchCodeforcesLeaderboard();
        fetchLeetCodeLeaderboard();
    }, []);

    // Fetch leaderboard when filters change
    useEffect(() => {
        if (activeTab === 'codemesh') {
            fetchLeaderboard();
        } else if (activeTab === 'codeforces') {
            fetchCodeforcesLeaderboard();
        } else if (activeTab === 'leetcode') {
            fetchLeetCodeLeaderboard();
        }
    }, [currentPage, selectedTier, searchQuery, activeTab]);

    const handleTierChange = (tier) => {
        setSelectedTier(tier);
        setCurrentPage(1);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setSelectedTier('All Tiers');
        setSearchQuery('');
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
            <div className="max-w-5xl mx-auto w-full">
                <div className="container mx-auto px-4 py-8 space-y-8">
                    
                    {/* Header */}
                    <div className="mb-8">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
                        <p className="text-muted-foreground">
                          Compete with the best coders across multiple platforms
                        </p>
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
                    <TabsList className="flex w-full overflow-x-auto justify-start md:grid md:grid-cols-3 max-w-3xl mx-auto h-auto p-1 gap-2 [&::-webkit-scrollbar]:hidden">
                        <TabsTrigger value="codemesh" className="whitespace-nowrap md:whitespace-normal flex-shrink-0 px-4 py-2 text-xs md:text-sm">CodeMesh Master Rating</TabsTrigger>
                        <TabsTrigger value="codeforces" className="whitespace-nowrap md:whitespace-normal flex-shrink-0 px-4 py-2 text-xs md:text-sm">Codeforces Rating</TabsTrigger>
                        <TabsTrigger value="leetcode" className="whitespace-nowrap md:whitespace-normal flex-shrink-0 px-4 py-2 text-xs md:text-sm">LeetCode Rating</TabsTrigger>
                    </TabsList>

                        {/* CodeMesh Master Rating Tab */}
                        <TabsContent value="codemesh" className="space-y-6">
                            {/* Podium */}
                            {/* <Card className=""> */}
                                {/* <CardHeader>
                                    <CardTitle className="text-2xl">🏆 Top 3 Champions</CardTitle>
                                    <CardDescription>
                                        The highest-rated coders by CodeMesh Master Rating
                                    </CardDescription>
                                </CardHeader> */}
                                <CardContent className="pb-0">
                                    <Podium topThree={topThree} platform={null} />
                                </CardContent>
                            {/* </Card> */}


                            {/* Leaderboard Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rankings</CardTitle>
                                    <CardDescription>
                                        Ranked by CodeMesh Master Rating
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Filters */}
                                    <LeaderboardFilters
                                        selectedTier={selectedTier}
                                        onTierChange={handleTierChange}
                                        searchQuery={searchQuery}
                                        onSearchChange={setSearchQuery}
                                        onSearch={handleSearch}
                                        onReset={handleReset}
                                    />

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
                            {/* Podium */}
                            {/* <Card className="border-primary/20"> */}
                                {/* <CardHeader>
                                    <CardTitle className="text-2xl">🏆 Top 3 Codeforces Champions</CardTitle>
                                    <CardDescription>
                                        The highest-rated coders on Codeforces
                                    </CardDescription>
                                </CardHeader> */}
                                <CardContent className="pb-0">
                                    {cfTopThree.length > 0 ? (
                                        <Podium topThree={cfTopThree} platform="codeforces" />
                                    ) : (
                                        <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
                                            <p className="text-lg">No Codeforces data available yet...</p>
                                        </div>
                                    )}
                                </CardContent>
                            {/* </Card> */}

                            {/* Leaderboard Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rankings </CardTitle>
                                    <CardDescription>
                                        Ranked by Codeforces Rating
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {cfLeaderboardData.length > 0 ? (
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
                            {/* Podium */}
                            {/* <Card className="border-primary/20"> */}
                                {/* <CardHeader>
                                    <CardTitle className="text-2xl">🏆 Top 3 LeetCode Champions</CardTitle>
                                    <CardDescription>
                                        The highest-rated coders on LeetCode
                                    </CardDescription>
                                </CardHeader> */}
                                <CardContent className="pb-0">
                                    {lcTopThree.length > 0 ? (
                                        <Podium topThree={lcTopThree} platform="leetcode" />
                                    ) : (
                                        <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
                                            <p className="text-lg">No LeetCode data available yet...</p>
                                        </div>
                                    )}
                                </CardContent>
                            {/* </Card> */}

                            {/* Leaderboard Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rankings</CardTitle>
                                    <CardDescription>
                                        Ranked by LeetCode Rating
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {lcLeaderboardData.length > 0 ? (
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
