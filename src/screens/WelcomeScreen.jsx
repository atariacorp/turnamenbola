// src/screens/WelcomeScreen.jsx
import React, { useState } from 'react'

function WelcomeScreen({ onStart, tournamentName, setTournamentName }) {
  const [name, setName] = useState(tournamentName || '')

  const handleStart = () => {
    if (name.trim()) {
      setTournamentName(name.trim())
      onStart()
    } else {
      alert('Masukkan nama turnamen terlebih dahulu!')
    }
  }

  return (
    <div style={{
      padding: '40px',
      maxWidth: '500px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '80px',
        marginBottom: '20px',
        animation: 'float 3s ease-in-out infinite'
      }}>
        🏆
      </div>
      <h2 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '16px'
      }}>
        Selamat Datang!
      </h2>
      <p style={{ color: '#a0a0a0', marginBottom: '32px' }}>
        Atur turnamen sepak bolamu dengan mudah
      </p>
      
      <div style={{ marginBottom: '24px', textAlign: 'left' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Nama Turnamen
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleStart()}
          placeholder="Contoh: Piala RT 05"
          style={{
            width: '100%',
            padding: '14px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '16px'
          }}
          autoFocus
        />
      </div>
      
      <button
        onClick={handleStart}
        style={{
          width: '100%',
          padding: '14px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Mulai Turnamen →
      </button>
      
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </div>
  )
}

export default WelcomeScreen