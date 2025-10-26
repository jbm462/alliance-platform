import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { createServiceCatalogWorkflow } from '../../lib/predefinedWorkflows';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  // Get user session
  const session = await getSession({ req });
  
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