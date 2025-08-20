import { useState } from 'react'
import {BrowserRouter as Router,Routes,Route,BrowserRouter} from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './Pages/LandingPage'
import CalendarPage from './Pages/CalendarPage'
import './index.css'
import { ThemeProvider } from "@/components/ui/theme-provider"

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
            <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                </Routes>
            </ThemeProvider>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App
