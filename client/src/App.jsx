import { useState } from 'react'
import {BrowserRouter as Router,Routes,Route,BrowserRouter} from 'react-router-dom'
import LandingPage from './Pages/LandingPage'
import './index.css'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                
            </Routes>
        </BrowserRouter>
    );
};

export default App
