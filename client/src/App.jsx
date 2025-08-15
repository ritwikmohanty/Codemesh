import { useState } from 'react'
import {BrowserRouter as Router,Routes,Route,BrowserRouter} from 'react-router-dom'
import LandingPage from './Pages/LandingPage'
import './index.css'
// import Dashboard from './Pages/Dashboard'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                {/* <Route path="/dashboard" element={<Dashboard />} /> */}
            </Routes>
        </BrowserRouter>
    );
};

export default App
