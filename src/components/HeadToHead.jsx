// src/components/HeadToHead.jsx
import React, { useState } from 'react'

function HeadToHead({ participants, matches, theme }) {
  const [player1, setPlayer1] = useState(participants[0]?.name || '')
  const [player2, setPlayer2] = useState(participants[1]?.name || '')

  const getHeadToHeadStats = () => {
    if (!player1 || !player2 || player1 === player2) return null
    
    const stats = {
      player1Wins: 0,
      player2Wins: 0,
      draws: 0,
      totalGoals1: 0,
      totalGoals2: 0,
      meetings: []
    }
    
    matches.forEach(match => {
      if ((match.player1.name === player1 && match.player2.name === player2) ||
          (match.player1.name === player2 && match.player2.name === player1)) {
        
        const p1Name = match.player1.name
        const p2Name = match.player2.name
        const isP1First = p1Name === player1
        
        stats.meetings.push({
          date: match.date || 'Unknown',
          score1: match.score1,
          score2: match.score2,
          winner: match.score1 > match.score2 ? p1Name : (match.score2 > match.score1 ? p2Name : 'Draw'),
          venue: match.venue
        })
        
        if (match.score1 > match.score2) {
          if (isP1First) stats.player1Wins++
          else stats.player2Wins++
        } else if (match.score2 > match.score1) {
          if (isP1First) stats.player2Wins++
          else stats.player1Wins++
        } else {
          stats.draws++
        }
        
        if (isP1First) {
          stats.totalGoals1 += match.score1
          stats.totalGoals2 += match.score2
        } else {
          stats.totalGoals1 += match.score2
          stats.totalGoals2 += match.score1
        }
      }
    })
    
    return stats
  }
  
  const stats = getHeadToHeadStats()
  
  return (
    <div style={{
      padding: '20px',
      backgroundColor: theme === 'dark' ? '#1e1e2e' : '#f9f9f9',
      borderRadius: '12px',
      marginBottom: '20px'
    }}>
      <h3>🤝 Head-to-Head</h3>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select
          value={player1}
          onChange={(e) => setPlayer1(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: theme === 'dark' ? '#333' : 'white',
            color: theme === 'dark' ? 'white' : '#333',
            border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`
          }}
        >
          <option value="">Pilih Pemain 1</option>
          {participants.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
        
        <span style={{ fontSize: '20px' }}>vs</span>
        
        <select
          value={player2}
          onChange={(e) => setPlayer2(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: theme === 'dark' ? '#333' : 'white',
            color: theme === 'dark' ? 'white' : '#333',
            border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`
          }}
        >
          <option value="">Pilih Pemain 2</option>
          {participants.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>
      
      {stats && stats.meetings.length > 0 ? (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ padding: '15px', backgroundColor: theme === 'dark' ? '#2a2a3e' : '#e8f5e9', borderRadius: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#22c55e' }}>{stats.player1Wins}</div>
              <div>{player1} Menang</div>
            </div>
            <div style={{ padding: '15px', backgroundColor: theme === 'dark' ? '#2a2a3e' : '#fff3e0', borderRadius: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.draws}</div>
              <div>Seri</div>
            </div>
            <div style={{ padding: '15px', backgroundColor: theme === 'dark' ? '#2a2a3e' : '#ffebee', borderRadius: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{stats.player2Wins}</div>
              <div>{player2} Menang</div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <strong>Total Gol:</strong> {player1} {stats.totalGoals1} - {stats.totalGoals2} {player2}
          </div>
          
          <div style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
            Total {stats.meetings.length} pertemuan
          </div>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#999' }}>
          {player1 && player2 ? 'Belum ada pertemuan antara kedua pemain' : 'Pilih dua pemain untuk melihat statistik head-to-head'}
        </p>
      )}
    </div>
  )
}

export default HeadToHead