import { supabase } from '../../../../lib/supabase'
import { executeAIStep } from '../../../../lib/openai'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const { stepId, inputs } = req.body
  
  // Get step details
  const { data: step, error: stepError } = await supabase
    .from('workflow_steps')
    .select('*')
    .eq('id', stepId)
    .single()
  
  if (stepError || !step) {
    return res.status(404).json({ error: 'Step not found' })
  }
  
  let result
  let cost = 0
  let tokens = 0
  
  try {
    if (step.type === 'AI_EXECUTE') {
      // Execute AI step
      const aiResult = await executeAIStep(step, inputs)
      result = aiResult.content
      cost = aiResult.cost
      tokens = aiResult.tokens
    } else {
      // Human step - just record completion
      result = inputs.result || 'Completed by human'
    }
    
    // Record execution
    const { data: execution, error: executionError } = await supabase
      .from('step_executions')
      .insert({
        workflow_instance_id: inputs.workflowInstanceId,
        step_id: stepId,
        result,
        cost,
        tokens,
        completed_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (executionError) {
      throw executionError
    }
    
    return res.status(200).json({ execution })
  } catch (error) {
    console.error('Error executing step:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to execute step' 
    })
  }
} 