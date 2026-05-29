// src/utils/sounds.js

// Audio context untuk suara
let audioContext = null

// Inisialisasi audio context (harus setelah user interaction)
export const initAudio = () => {
  if (!audioContext && window.AudioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

// Play spin sound effect
export const playSpinSound = () => {
  try {
    initAudio()
    if (!audioContext) return
    
    // Resume context jika suspended (karena autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    
    const now = audioContext.currentTime
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800
    gainNode.gain.value = 0.3
    
    oscillator.start()
    
    // Frequency sweep down
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.5)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
    
    oscillator.stop(now + 0.5)
  } catch (error) {
    console.log('Audio not supported:', error)
  }
}

// Play stop/result sound effect
export const playStopSound = () => {
  try {
    initAudio()
    if (!audioContext) return
    
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    
    const now = audioContext.currentTime
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 400
    gainNode.gain.value = 0.4
    
    oscillator.start()
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
    oscillator.stop(now + 0.3)
  } catch (error) {
    console.log('Audio not supported:', error)
  }
}

// Play victory sound
export const playVictorySound = () => {
  try {
    initAudio()
    if (!audioContext) return
    
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    
    const now = audioContext.currentTime
    
    // Play a happy little melody
    const frequencies = [523.25, 587.33, 659.25, 523.25, 587.33, 659.25, 783.99]
    frequencies.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = freq
      gainNode.gain.value = 0.2
      
      oscillator.start(now + i * 0.15)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.2)
      oscillator.stop(now + i * 0.15 + 0.2)
    })
  } catch (error) {
    console.log('Audio not supported:', error)
  }
}

// Play click sound
export const playClickSound = () => {
  try {
    initAudio()
    if (!audioContext) return
    
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    
    const now = audioContext.currentTime
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 600
    gainNode.gain.value = 0.15
    
    oscillator.start()
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
    oscillator.stop(now + 0.1)
  } catch (error) {
    console.log('Audio not supported:', error)
  }
}