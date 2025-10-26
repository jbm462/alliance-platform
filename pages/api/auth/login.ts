import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body
  
  try {
    // Simple demo authentication for now
    if (email === 'demo@alliance.com' && password === 'password') {
      return res.status(200).json({ 
        user: {
          id: 'demo-user-123',
          email: 'demo@alliance.com',
          name: 'Demo User'
        },
        message: 'Demo user logged in successfully'
      })
    }
    
    // For other users, you can implement proper Supabase auth later
    return res.status(401).json({ error: 'Invalid email or password' })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 