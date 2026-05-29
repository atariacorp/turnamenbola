import React, { useState, useContext, useEffect } from 'react'
import { ThemeContext } from '../App'
import { exportToPDF } from '../utils/exportPDF'
import Confetti from '../components/Confetti'

function LeagueScreen({ participants, leagueType, onBack }) {
  const { theme } = useContext(ThemeContext)
  const [showConfetti, setShowConfetti] = useState(false)
  const [winner, setWinner] = useState(null)
  
  // Generate matches based on league type (half or full season)
  const [matches, setMatches] = useState(() => {
    const newMatches = []
    const isFullSeason = leagueType === 'full' // Home & Away
    
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        // First leg
        newMatches.push({
          id: `${i}-${j}-1`,
          player1: participants[i],
          player2: participants[j],
          score1: null,
          score2: null,
          completed: false,
          leg: 1,
          venue: `${participants[i].name} (Home)`,
          events1: [], // goals, cards for player1
          events2: []  // goals, cards for player2
        })
        
        // Second leg if full season
        if (isFullSeason) {
          newMatches.push({
            id: `${i}-${j}-2`,
            player1: participants[j],
            player2: participants[i],
            score1: null,
            score2: null,
            completed: false,
            leg: 2,
            venue: `${participants[j].name} (Home)`,
            events1: [],
            events2: []
          })
        }
      }
    }
    return newMatches
  })

  // Initialize standings
  const [standings, setStandings] = useState(() => {
    const initial = {}
    participants.forEach(p => {
      initial[p.name] = { 
        played: 0, 
        wins: 0, 
        draws: 0, 
        losses: 0, 
        gf: 0, 
        ga: 0, 
        gd: 0, 
        points: 0,
        homeWins: 0, 
        awayWins: 0,
        goals: [], // track goal scorers
        yellowCards: 0,
        redCards: 0
      }
    })
    return initial
  })

  // Add event (goal, yellow card, red card)
  const addEvent = (matchId, player, type) => {
    const newMatches = [...matches]
    const match = newMatches.find(m => m.id === matchId)
    if (!match || match.completed) return
    
    const event = { 
      type, 
      minute: Math.floor(Math.random() * 90) + 1,
      playerName: player === 1 ? match.player1.name : match.player2.name
    }
    
    if (player === 1) match.events1.push(event)
    else match.events2.push(event)
    
    setMatches(newMatches)
  }

  // Update score for a match
  const updateScore = (matchId, player, value) => {
    const newMatches = [...matches]
    const match = newMatches.find(m => m.id === matchId)
    if (!match || match.completed) return
    
    const score = parseInt(value) || 0
    
    if (player === 1) match.score1 = score
    else match.score2 = score

    // Check if both scores are filled and match not completed
    if (match.score1 !== null && match.score2 !== null && !match.completed) {
      match.completed = true
      
      const newStandings = { ...standings }
      const p1 = match.player1.name
      const p2 = match.player2.name
      const s1 = match.score1
      const s2 = match.score2
      const isHomeGame = match.venue.includes(match.player1.name)

      const updateStats = (name, gf, ga, isWin, isDraw, isHome) => {
        const s = newStandings[name]
        if (!s) return
        
        s.played++
        s.gf += gf
        s.ga += ga
        s.gd = s.gf - s.ga
        
        // Track goals from events
        const matchEvents = name === p1 ? match.events1 : match.events2
        matchEvents.forEach(event => {
          if (event.type === 'goal') {
            s.goals.push(event)
          } else if (event.type === 'yellow') {
            s.yellowCards++
          } else if (event.type === 'red') {
            s.redCards++
          }
        })
        
        if (isWin) { 
          s.wins++; 
          s.points += 3;
          if (isHome) s.homeWins = (s.homeWins || 0) + 1
          else s.awayWins = (s.awayWins || 0) + 1
        }
        else if (isDraw) { 
          s.draws++; 
          s.points += 1;
        }
        else s.losses++
      }

      if (s1 > s2) {
        updateStats(p1, s1, s2, true, false, isHomeGame)
        updateStats(p2, s2, s1, false, false, !isHomeGame)
      } else if (s2 > s1) {
        updateStats(p2, s2, s1, true, false, !isHomeGame)
        updateStats(p1, s1, s2, false, false, isHomeGame)
      } else {
        updateStats(p1, s1, s2, false, true, isHomeGame)
        updateStats(p2, s2, s1, false, true, !isHomeGame)
      }
      
      setStandings(newStandings)
    }
    
    setMatches(newMatches)
  }

  // Calculate sorted standings
  const sortedStandings = Object.entries(standings)
    .sort((a, b) => {
      if (b[1].points !== a[1].points) return b[1].points - a[1].points
      if (b[1].gd !== a[1].gd) return b[1].gd - a[1].gd
      return b[1].gf - a[1].gf
    })

  // Calculate totals
  const totalMatches = matches.length
  const completedMatches = matches.filter(m => m.completed).length
  const isComplete = completedMatches === totalMatches

  // Check for champion when league is complete
  useEffect(() => {
    if (isComplete && sortedStandings.length > 0 && !winner) {
      setWinner(sortedStandings[0][0])
      setShowConfetti(true)
    }
  }, [isComplete, sortedStandings, winner])

  // Export to PDF
  const handleExportPDF = () => {
    exportToPDF('league-container', `liga-${leagueType === 'full' ? 'home-away' : 'half-season'}`)
  }

  // Get top goal scorer
  const getTopScorer = () => {
    const goalCounts = {}
    Object.entries(standings).forEach(([name, stats]) => {
      goalCounts[name] = stats.goals?.length || 0
    })
    const top = Object.entries(goalCounts).sort((a, b) => b[1] - a[1])[0]
    return top ? { name: top[0], goals: top[1] } : null
  }

  // Get fair play leader (least cards)
  const getFairPlayLeader = () => {
    const cardCounts = {}
    Object.entries(standings).forEach(([name, stats]) => {
      cardCounts[name] = (stats.yellowCards || 0) + (stats.redCards || 0) * 2
    })
    const top = Object.entries(cardCounts).sort((a, b) => a[1] - b[1])[0]
    return top ? { name: top[0], cards: top[1] } : null
  }

  const topScorer = getTopScorer()
  const fairPlayLeader = getFairPlayLeader()

  // Group matches by leg for full season home/away display
  const homeMatches = matches.filter(m => m.leg === 1)
  const awayMatches = matches.filter(m => m.leg === 2)

  return (
    <div style={{ padding: '20px' }}>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <div id="league-container">
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <h2 style={{ margin: 0 }}>
              ⚽ {leagueType === 'full' ? 'Liga Home & Away' : 'Liga 1/2 Musim'}
            </h2>
            <p style={{ margin: '5px 0 0', color: '#666' }}>
              Progress: {completedMatches}/{totalMatches} pertandingan
              {leagueType === 'full' && ' | Setiap tim bertemu home & away'}
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            style={{
              padding: '8px 16px',
              backgroundColor: theme === 'dark' ? '#444' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            📄 Export PDF
          </button>
        </div>

        {/* Statistics Cards */}
        {isComplete && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '25px'
          }}>
            <div style={{
              padding: '15px',
              backgroundColor: theme === 'dark' ? '#2a2a3e' : '#fef3c7',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '30px' }}>🏆</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{sortedStandings[0]?.[0]}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Juara Liga</div>
            </div>
            {topScorer && (
              <div style={{
                padding: '15px',
                backgroundColor: theme === 'dark' ? '#2a2a3e' : '#dbeafe',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '30px' }}>⚽</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{topScorer.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{topScorer.goals} Gol (Top Skor)</div>
              </div>
            )}
            {fairPlayLeader && (
              <div style={{
                padding: '15px',
                backgroundColor: theme === 'dark' ? '#2a2a3e' : '#dcfce7',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '30px' }}>🟨</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{fairPlayLeader.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{fairPlayLeader.cards} Kartu (Fair Play)</div>
              </div>
            )}
          </div>
        )}

        {/* Standings Table */}
        <div style={{
          marginBottom: '30px',
          padding: '15px',
          backgroundColor: theme === 'dark' ? '#1e1e2e' : '#f9f9f9',
          borderRadius: '12px'
        }}>
          <h3 style={{ marginTop: 0 }}>📊 Klasemen Akhir</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#667eea', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Pemain</th>
                  <th style={{ padding: '12px' }}>M</th>
                  <th style={{ padding: '12px' }}>W</th>
                  <th style={{ padding: '12px' }}>D</th>
                  <th style={{ padding: '12px' }}>L</th>
                  <th style={{ padding: '12px' }}>GF</th>
                  <th style={{ padding: '12px' }}>GA</th>
                  <th style={{ padding: '12px' }}>GD</th>
                  <th style={{ padding: '12px' }}>Pts</th>
                  <th style={{ padding: '12px' }}>⚽</th>
                  <th style={{ padding: '12px' }}>🟨</th>
                  <th style={{ padding: '12px' }}>🟥</th>
                  {leagueType === 'full' && (
                    <>
                      <th style={{ padding: '12px' }}>🏠</th>
                      <th style={{ padding: '12px' }}>✈️</th>
                    </>
                  )}
                 </tr>
              </thead>
              <tbody>
                {sortedStandings.map(([name, stats], idx) => (
                  <tr key={name} style={{ 
                    borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`,
                    backgroundColor: idx === 0 ? (theme === 'dark' ? '#2a2a3e' : '#fef3c7') : 'transparent',
                    fontWeight: idx === 0 ? 'bold' : 'normal'
                  }}>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ padding: '10px' }}>{name}</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>{stats.played}</td>
                    <td style={{ textAlign: 'center', padding: '10px', color: '#22c55e' }}>{stats.wins}</td>
                    <td style={{ textAlign: 'center', padding: '10px', color: '#f59e0b' }}>{stats.draws}</td>
                    <td style={{ textAlign: 'center', padding: '10px', color: '#ef4444' }}>{stats.losses}</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>{stats.gf}</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>{stats.ga}</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>{stats.gd}</td>
                    <td style={{ textAlign: 'center', padding: '10px', fontWeight: 'bold', fontSize: '16px' }}>{stats.points}</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>{stats.goals?.length || 0}</td>
                    <td style={{ textAlign: 'center', padding: '10px', color: '#f59e0b' }}>{stats.yellowCards || 0}</td>
                    <td style={{ textAlign: 'center', padding: '10px', color: '#ef4444' }}>{stats.redCards || 0}</td>
                    {leagueType === 'full' && (
                      <>
                        <td style={{ textAlign: 'center', padding: '10px', color: '#22c55e' }}>{stats.homeWins || 0}</td>
                        <td style={{ textAlign: 'center', padding: '10px', color: '#22c55e' }}>{stats.awayWins || 0}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Matches Schedule */}
        <div style={{ marginBottom: '30px' }}>
          <h3>📅 Jadwal Pertandingan</h3>
          
          {leagueType === 'full' && (
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ color: '#667eea' }}>🏠 Pertandingan Kandang</h4>
              {homeMatches.map(match => (
                <MatchRow 
                  key={match.id} 
                  match={match} 
                  updateScore={updateScore}
                  addEvent={addEvent}
                  theme={theme}
                />
              ))}
            </div>
          )}
          
          <div style={{ marginBottom: leagueType === 'full' ? '25px' : '0' }}>
            <h4 style={{ color: leagueType === 'full' ? '#f59e0b' : '#667eea' }}>
              {leagueType === 'full' ? '✈️ Pertandingan Tandang' : '📋 Semua Pertandingan'}
            </h4>
            {(leagueType === 'full' ? awayMatches : matches).map(match => (
              <MatchRow 
                key={match.id} 
                match={match} 
                updateScore={updateScore}
                addEvent={addEvent}
                theme={theme}
              />
            ))}
          </div>
        </div>

        {/* Champion Celebration */}
        {isComplete && winner && (
          <div style={{
            textAlign: 'center',
            padding: '30px',
            backgroundColor: theme === 'dark' ? '#2a2a3e' : '#fef3c7',
            borderRadius: '16px',
            marginTop: '20px'
          }}>
            <div style={{ fontSize: '64px' }}>🏆🏆🏆</div>
            <h2 style={{ margin: '10px 0', fontSize: '28px' }}>JUARA LIGA</h2>
            <h1 style={{ fontSize: '48px', margin: '10px 0', color: '#f59e0b' }}>
              {winner}
            </h1>
            <p>Total Poin: {sortedStandings[0]?.[1].points} | GD: {sortedStandings[0]?.[1].gd}</p>
            <p>⚽ {sortedStandings[0]?.[1].goals?.length || 0} Gol | 🟨 {sortedStandings[0]?.[1].yellowCards || 0} Kartu Kuning</p>
            <hr style={{ margin: '20px 0' }} />
            <p>🥈 Runner-up: {sortedStandings[1]?.[0]}</p>
            <p>🥉 Peringkat 3: {sortedStandings[2]?.[0]}</p>
            {topScorer && <p>⚽ Top Skor: {topScorer.name} ({topScorer.goals} gol)</p>}
            {fairPlayLeader && <p>🟨 Fair Play: {fairPlayLeader.name}</p>}
          </div>
        )}
      </div>

      <button
        onClick={onBack}
        style={{
          marginTop: '30px',
          padding: '12px 24px',
          backgroundColor: '#999',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        ← Kembali ke Pilih Format
      </button>
    </div>
  )
}

// Helper component for match row
const MatchRow = ({ match, updateScore, addEvent, theme }) => {
  const [showEvents, setShowEvents] = useState(false)
  
  return (
    <div style={{
      marginBottom: '8px',
      padding: '12px',
      backgroundColor: match.completed 
        ? (theme === 'dark' ? '#1a3a1a' : '#e8f5e9')
        : (theme === 'dark' ? '#2a2a3e' : 'white'),
      borderRadius: '10px',
      border: `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
      transition: 'all 0.2s'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {/* Player 1 */}
        <div style={{ width: '140px', textAlign: 'right' }}>
          <span style={{ fontWeight: 'bold' }}>{match.player1.name}</span>
          <div style={{ fontSize: '11px', color: '#888' }}>
            {match.events1?.map((e, i) => (
              <span key={i} style={{ marginLeft: '4px' }}>
                {e.type === 'goal' && `⚽${e.minute}'`}
                {e.type === 'yellow' && `🟨${e.minute}'`}
                {e.type === 'red' && `🟥${e.minute}'`}
              </span>
            ))}
          </div>
        </div>
        
        {/* Score Inputs */}
        <input
          type="number"
          value={match.score1 || ''}
          onChange={(e) => updateScore(match.id, 1, e.target.value)}
          style={{ width: '60px', padding: '8px', textAlign: 'center', fontSize: '18px', borderRadius: '6px', border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`, backgroundColor: theme === 'dark' ? '#333' : 'white', color: theme === 'dark' ? 'white' : '#333' }}
          disabled={match.completed}
          placeholder="0"
        />
        
        <span style={{ fontWeight: 'bold', fontSize: '20px' }}>-</span>
        
        <input
          type="number"
          value={match.score2 || ''}
          onChange={(e) => updateScore(match.id, 2, e.target.value)}
          style={{ width: '60px', padding: '8px', textAlign: 'center', fontSize: '18px', borderRadius: '6px', border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`, backgroundColor: theme === 'dark' ? '#333' : 'white', color: theme === 'dark' ? 'white' : '#333' }}
          disabled={match.completed}
          placeholder="0"
        />
        
        {/* Player 2 */}
        <div style={{ width: '140px', textAlign: 'left' }}>
          <span style={{ fontWeight: 'bold' }}>{match.player2.name}</span>
          <div style={{ fontSize: '11px', color: '#888' }}>
            {match.events2?.map((e, i) => (
              <span key={i} style={{ marginLeft: '4px' }}>
                {e.type === 'goal' && `⚽${e.minute}'`}
                {e.type === 'yellow' && `🟨${e.minute}'`}
                {e.type === 'red' && `🟥${e.minute}'`}
              </span>
            ))}
          </div>
        </div>
        
        {/* Venue & Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#888', minWidth: '80px' }}>
            {match.venue}
          </span>
          
          {!match.completed && (
            <>
              <button
                onClick={() => addEvent(match.id, 1, 'goal')}
                style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '14px', borderRadius: '4px', border: 'none', backgroundColor: '#22c55e', color: 'white' }}
                title="Tambah gol untuk pemain 1"
              >
                ⚽
              </button>
              <button
                onClick={() => addEvent(match.id, 2, 'goal')}
                style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '14px', borderRadius: '4px', border: 'none', backgroundColor: '#22c55e', color: 'white' }}
                title="Tambah gol untuk pemain 2"
              >
                ⚽+
              </button>
              <button
                onClick={() => addEvent(match.id, 1, 'yellow')}
                style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '14px', borderRadius: '4px', border: 'none', backgroundColor: '#f59e0b', color: 'white' }}
              >
                🟨
              </button>
              <button
                onClick={() => addEvent(match.id, 1, 'red')}
                style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '14px', borderRadius: '4px', border: 'none', backgroundColor: '#ef4444', color: 'white' }}
              >
                🟥
              </button>
            </>
          )}
          
          {match.completed && (
            <span style={{ color: '#22c55e', fontSize: '20px' }}>✓</span>
          )}
        </div>
      </div>
      
      {/* Events summary */}
      {!match.completed && (match.events1.length > 0 || match.events2.length > 0) && (
        <div style={{ 
          fontSize: '11px', 
          marginTop: '8px', 
          paddingTop: '8px', 
          borderTop: `1px solid ${theme === 'dark' ? '#444' : '#eee'}`,
          color: '#888',
          textAlign: 'center'
        }}>
          📋 {match.events1.length + match.events2.length} event tercatat
          <button 
            onClick={() => setShowEvents(!showEvents)}
            style={{ marginLeft: '8px', fontSize: '10px', cursor: 'pointer', background: 'none', border: 'none', color: '#667eea' }}
          >
            {showEvents ? 'sembunyikan' : 'detail'}
          </button>
          {showEvents && (
            <div style={{ marginTop: '5px' }}>
              {match.events1.map((e, i) => (
                <div key={i}>⚽ {match.player1.name} - {e.type === 'goal' ? 'Gol' : e.type === 'yellow' ? 'Kartu Kuning' : 'Kartu Merah'} menit {e.minute}'</div>
              ))}
              {match.events2.map((e, i) => (
                <div key={i}>⚽ {match.player2.name} - {e.type === 'goal' ? 'Gol' : e.type === 'yellow' ? 'Kartu Kuning' : 'Kartu Merah'} menit {e.minute}'</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LeagueScreen