import React, { useState } from 'react'

function GroupStageScreen({ participants, onBack, onComplete }) {
  const [groups, setGroups] = useState(() => {
    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    const numGroups = Math.min(4, Math.floor(participants.length / 2))
    const groupSize = Math.ceil(participants.length / numGroups)
    const newGroups = {}
    
    for (let i = 0; i < numGroups; i++) {
      const groupName = String.fromCharCode(65 + i)
      newGroups[groupName] = {
        players: shuffled.slice(i * groupSize, (i + 1) * groupSize),
        matches: [],
        standings: {}
      }
      
      // Generate matches within group
      const players = newGroups[groupName].players
      for (let a = 0; a < players.length; a++) {
        for (let b = a + 1; b < players.length; b++) {
          newGroups[groupName].matches.push({
            player1: players[a],
            player2: players[b],
            score1: null,
            score2: null
          })
        }
      }
      
      // Initialize standings
      players.forEach(p => {
        newGroups[groupName].standings[p.name] = {
          played: 0, wins: 0, draws: 0, losses: 0,
          gf: 0, ga: 0, gd: 0, points: 0
        }
      })
    }
    return newGroups
  })

  const updateScore = (groupName, matchIdx, player, value) => {
    const newGroups = { ...groups }
    const match = newGroups[groupName].matches[matchIdx]
    const score = parseInt(value) || 0
    
    if (player === 1) match.score1 = score
    else match.score2 = score

    if (match.score1 !== null && match.score2 !== null) {
      const p1 = match.player1.name
      const p2 = match.player2.name
      const s1 = match.score1
      const s2 = match.score2
      
      const updateStandings = (name, gf, ga, isWin, isDraw) => {
        const s = newGroups[groupName].standings[name]
        s.played++
        s.gf += gf
        s.ga += ga
        s.gd = s.gf - s.ga
        if (isWin) { s.wins++; s.points += 3 }
        else if (isDraw) { s.draws++; s.points += 1 }
        else s.losses++
      }

      if (s1 > s2) {
        updateStandings(p1, s1, s2, true, false)
        updateStandings(p2, s2, s1, false, false)
      } else if (s2 > s1) {
        updateStandings(p2, s2, s1, true, false)
        updateStandings(p1, s1, s2, false, false)
      } else {
        updateStandings(p1, s1, s2, false, true)
        updateStandings(p2, s2, s1, false, true)
      }
    }
    
    setGroups(newGroups)
  }

  const getGroupWinners = () => {
    const winners = []
    Object.keys(groups).forEach(groupName => {
      const group = groups[groupName]
      const sorted = Object.entries(group.standings)
        .sort((a, b) => b[1].points - a[1].points || b[1].gd - a[1].gd)
      if (sorted[0]) winners.push(sorted[0][0])
      if (sorted[1]) winners.push(sorted[1][0])
    })
    return winners
  }

  const allMatchesComplete = () => {
    return Object.values(groups).every(group =>
      group.matches.every(match => match.score1 !== null && match.score2 !== null)
    )
  }

  const handleComplete = () => {
    if (allMatchesComplete()) {
      onComplete(getGroupWinners())
    } else {
      alert('Harap isi semua skor pertandingan!')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📊 Fase Grup</h2>
      
      {Object.entries(groups).map(([groupName, group]) => (
        <div key={groupName} style={{
          marginBottom: '30px',
          padding: '15px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px'
        }}>
          <h3>Grup {groupName}</h3>
          
          <table style={{ width: '100%', marginBottom: '15px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#667eea', color: 'white' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Pemain</th>
                <th style={{ padding: '8px' }}>M</th><th style={{ padding: '8px' }}>W</th>
                <th style={{ padding: '8px' }}>D</th><th style={{ padding: '8px' }}>L</th>
                <th style={{ padding: '8px' }}>GF</th><th style={{ padding: '8px' }}>GA</th>
                <th style={{ padding: '8px' }}>GD</th><th style={{ padding: '8px' }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {group.players.map(player => {
                const s = group.standings[player.name]
                return (
                  <tr key={player.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}>{player.name}</td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>{s.played}</td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>{s.wins}</td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>{s.draws}</td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>{s.losses}</td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>{s.gf}</td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>{s.ga}</td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>{s.gd}</td>
                    <td style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold' }}>{s.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div style={{ marginTop: '10px' }}>
            <h4>Pertandingan:</h4>
            {group.matches.map((match, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px',
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '5px'
              }}>
                <span style={{ width: '120px', textAlign: 'right' }}>{match.player1.name}</span>
                <input
                  type="number"
                  value={match.score1 || ''}
                  onChange={(e) => updateScore(groupName, idx, 1, e.target.value)}
                  style={{ width: '50px', padding: '5px', textAlign: 'center' }}
                />
                <span>-</span>
                <input
                  type="number"
                  value={match.score2 || ''}
                  onChange={(e) => updateScore(groupName, idx, 2, e.target.value)}
                  style={{ width: '50px', padding: '5px', textAlign: 'center' }}
                />
                <span style={{ width: '120px', textAlign: 'left' }}>{match.player2.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={onBack}
          style={{ padding: '10px 20px', backgroundColor: '#999', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          ← Kembali
        </button>
        <button
          onClick={handleComplete}
          style={{ padding: '10px 20px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Selesai & Lanjut ke Knockout →
        </button>
      </div>
    </div>
  )
}

export default GroupStageScreen