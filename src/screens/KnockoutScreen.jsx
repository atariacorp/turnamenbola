// src/screens/KnockoutScreen.jsx
import React, { useState, useContext, useEffect } from 'react'
import { ThemeContext } from '../App'
import { exportToPDF } from '../utils/exportPDF'
import Confetti from '../components/Confetti'
import { saveTournamentHistory, unlockAchievement, getAchievements } from '../utils/storage'
import { addPlayerTrophy, getPlayerStarRating } from '../utils/playerStorage'
import AchievementsBadges from '../components/AchievementsBadges'
import LiveChat from '../components/LiveChat'
import { playVictorySound, initAudio } from '../utils/sounds'

// Achievement list
const ACHIEVEMENTS_LIST = [
  { id: 'first_win', name: 'Pertama Kali', description: 'Menjuarai turnamen pertama', icon: '🏆', color: '#f59e0b' },
  { id: 'hattrick', name: 'Hat-trick Hero', description: 'Mencetak 3 gol dalam satu pertandingan', icon: '⚽⚽⚽', color: '#22c55e' },
  { id: 'perfect_season', name: 'Musim Sempurna', description: 'Menang semua pertandingan', icon: '💯', color: '#ef4444' },
  { id: 'clean_sheet', name: 'Tembok Kokoh', description: '5 clean sheet dalam satu turnamen', icon: '🧤', color: '#3b82f6' },
  { id: 'comeback_king', name: 'Raja Comeback', description: 'Menang setelah tertinggal 2 gol', icon: '👑', color: '#8b5cf6' },
  { id: 'fair_play', name: 'Fair Play', description: 'Tanpa kartu sepanjang turnamen', icon: '🤝', color: '#10b981' },
  { id: 'top_scorer', name: 'Mesin Gol', description: 'Menjadi top skor turnamen', icon: '⚽', color: '#f59e0b' },
  { id: 'three_peat', name: 'Three-peat', description: 'Juara 3 kali berturut-turut', icon: '🏆🏆🏆', color: '#ef4444' },
]

function KnockoutScreen({ participants, onBack, onComplete }) {
  const { theme, userName } = useContext(ThemeContext)
  const [matches, setMatches] = useState(() => {
    const validParticipants = participants.map(p => ({
      name: p.name || p.player || 'Unknown',
      club: p.club || 'No Club',
      id: p.id || Date.now()
    }))
    
    const shuffled = [...validParticipants].sort(() => Math.random() - 0.5)
    const firstRound = []
    for (let i = 0; i < shuffled.length; i += 2) {
      firstRound.push({
        id: i,
        player1: shuffled[i],
        player2: shuffled[i + 1] || null,
        score1: null,
        score2: null,
        winner: null,
        events1: [],
        events2: [],
        motm: null,
        timeline: []
      })
    }
    return { rounds: [firstRound], currentRound: 0 }
  })
  
  const [showConfetti, setShowConfetti] = useState(false)
  const [savedToHistory, setSavedToHistory] = useState(false)
  const [achievements, setAchievements] = useState({})
  const [tournamentName, setTournamentName] = useState(`Turnamen ${new Date().toLocaleDateString()}`)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [isFinalComplete, setIsFinalComplete] = useState(false)

  useEffect(() => {
    setAchievements(getAchievements())
    // Check if final is already complete on load
    checkFinalComplete()
  }, [])

  const checkFinalComplete = () => {
    const lastRound = matches.rounds[matches.rounds.length - 1]
    if (lastRound && lastRound[0] && lastRound[0].winner) {
      setIsFinalComplete(true)
    }
  }

  const enableAudio = () => {
    initAudio()
    setAudioEnabled(true)
  }

  const addEvent = (roundIdx, matchIdx, player, type) => {
    if (isFinalComplete) {
      alert('Turnamen sudah selesai! Tidak dapat menambah event.');
      return;
    }
    
    const newMatches = { ...matches }
    const match = newMatches.rounds[roundIdx][matchIdx]
    const minute = Math.floor(Math.random() * 90) + 1
    
    const event = { type, minute, playerName: player === 1 ? match.player1.name : match.player2.name }
    
    if (player === 1) match.events1.push(event)
    else match.events2.push(event)
    
    match.timeline.push({
      minute,
      type,
      player: event.playerName,
      team: player === 1 ? 'home' : 'away'
    })
    
    match.timeline.sort((a, b) => a.minute - b.minute)
    
    setMatches(newMatches)
  }

  const setMotm = (roundIdx, matchIdx, player) => {
    if (isFinalComplete) {
      alert('Turnamen sudah selesai! Tidak dapat mengubah MOTM.');
      return;
    }
    
    const newMatches = { ...matches }
    const match = newMatches.rounds[roundIdx][matchIdx]
    match.motm = player === 1 ? match.player1.name : match.player2.name
    setMatches(newMatches)
  }

  const updateScore = (roundIdx, matchIdx, player, value) => {
    // Cek apakah final sudah selesai
    if (isFinalComplete) {
      alert('Turnamen sudah selesai! Tidak dapat mengubah skor lagi.');
      return;
    }
    
    const newMatches = { ...matches }
    const match = newMatches.rounds[roundIdx][matchIdx]
    
    if (player === 1) match.score1 = parseInt(value) || 0
    else match.score2 = parseInt(value) || 0

    if (match.score1 !== null && match.score2 !== null && match.player2) {
      if (match.score1 > match.score2) match.winner = match.player1
      else if (match.score2 > match.score1) match.winner = match.player2
      
      if (match.winner) {
        if (!newMatches.rounds[roundIdx + 1]) newMatches.rounds.push([])
        const nextRoundIdx = Math.floor(matchIdx / 2)
        if (!newMatches.rounds[roundIdx + 1][nextRoundIdx]) {
          newMatches.rounds[roundIdx + 1][nextRoundIdx] = {
            id: nextRoundIdx,
            player1: null,
            player2: null,
            score1: null,
            score2: null,
            winner: null,
            events1: [],
            events2: [],
            motm: null,
            timeline: []
          }
        }
        const nextMatch = newMatches.rounds[roundIdx + 1][nextRoundIdx]
        if (matchIdx % 2 === 0) {
          nextMatch.player1 = {
            ...match.winner,
            name: match.winner.name || match.winner.player || 'Unknown',
            club: match.winner.club || 'No Club'
          }
        } else {
          nextMatch.player2 = {
            ...match.winner,
            name: match.winner.name || match.winner.player || 'Unknown',
            club: match.winner.club || 'No Club'
          }
        }
      }
    }
    
    setMatches(newMatches)
    
    // Cek apakah final sudah selesai setelah update
    const lastRound = newMatches.rounds[newMatches.rounds.length - 1]
    if (lastRound && lastRound[0] && lastRound[0].winner) {
      setIsFinalComplete(true)
    }
  }

  const resetTournament = () => {
    if (window.confirm('Reset semua skor dan mulai ulang turnamen?')) {
      const validParticipants = participants.map(p => ({
        name: p.name || p.player || 'Unknown',
        club: p.club || 'No Club',
        id: p.id || Date.now()
      }))
      const shuffled = [...validParticipants].sort(() => Math.random() - 0.5)
      const firstRound = []
      for (let i = 0; i < shuffled.length; i += 2) {
        firstRound.push({
          id: i,
          player1: shuffled[i],
          player2: shuffled[i + 1] || null,
          score1: null,
          score2: null,
          winner: null,
          events1: [],
          events2: [],
          motm: null,
          timeline: []
        })
      }
      setMatches({ rounds: [firstRound], currentRound: 0 })
      setSavedToHistory(false)
      setIsFinalComplete(false)
    }
  }

  const getWinner = () => {
    const lastRound = matches.rounds[matches.rounds.length - 1]
    if (lastRound && lastRound[0] && lastRound[0].winner) {
      return lastRound[0].winner
    }
    return null
  }

  const winner = getWinner()

  const handleExportPDF = () => {
    exportToPDF('bracket-container', tournamentName.replace(/\s/g, '-'))
  }

  const saveToHistory = () => {
    if (winner && !savedToHistory) {
      if (audioEnabled) playVictorySound()
      
      const tournamentData = {
        name: tournamentName,
        winner: winner.name,
        runnerUp: matches.rounds[matches.rounds.length - 2]?.[0]?.winner?.name || '-',
        format: 'knockout',
        participants: participants.map(p => p.name || p.player),
        date: new Date().toISOString(),
        finalScore: `${matches.rounds[matches.rounds.length - 1][0]?.score1 || 0} - ${matches.rounds[matches.rounds.length - 1][0]?.score2 || 0}`
      }
      saveTournamentHistory(tournamentData)
      
      addPlayerTrophy(winner.name, tournamentName)
      
      const playerAchievements = achievements[winner.name] || []
      if (!playerAchievements.find(a => a.id === 'first_win')) {
        unlockAchievement(winner.name, ACHIEVEMENTS_LIST.find(a => a.id === 'first_win'))
      }
      
      const allGoals = []
      matches.rounds.forEach(round => {
        round.forEach(match => {
          match.events1?.forEach(e => { if (e.type === 'goal') allGoals.push(match.player1.name) })
          match.events2?.forEach(e => { if (e.type === 'goal') allGoals.push(match.player2.name) })
        })
      })
      
      const goalCounts = {}
      allGoals.forEach(name => { goalCounts[name] = (goalCounts[name] || 0) + 1 })
      Object.entries(goalCounts).forEach(([name, count]) => {
        if (count >= 3) {
          unlockAchievement(name, ACHIEVEMENTS_LIST.find(a => a.id === 'hattrick'))
        }
      })
      
      const finalMatch = matches.rounds[matches.rounds.length - 1][0]
      if (finalMatch && (finalMatch.score2 === 0 || finalMatch.score1 === 0)) {
        const cleanSheetWinner = finalMatch.score1 > finalMatch.score2 ? finalMatch.player1.name : finalMatch.player2.name
        unlockAchievement(cleanSheetWinner, ACHIEVEMENTS_LIST.find(a => a.id === 'clean_sheet'))
      }
      
      setSavedToHistory(true)
      setShowConfetti(true)
      if (onComplete) onComplete(winner.name, tournamentName)
    }
  }

  useEffect(() => {
    if (winner && !savedToHistory) {
      saveToHistory()
    }
  }, [winner])

  const winnerStarRating = winner ? getPlayerStarRating(
    (achievements[winner.name]?.length || 0) + 1
  ) : ''

  const chatRoomId = `knockout-${tournamentName.replace(/\s/g, '-')}`

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Audio Enable Button */}
      {!audioEnabled && (
        <button
          onClick={enableAudio}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '12px 20px',
            background: '#667eea',
            border: 'none',
            borderRadius: '30px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          🔊 Aktifkan Suara
        </button>
      )}
      
      {/* Header Controls */}
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
            fontSize: '28px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            🏆 Bagan Sistem Gugur
          </h2>
          <p style={{ color: '#a0a0a0', marginTop: '4px' }}>
            {isFinalComplete ? '🏆 Turnamen telah selesai! 🏆' : 'Klik skor untuk input, tambahkan gol dan kartu'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            placeholder="Nama Turnamen"
            style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px'
            }}
            disabled={isFinalComplete}
          />
          <button
            onClick={handleExportPDF}
            style={{
              padding: '8px 16px',
              background: theme === 'dark' ? '#444' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📄 Export PDF
          </button>
          <button
            onClick={resetTournament}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔄 Reset Turnamen
          </button>
        </div>
      </div>
      
      {/* Bracket Container */}
      <div id="bracket-container" style={{ 
        overflowX: 'auto', 
        padding: '20px', 
        background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', minWidth: '600px' }}>
          {matches.rounds.map((round, roundIdx) => (
            <div key={roundIdx} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ 
                textAlign: 'center',
                padding: '8px',
                background: 'rgba(102,126,234,0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                margin: 0,
                color: theme === 'dark' ? '#e0e0e0' : '#333'
              }}>
                {roundIdx === 0 ? 'Babak 1' : roundIdx === matches.rounds.length - 1 ? '🏆 FINAL 🏆' : `Babak ${roundIdx + 1}`}
              </h4>
              {round.map((match, matchIdx) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  roundIdx={roundIdx}
                  matchIdx={matchIdx}
                  updateScore={updateScore}
                  addEvent={addEvent}
                  setMotm={setMotm}
                  theme={theme}
                  isFinal={roundIdx === matches.rounds.length - 1}
                  isDisabled={isFinalComplete}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Winner Celebration */}
      {winner && (
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          marginBottom: '24px',
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.2))',
          borderRadius: '20px',
          border: '2px solid #f59e0b'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>🏆🏆🏆</div>
          <h2 style={{ fontSize: '28px', marginBottom: '8px', color: '#fff' }}>JUARA TURNAMEN</h2>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '18px', color: '#fbbf24' }}>🎮 Nama Gamer</div>
            <h1 style={{ 
              fontSize: '48px', 
              margin: '8px 0',
              background: 'linear-gradient(135deg, #fbbf24, #ef4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {winner.name}
            </h1>
            <div style={{ fontSize: '16px', color: '#9ca3af' }}>Tim yang digunakan</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24' }}>
              ⚽ {winner.club || 'Tim Terpilih'}
            </div>
          </div>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>
            {winnerStarRating}
          </div>
          <AchievementsBadges 
            playerName={winner.name} 
            unlockedAchievements={achievements[winner.name] || []} 
            onShowAll={true}
          />
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
            <button
              onClick={() => setShowConfetti(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🎉 Rayakan! 🎉
            </button>
            {!savedToHistory && (
              <button
                onClick={saveToHistory}
                style={{
                  padding: '12px 24px',
                  background: '#22c55e',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                💾 Simpan ke History
              </button>
            )}
          </div>
        </div>
      )}

      {/* Live Chat Section */}
      <LiveChat 
        matchId={chatRoomId}
        currentMatch={winner ? `${winner.name} menjadi juara!` : tournamentName}
        theme={theme}
      />

      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          marginTop: '24px',
          padding: '12px 24px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '12px',
          color: 'white',
          cursor: 'pointer',
          width: '100%',
          fontWeight: 'bold'
        }}
      >
        ← Kembali ke Pilih Format
      </button>
    </div>
  )
}

// MatchCard Component
const MatchCard = ({ match, roundIdx, matchIdx, updateScore, addEvent, setMotm, theme, isFinal, isDisabled }) => {
  const [showTimeline, setShowTimeline] = useState(false)
  
  const getPlayerDisplayName = (player) => {
    if (!player) return 'TBD'
    if (typeof player === 'object') {
      return player.name || player.player || 'TBD'
    }
    return String(player)
  }
  
  const getPlayerClub = (player) => {
    if (!player) return null
    if (typeof player === 'object') {
      return player.club || null
    }
    return null
  }
  
  const player1Name = getPlayerDisplayName(match.player1)
  const player1Club = getPlayerClub(match.player1)
  const player2Name = getPlayerDisplayName(match.player2)
  const player2Club = getPlayerClub(match.player2)
  
  const isWinner1 = match.winner === match.player1
  const isWinner2 = match.winner === match.player2
  const isMatchComplete = !!match.winner
  
  return (
    <div style={{
      background: isFinal 
        ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.15))'
        : (theme === 'dark' ? 'rgba(30,30,46,0.9)' : 'rgba(255,255,255,0.1)'),
      border: isFinal ? '2px solid #f59e0b' : `1px solid ${theme === 'dark' ? '#444' : 'rgba(255,255,255,0.2)'}`,
      borderRadius: '12px',
      padding: '12px',
      width: '340px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      transition: 'transform 0.2s',
      opacity: isDisabled && !isMatchComplete ? 0.7 : 1
    }}>
      {/* Player 1 */}
      <div style={{
        padding: '10px',
        background: isWinner1 ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1))' : 'transparent',
        borderRadius: '8px',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#ffffff' }}>
              🎮 {player1Name}
            </span>
            {player1Club && (
              <span style={{ fontSize: '11px', color: '#fbbf24', background: 'rgba(251,191,36,0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                ⚽ {player1Club}
              </span>
            )}
            {isWinner1 && <span style={{ fontSize: '11px', color: '#fbbf24', background: 'rgba(251,191,36,0.2)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>⭐ WINNER</span>}
          </div>
          <div style={{ fontSize: '10px', marginTop: '4px', color: '#9ca3af' }}>
            {match.events1?.map((e, i) => (
              <span key={i} style={{ marginRight: '4px' }}>
                {e.type === 'goal' && `⚽${e.minute}'`}
                {e.type === 'yellow' && `🟨${e.minute}'`}
                {e.type === 'red' && `🟥${e.minute}'`}
              </span>
            ))}
          </div>
        </div>
        
        {match.player1 && match.player2 && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="number"
              value={match.score1 !== null ? match.score1 : ''}
              onChange={(e) => updateScore(roundIdx, matchIdx, 1, e.target.value)}
              style={{
                width: '50px',
                padding: '8px',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
              disabled={!match.player2 || match.winner || isDisabled}
              placeholder="0"
            />
            <button 
              onClick={() => addEvent(roundIdx, matchIdx, 1, 'goal')} 
              style={{ padding: '4px 8px', cursor: 'pointer', background: '#22c55e', border: 'none', borderRadius: '6px', fontSize: '12px', color: 'white' }} 
              disabled={!match.player2 || match.winner || isDisabled} 
              title="Tambah Gol"
            >
              ⚽
            </button>
            <button 
              onClick={() => addEvent(roundIdx, matchIdx, 1, 'yellow')} 
              style={{ padding: '4px 8px', cursor: 'pointer', background: '#f59e0b', border: 'none', borderRadius: '6px', fontSize: '12px', color: 'white' }} 
              disabled={!match.player2 || match.winner || isDisabled} 
              title="Kartu Kuning"
            >
              🟨
            </button>
          </div>
        )}
      </div>
      
      {/* VS Divider */}
      {match.player2 && (
        <div style={{ textAlign: 'center', fontSize: '10px', color: '#6b7280', margin: '4px 0' }}>▼ VS ▼</div>
      )}
      
      {/* Player 2 */}
      <div style={{
        padding: '10px',
        background: isWinner2 ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1))' : 'transparent',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#ffffff' }}>
              🎮 {player2Name}
            </span>
            {player2Club && (
              <span style={{ fontSize: '11px', color: '#fbbf24', background: 'rgba(251,191,36,0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                ⚽ {player2Club}
              </span>
            )}
            {isWinner2 && <span style={{ fontSize: '11px', color: '#fbbf24', background: 'rgba(251,191,36,0.2)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>⭐ WINNER</span>}
          </div>
          <div style={{ fontSize: '10px', marginTop: '4px', color: '#9ca3af' }}>
            {match.events2?.map((e, i) => (
              <span key={i} style={{ marginRight: '4px' }}>
                {e.type === 'goal' && `⚽${e.minute}'`}
                {e.type === 'yellow' && `🟨${e.minute}'`}
                {e.type === 'red' && `🟥${e.minute}'`}
              </span>
            ))}
          </div>
        </div>
        
        {match.player2 && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="number"
              value={match.score2 !== null ? match.score2 : ''}
              onChange={(e) => updateScore(roundIdx, matchIdx, 2, e.target.value)}
              style={{
                width: '50px',
                padding: '8px',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
              disabled={match.winner || isDisabled}
              placeholder="0"
            />
            <button 
              onClick={() => addEvent(roundIdx, matchIdx, 2, 'goal')} 
              style={{ padding: '4px 8px', cursor: 'pointer', background: '#22c55e', border: 'none', borderRadius: '6px', fontSize: '12px', color: 'white' }} 
              disabled={match.winner || isDisabled} 
              title="Tambah Gol"
            >
              ⚽
            </button>
            <button 
              onClick={() => addEvent(roundIdx, matchIdx, 2, 'yellow')} 
              style={{ padding: '4px 8px', cursor: 'pointer', background: '#f59e0b', border: 'none', borderRadius: '6px', fontSize: '12px', color: 'white' }} 
              disabled={match.winner || isDisabled} 
              title="Kartu Kuning"
            >
              🟨
            </button>
          </div>
        )}
      </div>
      
      {/* MOTM & Timeline */}
      {match.winner && (
        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: `1px solid ${theme === 'dark' ? '#333' : 'rgba(255,255,255,0.1)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ color: '#9ca3af' }}>⭐ Man of the Match:</span>
            {match.motm ? (
              <span style={{ fontWeight: 'bold', color: '#fbbf24' }}>🎮 {match.motm}</span>
            ) : (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={() => setMotm(roundIdx, matchIdx, 1)} 
                  style={{ fontSize: '10px', padding: '2px 8px', cursor: 'pointer', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '4px', color: '#e0e0e0' }}
                  disabled={isDisabled}
                >
                  Pilih {player1Name?.split(' ')[0] || 'P1'}
                </button>
                <button 
                  onClick={() => setMotm(roundIdx, matchIdx, 2)} 
                  style={{ fontSize: '10px', padding: '2px 8px', cursor: 'pointer', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '4px', color: '#e0e0e0' }}
                  disabled={isDisabled}
                >
                  Pilih {player2Name?.split(' ')[0] || 'P2'}
                </button>
              </div>
            )}
          </div>
          
          {match.timeline?.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <button 
                onClick={() => setShowTimeline(!showTimeline)} 
                style={{ fontSize: '10px', padding: '4px 8px', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', color: '#9ca3af', width: '100%' }}
              >
                {showTimeline ? '📋 Sembunyikan Timeline' : '⏱️ Lihat Timeline Pertandingan'}
              </button>
              {showTimeline && (
                <div style={{ marginTop: '8px', fontSize: '10px', maxHeight: '120px', overflowY: 'auto' }}>
                  {match.timeline.map((event, idx) => (
                    <div key={idx} style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#9ca3af' }}>
                      ⏱️ {event.minute}' - {event.type === 'goal' ? '⚽ Gol' : event.type === 'yellow' ? '🟨 Kartu Kuning' : '🟥 Kartu Merah'} oleh {event.player}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default KnockoutScreen