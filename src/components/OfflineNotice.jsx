// src/components/OfflineNotice.jsx
import React, { useState, useEffect } from 'react'

function OfflineNotice({ theme }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      setTimeout(() => setShowUpdate(true), 1000)
      setTimeout(() => setShowUpdate(false), 5000)
    }
    
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline && !showUpdate) return null

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '20px',
      right: '20px',
      backgroundColor: isOffline ? '#ef4444' : '#22c55e',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '12px',
      textAlign: 'center',
      zIndex: 1000,
      animation: 'slideDown 0.3s ease-out',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <style>
        {`
          @keyframes slideDown {
            from {
              transform: translateY(-100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
      {isOffline ? (
        <>
          📡 Koneksi terputus! Data disimpan lokal, akan sync saat online.
        </>
      ) : (
        <>
          ✅ Koneksi kembali! Data tersinkronisasi.
        </>
      )}
    </div>
  )
}

export default OfflineNotice