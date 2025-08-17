import { useState } from 'react'
import {BrowserRouter as Router,Routes,Route,BrowserRouter} from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './Pages/LandingPage'
import './index.css'

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App
