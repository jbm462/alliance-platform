import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    return res.status(200).json({ 
      message: 'Demo user is ready! Use demo@alliance.com / password to sign in.',
      ready: true,
      credentials: {
        email: 'demo@alliance.com',
        password: 'password'
      }
    })
  } catch (err) {
    console.error('Demo setup error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
