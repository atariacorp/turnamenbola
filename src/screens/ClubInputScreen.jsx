// src/screens/ClubInputScreen.jsx
import React, { useState, useEffect } from 'react'
import { getAllClubs, getClubsByLeague, searchClubs, getTopRatedClubs } from '../data/fc26Clubs'

function ClubInputScreen({ players, onNext, showToast }) {
  const [selectedClubs, setSelectedClubs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLeague, setSelectedLeague] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [showTopRated, setShowTopRated] = useState(false)

  const leagues = [
    { id: 'all', name: 'Semua Liga', icon: '🌍' },
    { id: 'Premier League', name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'La Liga', name: 'La Liga', icon: '🇪🇸' },
    { id: 'Serie A', name: 'Serie A', icon: '🇮🇹' },
    { id: 'Bundesliga', name: 'Bundesliga', icon: '🇩🇪' },
    { id: 'Ligue 1', name: 'Ligue 1', icon: '🇫🇷' },
    { id: 'Eredivisie', name: 'Eredivisie', icon: '🇳🇱' },
    { id: 'Primeira Liga', name: 'Primeira Liga', icon: '🇵🇹' },
    { id: 'National', name: 'Tim Nasional', icon: '🏆' }
  ]

  const getFilteredClubs = () => {
    if (showTopRated) {
      return getTopRatedClubs(30)
    }
    
    let clubs = selectedLeague === 'all' 
      ? getAllClubs() 
      : getClubsByLeague(selectedLeague)
    
    if (searchTerm) {
      clubs = clubs.filter(club => 
        club.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return clubs
  }

  const toggleClub = (club) => {
    if (selectedClubs.find(c => c.name === club.name)) {
      setSelectedClubs(selectedClubs.filter(c => c.name !== club.name))
      if (showToast) showToast(`Tim ${club.name} dihapus`, 'warning')
    } else if (selectedClubs.length < players.length) {
      setSelectedClubs([...selectedClubs, club])
      if (showToast) showToast(`Tim ${club.name} ditambahkan`, 'success')
    } else {
      if (showToast) showToast(`Maksimal ${players.length} tim!`, 'error')
    }
  }

  const randomizeSelection = () => {
    const allClubs = getAllClubs()
    const shuffled = [...allClubs].sort(() => Math.random() - 0.5)
    const randomClubs = shuffled.slice(0, players.length)
    setSelectedClubs(randomClubs)
    if (showToast) showToast(`${players.length} tim dipilih secara acak!`, 'success')
  }

  const clearSelection = () => {
    setSelectedClubs([])
    if (showToast) showToast('Semua tim dihapus', 'info')
  }

  const handleNext = () => {
    if (selectedClubs.length >= players.length) {
      // Create assignments array with players and clubs
      const assignments = players.map((player, idx) => ({
        ...player,
        club: selectedClubs[idx % selectedClubs.length].name,
        clubData: selectedClubs[idx % selectedClubs.length]
      }))
      onNext(assignments)
    } else {
      if (showToast) showToast(`Pilih minimal ${players.length} tim!`, 'error')
    }
  }

  const filteredClubs = getFilteredClubs()

  // Get player assignment preview
  const getAssignmentsPreview = () => {
    const preview = []
    for (let i = 0; i < players.length; i++) {
      preview.push({
        player: players[i].name,
        club: selectedClubs[i % selectedClubs.length]?.name || 'Belum dipilih'
      })
    }
    return preview
  }

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      borderRadius: '24px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ⚽ Pilih Tim FC 26
        </h2>
        <p style={{ color: '#a0a0a0', marginTop: '8px' }}>
          Pilih {players.length} tim dari database EA Sports FC 26
        </p>
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{
          padding: '8px 16px',
          background: 'rgba(34,197,94,0.2)',
          borderRadius: '30px'
        }}>
          ✅ Terpilih: {selectedClubs.length}/{players.length}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={randomizeSelection}
            style={{
              padding: '8px 16px',
              background: '#f59e0b',
              border: 'none',
              borderRadius: '20px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🎲 Pilih Acak
          </button>
          <button
            onClick={clearSelection}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              border: 'none',
              borderRadius: '20px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🗑️ Hapus Semua
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 2, position: 'relative' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Cari tim..."
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>
        
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          style={{
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          {leagues.map(league => (
            <option key={league.id} value={league.id} style={{ background: '#1a1a2e' }}>
              {league.icon} {league.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowTopRated(!showTopRated)}
          style={{
            padding: '12px 16px',
            background: showTopRated ? '#667eea' : 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          ⭐ Top Rated
        </button>

        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          style={{
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          {viewMode === 'grid' ? '📋 List View' : '📱 Grid View'}
        </button>
      </div>

      {/* Clubs Grid/List */}
      <div style={{
        display: viewMode === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        flexDirection: viewMode === 'list' ? 'column' : 'row',
        gap: '10px',
        maxHeight: '400px',
        overflowY: 'auto',
        padding: '8px',
        marginBottom: '20px'
      }}>
        {filteredClubs.map((club, idx) => {
          const isSelected = selectedClubs.find(c => c.name === club.name)
          const isDisabled = !isSelected && selectedClubs.length >= players.length
          
          return (
            <button
              key={idx}
              onClick={() => toggleClub(club)}
              disabled={isDisabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px',
                background: isSelected 
                  ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isSelected ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '12px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                fontSize: '24px',
                width: '48px',
                height: '48px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                ⚽
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{club.name}</div>
                <div style={{ fontSize: '11px', color: '#a0a0a0' }}>
                  {club.country} • {club.rating}⭐
                </div>
              </div>
              {isSelected && (
                <div style={{ fontSize: '20px', color: 'white' }}>✓</div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected Clubs Summary */}
      {selectedClubs.length > 0 && (
        <div style={{
          padding: '16px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          marginBottom: '20px'
        }}>
          <h4 style={{ marginBottom: '12px', color: '#a0a0a0' }}>
            📋 Tim Terpilih ({selectedClubs.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {selectedClubs.map((club, idx) => (
              <span key={idx} style={{
                padding: '4px 12px',
                background: '#22c55e',
                borderRadius: '20px',
                fontSize: '12px'
              }}>
                {club.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Preview */}
      {selectedClubs.length > 0 && (
        <div style={{
          padding: '16px',
          background: 'rgba(102,126,234,0.1)',
          borderRadius: '16px',
          marginBottom: '20px',
          border: '1px solid rgba(102,126,234,0.3)'
        }}>
          <h4 style={{ marginBottom: '12px' }}>🎮 Preview Assignment Pemain ke Tim:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
            {getAssignmentsPreview().map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px'
              }}>
                <span>🎮 {item.player}</span>
                <span>→</span>
                <span style={{ color: '#f59e0b' }}>⚽ {item.club}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>
            💡 Tim akan di-assign secara berurutan ke pemain
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
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
            fontWeight: 'bold'
          }}
        >
          ← Kembali ke Pemain
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
          Lanjut ke Assignment →
        </button>
      </div>
    </div>
  )
}

export default ClubInputScreen