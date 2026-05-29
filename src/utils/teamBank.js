// src/utils/teamBank.js
const DEFAULT_TEAMS = {
  clubs: [
    'Manchester City', 'Liverpool', 'Arsenal', 'Manchester United', 'Chelsea',
    'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Athletic Club',
    'Inter Milan', 'AC Milan', 'Juventus', 'Napoli', 'AS Roma',
    'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen',
    'PSG', 'AS Monaco', 'Lyon', 'Marseille',
    'Ajax', 'Feyenoord', 'PSV Eindhoven',
    'Benfica', 'Porto', 'Sporting CP'
  ],
  countries: [
    'Indonesia', 'Argentina', 'Brasil', 'Jerman', 'Spanyol', 'Prancis',
    'Inggris', 'Italia', 'Belanda', 'Portugal', 'Belgia', 'Kroasia',
    'Uruguay', 'Kolombia', 'Chile', 'Meksiko', 'Amerika Serikat',
    'Jepang', 'Korea Selatan', 'Australia', 'Nigeria', 'Mesir', 'Maroko'
  ]
}

export const getTeamBank = () => {
  const saved = localStorage.getItem('custom_team_bank')
  if (saved) {
    return JSON.parse(saved)
  }
  return DEFAULT_TEAMS
}

export const addCustomTeam = (team, type = 'club') => {
  const bank = getTeamBank()
  if (!bank[type === 'club' ? 'clubs' : 'countries'].includes(team)) {
    bank[type === 'club' ? 'clubs' : 'countries'].push(team)
    localStorage.setItem('custom_team_bank', JSON.stringify(bank))
  }
  return bank
}

export const removeCustomTeam = (team, type = 'club') => {
  const bank = getTeamBank()
  const array = type === 'club' ? 'clubs' : 'countries'
  bank[array] = bank[array].filter(t => t !== team)
  localStorage.setItem('custom_team_bank', JSON.stringify(bank))
  return bank
}

export const resetTeamBank = () => {
  localStorage.setItem('custom_team_bank', JSON.stringify(DEFAULT_TEAMS))
  return DEFAULT_TEAMS
}

export const searchTeams = (query) => {
  const bank = getTeamBank()
  const allTeams = [...bank.clubs, ...bank.countries]
  return allTeams.filter(team => 
    team.toLowerCase().includes(query.toLowerCase())
  )
}