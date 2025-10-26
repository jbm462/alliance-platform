import { supabase } from '../../../lib/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body
  
  try {
    // First try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      // If sign in fails and it's the demo user, try to create it
      if (email === 'demo@alliance.com' && password === 'password') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'demo@alliance.com',
          password: 'password',
        })
        
        if (signUpError) {
          return res.status(401).json({ error: 'Demo user setup failed: ' + signUpError.message })
        }
        
        return res.status(200).json({ 
          user: signUpData.user,
          message: 'Demo user created successfully'
        })
      }
      
      return res.status(401).json({ error: error.message })
    }
    
    return res.status(200).json({ user: data.user })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 