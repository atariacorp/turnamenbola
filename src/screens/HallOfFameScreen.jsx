// src/screens/HallOfFameScreen.jsx
import React, { useState, useEffect } from 'react'
import { getTournamentHistory, clearAllHistory } from '../utils/storage'
import { getAllPlayers, getPlayerStarRating, resetAllPlayers } from '../utils/playerStorage'
import PlayerStats from '../components/PlayerStats'

function HallOfFameScreen({ onBack, theme, showToast }) {
  const [history, setHistory] = useState([])
  const [players, setPlayers] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('champions')
  const [allMatches, setAllMatches] = useState([])

  useEffect(() => {
    loadData()
    loadMatches()
  }, [])

  const loadData = () => {
    setHistory(getTournamentHistory())
    setPlayers(getAllPlayers())
  }

  const loadMatches = () => {
    const savedMatches = localStorage.getItem('match_history')
    if (savedMatches) {
      setAllMatches(JSON.parse(savedMatches))
    }
  }

  const handleClearHistory = () => {
    if (window.confirm('Hapus semua riwayat turnamen? Tindakan ini tidak dapat dibatalkan!')) {
      clearAllHistory()
      loadData()
      if (showToast) showToast('Riwayat turnamen telah dihapus!', 'success')
    }
  }

  const handleResetPlayers = () => {
    if (window.confirm('Reset semua data pemain? Tindakan ini tidak dapat dibatalkan!')) {
      resetAllPlayers()
      loadData()
      if (showToast) showToast('Database pemain telah direset!', 'success')
    }
  }

  // Calculate champion statistics
  const championStats = {}
  history.forEach(t => {
    championStats[t.winner] = (championStats[t.winner] || 0) + 1
  })

  const sortedChampions = Object.entries(championStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // Player rankings by trophies
  const sortedPlayers = [...players]
    .sort((a, b) => b.trophies - a.trophies)
    .slice(0, 20)

  const filteredHistory = history.filter(t => {
    if (filter === 'winner') return true
    return true
  })

  const getPlayerDetails = (playerName) => {
    return players.find(p => p.name === playerName)
  }

  const tabs = [
    { id: 'champions', label: '🏆 Juara', icon: '🏆' },
    { id: 'players', label: '⭐ Pemain', icon: '⭐' },
    { id: 'history', label: '📜 Riwayat', icon: '📜' },
    { id: 'stats', label: '📊 Performa', icon: '📊' }
  ]

  // Get all unique players for stats
  const allUniquePlayers = []
  players.forEach(p => {
    if (!allUniquePlayers.find(up => up.name === p.name)) {
      allUniquePlayers.push({ name: p.name, id: p.id })
    }
  })
  history.forEach(t => {
    if (t.winner && !allUniquePlayers.find(up => up.name === t.winner)) {
      allUniquePlayers.push({ name: t.winner, id: Date.now() + Math.random() })
    }
    if (t.runnerUp && t.runnerUp !== '-' && !allUniquePlayers.find(up => up.name === t.runnerUp)) {
      allUniquePlayers.push({ name: t.runnerUp, id: Date.now() + Math.random() })
    }
  })

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      borderRadius: '24px',
      minHeight: '600px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            🏆 Hall of Fame
          </h2>
          <p style={{ color: '#a0a0a0', marginTop: '4px' }}>
            Penghargaan, sejarah, dan statistik performa para juara
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleResetPlayers}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🔄 Reset Database Pemain
          </button>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            ← Kembali
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: `1px solid ${theme === 'dark' ? '#333' : 'rgba(255,255,255,0.2)'}`,
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
              border: 'none',
              borderRadius: '30px',
              color: activeTab === tab.id ? 'white' : '#a0a0a0',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Champions Hall of Fame */}
      {activeTab === 'champions' && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {sortedChampions.map(([name, count], idx) => {
              const playerDetails = getPlayerDetails(name)
              const starRating = getPlayerStarRating(count)
              
              return (
                <div
                  key={name}
                  onClick={() => setSelectedPlayer(name)}
                  style={{
                    padding: '20px',
                    background: idx === 0 
                      ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.2))'
                      : 'rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: idx === 0 ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                    transition: 'transform 0.2s'
                  }}
                >
                  {idx === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '30px'
                    }}>👑</div>
                  )}
                  <div style={{ fontSize: idx === 0 ? '56px' : '40px', marginBottom: '8px' }}>
                    {idx === 0 ? '🏆' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : '⭐'))}
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: idx === 0 ? '22px' : '18px' }}>
                    {name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#f59e0b', marginTop: '4px' }}>
                    {starRating}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a0a0a0', marginTop: '8px' }}>
                    🏆 {count} {count === 1 ? 'kali juara' : 'kali juara'}
                  </div>
                </div>
              )
            })}
          </div>

          {sortedChampions.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
              <p>Belum ada juara. Selesaikan turnamen pertama Anda!</p>
            </div>
          )}
        </>
      )}

      {/* Tab: Player Rankings */}
      {activeTab === 'players' && (
        <div>
          <h3 style={{ marginBottom: '16px', color: '#a0a0a0' }}>
            ⭐ Peringkat Pemain (Berdasarkan Gelar Juara)
          </h3>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {sortedPlayers.map((player, idx) => (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: idx < 3 
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15))'
                    : 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: idx === 0 ? '#f59e0b' : (idx === 1 ? '#94a3b8' : (idx === 2 ? '#cd7f32' : 'rgba(255,255,255,0.2)')),
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : idx + 1))}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{player.name}</div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0' }}>
                      Pertama main: {new Date(player.firstPlayed).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px' }}>{getPlayerStarRating(player.trophies)}</div>
                  <div style={{ fontSize: '12px', color: '#f59e0b' }}>
                    🏆 {player.trophies} gelar
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {sortedPlayers.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
              <p>Belum ada data pemain. Mulai turnamen untuk mengumpulkan gelar!</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Tournament History */}
      {activeTab === 'history' && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <h3 style={{ color: '#a0a0a0' }}>📜 Riwayat Turnamen</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Semua Turnamen</option>
                <option value="winner">Hanya Juara</option>
              </select>
              <button
                onClick={handleClearHistory}
                style={{
                  padding: '8px 16px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                🗑️ Hapus Riwayat
              </button>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(102,126,234,0.3)' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Tanggal</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Turnamen</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Juara</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Runner-up</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Format</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Peserta</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>⭐</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((t, idx) => (
                  <tr key={t.id} style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                  }}>
                    <td style={{ padding: '12px' }}>{new Date(t.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>{t.name}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#f59e0b' }}>{t.winner}</td>
                    <td style={{ padding: '12px', color: '#a0a0a0' }}>{t.runnerUp || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      {t.format === 'knockout' ? 'Sistem Gugur' : 
                       t.format === 'league' ? 'Liga' : 
                       t.format === 'home_away' ? 'Home & Away' : 'Fase Grup'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{t.participants?.length || 0}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {getPlayerStarRating(championStats[t.winner] || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredHistory.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
              <p>Belum ada riwayat turnamen. Selesaikan turnamen pertama Anda!</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Player Stats */}
      {activeTab === 'stats' && (
        <PlayerStats 
          players={allUniquePlayers}
          matches={allMatches}
          theme={theme}
          showToast={showToast}
        />
      )}

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }} onClick={() => setSelectedPlayer(null)}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            {(() => {
              const player = players.find(p => p.name === selectedPlayer)
              if (!player) return <div>Loading...</div>
              
              return (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '8px' }}>👤</div>
                    <h3 style={{ fontSize: '24px' }}>{player.name}</h3>
                    <div style={{ fontSize: '32px', marginTop: '8px' }}>
                      {getPlayerStarRating(player.trophies)}
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '28px' }}>🏆</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{player.trophies}</div>
                      <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Gelar Juara</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '28px' }}>📅</div>
                      <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Pertama Main</div>
                      <div style={{ fontSize: '12px' }}>{new Date(player.firstPlayed).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  {player.tournamentsWon && player.tournamentsWon.length > 0 && (
                    <div>
                      <h4 style={{ marginBottom: '12px' }}>🏆 Turnamen yang Dimenangkan:</h4>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {player.tournamentsWon.map((tourney, idx) => (
                          <div key={idx} style={{
                            padding: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            marginBottom: '8px'
                          }}>
                            <div>{tourney.name}</div>
                            <div style={{ fontSize: '11px', color: '#888' }}>
                              {new Date(tourney.date).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setSelectedPlayer(null)}
                    style={{
                      width: '100%',
                      marginTop: '24px',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Tutup
                  </button>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default HallOfFameScreen