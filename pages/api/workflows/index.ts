import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

// Simple in-memory storage for demo purposes
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
  },
  {
    id: 'demo-workflow-2',
    title: 'Process Taxonomy Creation',
    description: 'Workflow for creating a standard common process framework taxonomy for baseline purposes',
    author_id: 'demo-user-123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: '1.0',
    version_notes: 'Initial version',
    is_public: true,
    category: 'business',
    steps: [
      {
        id: 'step-1',
        workflow_id: 'demo-workflow-2',
        order_index: 0,
        type: 'human',
        label: 'Indicate the sector / industry',
        instructions: 'Specify the industry sector for the taxonomy framework.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'step-2',
        workflow_id: 'demo-workflow-2',
        order_index: 1,
        type: 'ai',
        label: 'Pull APQC of said sector / industry and function',
        system_prompt: 'You are a business process expert. Analyze the APQC framework for the specified industry.',
        user_prompt: 'Provide APQC process categories for the specified industry sector.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'step-3',
        workflow_id: 'demo-workflow-2',
        order_index: 2,
        type: 'human',
        label: 'Share any client business process documentation',
        instructions: 'Upload or provide any existing business process documentation from the client.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'step-4',
        workflow_id: 'demo-workflow-2',
        order_index: 3,
        type: 'ai',
        label: 'Tailor taxonomy to the client and indicate any key nuances to consider',
        system_prompt: 'You are a business process consultant. Create a customized taxonomy based on APQC and client documentation.',
        user_prompt: 'Create a tailored process taxonomy that incorporates client-specific nuances and requirements.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'step-5',
        workflow_id: 'demo-workflow-2',
        order_index: 4,
        type: 'ai',
        label: 'Create question set and focus process areas for human to leverage in client discussion',
        system_prompt: 'You are a business consultant. Create strategic questions for client engagement.',
        user_prompt: 'Generate a comprehensive question set for client discussions about process areas.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Fetch workflows
  if (req.method === 'GET') {
    try {
      return res.status(200).json(workflows);
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
      
      const newWorkflow = {
        id: workflowId,
        title,
        description,
        author_id: authorId || 'demo-user-123',
        created_at: now,
        updated_at: now,
        version: version || '1.0',
        version_notes: versionNotes || '',
        is_public: false,
        category: 'custom',
        steps: steps.map((step, index) => ({
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
        }))
      };
      
      // Add to workflows array
      workflows.unshift(newWorkflow);
      
      return res.status(201).json(newWorkflow);
    } catch (error) {
      console.error('Error creating workflow:', error);
      return res.status(500).json({ message: 'Failed to create workflow' });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
}