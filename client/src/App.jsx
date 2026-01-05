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
import BattlesPage from './Pages/BattlesPage'
import CreateBattlePage from './Pages/CreateBattlePage'
import JoinBattlePage from './Pages/JoinBattlePage'
import BattlePage from './Pages/BattlePage'
import { Toaster } from 'sonner'

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
                        <Route path="/battles" element={<BattlesPage />} />
                        <Route path="/battles/create" element={<CreateBattlePage />} />
                        <Route path="/battles/join" element={<JoinBattlePage />} />
                        <Route path="/battles/join/:joinToken" element={<JoinBattlePage />} />
                        <Route path="/battle/:battleId" element={<BattlePage />} />
                    </Routes>
                </OnboardingWrapper>
                <Toaster 
                  position="bottom-right" 
                  richColors 
                  closeButton
                  toastOptions={{
                    style: {
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    },
                  }}
                />
            </ThemeProvider>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App
