import { supabase } from '../../../lib/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Create demo user
    const { data, error } = await supabase.auth.signUp({
      email: 'demo@alliance.com',
      password: 'password',
    })
    
    if (error) {
      // If user already exists, try to sign in
      if (error.message.includes('already registered')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'demo@alliance.com',
          password: 'password',
        })
        
        if (signInError) {
          return res.status(400).json({ error: signInError.message })
        }
        
        return res.status(200).json({ 
          message: 'Demo user already exists and is ready to use',
          user: signInData.user 
        })
      }
      
      return res.status(400).json({ error: error.message })
    }
    
    return res.status(200).json({ 
      message: 'Demo user created successfully',
      user: data.user 
    })
  } catch (err) {
    console.error('Demo setup error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
