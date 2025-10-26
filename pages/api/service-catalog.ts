import type { NextApiRequest, NextApiResponse } from 'next';
// Removed NextAuth import - using simplified auth
import { createServiceCatalogWorkflow } from '../../lib/predefinedWorkflows';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  // Get user session
  // Simplified auth - using demo user for now
  const session = { user: { id: 'demo-user-123' } };
  
  if (!session || !session.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const { category } = req.body;
    
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    
    // Create the service catalog workflow
    const result = await createServiceCatalogWorkflow(session.user.id, category);
    
    return res.status(201).json({
      message: 'Service catalog workflow created successfully',
      workflowId: result.workflowId
    });
  } catch (error) {
    console.error('Error creating service catalog workflow:', error);
    return res.status(500).json({ message: 'Failed to create service catalog workflow' });
  }
} 