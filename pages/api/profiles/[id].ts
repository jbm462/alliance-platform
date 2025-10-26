import type { NextApiRequest, NextApiResponse } from 'next';

// Mock database with proper typing
const users: Record<string, {
  id: string;
  name: string;
  title: string;
  bio: string;
}> = {
  '1': {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Strategic Finance Consultant',
    bio: 'Finance professional with 10+ years of experience...',
    // Other profile data
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const userId = Array.isArray(id) ? id[0] : id;
  
  if (!userId) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  
  if (req.method === 'GET') {
    const user = users[userId];
    if (user) {
      return res.status(200).json(user);
    }
    return res.status(404).json({ message: 'User not found' });
  }
  
  if (req.method === 'PUT') {
    // Update user data
    if (users[userId]) {
      users[userId] = { ...users[userId], ...req.body };
      return res.status(200).json(users[userId]);
    }
    return res.status(404).json({ message: 'User not found' });
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 