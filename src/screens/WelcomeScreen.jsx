// src/screens/WelcomeScreen.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function WelcomeScreen({ onStart, tournamentName, setTournamentName }) {
  const [name, setName] = useState(tournamentName || '')
  const [activeRooms, setActiveRooms] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadActiveRooms()
    
    // Subscribe ke perubahan room (real-time)
    if (supabase) {
      const subscription = supabase
        .channel('rooms-channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'rooms' },
          () => loadActiveRooms()
        )
        .subscribe()
      
      return () => subscription.unsubscribe()
    }
  }, [])

  const loadActiveRooms = async () => {
    setIsLoading(true)
    
    if (supabase) {
      const { data } = await supabase
        .from('rooms')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false })
        .limit(10)
      
      setActiveRooms(data || [])
    } else {
      // Demo data offline
      setActiveRooms([
        { room_code: 'ABC123', room_name: 'Turnamen Minggu Pagi', current_players: 3, max_players: 8, owner_name: 'Budi' },
        { room_code: 'XYZ789', room_name: 'Liga Santai', current_players: 5, max_players: 8, owner_name: 'Andi' },
        { room_code: 'DEF456', room_name: 'Piala RT 05', current_players: 2, max_players: 8, owner_name: 'Citra' },
      ])
    }
    
    setIsLoading(false)
  }

  const copyRoomCode = (code) => {
    navigator.clipboard.writeText(code)
    alert(`Kode room ${code} disalin!`)
  }

  const handleStart = () => {
    if (name.trim()) {
      setTournamentName(name.trim())
      onStart()
    } else {
      alert('Masukkan nama turnamen terlebih dahulu!')
    }
  }

  return (
    <div style={{
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '80px',
        marginBottom: '20px',
        animation: 'float 3s ease-in-out infinite'
      }}>
        🏆
      </div>
      <h2 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '16px'
      }}>
        Turnamen Sepak Bola
      </h2>
      <p style={{ color: '#a0a0a0', marginBottom: '32px' }}>
        Atur turnamen sepak bolamu dengan mudah, atau gabung dengan room yang sudah ada!
      </p>
      
      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '32px',
        marginTop: '20px'
      }}>
        {/* Left Column - Create Tournament */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#fff' }}>✨ Buat Turnamen Baru</h3>
          
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStart()}
            placeholder="Nama Turnamen..."
            style={{
              width: '100%',
              padding: '14px',
              marginBottom: '20px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px'
            }}
            autoFocus
          />
          
          <button
            onClick={handleStart}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Mulai Turnamen Baru →
          </button>
        </div>

        {/* Right Column - Active Rooms */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', color: '#fff' }}>🎮 Room Aktif</h3>
            <span style={{
              padding: '4px 12px',
              background: '#22c55e',
              borderRadius: '20px',
              fontSize: '12px'
            }}>
              {activeRooms.length} Room
            </span>
          </div>
          
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              <div className="spinner" style={{
                width: '30px',
                height: '30px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTop: '3px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 10px'
              }} />
              Memuat room...
            </div>
          ) : activeRooms.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {activeRooms.map((room, idx) => (
                <div
                  key={room.id || idx}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    padding: '16px',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '16px' }}>
                        {room.room_name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                        Host: {room.owner_name || 'Anonymous'}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      background: 'rgba(34,197,94,0.2)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#22c55e'
                    }}>
                      👥 {room.current_players || 0}/{room.max_players || 8}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      letterSpacing: '2px',
                      color: '#f59e0b',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '4px 12px',
                      borderRadius: '8px'
                    }}>
                      {room.room_code}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => copyRoomCode(room.room_code)}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        📋 Salin
                      </button>
                      <button
                        onClick={() => window.location.href = `/?join=${room.room_code}`}
                        style={{
                          padding: '6px 16px',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}
                      >
                        Gabung
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#888'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
              <p>Belum ada room aktif</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>Buat room baru untuk bermain bersama teman!</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '32px', fontSize: '12px', color: '#666' }}>
        💡 Tips: Buat room baru atau gabung dengan room yang sudah ada menggunakan kode room
      </div>
      
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

export default WelcomeScreen