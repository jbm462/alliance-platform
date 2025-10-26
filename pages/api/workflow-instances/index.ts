import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { getSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get user session
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // GET - Fetch workflow instances
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          workflow:workflows(*)
        `)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching workflow instances:', error);
      return res.status(500).json({ message: 'Failed to fetch workflow instances' });
    }
  }
  
  // POST - Create new workflow instance
  if (req.method === 'POST') {
    try {
      const { workflowId, clientId, clientName } = req.body;
      
      if (!workflowId) {
        return res.status(400).json({ message: 'Workflow ID is required' });
      }
      
      // Fetch the workflow to make sure it exists
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .select(`
          *,
          steps:workflow_steps(*)
        `)
        .eq('id', workflowId)
        .single();
      
      if (workflowError) {
        return res.status(404).json({ message: 'Workflow not found' });
      }
      
      // Create new workflow instance
      const instanceId = uuidv4();
      const now = new Date().toISOString();
      
      const { error: instanceError } = await supabase
        .from('workflow_instances')
        .insert({
          id: instanceId,
          workflow_id: workflowId,
          started_by: session.user.id,
          started_at: now,
          status: 'in_progress',
          current_step_index: 0,
          client_id: clientId || null,
          client_name: clientName || null,
          total_execution_time_ms: 0,
          human_time_spent_ms: 0,
          ai_processing_time_ms: 0,
          client_wait_time_ms: 0,
          total_cost: 0
        });
      
      if (instanceError) throw instanceError;
      
      // Fetch the instance with the workflow
      const { data: instance, error: fetchError } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          workflow:workflows(
            *,
            steps:workflow_steps(*)
          )
        `)
        .eq('id', instanceId)
        .single();
      
      if (fetchError) throw fetchError;
      
      return res.status(201).json(instance);
    } catch (error) {
      console.error('Error creating workflow instance:', error);
      return res.status(500).json({ message: 'Failed to create workflow instance' });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 