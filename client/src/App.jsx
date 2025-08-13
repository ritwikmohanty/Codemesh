import { useState } from 'react'
import {BrowserRouter as Router,Rotes,Route,BrowserRouter} from 'react-router-dom'


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
