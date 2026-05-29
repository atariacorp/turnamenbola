// src/components/UpdateNotification.jsx
import React, { useState, useEffect } from 'react'

function UpdateNotification({ theme }) {
  const [showUpdate, setShowUpdate] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker)
              setShowUpdate(true)
            }
          })
        })
      })
    }
  }, [])

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
      setShowUpdate(false)
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    setShowUpdate(false)
  }

  if (!showUpdate) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      left: '20px',
      maxWidth: '400px',
      margin: '0 auto',
      backgroundColor: theme === 'dark' ? '#1e1e2e' : 'white',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      zIndex: 1000,
      border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ fontSize: '24px' }}>🔄</div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, fontSize: '14px' }}>Update Tersedia!</h4>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>
            Versi baru sudah siap. Refresh untuk update.
          </p>
        </div>
        <button
          onClick={handleUpdate}
          style={{
            padding: '8px 16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Update
        </button>
        <button
          onClick={handleDismiss}
          style={{
            padding: '8px',
            backgroundColor: 'transparent',
            color: '#888',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default UpdateNotification