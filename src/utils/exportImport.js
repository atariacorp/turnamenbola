// src/utils/exportImport.js
export const exportTournamentData = (tournamentData) => {
  const dataStr = JSON.stringify(tournamentData, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `turnamen_${tournamentData.name || 'export'}_${new Date().toISOString().slice(0,19)}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

export const importTournamentData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (error) {
        reject('Invalid JSON file')
      }
    }
    reader.onerror = () => reject('Error reading file')
    reader.readAsText(file)
  })
}

export const exportToCSV = (data, filename) => {
  const headers = Object.keys(data[0] || {}).join(',')
  const rows = data.map(row => Object.values(row).join(',')).join('\n')
  const csv = `${headers}\n${rows}`
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export const shareToSocialMedia = (platform, tournamentData) => {
  const text = `🏆 ${tournamentData.name}\nJuara: ${tournamentData.winner}\nSkor: ${tournamentData.finalScore || '-'}\n\nBuat turnamenmu di Aplikasi Turnamen Bola!`
  const url = window.location.href
  
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
  }
  
  window.open(shareUrls[platform], '_blank', 'width=600,height=400')
}