import { useState } from 'react'
import ServiceSelectionPage from './ServiceSelectionPage'
import ServiceUploadPage from './ServiceUploadPage'
import LoadingScreen from './LoadingScreen'
import { getServiceByKey } from '../config/services'
import { useTheme } from '../context/useTheme'
import logo from '../assets/Images/logo.jpg'
import './App.css'

export default function App() {
  const [selectedServiceKey, setSelectedServiceKey] = useState(null)
  const [booted, setBooted] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const selectedService = selectedServiceKey ? getServiceByKey(selectedServiceKey) : null

  if (!booted) {
    return <LoadingScreen onComplete={() => setBooted(true)} />
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <header className="app-header">
        <a
          href="https://www.mauritiuspost.mu/"
          target="_blank"
          rel="noopener noreferrer"
          className="app-brand-block"
        >
          <img src={logo} alt="Mauritius Post logo" className="app-brand-logo" />
        </a>

        <button
          type="button"
          onClick={toggleTheme}
          className="app-theme-toggle"
          aria-label="Toggle light and dark mode"
        >
          <span className="toggle-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </header>

      {selectedService ? (
        <ServiceUploadPage
          service={selectedService}
          onBack={() => setSelectedServiceKey(null)}
          theme={theme}
        />
      ) : (
        <ServiceSelectionPage onSelect={setSelectedServiceKey} theme={theme} />
      )}
    </div>
  )
}
