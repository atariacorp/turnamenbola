// src/screens/RoomLobby.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function RoomLobby({ roomData, onLeave, theme, showToast, userName }) {
  const [players, setPlayers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (supabase) {
      loadPlayers()
      
      const subscription = supabase
        .channel(`room-${roomData.roomId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomData.roomId}` },
          () => loadPlayers()
        )
        .subscribe()
      
      return () => subscription.unsubscribe()
    }
  }, [roomData.roomId])

  const loadPlayers = async () => {
    if (!supabase) return
    
    const { data } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomData.roomId)
    
    setPlayers(data || [])
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomData.roomCode)
    showToast('Kode room disalin!', 'success')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: 'white', marginBottom: '8px' }}>🎮 {roomData.roomName || 'Room Turnamen'}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center', marginTop: '16px' }}>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '8px 16px',
              borderRadius: '12px',
              fontFamily: 'monospace',
              fontSize: '20px',
              letterSpacing: '4px',
              color: '#f59e0b'
            }}>
              {roomData.roomCode}
            </div>
            <button
              onClick={copyRoomCode}
              style={{
                padding: '8px 16px',
                background: '#667eea',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              📋 Salin Kode
            </button>
          </div>
        </div>

        {/* Players List */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: 'white', marginBottom: '16px' }}>👥 Pemain dalam Room ({players.length}/8)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {players.map(player => (
              <div key={player.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>👤</div>
                <div>
                  <div style={{ color: 'white', fontWeight: 'bold' }}>{player.player_name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {player.player_name === roomData.playerName ? 'Host' : 'Joined'}
                  </div>
                </div>
                {player.is_ready && <span style={{ marginLeft: 'auto', color: '#22c55e' }}>✅ Ready</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={onLeave}
            style={{
              flex: 1,
              padding: '14px',
              background: '#ef4444',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🚪 Keluar Room
          </button>
          <button
            onClick={() => {
              if (players.length >= 2) {
                showToast('Memulai turnamen...', 'success')
                // Navigate to tournament setup
              } else {
                showToast('Minimal 2 pemain untuk memulai turnamen!', 'warning')
              }
            }}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🎮 Mulai Turnamen
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoomLobby