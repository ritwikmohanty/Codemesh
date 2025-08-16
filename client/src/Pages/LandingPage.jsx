import React from 'react'
import Navbar from '../Components/Navbar.jsx'
import GradientHero from '../Components/Hero.jsx'
import SupportedPlatforms from '../Components/SupportedPlatforms.jsx'
import FAQ from '../Components/FAQ.jsx'
import Grid from '../Components/Grid.jsx'
import BrandingFooter from '../Components/Footer.jsx'

function LandingPage() {
  return (
    <div style={{ position: 'relative' }}>
      {/* place hero first so it starts at the top */}
      <GradientHero />

      {/* position the navbar on top of the hero */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <Navbar />
      </div>
      <Grid/>
      <SupportedPlatforms />
      <FAQ />
      <BrandingFooter />
    </div>
  )
}

export default LandingPage