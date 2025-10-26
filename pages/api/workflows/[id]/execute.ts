import type { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory storage for workflow instances
let workflowInstances: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (req.method === 'POST') {
    try {
      // Start a new workflow instance
      const instanceId = `instance-${Date.now()}`;
      const now = new Date().toISOString();
      
      const newInstance = {
        id: instanceId,
        workflow_id: id,
        started_by: 'demo-user-123',
        started_at: now,
        completed_at: null,
        status: 'in_progress',
        current_step_index: 0,
        steps_completed: [],
        current_step_data: null,
        total_steps: 0, // Will be set when we fetch the workflow
        created_at: now,
        updated_at: now
      };
      
      // Add to instances
      workflowInstances.push(newInstance);
      
      return res.status(201).json({
        instance: newInstance,
        message: 'Workflow started successfully'
      });
    } catch (error) {
      console.error('Error starting workflow:', error);
      return res.status(500).json({ error: 'Failed to start workflow' });
    }
  }
  
  if (req.method === 'GET') {
    try {
      const { instanceId } = req.query;
      
      if (instanceId) {
        // Get specific instance
        const instance = workflowInstances.find(i => i.id === instanceId);
        if (!instance) {
          return res.status(404).json({ error: 'Workflow instance not found' });
        }
        return res.status(200).json({ instance });
      } else {
        // Get all instances for a workflow
        const instances = workflowInstances.filter(i => i.workflow_id === id);
        return res.status(200).json({ instances });
      }
    } catch (error) {
      console.error('Error fetching workflow instances:', error);
      return res.status(500).json({ error: 'Failed to fetch workflow instances' });
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { instanceId, action, stepData } = req.body;
      
      const instance = workflowInstances.find(i => i.id === instanceId);
      if (!instance) {
        return res.status(404).json({ error: 'Workflow instance not found' });
      }
      
      if (action === 'complete_step') {
        // Mark current step as completed
        instance.steps_completed.push({
          step_index: instance.current_step_index,
          completed_at: new Date().toISOString(),
          data: stepData
        });
        
        // Move to next step
        instance.current_step_index += 1;
        instance.updated_at = new Date().toISOString();
        
        // Check if workflow is complete
        if (instance.current_step_index >= instance.total_steps) {
          instance.status = 'completed';
          instance.completed_at = new Date().toISOString();
        }
        
        return res.status(200).json({ instance });
      }
      
      if (action === 'update_step_data') {
        // Update current step data
        instance.current_step_data = stepData;
        instance.updated_at = new Date().toISOString();
        
        return res.status(200).json({ instance });
      }
      
      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Error updating workflow instance:', error);
      return res.status(500).json({ error: 'Failed to update workflow instance' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}