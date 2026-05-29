// src/components/RuleEditor.jsx
import React, { useState, useEffect } from 'react'

const DEFAULT_RULES = {
  winPoints: 3,
  drawPoints: 1,
  lossPoints: 0,
  goalBonus: false,
  goalBonusThreshold: 3,
  cardPenalty: false,
  yellowCardPenalty: -1,
  redCardPenalty: -3,
  extraTimeEnabled: true,
  penaltyShootout: true,
  maxSubstitutions: 3,
  matchDuration: 90
}

function RuleEditor({ onSave, theme, initialRules }) {
  const [rules, setRules] = useState(initialRules || DEFAULT_RULES)

  const handleSave = () => {
    localStorage.setItem('tournament_rules', JSON.stringify(rules))
    if (onSave) onSave(rules)
    alert('Aturan berhasil disimpan!')
  }

  const handleReset = () => {
    setRules(DEFAULT_RULES)
    localStorage.setItem('tournament_rules', JSON.stringify(DEFAULT_RULES))
    if (onSave) onSave(DEFAULT_RULES)
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: theme === 'dark' ? '#1e1e2e' : '#f9f9f9',
      borderRadius: '12px',
      marginBottom: '20px'
    }}>
      <h3>⚙️ Pengaturan Aturan Turnamen</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Poin Menang</label>
          <input
            type="number"
            value={rules.winPoints}
            onChange={(e) => setRules({ ...rules, winPoints: parseInt(e.target.value) })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`, backgroundColor: theme === 'dark' ? '#333' : 'white', color: theme === 'dark' ? 'white' : '#333' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Poin Seri</label>
          <input
            type="number"
            value={rules.drawPoints}
            onChange={(e) => setRules({ ...rules, drawPoints: parseInt(e.target.value) })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`, backgroundColor: theme === 'dark' ? '#333' : 'white', color: theme === 'dark' ? 'white' : '#333' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Durasi Match (menit)</label>
          <input
            type="number"
            value={rules.matchDuration}
            onChange={(e) => setRules({ ...rules, matchDuration: parseInt(e.target.value) })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`, backgroundColor: theme === 'dark' ? '#333' : 'white', color: theme === 'dark' ? 'white' : '#333' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Max Substitusi</label>
          <input
            type="number"
            value={rules.maxSubstitutions}
            onChange={(e) => setRules({ ...rules, maxSubstitutions: parseInt(e.target.value) })}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`, backgroundColor: theme === 'dark' ? '#333' : 'white', color: theme === 'dark' ? 'white' : '#333' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rules.extraTimeEnabled}
              onChange={(e) => setRules({ ...rules, extraTimeEnabled: e.target.checked })}
            />
            <span>Perpanjangan Waktu</span>
          </label>
        </div>
        
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rules.penaltyShootout}
              onChange={(e) => setRules({ ...rules, penaltyShootout: e.target.checked })}
            />
            <span>Adu Penalti</span>
          </label>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={handleSave} style={buttonStyle('#22c55e', theme)}>💾 Simpan Aturan</button>
        <button onClick={handleReset} style={buttonStyle('#f59e0b', theme)}>🔄 Reset ke Default</button>
      </div>
    </div>
  )
}

const buttonStyle = (color, theme) => ({
  padding: '10px 20px',
  backgroundColor: color,
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
})

export default RuleEditor