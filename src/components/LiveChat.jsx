// src/components/LiveChat.jsx
import React, { useState, useEffect, useRef, useContext } from 'react'
import { supabase } from '../lib/supabase'
import { ThemeContext } from '../App'

function LiveChat({ matchId, currentMatch }) {
  const { theme, userName: appUserName } = useContext(ThemeContext)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)
  
  // Get user name from localStorage or context
  const playerName = appUserName || localStorage.getItem('app_user_name') || 'Anonymous'

  // Load messages and setup realtime subscription
  useEffect(() => {
    if (!matchId) return

    loadMessages()

    if (supabase) {
      const channel = supabase.channel(`chat-${matchId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: playerName }
        }
      })

      channel.on('broadcast', { event: 'message' }, (payload) => {
        setMessages(prev => [...prev, payload.payload])
      })

      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const count = Object.keys(state).length
        setOnlineCount(count)
      })

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          await channel.track({ user: playerName, online_at: new Date().toISOString() })
        }
      })

      channelRef.current = channel

      return () => {
        if (channelRef.current) {
          channelRef.current.unsubscribe()
        }
      }
    } else {
      loadLocalMessages()
      setIsConnected(false)
    }
  }, [matchId])

  const loadMessages = async () => {
    if (!supabase) return loadLocalMessages()

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (!error && data) {
        const formattedMessages = data.map(msg => ({
          id: msg.id,
          user: msg.user_name,
          message: msg.message,
          time: new Date(msg.created_at).toLocaleTimeString(),
          isCommentary: msg.is_commentary,
          isOwn: msg.user_name === playerName
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.log('Error loading messages:', error)
      loadLocalMessages()
    }
  }

  const loadLocalMessages = () => {
    const saved = localStorage.getItem(`chat_${matchId}`)
    if (saved) {
      setMessages(JSON.parse(saved))
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      user: playerName,
      message: newMessage,
      time: new Date().toLocaleTimeString(),
      isOwn: true,
      isCommentary: false
    }

    setMessages(prev => [...prev, message])

    if (supabase && channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'message',
        payload: message
      })

      await supabase.from('chat_messages').insert({
        match_id: matchId,
        user_name: playerName,
        message: newMessage,
        is_commentary: false
      })
    }

    const allMessages = [...messages, message]
    localStorage.setItem(`chat_${matchId}`, JSON.stringify(allMessages))

    setNewMessage('')
  }

  const addCommentary = async (text) => {
    const commentary = {
      id: Date.now(),
      user: '🎙️ Commentary',
      message: text,
      time: new Date().toLocaleTimeString(),
      isCommentary: true,
      isOwn: false
    }

    setMessages(prev => [...prev, commentary])

    if (supabase && channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'message',
        payload: commentary
      })

      await supabase.from('chat_messages').insert({
        match_id: matchId,
        user_name: 'Commentary',
        message: text,
        is_commentary: true
      })
    }

    localStorage.setItem(`chat_${matchId}`, JSON.stringify([...messages, commentary]))
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const clearChat = () => {
    if (window.confirm('Hapus semua pesan chat?')) {
      setMessages([])
      localStorage.removeItem(`chat_${matchId}`)
      if (supabase) {
        supabase.from('chat_messages').delete().eq('match_id', matchId)
      }
    }
  }

  const commentaryOptions = [
    '⚽ Gol! Luar biasa!',
    '🟨 Kartu kuning!',
    '🟥 Kartu merah!',
    '🔄 Substitusi pemain',
    '⏱️ Waktu tambahan...',
    '🔥 Peluang emas!',
    '🧤 Save gemilang!',
    '🎉 Gol kemenangan!',
    '😱 Hampir gol!',
    '👏 Standing ovation!',
    '🏆 Menuju final!',
    '🎯 Assist brilian!'
  ]

  return (
    <div style={{
      background: theme === 'dark' ? '#1e1e2e' : '#f9f9f9',
      borderRadius: '16px',
      overflow: 'hidden',
      marginTop: '20px',
      border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>💬 Live Chat</span>
          {currentMatch && (
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '20px'
            }}>
              {currentMatch}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onlineCount > 0 && (
            <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              👥 {onlineCount} online
            </span>
          )}
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? '#22c55e' : '#ef4444',
            animation: isConnected ? 'pulse 1.5s infinite' : 'none'
          }} />
          <span style={{ fontSize: '11px' }}>
            {isConnected ? 'Real-time' : 'Offline Mode'}
          </span>
          <button
            onClick={clearChat}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px'
            }}
            title="Clear chat"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div style={{
        height: '300px',
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#888',
            padding: '60px 20px'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
            <p>Belum ada pesan.</p>
            <p style={{ fontSize: '12px' }}>Jadi yang pertama berkomentar!</p>
          </div>
        )}
        
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.isOwn ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}
          >
            <div style={{
              background: msg.isCommentary 
                ? (theme === 'dark' ? '#2a2a3e' : '#fef3c7')
                : (msg.isOwn 
                  ? 'linear-gradient(135deg, #667eea, #764ba2)'
                  : (theme === 'dark' ? '#2a2a3e' : 'white')),
              color: msg.isOwn && !msg.isCommentary ? 'white' : (theme === 'dark' ? '#e0e0e0' : '#333'),
              padding: '8px 12px',
              borderRadius: msg.isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              fontSize: '13px',
              wordBreak: 'break-word'
            }}>
              {!msg.isCommentary && (
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: 'bold',
                  color: msg.isOwn ? '#f59e0b' : '#667eea',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>🎮</span> {msg.user}
                </div>
              )}
              <div>{msg.message}</div>
              <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px' }}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div style={{ 
        padding: '12px', 
        borderTop: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
        background: theme === 'dark' ? '#1a1a2e' : '#fefefe'
      }}>
        {/* Quick Commentary Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '12px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {commentaryOptions.map(opt => (
            <button
              key={opt}
              onClick={() => addCommentary(opt)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                background: 'rgba(102,126,234,0.1)',
                border: `1px solid rgba(102,126,234,0.3)`,
                borderRadius: '20px',
                color: theme === 'dark' ? '#e0e0e0' : '#667eea',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {opt}
            </button>
          ))}
        </div>
        
        {/* Message Input */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Kirim pesan sebagai ${playerName}...`}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '24px',
              border: `1px solid ${theme === 'dark' ? '#555' : '#ddd'}`,
              background: theme === 'dark' ? '#333' : 'white',
              color: theme === 'dark' ? 'white' : '#333',
              outline: 'none'
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '24px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Kirim
          </button>
        </div>
        
        {/* Info Text */}
        <div style={{
          fontSize: '10px',
          color: '#888',
          marginTop: '8px',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <span>🎮 {playerName}</span>
          {isConnected ? (
            <span>🟢 Real-time • Pesan terkirim ke semua pengguna</span>
          ) : (
            <span>📡 Offline mode • Pesan tersimpan di browser ini</span>
          )}
        </div>
      </div>
      
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  )
}

export default LiveChat