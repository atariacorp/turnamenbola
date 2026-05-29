// src/components/PlayerStats.jsx
import React, { useState, useEffect } from 'react'

function PlayerStats({ players, matches, theme }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [statsData, setStatsData] = useState({})
  const [timeRange, setTimeRange] = useState('all') // all, last5, last10

  useEffect(() => {
    calculateStats()
  }, [players, matches])

  const calculateStats = () => {
    const stats = {}
    
    players.forEach(player => {
      stats[player.name] = {
        name: player.name,
        totalMatches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        motmAwards: 0,
        cleanSheets: 0,
        winRate: 0,
        goalsPerMatch: 0,
        tournamentsWon: 0,
        totalPoints: 0,
        last5Matches: [],
        opponentStats: {}
      }
    })

    // Process matches
    matches.forEach(match => {
      if (!match.completed) return

      const p1Name = match.player1?.name
      const p2Name = match.player2?.name
      
      if (p1Name && stats[p1Name]) {
        stats[p1Name].totalMatches++
        stats[p1Name].goals += match.score1 || 0
        stats[p1Name].yellowCards += match.events1?.filter(e => e.type === 'yellow').length || 0
        stats[p1Name].redCards += match.events1?.filter(e => e.type === 'red').length || 0
        
        // Track assists (sederhana: setiap goal dianggap assist dari team)
        stats[p1Name].assists += (match.score1 || 0)
        
        if (match.score1 > match.score2) {
          stats[p1Name].wins++
          stats[p1Name].totalPoints += 3
        } else if (match.score1 === match.score2) {
          stats[p1Name].draws++
          stats[p1Name].totalPoints += 1
        } else {
          stats[p1Name].losses++
        }
        
        if (match.score2 === 0) stats[p1Name].cleanSheets++
        if (match.motm === p1Name) stats[p1Name].motmAwards++
        
        // Track opponent stats
        if (p2Name) {
          if (!stats[p1Name].opponentStats[p2Name]) {
            stats[p1Name].opponentStats[p2Name] = { wins: 0, losses: 0, draws: 0, goals: 0, conceded: 0 }
          }
          const opp = stats[p1Name].opponentStats[p2Name]
          if (match.score1 > match.score2) opp.wins++
          else if (match.score1 < match.score2) opp.losses++
          else opp.draws++
          opp.goals += match.score1 || 0
          opp.conceded += match.score2 || 0
        }
      }
      
      if (p2Name && stats[p2Name]) {
        stats[p2Name].totalMatches++
        stats[p2Name].goals += match.score2 || 0
        stats[p2Name].yellowCards += match.events2?.filter(e => e.type === 'yellow').length || 0
        stats[p2Name].redCards += match.events2?.filter(e => e.type === 'red').length || 0
        stats[p2Name].assists += (match.score2 || 0)
        
        if (match.score2 > match.score1) {
          stats[p2Name].wins++
          stats[p2Name].totalPoints += 3
        } else if (match.score1 === match.score2) {
          stats[p2Name].draws++
          stats[p2Name].totalPoints += 1
        } else {
          stats[p2Name].losses++
        }
        
        if (match.score1 === 0) stats[p2Name].cleanSheets++
        if (match.motm === p2Name) stats[p2Name].motmAwards++
        
        if (p1Name) {
          if (!stats[p2Name].opponentStats[p1Name]) {
            stats[p2Name].opponentStats[p1Name] = { wins: 0, losses: 0, draws: 0, goals: 0, conceded: 0 }
          }
          const opp = stats[p2Name].opponentStats[p1Name]
          if (match.score2 > match.score1) opp.wins++
          else if (match.score2 < match.score1) opp.losses++
          else opp.draws++
          opp.goals += match.score2 || 0
          opp.conceded += match.score1 || 0
        }
      }
    })
    
    // Calculate derived stats
    Object.values(stats).forEach(stat => {
      if (stat.totalMatches > 0) {
        stat.winRate = ((stat.wins / stat.totalMatches) * 100).toFixed(1)
        stat.goalsPerMatch = (stat.goals / stat.totalMatches).toFixed(2)
      }
    })
    
    setStatsData(stats)
  }

  const sortedPlayers = Object.values(statsData).sort((a, b) => b.totalPoints - a.totalPoints)

  // Get player performance chart data
  const getPlayerChartData = (player) => {
    const matchesPlayed = []
    const goalsScored = []
    for (let i = 0; i < player.totalMatches; i++) {
      matchesPlayed.push(i + 1)
      goalsScored.push(Math.floor(Math.random() * 3)) // Placeholder
    }
    return { matches: matchesPlayed, goals: goalsScored }
  }

  return (
    <div style={{
      padding: '20px',
      background: theme === 'dark' ? '#1e1e2e' : '#f9f9f9',
      borderRadius: '16px',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        📊 Statistik Performa Pemain
      </h3>

      {/* Player Selection Dropdown */}
      <div style={{ marginBottom: '20px' }}>
        <select
          value={selectedPlayer || ''}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            background: theme === 'dark' ? '#333' : 'white',
            border: `1px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
            color: theme === 'dark' ? 'white' : '#333',
            width: '200px'
          }}
        >
          <option value="">Pilih Pemain</option>
          {sortedPlayers.map(p => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      {selectedPlayer && statsData[selectedPlayer] ? (
        <PlayerDetailCard 
          player={statsData[selectedPlayer]} 
          theme={theme}
          chartData={getPlayerChartData(statsData[selectedPlayer])}
        />
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#888'
        }}>
          Pilih pemain untuk melihat statistik lengkap
        </div>
      )}

      {/* Leaderboard */}
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ marginBottom: '12px' }}>🏆 Leaderboard</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: theme === 'dark' ? '#2a2a3e' : '#e0e0e0' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Pemain</th>
                <th style={{ padding: '10px' }}>M</th>
                <th style={{ padding: '10px' }}>W</th>
                <th style={{ padding: '10px' }}>D</th>
                <th style={{ padding: '10px' }}>L</th>
                <th style={{ padding: '10px' }}>⚽</th>
                <th style={{ padding: '10px' }}>Pts</th>
                <th style={{ padding: '10px' }}>Win%</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.slice(0, 10).map((player, idx) => (
                <tr key={player.name} style={{ borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}` }}>
                  <td style={{ padding: '10px' }}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{player.name}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{player.totalMatches}</td>
                  <td style={{ textAlign: 'center', padding: '10px', color: '#22c55e' }}>{player.wins}</td>
                  <td style={{ textAlign: 'center', padding: '10px', color: '#f59e0b' }}>{player.draws}</td>
                  <td style={{ textAlign: 'center', padding: '10px', color: '#ef4444' }}>{player.losses}</td>
                  <td style={{ textAlign: 'center', padding: '10px', fontWeight: 'bold' }}>{player.goals}</td>
                  <td style={{ textAlign: 'center', padding: '10px', fontWeight: 'bold' }}>{player.totalPoints}</td>
                  <td style={{ textAlign: 'center', padding: '10px' }}>{player.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Player Detail Card Component
const PlayerDetailCard = ({ player, theme, chartData }) => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'goals', label: '⚽ Goals', icon: '⚽' },
    { id: 'cards', label: '🃏 Cards', icon: '🃏' },
    { id: 'opponents', label: '🤝 Opponents', icon: '🤝' }
  ]

  return (
    <div style={{
      background: theme === 'dark' ? '#2a2a3e' : 'white',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      {/* Player Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '30px'
        }}>
          🎮
        </div>
        <div>
          <h2 style={{ fontSize: '24px', margin: 0 }}>{player.name}</h2>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
            <span>🏆 {player.totalPoints} pts</span>
            <span>⚽ {player.goals} gol</span>
            <span>📊 {player.winRate}% win</span>
            <span>⭐ {player.motmAwards} MOTM</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`, paddingBottom: '10px' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              background: activeTab === tab.id ? '#667eea' : 'transparent',
              border: 'none',
              borderRadius: '20px',
              color: activeTab === tab.id ? 'white' : (theme === 'dark' ? '#ccc' : '#666'),
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <StatCard label="Total Match" value={player.totalMatches} icon="🎮" color="#3b82f6" />
            <StatCard label="Menang" value={player.wins} icon="✅" color="#22c55e" />
            <StatCard label="Seri" value={player.draws} icon="🤝" color="#f59e0b" />
            <StatCard label="Kalah" value={player.losses} icon="❌" color="#ef4444" />
            <StatCard label="Gol" value={player.goals} icon="⚽" color="#10b981" />
            <StatCard label="Assist" value={player.assists || 0} icon="🎯" color="#8b5cf6" />
            <StatCard label="Clean Sheet" value={player.cleanSheets} icon="🧤" color="#06b6d4" />
            <StatCard label="MOTM" value={player.motmAwards} icon="⭐" color="#f59e0b" />
          </div>

          {/* Performance Chart */}
          <div style={{ marginTop: '20px' }}>
            <h4>📈 Performa per Match</h4>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '4px',
              height: '150px',
              marginTop: '10px'
            }}>
              {chartData.matches.slice(-10).map((match, idx) => (
                <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: `${(chartData.goals[idx] || 0) * 30}px`,
                    background: '#667eea',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s'
                  }} />
                  <div style={{ fontSize: '10px', marginTop: '5px' }}>M{idx + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div>
          <h4>⚽ Statistik Gol</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '16px'
          }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#22c55e' }}>{player.goals}</div>
              <div>Total Gol</div>
              <div style={{ fontSize: '14px', color: '#888' }}>{player.goalsPerMatch} per match</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>{player.assists || 0}</div>
              <div>Total Assist</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6' }}>
                {player.totalMatches > 0 ? ((player.goals / player.totalMatches) * 100).toFixed(1) : 0}%
              </div>
              <div>Kontribusi Gol</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cards' && (
        <div>
          <h4>🃏 Statistik Kartu</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '16px'
          }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>{player.yellowCards}</div>
              <div>Kartu Kuning</div>
              <div style={{ fontSize: '14px', color: '#888' }}>{player.totalMatches > 0 ? (player.yellowCards / player.totalMatches).toFixed(2) : 0} per match</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ef4444' }}>{player.redCards}</div>
              <div>Kartu Merah</div>
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#22c55e' }}>{player.cleanSheets}</div>
              <div>Clean Sheet</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'opponents' && (
        <div>
          <h4>🤝 Head-to-Head vs Lawan</h4>
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: theme === 'dark' ? '#333' : '#e0e0e0' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Lawan</th>
                  <th style={{ padding: '8px' }}>M</th>
                  <th style={{ padding: '8px' }}>W</th>
                  <th style={{ padding: '8px' }}>D</th>
                  <th style={{ padding: '8px' }}>L</th>
                  <th style={{ padding: '8px' }}>GF</th>
                  <th style={{ padding: '8px' }}>GA</th>
                  <th style={{ padding: '8px' }}>Win%</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(player.opponentStats || {}).map(([oppName, stats]) => {
                  const total = stats.wins + stats.draws + stats.losses
                  const winRate = total > 0 ? ((stats.wins / total) * 100).toFixed(1) : 0
                  return (
                    <tr key={oppName} style={{ borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#eee'}` }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{oppName}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{total}</td>
                      <td style={{ textAlign: 'center', padding: '8px', color: '#22c55e' }}>{stats.wins}</td>
                      <td style={{ textAlign: 'center', padding: '8px', color: '#f59e0b' }}>{stats.draws}</td>
                      <td style={{ textAlign: 'center', padding: '8px', color: '#ef4444' }}>{stats.losses}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{stats.goals}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{stats.conceded}</td>
                      <td style={{ textAlign: 'center', padding: '8px' }}>{winRate}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Stat Card Component
const StatCard = ({ label, value, icon, color }) => (
  <div style={{
    padding: '12px',
    background: '#1a1a2e',
    borderRadius: '12px',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '24px' }}>{icon}</div>
    <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{value}</div>
    <div style={{ fontSize: '11px', color: '#888' }}>{label}</div>
  </div>
)

export default PlayerStats