import { useState } from 'react'
import {BrowserRouter as Router,Routes,Route,BrowserRouter} from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import OnboardingWrapper from './components/OnboardingWrapper'
import LandingPage from './Pages/LandingPage'
import CalendarPage from './Pages/CalendarPage'
import './index.css'
import { ThemeProvider } from "./components/ui/theme-provider"
import Portfolio from './Pages/Portfolio'
import Leaderboard from './Pages/LeaderboardPage'
import Settings from './Pages/Settings'

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
            <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
                <OnboardingWrapper>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/portfolio/:username" element={<Portfolio />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </OnboardingWrapper>
            </ThemeProvider>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App
