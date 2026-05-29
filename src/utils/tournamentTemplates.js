// src/utils/tournamentTemplates.js
const DEFAULT_TEMPLATES = [
  {
    id: 'world_cup',
    name: '🏆 Piala Dunia',
    description: '32 tim, fase grup + knockout',
    format: 'group',
    numGroups: 8,
    playersPerGroup: 4,
    icon: '🌍'
  },
  {
    id: 'champions_league',
    name: '⭐ Liga Champions',
    description: 'Knockout dengan home & away',
    format: 'home_away',
    rounds: 'knockout',
    icon: '⭐'
  },
  {
    id: 'premier_league',
    name: '⚽ Premier League',
    description: 'Liga penuh home & away',
    format: 'league',
    leagueType: 'full',
    icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
  },
  {
    id: 'fast_cup',
    name: '🚀 Fast Cup',
    description: 'Sistem gugur cepat',
    format: 'knockout',
    maxPlayers: 8,
    icon: '⚡'
  },
  {
    id: 'euro_cup',
    name: '🏅 Piala Eropa',
    description: '24 tim, 6 grup',
    format: 'group',
    numGroups: 6,
    playersPerGroup: 4,
    icon: '🇪🇺'
  }
]

export const getTemplates = () => {
  const saved = localStorage.getItem('tournament_templates')
  if (saved) {
    return JSON.parse(saved)
  }
  return DEFAULT_TEMPLATES
}

export const saveTemplate = (template) => {
  const templates = getTemplates()
  const newTemplate = { ...template, id: Date.now().toString() }
  templates.push(newTemplate)
  localStorage.setItem('tournament_templates', JSON.stringify(templates))
  return newTemplate
}

export const deleteTemplate = (templateId) => {
  const templates = getTemplates()
  const newTemplates = templates.filter(t => t.id !== templateId)
  localStorage.setItem('tournament_templates', JSON.stringify(newTemplates))
  return newTemplates
}

export const applyTemplate = (template, currentSettings) => {
  return { ...currentSettings, ...template }
}