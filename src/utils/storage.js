// src/utils/storage.js
import { supabase } from '../lib/supabase'

// Local Storage keys
const STORAGE_KEYS = {
  TOURNAMENT_HISTORY: 'tournament_history',
  PLAYER_PROFILES: 'player_profiles',
  ACHIEVEMENTS: 'achievements',
  CURRENT_TOURNAMENT: 'current_tournament'
}

// Save tournament to history
export const saveTournamentHistory = async (tournamentData) => {
  try {
    // Save to localStorage
    const history = getTournamentHistory()
    const newHistory = [{
      id: Date.now(),
      ...tournamentData,
      date: new Date().toISOString()
    }, ...history].slice(0, 20) // Keep last 20 tournaments
    
    localStorage.setItem(STORAGE_KEYS.TOURNAMENT_HISTORY, JSON.stringify(newHistory))
    
    // Also save to Supabase if user is logged in (multi-device sync)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('tournament_history').insert({
        user_id: user.id,
        tournament_name: tournamentData.name,
        winner: tournamentData.winner,
        format: tournamentData.format,
        participants: tournamentData.participants,
        date: new Date().toISOString()
      })
    }
    
    return newHistory
  } catch (error) {
    console.error('Failed to save tournament history:', error)
    return []
  }
}

// Get tournament history
export const getTournamentHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.TOURNAMENT_HISTORY)
    return history ? JSON.parse(history) : []
  } catch {
    return []
  }
}

// Load tournament from history
export const loadTournamentFromHistory = (tournamentId) => {
  const history = getTournamentHistory()
  return history.find(t => t.id === tournamentId)
}

// Delete tournament from history
export const deleteTournamentHistory = (tournamentId) => {
  const history = getTournamentHistory()
  const newHistory = history.filter(t => t.id !== tournamentId)
  localStorage.setItem(STORAGE_KEYS.TOURNAMENT_HISTORY, JSON.stringify(newHistory))
  return newHistory
}

// Clear all history
export const clearAllHistory = () => {
  localStorage.removeItem(STORAGE_KEYS.TOURNAMENT_HISTORY)
}

// Save player profile
export const savePlayerProfile = (playerName, profileData) => {
  const profiles = getPlayerProfiles()
  profiles[playerName] = { ...profiles[playerName], ...profileData, lastUpdated: new Date().toISOString() }
  localStorage.setItem(STORAGE_KEYS.PLAYER_PROFILES, JSON.stringify(profiles))
  return profiles
}

// Get player profiles
export const getPlayerProfiles = () => {
  try {
    const profiles = localStorage.getItem(STORAGE_KEYS.PLAYER_PROFILES)
    return profiles ? JSON.parse(profiles) : {}
  } catch {
    return {}
  }
}

// Save achievement
export const unlockAchievement = (playerName, achievement) => {
  const achievements = getAchievements()
  if (!achievements[playerName]) achievements[playerName] = []
  
  if (!achievements[playerName].find(a => a.id === achievement.id)) {
    achievements[playerName].push({ ...achievement, unlockedAt: new Date().toISOString() })
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements))
    return true
  }
  return false
}

// Get achievements
export const getAchievements = () => {
  try {
    const achievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)
    return achievements ? JSON.parse(achievements) : {}
  } catch {
    return {}
  }
}

// Get player stats across tournaments
export const getPlayerCareerStats = (playerName) => {
  const history = getTournamentHistory()
  const stats = {
    tournaments: 0,
    wins: 0,
    runnerUp: 0,
    totalGoals: 0,
    totalMatches: 0,
    achievements: []
  }
  
  history.forEach(tournament => {
    if (tournament.winner === playerName) stats.wins++
    if (tournament.runnerUp === playerName) stats.runnerUp++
    stats.tournaments++
    stats.totalGoals += tournament.playerGoals?.[playerName] || 0
    stats.totalMatches += tournament.playerMatches?.[playerName] || 0
  })
  
  const achievements = getAchievements()
  stats.achievements = achievements[playerName] || []
  
  return stats
}