// src/screens/SpinnerScreen.jsx
import React, { useState, useRef, useEffect, useContext } from 'react'
import { ThemeContext } from '../App'
import { playSpinSound, playStopSound, initAudio } from '../utils/sounds'

function SpinnerScreen({ players, clubs, onComplete }) {
  const { theme } = useContext(ThemeContext)
  const [assignments, setAssignments] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [remainingClubs, setRemainingClubs] = useState(() => [...clubs])
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const currentAngle = useRef(0)

  // Enable audio on first user interaction
  const enableAudio = () => {
    initAudio()
    setAudioEnabled(true)
  }

  const colors = ['#dc2626', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#84cc16']

  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas || remainingClubs.length === 0) return

    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = canvas.width / 2 - 10
    const arc = (2 * Math.PI) / remainingClubs.length

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    remainingClubs.forEach((club, index) => {
      const angle = currentAngle.current + index * arc
      ctx.fillStyle = colors[index % colors.length]
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, angle, angle + arc)
      ctx.lineTo(centerX, centerY)
      ctx.fill()
      ctx.stroke()

      ctx.save()
      ctx.fillStyle = 'white'
      ctx.font = 'bold 12px Arial'
      ctx.translate(
        centerX + Math.cos(angle + arc / 2) * radius * 0.7,
        centerY + Math.sin(angle + arc / 2) * radius * 0.7
      )
      ctx.rotate(angle + arc / 2 + Math.PI / 2)
      const clubName = typeof club === 'object' ? club.name || JSON.stringify(club) : String(club)
      const text = clubName.length > 12 ? clubName.slice(0, 10) + '...' : clubName
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0)
      ctx.restore()
    })
  }

  const spin = () => {
    if (isSpinning || currentIndex >= players.length) return
    
    if (audioEnabled) playSpinSound()
    
    setIsSpinning(true)
    const spinAngle = Math.random() * 360 + 1440
    const duration = 2000
    const startTime = performance.now()
    const startAngle = currentAngle.current

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(1, elapsed / duration)
      const easeOut = (t) => 1 - Math.pow(1 - t, 3)
      const angle = startAngle + spinAngle * easeOut(progress)
      
      currentAngle.current = angle % 360
      drawWheel()

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        if (audioEnabled) playStopSound()
        
        const normalizedAngle = (360 - (currentAngle.current % 360)) % 360
        const segmentAngle = 360 / remainingClubs.length
        const selectedIndex = Math.floor(normalizedAngle / segmentAngle)
        const selectedClub = remainingClubs[selectedIndex]
        
        setTimeout(() => {
          const clubName = typeof selectedClub === 'object' ? selectedClub.name || JSON.stringify(selectedClub) : String(selectedClub)
          const newAssignments = [...assignments, {
            player: players[currentIndex].name,
            club: clubName
          }]
          setAssignments(newAssignments)
          setRemainingClubs(remainingClubs.filter(c => {
            const cName = typeof c === 'object' ? c.name || JSON.stringify(c) : String(c)
            const sName = typeof selectedClub === 'object' ? selectedClub.name || JSON.stringify(selectedClub) : String(selectedClub)
            return cName !== sName
          }))
          setCurrentIndex(currentIndex + 1)
          setIsSpinning(false)
          currentAngle.current = 0
        }, 500)
      }
    }

    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    drawWheel()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [remainingClubs])

  // Panggil onComplete hanya sekali ketika semua pemain sudah di-assign
  useEffect(() => {
    if (currentIndex >= players.length && players.length > 0 && !hasCompleted) {
      setHasCompleted(true)
      onComplete(assignments)
    }
  }, [currentIndex, players.length, assignments, hasCompleted, onComplete])

  // Jika sudah selesai, jangan render apa-apa
  if (hasCompleted || (currentIndex >= players.length && players.length > 0)) {
    return null
  }

  const currentPlayer = players[currentIndex]
  const playerName = currentPlayer ? (typeof currentPlayer === 'object' ? currentPlayer.name || String(currentPlayer) : String(currentPlayer)) : ''

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {/* Audio Enable Button */}
      {!audioEnabled && (
        <button
          onClick={enableAudio}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 16px',
            background: '#667eea',
            border: 'none',
            borderRadius: '20px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🔊 Aktifkan Suara
        </button>
      )}
      
      <h2 style={{ marginBottom: '10px' }}>🎡 Spin Acak Tim</h2>
      
      {/* Current Player Info */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea20, #764ba220)',
        borderRadius: '16px',
        display: 'inline-block',
        minWidth: '250px'
      }}>
        <div style={{ fontSize: '14px', color: '#888' }}>Giliran Pemain</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
          🎮 {playerName}
        </div>
      </div>
      
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Sisa tim: {remainingClubs.length} | Sisa pemain: {players.length - currentIndex}
      </p>

      <canvas 
        ref={canvasRef} 
        width={350} 
        height={350} 
        style={{ 
          margin: '0 auto', 
          display: 'block',
          borderRadius: '50%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}
      />

      <div style={{ position: 'relative', width: '350px', margin: '0 auto' }}>
        <div style={{
          position: 'absolute',
          top: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '15px solid transparent',
          borderRight: '15px solid transparent',
          borderTop: '30px solid #ef4444',
          zIndex: 10
        }} />
      </div>

      <button
        onClick={spin}
        disabled={isSpinning}
        style={{
          marginTop: '40px',
          padding: '14px 40px',
          backgroundColor: isSpinning ? '#999' : '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          cursor: isSpinning ? 'not-allowed' : 'pointer'
        }}
      >
        {isSpinning ? '🎵 Berputar...' : '🎲 Mulai Spin!'}
      </button>

      {/* Results Table */}
      <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '500px', margin: '30px auto 0' }}>
        <h3 style={{ marginBottom: '16px' }}>📋 Hasil Assignment:</h3>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {assignments.map((a, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f0f0f0',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: 'white'
                }}>{i + 1}</span>
                <span style={{ fontWeight: 'bold' }}>🎮 {a.player}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>→</span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: '#f59e0b',
                  background: 'rgba(245,158,11,0.1)',
                  padding: '4px 12px',
                  borderRadius: '20px'
                }}>
                  ⚽ {a.club}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SpinnerScreen