// src/screens/SettingsScreen.jsx
import React, { useState } from 'react'
import RuleEditor from '../components/RuleEditor'
import AutoBackup from '../components/AutoBackup'
import { getTeamBank, addCustomTeam, removeCustomTeam, resetTeamBank } from '../utils/teamBank'
import { getTemplates, saveTemplate, deleteTemplate } from '../utils/tournamentTemplates'
import { exportTournamentData, importTournamentData, exportToCSV } from '../utils/exportImport'

function SettingsScreen({ theme, tournamentData, onBack }) {
  const [teamBank, setTeamBank] = useState(getTeamBank())
  const [templates, setTemplates] = useState(getTemplates())
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamType, setNewTeamType] = useState('club')
  const [newTemplateName, setNewTemplateName] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [activeTab, setActiveTab] = useState('rules')

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      const updated = addCustomTeam(newTeamName, newTeamType)
      setTeamBank(updated)
      setNewTeamName('')
    }
  }

  const handleRemoveTeam = (team, type) => {
    const updated = removeCustomTeam(team, type)
    setTeamBank(updated)
  }

  const handleResetTeamBank = () => {
    if (window.confirm('Reset bank tim ke default?')) {
      const updated = resetTeamBank()
      setTeamBank(updated)
    }
  }

  const handleSaveTemplate = () => {
    if (newTemplateName.trim()) {
      const newTemplate = {
        name: newTemplateName,
        description: 'Custom template',
        format: 'knockout',
        icon: '📋'
      }
      const saved = saveTemplate(newTemplate)
      setTemplates([...templates, saved])
      setNewTemplateName('')
    }
  }

  const handleDeleteTemplate = (id) => {
    const updated = deleteTemplate(id)
    setTemplates(updated)
  }

  const handleExportData = () => {
    const allData = {
      tournament: tournamentData,
      teamBank: teamBank,
      templates: templates,
      exportDate: new Date().toISOString()
    }
    exportTournamentData(allData)
  }

  const handleImportData = async () => {
    if (importFile) {
      try {
        const data = await importTournamentData(importFile)
        alert('Import berhasil! Halaman akan direfresh.')
        window.location.reload()
      } catch (error) {
        alert('Gagal import: ' + error)
      }
    }
  }

  const handleExportStandingsCSV = () => {
    if (tournamentData?.standings) {
      const standingsArray = Object.entries(tournamentData.standings).map(([name, stats]) => ({
        Pemain: name,
        Main: stats.played,
        Menang: stats.wins,
        Seri: stats.draws,
        Kalah: stats.losses,
        GolMasuk: stats.gf,
        GolKemasukan: stats.ga,
        SelisihGol: stats.gd,
        Poin: stats.points
      }))
      exportToCSV(standingsArray, 'klasemen_turnamen')
    }
  }

  const tabs = [
    { id: 'rules', label: '⚙️ Aturan', icon: '⚙️' },
    { id: 'teams', label: '⚽ Bank Tim', icon: '⚽' },
    { id: 'templates', label: '📋 Template', icon: '📋' },
    { id: 'backup', label: '💾 Backup', icon: '💾' },
    { id: 'export', label: '📤 Export/Import', icon: '📤' }
  ]

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>⚙️ Pengaturan Turnamen</h2>
        <button onClick={onBack} style={buttonStyle('#999', theme)}>← Kembali</button>
      </div>
      
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '5px',
        marginBottom: '20px',
        overflowX: 'auto',
        paddingBottom: '5px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === tab.id ? '#667eea' : (theme === 'dark' ? '#2a2a3e' : '#f0f0f0'),
              color: activeTab === tab.id ? 'white' : (theme === 'dark' ? '#e0e0e0' : '#333'),
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      {activeTab === 'rules' && (
        <RuleEditor theme={theme} onSave={(rules) => console.log('Rules saved:', rules)} />
      )}
      
      {activeTab === 'teams' && (
        <div style={{
          padding: '20px',
          backgroundColor: theme === 'dark' ? '#1e1e2e' : '#f9f9f9',
          borderRadius: '12px'
        }}>
          <h3>⚽ Manajemen Bank Tim</h3>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Nama tim baru..."
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
                backgroundColor: theme === 'dark' ? '#333' : 'white'
              }}
            />
            <select
              value={newTeamType}
              onChange={(e) => setNewTeamType(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: theme === 'dark' ? '#333' : 'white'
              }}
            >
              <option value="club">Klub</option>
              <option value="country">Negara</option>
            </select>
            <button onClick={handleAddTeam} style={buttonStyle('#22c55e', theme)}>+ Tambah</button>
            <button onClick={handleResetTeamBank} style={buttonStyle('#f59e0b', theme)}>🔄 Reset Default</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {teamBank.clubs.map(team => (
              <div key={team} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: theme === 'dark' ? '#2a2a3e' : 'white',
                borderRadius: '6px'
              }}>
                <span>⚽ {team}</span>
                <button onClick={() => handleRemoveTeam(team, 'club')} style={smallButtonStyle('#ef4444')}>✖</button>
              </div>
            ))}
            {teamBank.countries.map(team => (
              <div key={team} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: theme === 'dark' ? '#2a2a3e' : 'white',
                borderRadius: '6px'
              }}>
                <span>🌍 {team}</span>
                <button onClick={() => handleRemoveTeam(team, 'country')} style={smallButtonStyle('#ef4444')}>✖</button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'templates' && (
        <div style={{
          padding: '20px',
          backgroundColor: theme === 'dark' ? '#1e1e2e' : '#f9f9f9',
          borderRadius: '12px'
        }}>
          <h3>📋 Template Turnamen</h3>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Nama template..."
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${theme === 'dark' ? '#555' : '#ccc'}`,
                backgroundColor: theme === 'dark' ? '#333' : 'white'
              }}
            />
            <button onClick={handleSaveTemplate} style={buttonStyle('#22c55e', theme)}>💾 Simpan Template</button>
          </div>
          
          <div style={{ display: 'grid', gap: '10px' }}>
            {templates.map(template => (
              <div key={template.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                backgroundColor: theme === 'dark' ? '#2a2a3e' : 'white',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{template.icon} {template.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{template.description}</div>
                </div>
                <button onClick={() => handleDeleteTemplate(template.id)} style={smallButtonStyle('#ef4444')}>Hapus</button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'backup' && (
        <AutoBackup theme={theme} onBackup={() => alert('Backup berhasil!')} onRestore={() => {}} />
      )}
      
      {activeTab === 'export' && (
        <div style={{
          padding: '20px',
          backgroundColor: theme === 'dark' ? '#1e1e2e' : '#f9f9f9',
          borderRadius: '12px'
        }}>
          <h3>📤 Export / Import Data</h3>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <h4>Export Data</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={handleExportData} style={buttonStyle('#3b82f6', theme)}>📄 Export JSON (Lengkap)</button>
                <button onClick={handleExportStandingsCSV} style={buttonStyle('#10b981', theme)}>📊 Export Klasemen CSV</button>
              </div>
            </div>
            
            <div>
              <h4>Import Data</h4>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files[0])}
                style={{ marginBottom: '10px' }}
              />
              <button onClick={handleImportData} style={buttonStyle('#f59e0b', theme)}>📥 Import JSON</button>
            </div>
          </div>
        </div>
      )}
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

const smallButtonStyle = (color) => ({
  padding: '4px 8px',
  backgroundColor: color,
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '11px'
})

export default SettingsScreen