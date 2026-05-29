// src/utils/playerStorage.js

const STORAGE_KEYS = {
  PLAYERS: 'tournament_players_db',
  PLAYER_STATS: 'player_stats',
  PLAYER_TROPHIES: 'player_trophies',
  CURRENT_PLAYERS: 'current_players'
}

// Default player database
export const DEFAULT_PLAYERS = [
  'Lionel Messi', 'Cristiano Ronaldo', 'Neymar Jr', 'Kylian Mbappe', 
  'Erling Haaland', 'Kevin De Bruyne', 'Mohamed Salah', 'Karim Benzema',
  'Robert Lewandowski', 'Luka Modric', 'Sergio Ramos', 'Virgil van Dijk',
  'Thibaut Courtois', 'Manuel Neuer', 'Harry Kane', 'Vinicious Jr',
  'Jude Bellingham', 'Pedri', 'Gavi', 'Phil Foden',
  'Bukayo Saka', 'Jamal Musiala', 'Rafael Leao', 'Victor Osimhen',
  'Aldan', 'Asthar', 'Reo', 'Andy', 'Dany', 'Dedy', 'Rircard', 'Reza'
]

// Save current players (selected in the current session)
export const saveCurrentPlayers = (players) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PLAYERS, JSON.stringify(players))
    console.log('✅ Current players saved:', players.length)
    return true
  } catch (error) {
    console.error('Failed to save current players:', error)
    return false
  }
}

// Load current players from previous session
export const loadCurrentPlayers = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_PLAYERS)
    if (saved) {
      const players = JSON.parse(saved)
      console.log('✅ Current players loaded:', players.length)
      return players
    }
  } catch (error) {
    console.error('Failed to load current players:', error)
  }
  return []
}

// Get all players from database
export const getAllPlayers = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAYERS)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load players:', error)
  }
  return []
}

// Add new player
export const addPlayer = (playerName) => {
  const players = getAllPlayers()
  if (!players.find(p => p.name === playerName)) {
    const newPlayer = {
      id: Date.now(),
      name: playerName,
      trophies: 0,
      tournamentsWon: [],
      totalGoals: 0,
      totalAssists: 0,
      motmAwards: 0,
      firstPlayed: new Date().toISOString(),
      lastPlayed: new Date().toISOString()
    }
    players.push(newPlayer)
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players))
    console.log('✅ Player added to database:', playerName)
    return newPlayer
  }
  return null
}

// Update player trophy
export const addPlayerTrophy = (playerName, tournamentName) => {
  const players = getAllPlayers()
  const player = players.find(p => p.name === playerName)
  if (player) {
    player.trophies++
    player.tournamentsWon.push({
      name: tournamentName,
      date: new Date().toISOString()
    })
    player.lastPlayed = new Date().toISOString()
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players))
    console.log('✅ Trophy added to:', playerName, 'Total:', player.trophies)
  }
  return player
}

// Update player stats
export const updatePlayerStats = (playerName, stats) => {
  const players = getAllPlayers()
  const player = players.find(p => p.name === playerName)
  if (player) {
    Object.assign(player, stats)
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players))
  }
}

// Delete player
export const deletePlayer = (playerName) => {
  let players = getAllPlayers()
  players = players.filter(p => p.name !== playerName)
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players))
  console.log('✅ Player deleted:', playerName)
}

// Reset all players
export const resetAllPlayers = () => {
  localStorage.removeItem(STORAGE_KEYS.PLAYERS)
  localStorage.removeItem(STORAGE_KEYS.PLAYER_STATS)
  localStorage.removeItem(STORAGE_KEYS.PLAYER_TROPHIES)
  console.log('✅ All player data reset')
}

// Get player trophies count
export const getPlayerTrophies = (playerName) => {
  const players = getAllPlayers()
  const player = players.find(p => p.name === playerName)
  return player ? player.trophies : 0
}

// Get star rating based on trophies
export const getPlayerStarRating = (trophies) => {
  if (trophies === 0) return '⭐'
  if (trophies === 1) return '⭐'
  if (trophies === 2) return '⭐⭐'
  if (trophies === 3) return '⭐⭐⭐'
  if (trophies === 4) return '⭐⭐⭐⭐'
  if (trophies >= 5) return '⭐⭐⭐⭐⭐'
  return '⭐'
}

// Clear current players (when tournament is finished or reset)
export const clearCurrentPlayers = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_PLAYERS)
  console.log('✅ Current players cleared')
}

// Get current app user name
export const getAppUserName = () => {
  return localStorage.getItem('app_user_name') || 'Guest'
}

// Set app user name
export const setAppUserName = (name) => {
  localStorage.setItem('app_user_name', name)
  return name
}

// Clear app user name
export const clearAppUserName = () => {
  localStorage.removeItem('app_user_name')
}