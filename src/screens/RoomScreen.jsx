// src/screens/RoomScreen.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function RoomScreen({ theme, onJoinRoom, onCreateRoom, showToast }) {
  const [activeTab, setActiveTab] = useState('join')
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('app_user_name') || '')
  const [roomName, setRoomName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [password, setPassword] = useState('')
  const [availableRooms, setAvailableRooms] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadAvailableRooms()
    
    // Subscribe to real-time room updates
    if (supabase) {
      const subscription = supabase
        .channel('rooms-channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'rooms' },
          () => loadAvailableRooms()
        )
        .subscribe()
      
      return () => subscription.unsubscribe()
    }
  }, [])

  const loadAvailableRooms = async () => {
    if (!supabase) return
    
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
    
    setAvailableRooms(data || [])
  }

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      showToast('Masukkan nama Anda terlebih dahulu!', 'error')
      return
    }
    
    setIsLoading(true)
    const newRoomCode = generateRoomCode()
    
    const roomData = {
      room_code: newRoomCode,
      room_name: roomName || `Room ${newRoomCode}`,
      password: isPrivate ? password : null,
      is_private: isPrivate,
      owner_name: playerName,
      max_players: 8,
      current_players: 1,
      status: 'waiting'
    }
    
    if (supabase) {
      const { data, error } = await supabase
        .from('rooms')
        .insert(roomData)
        .select()
        .single()
      
      if (!error && data) {
        await supabase.from('room_players').insert({
          room_id: data.id,
          player_name: playerName,
          is_ready: true
        })
        
        localStorage.setItem('current_room_code', newRoomCode)
        localStorage.setItem('current_room_id', data.id)
        onCreateRoom({ roomId: data.id, roomCode: newRoomCode, playerName })
        showToast(`Room ${newRoomCode} berhasil dibuat!`, 'success')
      } else {
        showToast('Gagal membuat room', 'error')
      }
    } else {
      // Local mode for testing
      const mockRoom = { id: Date.now(), room_code: newRoomCode }
      onCreateRoom({ roomId: mockRoom.id, roomCode: newRoomCode, playerName })
      showToast(`Room ${newRoomCode} berhasil dibuat (offline mode)`, 'success')
    }
    
    setIsLoading(false)
  }

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      showToast('Masukkan nama Anda terlebih dahulu!', 'error')
      return
    }
    
    if (!roomCode.trim()) {
      showToast('Masukkan kode room!', 'error')
      return
    }
    
    setIsLoading(true)
    
    if (supabase) {
      const { data: room, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single()
      
      if (error || !room) {
        showToast('Room tidak ditemukan!', 'error')
        setIsLoading(false)
        return
      }
      
      if (room.is_private && room.password !== password) {
        showToast('Password salah!', 'error')
        setIsLoading(false)
        return
      }
      
      if (room.current_players >= room.max_players) {
        showToast('Room sudah penuh!', 'error')
        setIsLoading(false)
        return
      }
      
      await supabase.from('room_players').insert({
        room_id: room.id,
        player_name: playerName,
        is_ready: true
      })
      
      await supabase
        .from('rooms')
        .update({ current_players: room.current_players + 1 })
        .eq('id', room.id)
      
      localStorage.setItem('current_room_code', room.room_code)
      localStorage.setItem('current_room_id', room.id)
      onJoinRoom({ roomId: room.id, roomCode: room.room_code, playerName })
      showToast(`Berhasil bergabung ke room ${room.room_code}!`, 'success')
    } else {
      // Local mode
      onJoinRoom({ roomId: Date.now(), roomCode: roomCode.toUpperCase(), playerName })
      showToast(`Bergabung ke room ${roomCode.toUpperCase()} (offline mode)`, 'success')
    }
    
    setIsLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>Room Turnamen</h2>
          <p style={{ color: '#a0a0a0', marginTop: '8px' }}>
            Buat room baru atau bergabung dengan room yang sudah ada
          </p>
        </div>

        {/* Player Name Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Nama Anda</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Masukkan nama Anda..."
            style={{
              width: '100%',
              padding: '14px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px'
            }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('join')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'join' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🔗 Join Room
          </button>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'create' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            ✨ Buat Room
          </button>
        </div>

        {activeTab === 'join' ? (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Kode Room</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Contoh: ABC123"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px',
                  textAlign: 'center',
                  letterSpacing: '2px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Password (jika ada)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <button
              onClick={handleJoinRoom}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Memproses...' : '🔗 Join Room'}
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Nama Room</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Contoh: Turnamen Ahad Pagi"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ color: '#a0a0a0' }}>Room Privat (dengan password)</span>
              </label>
            </div>
            
            {isPrivate && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0' }}>Password Room</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px'
                  }}
                />
              </div>
            )}
            
            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Membuat...' : '✨ Buat Room'}
            </button>
          </>
        )}

        {/* Available Rooms List */}
        {availableRooms.length > 0 && activeTab === 'join' && (
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ color: '#a0a0a0', marginBottom: '12px' }}>Room Tersedia:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {availableRooms.map(room => (
                <div
                  key={room.id}
                  onClick={() => setRoomCode(room.room_code)}
                  style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'white' }}>{room.room_name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Kode: {room.room_code}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#22c55e' }}>
                    👥 {room.current_players}/{room.max_players}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomScreen