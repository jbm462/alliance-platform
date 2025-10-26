import type { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory storage for workflow instances
let workflowInstances: any[] = [];

// Import the same workflow data as the main API
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
  const { id } = req.query;
  
  if (req.method === 'POST') {
    try {
      // Find the workflow to get total steps
      const workflow = workflows.find(w => w.id === id);
      if (!workflow) {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      
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
        total_steps: workflow.steps.length,
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
        // Get the current workflow to access step details
        const workflow = workflows.find(w => w.id === instance.workflow_id);
        if (!workflow) {
          return res.status(404).json({ error: 'Workflow not found' });
        }
        
        const currentStep = workflow.steps[instance.current_step_index];
        if (!currentStep) {
          return res.status(400).json({ error: 'Invalid step index' });
        }
        
        let finalStepData = { ...stepData };
        
        // AI execution is handled by the frontend
        
        // Mark current step as completed
        instance.steps_completed.push({
          step_index: instance.current_step_index,
          completed_at: new Date().toISOString(),
          data: finalStepData
        });
        
        // Update total cost if AI was involved
        if (finalStepData.aiCost) {
          instance.total_cost = (instance.total_cost || 0) + finalStepData.aiCost;
        }
        
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