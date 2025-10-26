import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // For now, just return success - the demo user will be created when they first try to sign in
    return res.status(200).json({ 
      message: 'Demo user setup ready. You can now use demo@alliance.com / password',
      ready: true
    })
  } catch (err) {
    console.error('Demo setup error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
