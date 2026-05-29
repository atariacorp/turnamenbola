// src/components/AutoBackup.jsx
import React, { useState, useEffect } from 'react'

function AutoBackup({ onBackup, onRestore, theme }) {
  const [backups, setBackups] = useState([])
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)

  useEffect(() => {
    loadBackups()
    
    // Auto backup setiap 5 menit
    const interval = setInterval(() => {
      if (autoBackupEnabled) {
        performBackup('auto')
      }
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [autoBackupEnabled])

  const loadBackups = () => {
    const saved = localStorage.getItem('tournament_backups')
    if (saved) {
      setBackups(JSON.parse(saved))
    }
  }

  const performBackup = (type = 'manual') => {
    const tournamentData = {
      standings: localStorage.getItem('tournament_standings'),
      matches: localStorage.getItem('tournament_matches'),
      players: localStorage.getItem('tournament_players'),
      clubs: localStorage.getItem('tournament_clubs'),
      timestamp: new Date().toISOString(),
      type: type
    }
    
    const newBackups = [tournamentData, ...backups].slice(0, 10)
    setBackups(newBackups)
    localStorage.setItem('tournament_backups', JSON.stringify(newBackups))
    
    if (type === 'manual' && onBackup) {
      onBackup()
    }
  }

  const restoreBackup = (backup) => {
    if (window.confirm('Restore backup akan mengganti data saat ini. Lanjutkan?')) {
      if (backup.standings) localStorage.setItem('tournament_standings', backup.standings)
      if (backup.matches) localStorage.setItem('tournament_matches', backup.matches)
      if (backup.players) localStorage.setItem('tournament_players', backup.players)
      if (backup.clubs) localStorage.setItem('tournament_clubs', backup.clubs)
      
      if (onRestore) onRestore()
      alert('Backup berhasil direstore!')
      window.location.reload()
    }
  }

  const deleteBackup = (index) => {
    const newBackups = backups.filter((_, i) => i !== index)
    setBackups(newBackups)
    localStorage.setItem('tournament_backups', JSON.stringify(newBackups))
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: theme === 'dark' ? '#1e1e2e' : '#f9f9f9',
      borderRadius: '12px',
      marginBottom: '20px'
    }}>
      <h3>💾 Auto-Backup & Restore</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoBackupEnabled}
            onChange={(e) => setAutoBackupEnabled(e.target.checked)}
          />
          <span>Aktifkan Auto-Backup (setiap 5 menit)</span>
        </label>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => performBackup('manual')} style={buttonStyle('#22c55e', theme)}>💾 Backup Sekarang</button>
      </div>
      
      {backups.length > 0 && (
        <div>
          <h4>Riwayat Backup</h4>
          {backups.map((backup, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px',
              backgroundColor: theme === 'dark' ? '#2a2a3e' : 'white',
              borderRadius: '8px',
              marginBottom: '8px'
            }}>
              <div>
                <div>{new Date(backup.timestamp).toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {backup.type === 'auto' ? '🤖 Auto' : '👤 Manual'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => restoreBackup(backup)} style={buttonStyle('#3b82f6', theme, true)}>Restore</button>
                <button onClick={() => deleteBackup(idx)} style={buttonStyle('#ef4444', theme, true)}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const buttonStyle = (color, theme, small = false) => ({
  padding: small ? '4px 12px' : '8px 16px',
  backgroundColor: color,
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: small ? '12px' : '14px'
})

export default AutoBackup