import type { NextApiRequest, NextApiResponse } from 'next';
import { executeAIStep } from '../../../lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { step, inputs } = req.body;
    
    if (!step) {
      return res.status(400).json({ error: 'Step data is required' });
    }

    // Execute the AI step
    const result = await executeAIStep(step, inputs);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('AI execution error:', error);
    return res.status(500).json({ 
      error: 'Failed to execute AI step',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
