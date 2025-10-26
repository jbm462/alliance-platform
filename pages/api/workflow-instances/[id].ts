import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { getSession } from 'next-auth/react';
import { executeAIStep } from '../../../lib/openai';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  // Get user session
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // GET - Fetch workflow instance by ID
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          workflow:workflows(
            *,
            steps:workflow_steps(*)
          ),
          step_executions(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ message: 'Workflow instance not found' });
        }
        throw error;
      }
      
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching workflow instance:', error);
      return res.status(500).json({ message: 'Failed to fetch workflow instance' });
    }
  }
  
  // PUT - Update workflow instance
  if (req.method === 'PUT') {
    try {
      const { 
        currentStepIndex, 
        status, 
        humanTimeSpent, 
        clientWaitTime,
        outputQualityScore,
        completedAt
      } = req.body;
      
      const updateData: any = {};
      
      if (currentStepIndex !== undefined) {
        updateData.current_step_index = currentStepIndex;
      }
      
      if (status) {
        updateData.status = status;
      }
      
      if (humanTimeSpent) {
        // Fetch current value
        const { data: instance } = await supabase
          .from('workflow_instances')
          .select('human_time_spent_ms')
          .eq('id', id)
          .single();
        
        updateData.human_time_spent_ms = (instance?.human_time_spent_ms || 0) + humanTimeSpent;
      }
      
      if (clientWaitTime) {
        // Fetch current value
        const { data: instance } = await supabase
          .from('workflow_instances')
          .select('client_wait_time_ms')
          .eq('id', id)
          .single();
        
        updateData.client_wait_time_ms = (instance?.client_wait_time_ms || 0) + clientWaitTime;
      }
      
      if (outputQualityScore !== undefined) {
        updateData.output_quality_score = outputQualityScore;
      }
      
      if (completedAt) {
        updateData.completed_at = completedAt;
        
        // Calculate total execution time
        const { data: instance } = await supabase
          .from('workflow_instances')
          .select('started_at')
          .eq('id', id)
          .single();
        
        if (instance?.started_at) {
          const startTime = new Date(instance.started_at).getTime();
          const endTime = new Date(completedAt).getTime();
          updateData.total_execution_time_ms = endTime - startTime;
        }
      }
      
      const { error: updateError } = await supabase
        .from('workflow_instances')
        .update(updateData)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Fetch the updated instance
      const { data: instance, error: fetchError } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          workflow:workflows(
            *,
            steps:workflow_steps(*)
          ),
          step_executions(*)
        `)
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      return res.status(200).json(instance);
    } catch (error) {
      console.error('Error updating workflow instance:', error);
      return res.status(500).json({ message: 'Failed to update workflow instance' });
    }
  }
  
  // POST - Execute a step
  if (req.method === 'POST') {
    try {
      const { stepId, stepType, inputs } = req.body;
      
      if (!stepId || !stepType) {
        return res.status(400).json({ message: 'Step ID and type are required' });
      }
      
      // Get the step details
      const { data: step, error: stepError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('id', stepId)
        .single();
      
      if (stepError) {
        return res.status(404).json({ message: 'Step not found' });
      }
      
      // For AI steps, execute with OpenAI
      if (stepType === 'ai') {
        const startTime = Date.now();
        
        try {
          const result = await executeAIStep(step, inputs || {});
          
          const endTime = Date.now();
          
          return res.status(200).json({
            output: result,
            executionTime: endTime - startTime
          });
        } catch (aiError) {
          console.error('Error executing AI step:', aiError);
          return res.status(500).json({ message: 'AI step execution failed' });
        }
      }
      
      // For human steps, record the execution
      if (stepType === 'human') {
        const { output, executionTime } = req.body;
        
        if (!output) {
          return res.status(400).json({ message: 'Output is required for human steps' });
        }
        
        const now = new Date().toISOString();
        
        // Record the step execution
        const { error: executionError } = await supabase
          .from('step_executions')
          .insert({
            instance_id: id,
            step_id: stepId,
            started_at: now,
            completed_at: now,
            status: 'completed',
            execution_time_ms: executionTime || 0,
            output,
            input_data: inputs || {}
          });
        
        if (executionError) throw executionError;
        
        // Update the instance with human time spent
        if (executionTime) {
          const { data: instance } = await supabase
            .from('workflow_instances')
            .select('human_time_spent_ms')
            .eq('id', id)
            .single();
          
          const currentHumanTime = instance?.human_time_spent_ms || 0;
          
          await supabase
            .from('workflow_instances')
            .update({
              human_time_spent_ms: currentHumanTime + executionTime
            })
            .eq('id', id);
        }
        
        return res.status(200).json({
          output,
          executionTime: executionTime || 0
        });
      }
      
      // For client validation steps
      if (stepType === 'client_validate') {
        const { clientEmail } = req.body;
        
        if (!clientEmail) {
          return res.status(400).json({ message: 'Client email is required for validation steps' });
        }
        
        const validationId = uuidv4();
        const now = new Date().toISOString();
        
        // Create expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        // Generate a secure link
        const secureLink = `${process.env.NEXT_PUBLIC_APP_URL}/client-validation/${validationId}`;
        
        // Create the client validation record
        const { error: validationError } = await supabase
          .from('client_validations')
          .insert({
            id: validationId,
            instance_id: id,
            step_id: stepId,
            created_at: now,
            expires_at: expiresAt.toISOString(),
            status: 'pending',
            secure_link: secureLink
          });
        
        if (validationError) throw validationError;
        
        // In a real app, we would send an email to the client
        // For now, just return the secure link
        
        return res.status(200).json({
          message: 'Client validation initiated',
          secureLink
        });
      }
      
      return res.status(400).json({ message: 'Unsupported step type' });
    } catch (error) {
      console.error('Error executing step:', error);
      return res.status(500).json({ message: 'Failed to execute step' });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 