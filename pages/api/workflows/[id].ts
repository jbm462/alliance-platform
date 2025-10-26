import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { getSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  // Get user session
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // GET - Fetch workflow by ID
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          steps:workflow_steps(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ message: 'Workflow not found' });
        }
        throw error;
      }
      
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching workflow:', error);
      return res.status(500).json({ message: 'Failed to fetch workflow' });
    }
  }
  
  // PUT - Update workflow
  if (req.method === 'PUT') {
    try {
      const { title, description, steps, version, versionNotes } = req.body;
      
      // Validate input
      if (!title || !description || !steps || !Array.isArray(steps)) {
        return res.status(400).json({ message: 'Invalid workflow data' });
      }
      
      // Update workflow
      const now = new Date().toISOString();
      
      const { error: workflowError } = await supabase
        .from('workflows')
        .update({
          title,
          description,
          updated_at: now,
          version: version || '1.0',
          version_notes: versionNotes || ''
        })
        .eq('id', id);
      
      if (workflowError) throw workflowError;
      
      // Delete existing steps
      const { error: deleteError } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', id);
      
      if (deleteError) throw deleteError;
      
      // Create new steps
      const stepsToInsert = steps.map((step, index) => ({
        id: uuidv4(),
        workflow_id: id,
        order_index: index,
        type: step.type,
        label: step.label,
        system_prompt: step.systemPrompt || undefined,
        user_prompt: step.userPrompt || undefined,
        instructions: step.instructions || undefined,
        created_at: now,
        updated_at: now
      }));
      
      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(stepsToInsert);
      
      if (stepsError) throw stepsError;
      
      // Fetch the updated workflow with steps
      const { data: workflow, error: fetchError } = await supabase
        .from('workflows')
        .select(`
          *,
          steps:workflow_steps(*)
        `)
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      return res.status(200).json(workflow);
    } catch (error) {
      console.error('Error updating workflow:', error);
      return res.status(500).json({ message: 'Failed to update workflow' });
    }
  }
  
  // DELETE - Delete workflow
  if (req.method === 'DELETE') {
    try {
      // Delete workflow steps first (due to foreign key constraint)
      const { error: deleteStepsError } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', id);
      
      if (deleteStepsError) throw deleteStepsError;
      
      // Delete the workflow
      const { error: deleteWorkflowError } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);
      
      if (deleteWorkflowError) throw deleteWorkflowError;
      
      return res.status(200).json({ message: 'Workflow deleted successfully' });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      return res.status(500).json({ message: 'Failed to delete workflow' });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 