import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

// Simple in-memory storage for demo purposes (same as index.ts)
let workflows: any[] = [
  {
    id: 'demo-workflow-1',
    title: 'Content Creation Workflow',
    description: 'A workflow for creating blog posts with AI assistance',
    author_id: 'demo-user-123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: '1.0',
    version_notes: 'Initial version',
    is_public: true,
    category: 'content',
    steps: [
      {
        id: 'step-1',
        workflow_id: 'demo-workflow-1',
        order_index: 0,
        type: 'ai',
        label: 'Generate Topic Ideas',
        system_prompt: 'You are a content strategist. Generate 5 engaging blog post topics.',
        user_prompt: 'Generate topics for a tech blog about AI and productivity.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'step-2',
        workflow_id: 'demo-workflow-1',
        order_index: 1,
        type: 'human',
        label: 'Review and Select Topic',
        instructions: 'Review the generated topics and select the most promising one.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  // GET - Fetch workflow by ID
  if (req.method === 'GET') {
    try {
      const workflow = workflows.find(w => w.id === id);
      
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }
      
      return res.status(200).json(workflow);
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
      
      const workflowIndex = workflows.findIndex(w => w.id === id);
      
      if (workflowIndex === -1) {
        return res.status(404).json({ message: 'Workflow not found' });
      }
      
      // Update workflow
      const now = new Date().toISOString();
      
      workflows[workflowIndex] = {
        ...workflows[workflowIndex],
        title,
        description,
        updated_at: now,
        version: version || '1.0',
        version_notes: versionNotes || '',
        steps: steps.map((step, index) => ({
          id: step.id || uuidv4(),
          workflow_id: id,
          order_index: index,
          type: step.type,
          label: step.label,
          system_prompt: step.systemPrompt || undefined,
          user_prompt: step.userPrompt || undefined,
          instructions: step.instructions || undefined,
          created_at: step.created_at || now,
          updated_at: now
        }))
      };
      
      return res.status(200).json(workflows[workflowIndex]);
    } catch (error) {
      console.error('Error updating workflow:', error);
      return res.status(500).json({ message: 'Failed to update workflow' });
    }
  }
  
  // DELETE - Delete workflow
  if (req.method === 'DELETE') {
    try {
      const workflowIndex = workflows.findIndex(w => w.id === id);
      
      if (workflowIndex === -1) {
        return res.status(404).json({ message: 'Workflow not found' });
      }
      
      workflows.splice(workflowIndex, 1);
      
      return res.status(200).json({ message: 'Workflow deleted successfully' });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      return res.status(500).json({ message: 'Failed to delete workflow' });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
}