// src/components/NotificationToast.jsx
import React, { useEffect } from 'react'

function NotificationToast({ show, message, type, onClose, theme }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  const getIcon = () => {
    switch(type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'celebration': return '🏆'
      default: return 'ℹ️'
    }
  }

  const getBackground = () => {
    switch(type) {
      case 'success': return 'linear-gradient(135deg, #22c55e, #16a34a)'
      case 'error': return 'linear-gradient(135deg, #ef4444, #dc2626)'
      case 'warning': return 'linear-gradient(135deg, #f59e0b, #d97706)'
      case 'celebration': return 'linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6)'
      default: return 'linear-gradient(135deg, #667eea, #764ba2)'
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      zIndex: 9999,
      animation: 'slideInRight 0.3s ease-out'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 20px',
        background: getBackground(),
        borderRadius: '12px',
        color: 'white',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        maxWidth: '350px',
        cursor: 'pointer'
      }} onClick={onClose}>
        <span style={{ fontSize: '20px' }}>{getIcon()}</span>
        <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: '12px'
          }}
        >
          ✕
        </button>
      </div>
      
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  )
}

export default NotificationToast