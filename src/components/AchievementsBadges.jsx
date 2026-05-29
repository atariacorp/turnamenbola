// src/components/AchievementsBadges.jsx
import React from 'react'

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

function AchievementsBadges({ playerName, unlockedAchievements = [], onShowAll = false }) {
  const unlockedIds = unlockedAchievements.map(a => a.id)
  
  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ fontSize: '13px', marginBottom: '8px', color: '#888' }}>
        🎖️ Pencapaian
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {ACHIEVEMENTS_LIST.map(achievement => {
          const isUnlocked = unlockedIds.includes(achievement.id)
          return (
            <div
              key={achievement.id}
              title={achievement.description}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: isUnlocked ? achievement.color : (onShowAll ? '#333' : 'transparent'),
                color: isUnlocked ? 'white' : '#888',
                borderRadius: '20px',
                fontSize: '12px',
                opacity: isUnlocked ? 1 : (onShowAll ? 0.5 : 0),
                transition: 'all 0.2s'
              }}
            >
              <span>{achievement.icon}</span>
              {onShowAll && <span>{achievement.name}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AchievementsBadges