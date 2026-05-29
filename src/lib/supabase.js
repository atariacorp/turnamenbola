// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Chat will run in offline mode.')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null

export async function testConnection() {
  if (!supabase) {
    console.log('📡 Running in offline mode')
    return false
  }
  
  try {
    const { error } = await supabase.from('chat_messages').select('count', { count: 'exact', head: true })
    if (error) throw error
    console.log('✅ Connected to Supabase Realtime')
    return true
  } catch (error) {
    console.log('📡 Realtime mode not available, using fallback')
    return false
  }
}

// Function to get online users count (optional)
export async function getOnlineUsers(matchId) {
  if (!supabase) return 0
  
  try {
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', matchId)
      .gt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    
    return count || 0
  } catch {
    return 0
  }
}