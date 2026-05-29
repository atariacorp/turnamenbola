// src/App.jsx
import React, { useState, useEffect, createContext } from 'react'
import WelcomeScreen from './screens/WelcomeScreen'
import PlayerInputScreen from './screens/PlayerInputScreen'
import ClubInputScreen from './screens/ClubInputScreen'
import KnockoutScreen from './screens/KnockoutScreen'
import GroupStageScreen from './screens/GroupStageScreen'
import LeagueScreen from './screens/LeagueScreen'
import HallOfFameScreen from './screens/HallOfFameScreen'
import SettingsScreen from './screens/SettingsScreen'
import RoomScreen from './screens/RoomScreen'
import RoomLobby from './screens/RoomLobby'
import InstallPrompt from './components/InstallPrompt'
import OfflineNotice from './components/OfflineNotice'
import UpdateNotification from './components/UpdateNotification'
import NotificationToast from './components/NotificationToast'
import UserProfile from './components/UserProfile'
import { getTournamentHistory } from './utils/storage'

export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} })

function App() {
  // ============================================================
  // 1. SEMUA useState HARUS DI ATAS (SEBELUM APAPUN)
  // ============================================================
  const [step, setStep] = useState(0)
  const [players, setPlayers] = useState([])
  const [clubs, setClubs] = useState([])
  const [assignments, setAssignments] = useState([])
  const [format, setFormat] = useState(null)
  const [leagueType, setLeagueType] = useState(null)
  const [tournamentName, setTournamentName] = useState('')
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationType, setNotificationType] = useState('info')
  const [totalTournaments, setTotalTournaments] = useState(0)
  const [totalChampions, setTotalChampions] = useState(0)
  const [userName, setUserName] = useState(() => localStorage.getItem('app_user_name') || '')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [roomMode, setRoomMode] = useState(null)
  const [roomData, setRoomData] = useState(null)

  // ============================================================
  // 2. SEMUA useEffect HARUS DI SINI (SEBELUM FUNGSI LAIN)
  // ============================================================
  useEffect(() => {
    const history = getTournamentHistory()
    setTotalTournaments(history.length)
    const uniqueWinners = new Set(history.map(t => t.winner))
    setTotalChampions(uniqueWinners.size)
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.style.backgroundColor = theme === 'dark' ? '#1a1a2e' : '#f0f0f0'
  }, [theme])

  // ============================================================
  // 3. FUNGSI-FUNGSI (TIDAK MEMPENGARUHI JUMLAH HOOK)
  // ============================================================
  const showToast = (message, type = 'info') => {
    setNotificationMessage(message)
    setNotificationType(type)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    showToast(`Mode ${newTheme === 'dark' ? 'Gelap' : 'Terang'} diaktifkan`, 'success')
  }

  const handleClubAssignmentComplete = (assigned) => {
    setAssignments(assigned)
    setStep(3)
    showToast(`${assigned.length} pemain berhasil di-assign ke tim!`, 'success')
  }

  const handleTournamentComplete = (winner, tournamentName) => {
    showToast(`🏆 Selamat! ${winner} menjadi juara ${tournamentName}! 🏆`, 'celebration')
    setTotalTournaments(prev => prev + 1)
  }

  const handleCreateRoom = (data) => {
    setRoomData(data)
    setRoomMode('in-room')
    showToast(`Room ${data.roomCode} berhasil dibuat! Bagikan kode ini ke teman Anda`, 'success')
  }

  const handleJoinRoom = (data) => {
    setRoomData(data)
    setRoomMode('in-room')
    showToast(`Berhasil bergabung ke room ${data.roomCode}`, 'success')
  }

  const handleLeaveRoom = () => {
    setRoomMode(null)
    setRoomData(null)
    localStorage.removeItem('current_room_code')
    localStorage.removeItem('current_room_id')
    showToast('Meninggalkan room', 'info')
  }

  // ============================================================
  // 4. CONDITIONAL RETURN HANYA BOLEH SETELAH SEMUA HOOK
  // ============================================================
  
  // Jika dalam mode room
  if (roomMode === 'in-room' && roomData) {
    return (
      <RoomLobby 
        roomData={roomData} 
        onLeave={handleLeaveRoom}
        theme={theme}
        showToast={showToast}
        userName={userName}
      />
    )
  }

  // Jika memilih untuk membuat/join room
  if (roomMode === 'create' || roomMode === 'join') {
    return (
      <RoomScreen 
        theme={theme}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        showToast={showToast}
        initialMode={roomMode}
      />
    )
  }

  // ============================================================
  // 5. RENDER STEP (TIDAK MEMPENGARUHI JUMLAH HOOK)
  // ============================================================
  const renderStep = () => {
    switch(step) {
      case 0:
        return <WelcomeScreen onStart={() => setStep(1)} tournamentName={tournamentName} setTournamentName={setTournamentName} />
      case 1:
        return <PlayerInputScreen players={players} setPlayers={setPlayers} onNext={() => setStep(2)} showToast={showToast} />
      case 2:
        return <ClubInputScreen players={players} clubs={clubs} setClubs={setClubs} onNext={handleClubAssignmentComplete} showToast={showToast} />
      case 3:
        return (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '30px', color: theme === 'dark' ? '#e0e0e0' : '#333' }}>🎯 Pilih Cara Assign Tim</h2>
            <p style={{ color: '#a0a0a0', marginBottom: '30px' }}>{assignments.length} pemain siap dengan tim masing-masing</p>
            <div style={{ display: 'grid', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
              <button onClick={() => setStep(4)} style={buttonStyle('#22c55e', theme)}>✅ Sudah Sesuai, Lanjut ke Format</button>
              <button onClick={() => setStep(2)} style={buttonStyle('#f59e0b', theme)}>🔄 Ubah Assignment Tim</button>
              <button onClick={() => setStep(1)} style={buttonStyle('#ef4444', theme)}>← Kembali ke Pemain</button>
            </div>
          </div>
        )
      case 4:
        return (
          <div style={{
            padding: '48px 24px',
            background: 'linear-gradient(135deg, #0a0a1a, #0f0f2a, #1a1a3e)',
            minHeight: '600px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '40px',
                marginBottom: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <span style={{ fontSize: '11px', letterSpacing: '2px', color: '#a0a0a0' }}>STEP 4 • FORMAT</span>
              </div>
              <h2 style={{
                fontSize: '48px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ffffff, #a855f7, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '16px',
                letterSpacing: '-1px'
              }}>
                Pilih Format Turnamen
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '550px', margin: '0 auto' }}>
                Tentukan sistem pertandingan yang akan digunakan untuk turnamen Anda
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '28px',
              maxWidth: '1200px',
              margin: '0 auto',
              marginBottom: '48px'
            }}>
              {/* Knockout Card */}
              <div
                onClick={() => { setFormat('knockout'); setStep(5); showToast('🏆 Format Sistem Gugur dipilih', 'info') }}
                style={{
                  background: 'linear-gradient(135deg, rgba(30,30,50,0.95), rgba(20,20,40,0.98))',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '32px',
                  padding: '36px 28px',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #ef4444, #f97316)',
                  borderRadius: '32px 32px 0 0'
                }} />
                <div style={{
                  width: '88px',
                  height: '88px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 15px 30px -8px rgba(239,68,68,0.4)'
                }}>
                  <span style={{ fontSize: '44px' }}>🏆</span>
                </div>
                <h3 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>Sistem Gugur</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Knockout • Single Elimination</p>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '14px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px', color: '#cbd5e1' }}>
                    <span>⚡ Cepat</span><span>🎯 1x Pertemuan</span><span>🏆 Langsung Juara</span>
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#ef4444', fontSize: '15px', fontWeight: '600' }}>
                  <span>Pilih Format</span><span>→</span>
                </div>
              </div>

              {/* Group Stage Card */}
              <div
                onClick={() => { setFormat('group'); setStep(5); showToast('📊 Format Fase Grup dipilih', 'info') }}
                style={{
                  background: 'linear-gradient(135deg, rgba(30,30,50,0.95), rgba(20,20,40,0.98))',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '32px',
                  padding: '36px 28px',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                  borderRadius: '32px 32px 0 0'
                }} />
                <div style={{
                  width: '88px',
                  height: '88px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 15px 30px -8px rgba(59,130,246,0.4)'
                }}>
                  <span style={{ fontSize: '44px' }}>📊</span>
                </div>
                <h3 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>Fase Grup</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Group Stage + Knockout</p>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '14px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px', color: '#cbd5e1' }}>
                    <span>📋 Setiap Bertemu</span><span>📊 Klasemen</span><span>🏆 Lolos Knockout</span>
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#3b82f6', fontSize: '15px', fontWeight: '600' }}>
                  <span>Pilih Format</span><span>→</span>
                </div>
              </div>

              {/* League Card */}
              <div
                onClick={() => { setFormat('league'); setStep(6) }}
                style={{
                  background: 'linear-gradient(135deg, rgba(30,30,50,0.95), rgba(20,20,40,0.98))',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '32px',
                  padding: '36px 28px',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #10b981, #14b8a6)',
                  borderRadius: '32px 32px 0 0'
                }} />
                <div style={{
                  width: '88px',
                  height: '88px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 15px 30px -8px rgba(16,185,129,0.4)'
                }}>
                  <span style={{ fontSize: '44px' }}>⚽</span>
                </div>
                <h3 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>Liga Penuh</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Full League • Round Robin</p>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '14px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px', color: '#cbd5e1' }}>
                    <span>⚽ Semua Bertemu</span><span>📊 Klasemen</span><span>🏆 Poin Penuh</span>
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#10b981', fontSize: '15px', fontWeight: '600' }}>
                  <span>Pilih Format</span><span>→</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', maxWidth: '400px', margin: '0 auto', flexWrap: 'wrap' }}>
              <button onClick={() => setStep(7)} style={{ padding: '12px 24px', background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '40px', color: '#a78bfa', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>🏅 Hall of Fame</button>
              <button onClick={() => setStep(8)} style={{ padding: '12px 24px', background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '40px', color: '#fbbf24', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>⚙️ Pengaturan</button>
              <button onClick={() => setStep(2)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '40px', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>← Kembali ke Tim</button>
            </div>
          </div>
        )
      case 5:
        if (format === 'knockout') return <KnockoutScreen participants={assignments} onBack={() => setStep(4)} onComplete={handleTournamentComplete} />
        if (format === 'group') return <GroupStageScreen participants={assignments} onBack={() => setStep(4)} onComplete={(winners) => { showToast(`Lolos ke knockout: ${winners.join(', ')}`, 'success'); setStep(4) }} />
        return null
      case 6:
        return (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '30px', color: theme === 'dark' ? '#e0e0e0' : '#333' }}>Pilih Jenis Liga</h2>
            <div style={{ display: 'grid', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
              <button onClick={() => { setLeagueType('half'); setFormat('league'); setStep(5); showToast('Liga 1/2 Musim dipilih', 'info') }} style={buttonStyle('#f59e0b', theme)}>
                📋 1/2 Musim (1x Pertemuan)
                <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.8 }}>Setiap pasangan bertemu 1 kali</div>
              </button>
              <button onClick={() => { setLeagueType('full'); setFormat('league'); setStep(5); showToast('Liga Home & Away dipilih', 'info') }} style={buttonStyle('#ef4444', theme)}>
                🏠 Home & Away (2x Pertemuan)
                <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.8 }}>Setiap pasangan bertemu home dan away</div>
              </button>
              <button onClick={() => setStep(4)} style={buttonStyle('#999', theme, true)}>← Kembali</button>
            </div>
          </div>
        )
      case 7:
        return <HallOfFameScreen onBack={() => setStep(4)} theme={theme} showToast={showToast} />
      case 8:
        return <SettingsScreen theme={theme} tournamentData={null} onBack={() => setStep(4)} showToast={showToast} />
      default:
        return null
    }
  }

  useEffect(() => {
    if (format && step === 4 && format !== 'league') setStep(5)
  }, [format, step])

  const menuItems = [
    { id: 0, label: '🏠 Home', action: () => setStep(0), active: step === 0 },
    { id: 1, label: '📝 Pemain', action: () => setStep(1), active: step === 1 },
    { id: 2, label: '⚽ Tim', action: () => setStep(2), active: step === 2 },
    { id: 3, label: '🎯 Assign', action: () => setStep(3), active: step === 3 },
    { id: 4, label: '🎮 Mulai', action: () => setStep(4), active: step === 4 || step === 5 || step === 6 },
    { id: 7, label: '🏅 Hall of Fame', action: () => setStep(7), active: step === 7 },
    { id: 8, label: '⚙️ Settings', action: () => setStep(8), active: step === 8 },
    { id: 'room', label: '🎮 Room', action: () => setRoomMode('create'), active: roomMode !== null },
  ]

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, showToast, userName, tournamentName }}>
      <div style={{
        minHeight: '100vh',
        background: theme === 'dark' ? 'radial-gradient(circle at 10% 20%, rgb(0, 0, 0) 0%, rgb(20, 10, 40) 100%)' : 'radial-gradient(circle at 10% 20%, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%)',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto', backgroundColor: theme === 'dark' ? '#1e1e2e' : 'white',
          borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', minHeight: '600px'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px',
            background: theme === 'dark' ? '#0f0f1a' : '#f8f9fa', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`, flexWrap: 'wrap', gap: '10px'
          }}>
            <div style={{ gap: '8px', flexWrap: 'wrap', display: window.innerWidth < 768 ? 'none' : 'flex' }}>
              {menuItems.map(item => (
                <button key={item.id} onClick={item.action} style={{
                  padding: '6px 14px', background: item.active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                  border: item.active ? 'none' : `1px solid ${theme === 'dark' ? '#444' : '#ddd'}`,
                  borderRadius: '20px', color: item.active ? 'white' : (theme === 'dark' ? '#ccc' : '#666'),
                  cursor: 'pointer', fontSize: '12px'
                }}>{item.label}</button>
              ))}
            </div>

            <button onClick={() => setShowMobileMenu(!showMobileMenu)} style={{ display: window.innerWidth < 768 ? 'block' : 'none', padding: '6px 12px', background: theme === 'dark' ? '#333' : '#e0e0e0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>☰ Menu</button>

            {showMobileMenu && (
              <div style={{ position: 'absolute', top: '70px', left: '20px', right: '20px', background: theme === 'dark' ? '#1e1e2e' : 'white', borderRadius: '12px', padding: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => { item.action(); setShowMobileMenu(false) }} style={{ padding: '10px 16px', background: item.active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent', border: 'none', borderRadius: '8px', color: item.active ? 'white' : (theme === 'dark' ? '#ccc' : '#666'), textAlign: 'left', cursor: 'pointer' }}>{item.label}</button>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <UserProfile theme={theme} onNameChange={setUserName} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '30px' }}>
                <span>🏆 {totalTournaments}</span>
                <span>⭐ {totalChampions}</span>
              </div>
              <button onClick={toggleTheme} style={{ padding: '6px 12px', borderRadius: '30px', background: theme === 'dark' ? '#333' : '#e0e0e0', border: 'none', cursor: 'pointer' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', background: theme === 'dark' ? '#0a0a0f' : '#f0f0f0', borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#ddd'}`, fontSize: '11px' }}>
            {['Welcome', 'Pemain', 'Tim', 'Assign', 'Format', 'Turnamen'].map((label, idx) => (
              <div key={idx} style={{ flex: 1, textAlign: 'center', opacity: step >= idx ? 1 : 0.4, color: step === idx ? '#667eea' : (theme === 'dark' ? '#888' : '#999'), fontWeight: step === idx ? 'bold' : 'normal' }}>
                <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', background: step >= idx ? '#667eea' : (theme === 'dark' ? '#333' : '#ccc'), color: 'white', fontSize: '10px', lineHeight: '20px', marginRight: '6px' }}>{idx}</span>{label}
              </div>
            ))}
          </div>

          <div style={{ minHeight: '500px' }}>{renderStep()}</div>
          
          <div style={{ padding: '12px 20px', textAlign: 'center', borderTop: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`, fontSize: '11px', color: theme === 'dark' ? '#666' : '#999', background: theme === 'dark' ? '#0f0f1a' : '#f8f9fa' }}>
            <p>🏆 {tournamentName || 'Turnamen Sepak Bola'} | {totalTournaments} Turnamen Selesai | {totalChampions} Juara Berbeda</p>
          </div>
        </div>
      </div>
      
      <InstallPrompt theme={theme} />
      <OfflineNotice theme={theme} />
      <UpdateNotification theme={theme} />
      <NotificationToast show={showNotification} message={notificationMessage} type={notificationType} onClose={() => setShowNotification(false)} theme={theme} />
    </ThemeContext.Provider>
  )
}

const buttonStyle = (color, theme, isSecondary = false) => ({
  padding: '14px 20px', backgroundColor: isSecondary ? (theme === 'dark' ? '#555' : '#999') : color,
  color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold',
  cursor: 'pointer', transition: 'all 0.2s ease',
  boxShadow: theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.15)',
})

export default App