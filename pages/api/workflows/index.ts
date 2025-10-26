import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Fetch workflows
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          steps:workflow_steps(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return res.status(500).json({ message: 'Failed to fetch workflows' });
    }
  }
  
  // POST - Create new workflow
  if (req.method === 'POST') {
    try {
      const { title, description, steps, version, versionNotes, authorId } = req.body;
      
      // Validate input
      if (!title || !description || !steps || !Array.isArray(steps)) {
        return res.status(400).json({ message: 'Invalid workflow data' });
      }
      
      // Create workflow
      const workflowId = uuidv4();
      const now = new Date().toISOString();
      
      const { error: workflowError } = await supabase
        .from('workflows')
        .insert({
          id: workflowId,
          title,
          description,
          author_id: authorId || 'anonymous', // Use provided authorId or fallback
          created_at: now,
          updated_at: now,
          version: version || '1.0',
          version_notes: versionNotes || '',
          is_public: false,
          category: 'custom'
        });
      
      if (workflowError) throw workflowError;
      
      // Create workflow steps
      const stepsToInsert = steps.map((step, index) => ({
        id: uuidv4(),
        workflow_id: workflowId,
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
      
      // Fetch the complete workflow with steps
      const { data: workflow, error: fetchError } = await supabase
        .from('workflows')
        .select(`
          *,
          steps:workflow_steps(*)
        `)
        .eq('id', workflowId)
        .single();
      
      if (fetchError) throw fetchError;
      
      return res.status(201).json(workflow);
    } catch (error) {
      console.error('Error creating workflow:', error);
      return res.status(500).json({ message: 'Failed to create workflow' });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 