// src/components/InstallPrompt.jsx
import React, { useState, useEffect } from 'react'

function InstallPrompt({ theme }) {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setShowPrompt(false)
    setInstallPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('installPromptDismissed', new Date().toISOString())
  }

  if (isInstalled || !showPrompt) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      backgroundColor: theme === 'dark' ? '#1e1e2e' : 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      padding: '16px',
      zIndex: 1000,
      border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
      animation: 'slideUp 0.3s ease-out'
    }}>
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: '#667eea',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          🏆
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>Install Aplikasi</h4>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>
            Install untuk akses cepat dan offline
          </p>
        </div>
        <button
          onClick={handleInstall}
          style={{
            padding: '8px 16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: '8px',
            backgroundColor: 'transparent',
            color: '#888',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default InstallPrompt