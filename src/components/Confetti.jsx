import React, { useEffect } from 'react'

function Confetti({ active, onComplete }) {
  useEffect(() => {
    if (!active) return
    
    const loadConfetti = async () => {
      const canvasConfetti = (await import('canvas-confetti')).default
      
      canvasConfetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#667eea', '#764ba2', '#f59e0b', '#22c55e', '#ef4444']
      })
      
      setTimeout(() => {
        canvasConfetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.7 },
          startVelocity: 25
        })
      }, 200)
      
      setTimeout(() => {
        canvasConfetti({
          particleCount: 200,
          spread: 50,
          origin: { y: 0.5 },
          startVelocity: 30,
          decay: 0.9
        })
      }, 500)
      
      setTimeout(onComplete, 2000)
    }
    
    loadConfetti()
  }, [active, onComplete])
  
  return null
}

export default Confetti