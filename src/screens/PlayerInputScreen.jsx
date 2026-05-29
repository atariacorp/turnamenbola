// src/screens/PlayerInputScreen.jsx
import React, { useState, useEffect } from 'react'
import { getAllPlayers, addPlayer, deletePlayer, resetAllPlayers, getPlayerStarRating, saveCurrentPlayers, loadCurrentPlayers } from '../utils/playerStorage'

function PlayerInputScreen({ players, setPlayers, onNext, showToast }) {
  const [playerName, setPlayerName] = useState('')
  const [playerList, setPlayerList] = useState([])
  const [savedPlayers, setSavedPlayers] = useState([])
  const [showSavedPlayers, setShowSavedPlayers] = useState(false)

  // Load saved players on mount
  useEffect(() => {
    loadSavedPlayers()
    loadCurrentPlayersFromStorage()
  }, [])

  // Save playerList to localStorage whenever it changes
  useEffect(() => {
    if (playerList.length > 0) {
      saveCurrentPlayers(playerList)
    }
  }, [playerList])

  const loadSavedPlayers = () => {
    const saved = getAllPlayers()
    setSavedPlayers(saved)
  }

  const loadCurrentPlayersFromStorage = () => {
    const savedCurrentPlayers = loadCurrentPlayers()
    if (savedCurrentPlayers && savedCurrentPlayers.length > 0) {
      setPlayerList(savedCurrentPlayers)
      if (showToast) showToast(`${savedCurrentPlayers.length} pemain dimuat dari penyimpanan`, 'info')
    }
  }

  const handleAddPlayer = () => {
    if (playerName.trim() && playerList.length < 32) {
      const newPlayer = {
        id: Date.now(),
        name: playerName.trim(),
        club: null,
        trophies: 0,
        createdAt: new Date().toISOString()
      }
      const newList = [...playerList, newPlayer]
      setPlayerList(newList)
      addPlayer(playerName.trim())
      setPlayerName('')
      loadSavedPlayers()
      if (showToast) showToast(`Pemain ${playerName.trim()} ditambahkan`, 'success')
    }
  }

  const addSavedPlayer = (savedPlayer) => {
    if (!playerList.find(p => p.name === savedPlayer.name) && playerList.length < 32) {
      const newPlayer = {
        id: Date.now(),
        name: savedPlayer.name,
        club: null,
        trophies: savedPlayer.trophies || 0,
        createdAt: new Date().toISOString()
      }
      const newList = [...playerList, newPlayer]
      setPlayerList(newList)
      if (showToast) showToast(`Pemain ${savedPlayer.name} ditambahkan dari database`, 'success')
    } else {
      if (showToast) showToast(`Pemain ${savedPlayer.name} sudah ada!`, 'warning')
    }
  }

  const removePlayer = (id, name) => {
    const newList = playerList.filter(p => p.id !== id)
    setPlayerList(newList)
    if (showToast) showToast(`Pemain ${name} dihapus`, 'warning')
  }

  const handleResetDatabase = () => {
    if (window.confirm('Reset semua data pemain? Tindakan ini tidak dapat dibatalkan!')) {
      resetAllPlayers()
      loadSavedPlayers()
      if (showToast) showToast('Database pemain telah direset!', 'success')
    }
  }

  const handleClearCurrentPlayers = () => {
    if (window.confirm('Hapus semua pemain dari daftar saat ini?')) {
      setPlayerList([])
      localStorage.removeItem('current_players')
      if (showToast) showToast('Daftar pemain saat ini telah dibersihkan', 'info')
    }
  }

  const handleNext = () => {
    if (playerList.length >= 2) {
      setPlayers(playerList)
      onNext()
    } else {
      if (showToast) showToast('Minimal 2 pemain!', 'error')
    }
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: '800px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      borderRadius: '24px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          📝 Daftar Pemain
        </h2>
        <p style={{ color: '#a0a0a0' }}>Tambah pemain atau pilih dari database</p>
        <div style={{ 
          fontSize: '12px', 
          color: '#22c55e', 
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span>💾</span> Data tersimpan otomatis
          {playerList.length > 0 && (
            <span style={{ color: '#f59e0b' }}>• {playerList.length} pemain aktif</span>
          )}
        </div>
      </div>

      {/* Input Form */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
          placeholder="Nama pemain baru..."
          style={{
            flex: 1,
            padding: '14px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '16px'
          }}
        />
        <button
          onClick={handleAddPlayer}
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          + Tambah
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={handleClearCurrentPlayers}
          style={{
            flex: 1,
            padding: '10px',
            background: 'rgba(239,68,68,0.2)',
            border: '1px solid rgba(239,68,68,0.5)',
            borderRadius: '12px',
            color: '#ef4444',
            cursor: 'pointer'
          }}
        >
          🗑️ Hapus Semua Pemain
        </button>
        <button
          onClick={() => setShowSavedPlayers(!showSavedPlayers)}
          style={{
            flex: 1,
            padding: '10px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          {showSavedPlayers ? '📋 Sembunyikan Database' : '📚 Tampilkan Database'}
        </button>
      </div>

      {/* Saved Players Database */}
      {showSavedPlayers && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ color: '#a0a0a0' }}>📚 Database Pemain ({savedPlayers.length})</h4>
            <button
              onClick={handleResetDatabase}
              style={{
                padding: '6px 12px',
                background: '#ef4444',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Reset Database
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '8px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {savedPlayers.map(player => (
              <button
                key={player.id}
                onClick={() => addSavedPlayer(player)}
                disabled={playerList.find(p => p.name === player.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  opacity: playerList.find(p => p.name === player.name) ? 0.5 : 1,
                  color: 'white'
                }}
              >
                <span>{player.name}</span>
                <span style={{ fontSize: '12px', color: '#f59e0b' }}>
                  {getPlayerStarRating(player.trophies)} {player.trophies > 0 && `(${player.trophies})`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Player List */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ marginBottom: '12px', color: '#a0a0a0' }}>
          👥 Pemain Terpilih ({playerList.length}/32)
          {playerList.length > 0 && (
            <span style={{ fontSize: '11px', marginLeft: '8px', color: '#22c55e' }}>
              💾 Tersimpan
            </span>
          )}
        </h4>
        {playerList.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px'
          }}>
            <p style={{ color: '#888', marginBottom: '8px' }}>Belum ada pemain.</p>
            <p style={{ color: '#666', fontSize: '12px' }}>Tambahkan pemain di atas atau pilih dari database!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {playerList.map((player, idx) => (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>{idx + 1}</span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: '16px',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}>
                    {player.name}
                  </span>
                  {player.trophies > 0 && (
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '14px',
                      color: '#f59e0b'
                    }}>
                      {getPlayerStarRating(player.trophies)}
                    </span>
                  )}
                  {player.createdAt && (
                    <span style={{ 
                      fontSize: '10px', 
                      color: '#666',
                      marginLeft: '8px'
                    }}>
                      🕐 {new Date(player.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removePlayer(player.id, player.name)}
                  style={{
                    padding: '6px 14px',
                    background: 'rgba(239,68,68,0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#ef4444'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(239,68,68,0.8)'}
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            flex: 1,
            padding: '14px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          ← Kembali
        </button>
        <button
          onClick={handleNext}
          style={{
            flex: 1,
            padding: '14px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Lanjut ke Tim →
        </button>
      </div>
    </div>
  )
}

export default PlayerInputScreen