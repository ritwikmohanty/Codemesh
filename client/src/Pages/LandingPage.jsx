import React from 'react'
import Navbar from '../components/Navbar.jsx'
import GradientHero from '../components/Landing/Hero.jsx'
import SupportedPlatforms from '../components/Landing/SupportedPlatforms.jsx'
import FAQ from '../components/Landing/FAQ.jsx'
import Grid from '../components/Landing/Grid.jsx'
import BrandingFooter from '../components/Landing/Footer.jsx'
import CTA from '../components/Landing/CTA.jsx'

function LandingPage() {
  return (
    <div style={{ position: 'relative' }}>
      {/* place hero first so it starts at the top */}
      <GradientHero />

      {/* position the navbar on top of the hero */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <Navbar />
      </div>
      <Grid />
      <SupportedPlatforms />
      <FAQ />
      <CTA />
      <BrandingFooter />
    </div>
  )
}

export default LandingPage