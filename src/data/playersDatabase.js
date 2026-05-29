// src/data/playersDatabase.js

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

// Player star system
export const PLAYER_STARS = {
  0: '⭐',
  1: '⭐',
  2: '⭐⭐',
  3: '⭐⭐⭐',
  4: '⭐⭐⭐⭐',
  5: '⭐⭐⭐⭐⭐',
  6: '⭐⭐⭐⭐⭐⭐',
  7: '⭐⭐⭐⭐⭐⭐⭐',
  8: '⭐⭐⭐⭐⭐⭐⭐⭐',
  9: '⭐⭐⭐⭐⭐⭐⭐⭐⭐',
  10: '⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐'
}

// Get player stars based on trophy count
export const getPlayerStars = (trophyCount) => {
  if (trophyCount === 0) return '⭐'
  if (trophyCount <= 2) return '⭐'.repeat(trophyCount)
  if (trophyCount <= 5) return '⭐⭐'.repeat(Math.min(5, trophyCount))
  return '⭐⭐⭐⭐⭐'
}

// Player profile interface
export class PlayerProfile {
  constructor(name) {
    this.name = name
    this.trophies = 0
    TournamentsWon: []
    totalGoals = 0
    totalAssists = 0
    motmAwards = 0
    firstPlayed = new Date().toISOString()
    lastPlayed = new Date().toISOString()
  }
}