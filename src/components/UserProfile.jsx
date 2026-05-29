// src/components/UserProfile.jsx
import React, { useState, useEffect } from 'react'

function UserProfile({ theme, onNameChange }) {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('app_user_name') || ''
  })
  const [isEditing, setIsEditing] = useState(!localStorage.getItem('app_user_name'))
  const [tempName, setTempName] = useState(userName)

  useEffect(() => {
    if (userName) {
      onNameChange?.(userName)
    }
  }, [userName])

  const saveUserName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim())
      localStorage.setItem('app_user_name', tempName.trim())
      setIsEditing(false)
    }
  }

  const handleEdit = () => {
    setTempName(userName)
    setIsEditing(true)
  }

  const handleClearName = () => {
    if (window.confirm('Hapus nama pengguna?')) {
      localStorage.removeItem('app_user_name')
      setUserName('')
      setIsEditing(true)
      setTempName('')
    }
  }

  // Jika belum ada nama, tampilkan alert yang menonjol
  if (!userName && !isEditing) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        background: '#ef4444',
        borderRadius: '30px',
        cursor: 'pointer',
        animation: 'pulse-red 1.5s infinite',
        boxShadow: '0 0 10px rgba(239,68,68,0.5)'
      }}
      onClick={handleEdit}>
        <span style={{ fontSize: '14px' }}>⚠️</span>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>
          Belum ada nama!
        </span>
        <span style={{ fontSize: '12px', color: 'white' }}>Klik untuk isi</span>
        <style>
          {`
            @keyframes pulse-red {
              0%, 100% { opacity: 1; background: #ef4444; }
              50% { opacity: 0.7; background: #dc2626; }
            }
          `}
        </style>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        background: theme === 'dark' ? '#2a2a3e' : '#f0f0f0',
        borderRadius: '30px',
        border: '2px solid #667eea',
        boxShadow: '0 0 0 3px rgba(102,126,234,0.3)'
      }}>
        <span style={{ fontSize: '14px' }}>👤</span>
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && saveUserName()}
          placeholder="Nama Anda..."
          autoFocus
          style={{
            padding: '6px 10px',
            fontSize: '13px',
            borderRadius: '20px',
            border: 'none',
            background: theme === 'dark' ? '#444' : 'white',
            color: theme === 'dark' ? 'white' : '#333',
            width: '130px',
            outline: 'none'
          }}
        />
        <button
          onClick={saveUserName}
          style={{
            padding: '4px 12px',
            background: '#22c55e',
            border: 'none',
            borderRadius: '20px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold'
          }}
        >
          Simpan
        </button>
        <button
          onClick={() => setIsEditing(false)}
          style={{
            padding: '4px 8px',
            background: '#ef4444',
            border: 'none',
            borderRadius: '20px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      background: theme === 'dark' ? 'rgba(102,126,234,0.2)' : 'rgba(102,126,234,0.1)',
      borderRadius: '30px',
      border: '1px solid #667eea'
    }}>
      <span style={{ fontSize: '14px' }}>👤</span>
      <span style={{ 
        fontSize: '13px', 
        fontWeight: 'bold',
        color: '#667eea'
      }}>
        {userName}
      </span>
      <span style={{ fontSize: '12px', color: '#888' }}>|</span>
      <button
        onClick={handleEdit}
        style={{
          padding: '2px 8px',
          background: 'rgba(102,126,234,0.2)',
          border: 'none',
          borderRadius: '20px',
          color: '#667eea',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        Edit
      </button>
      <button
        onClick={handleClearName}
        style={{
          padding: '2px 8px',
          background: 'rgba(239,68,68,0.2)',
          border: 'none',
          borderRadius: '20px',
          color: '#ef4444',
          cursor: 'pointer',
          fontSize: '11px'
        }}
      >
        Hapus
      </button>
    </div>
  )
}

export default UserProfile