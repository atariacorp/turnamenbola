// src/components/StatisticsDashboard.jsx
import React from 'react'

function StatisticsDashboard({ standings, matches, participants, theme }) {
  // Calculate various statistics
  const calculateStats = () => {
    const allGoals = []
    const allCards = { yellow: 0, red: 0 }
    const playerStats = {}
    
    Object.entries(standings).forEach(([name, stats]) => {
      playerStats[name] = {
        goals: stats.goals?.length || 0,
        yellowCards: stats.yellowCards || 0,
        redCards: stats.redCards || 0,
        points: stats.points,
        wins: stats.wins,
        cleanSheets: 0
      }
    })
    
    matches.forEach(match => {
      if (match.completed) {
        if (match.score1 === 0) playerStats[match.player1.name].cleanSheets++
        if (match.score2 === 0) playerStats[match.player2.name].cleanSheets++
        
        match.events1?.forEach(e => {
          if (e.type === 'goal') allGoals.push({ player: match.player1.name, minute: e.minute })
          if (e.type === 'yellow') allCards.yellow++
          if (e.type === 'red') allCards.red++
        })
        
        match.events2?.forEach(e => {
          if (e.type === 'goal') allGoals.push({ player: match.player2.name, minute: e.minute })
          if (e.type === 'yellow') allCards.yellow++
          if (e.type === 'red') allCards.red++
        })
      }
    })
    
    // Top scorer
    const topScorer = Object.entries(playerStats)
      .sort((a, b) => b[1].goals - a[1].goals)[0]
    
    // Most wins
    const mostWins = Object.entries(playerStats)
      .sort((a, b) => b[1].wins - a[1].wins)[0]
    
    // Most clean sheets
    const mostCleanSheets = Object.entries(playerStats)
      .sort((a, b) => b[1].cleanSheets - a[1].cleanSheets)[0]
    
    // Average goals per match
    const totalGoals = allGoals.length
    const completedMatches = matches.filter(m => m.completed).length
    const avgGoals = completedMatches > 0 ? (totalGoals / completedMatches).toFixed(2) : 0
    
    return {
      topScorer,
      mostWins,
      mostCleanSheets,
      allCards,
      avgGoals,
      totalGoals,
      completedMatches,
      totalMatches: matches.length
    }
  }
  
  const stats = calculateStats()
  const progress = stats.completedMatches > 0 
    ? (stats.completedMatches / stats.totalMatches * 100).toFixed(1)
    : 0
  
  return (
    <div style={{
      padding: '20px',
      backgroundColor: theme === 'dark' ? '#1e1e2e' : '#f9f9f9',
      borderRadius: '12px',
      marginBottom: '20px'
    }}>
      <h3>📈 Statistik Turnamen</h3>
      
      {/* Progress Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Progress Pertandingan</span>
          <span>{stats.completedMatches}/{stats.totalMatches} ({progress}%)</span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: theme === 'dark' ? '#333' : '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#22c55e',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>
      
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '15px',
          backgroundColor: theme === 'dark' ? '#2a2a3e' : 'white',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px' }}>⚽</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalGoals}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Gol</div>
          <div style={{ fontSize: '11px', marginTop: '5px' }}>Rata-rata: {stats.avgGoals} per match</div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: theme === 'dark' ? '#2a2a3e' : 'white',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px' }}>⭐</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.topScorer?.[0] || '-'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{stats.topScorer?.[1]?.goals || 0} Gol (Top Skor)</div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: theme === 'dark' ? '#2a2a3e' : 'white',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px' }}>🏆</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.mostWins?.[0] || '-'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{stats.mostWins?.[1]?.wins || 0} Kemenangan</div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: theme === 'dark' ? '#2a2a3e' : 'white',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px' }}>🟨</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.allCards.yellow}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Kartu Kuning</div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: theme === 'dark' ? '#2a2a3e' : 'white',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px' }}>🟥</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.allCards.red}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Kartu Merah</div>
        </div>
        
        <div style={{
          padding: '15px',
          backgroundColor: theme === 'dark' ? '#2a2a3e' : 'white',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px' }}>🧤</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.mostCleanSheets?.[0] || '-'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{stats.mostCleanSheets?.[1]?.cleanSheets || 0} Clean Sheet</div>
        </div>
      </div>
      
      {/* Goal Timeline (simple visualization) */}
      {stats.totalGoals > 0 && (
        <div>
          <div style={{ fontSize: '14px', marginBottom: '10px' }}>⏱️ Distribusi Gol</div>
          <div style={{ display: 'flex', gap: '2px', height: '60px', alignItems: 'flex-end' }}>
            {[0, 15, 30, 45, 60, 75].map((minute, idx) => {
              const height = Math.random() * 50 + 10 // Placeholder - would need real data
              return (
                <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: `${height}px`,
                    backgroundColor: '#667eea',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s'
                  }} />
                  <div style={{ fontSize: '10px', marginTop: '5px' }}>{minute}'</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default StatisticsDashboard