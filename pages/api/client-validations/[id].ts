import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  // GET - Fetch client validation by ID
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('client_validations')
        .select(`
          *,
          instance:workflow_instances(
            *,
            workflow:workflows(
              *,
              steps:workflow_steps(*)
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ message: 'Client validation not found' });
        }
        throw error;
      }
      
      // Check if validation has expired
      if (data.status === 'expired' || new Date(data.expires_at) < new Date()) {
        // Update status if it's not already marked as expired
        if (data.status !== 'expired') {
          await supabase
            .from('client_validations')
            .update({ status: 'expired' })
            .eq('id', id);
        }
        
        return res.status(410).json({ message: 'Client validation has expired' });
      }
      
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching client validation:', error);
      return res.status(500).json({ message: 'Failed to fetch client validation' });
    }
  }
  
  // POST - Submit client validation
  if (req.method === 'POST') {
    try {
      // Get the validation record
      const { data: validation, error: validationError } = await supabase
        .from('client_validations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (validationError) {
        if (validationError.code === 'PGRST116') {
          return res.status(404).json({ message: 'Client validation not found' });
        }
        throw validationError;
      }
      
      // Check if validation has expired
      if (validation.status === 'expired' || new Date(validation.expires_at) < new Date()) {
        return res.status(410).json({ message: 'Client validation has expired' });
      }
      
      // Check if validation is already completed
      if (validation.status === 'completed') {
        return res.status(409).json({ message: 'Client validation already completed' });
      }
      
      const { files } = req.body;
      
      // Update the validation record
      const now = new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('client_validations')
        .update({
          status: 'completed',
          completed_at: now,
          uploaded_files: files || []
        })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Record the step execution
      const { error: executionError } = await supabase
        .from('step_executions')
        .insert({
          instance_id: validation.instance_id,
          step_id: validation.step_id,
          started_at: validation.created_at,
          completed_at: now,
          status: 'completed',
          output: JSON.stringify({ files: files || [] }),
          input_data: {}
        });
      
      if (executionError) throw executionError;
      
      // Update the workflow instance
      // Calculate client wait time
      const startTime = new Date(validation.created_at).getTime();
      const endTime = new Date(now).getTime();
      const waitTime = endTime - startTime;
      
      const { data: instance } = await supabase
        .from('workflow_instances')
        .select('client_wait_time_ms, current_step_index')
        .eq('id', validation.instance_id)
        .single();
      
      if (instance) {
        const currentWaitTime = instance.client_wait_time_ms || 0;
        
        await supabase
          .from('workflow_instances')
          .update({
            client_wait_time_ms: currentWaitTime + waitTime,
            current_step_index: instance.current_step_index + 1 // Move to next step
          })
          .eq('id', validation.instance_id);
      }
      
      return res.status(200).json({
        message: 'Client validation completed successfully',
        waitTime
      });
    } catch (error) {
      console.error('Error submitting client validation:', error);
      return res.status(500).json({ message: 'Failed to submit client validation' });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 