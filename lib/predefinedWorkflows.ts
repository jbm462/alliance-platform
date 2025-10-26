import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';

/**
 * Create a Service Catalog workflow in the database
 */
export const createServiceCatalogWorkflow = async (userId: string, category: string = 'Banking') => {
  try {
    const workflowId = uuidv4();
    const now = new Date().toISOString();
    
    // Create the workflow
    const { error: workflowError } = await supabase
      .from('workflows')
      .insert({
        id: workflowId,
        title: `Service Catalog - ${category}`,
        description: `A comprehensive workflow for developing a service catalog for ${category} organizations, leveraging APQC taxonomy and AI-driven analysis.`,
        author_id: userId,
        created_at: now,
        updated_at: now,
        version: '1.0',
        version_notes: 'Initial version',
        is_public: false,
        category: 'service_catalog'
      });
    
    if (workflowError) throw workflowError;
    
    // Create the steps
    const steps = [
      {
        id: uuidv4(),
        workflow_id: workflowId,
        order_index: 0,
        type: 'human',
        label: 'Upload APQC/Base Taxonomy',
        instructions: 'Upload an Excel or CSV file containing the APQC taxonomy or other process framework you want to use as a base for your service catalog.',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        workflow_id: workflowId,
        order_index: 1,
        type: 'ai',
        label: 'Extract and Structure Taxonomy',
        system_prompt: 'You are an expert in business process frameworks and taxonomies. Your task is to analyze the provided data and extract a structured process taxonomy.',
        user_prompt: `Extract and structure the process taxonomy from the following data:
{{taxonomyData}}

Format as hierarchical JSON with:
- L1: Major process areas
- L2: Process groups  
- L3: Processes
- L4: Activities

Include APQC codes where present. Make sure to preserve the hierarchical relationships between levels.`,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        workflow_id: workflowId,
        order_index: 2,
        type: 'human',
        label: 'Review and Request Client Data',
        instructions: 'Review the structured taxonomy extracted by AI. Make any necessary corrections or adjustments. When ready, request additional data from the client to enrich the taxonomy.',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        workflow_id: workflowId,
        order_index: 3,
        type: 'client_validate',
        label: 'Client Data Upload',
        instructions: 'Please upload any relevant documents to help us understand your specific processes. This could include time studies, organization charts, existing process documentation, or other relevant materials.',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        workflow_id: workflowId,
        order_index: 4,
        type: 'ai',
        label: 'Enrich with Intelligence',
        system_prompt: 'You are an expert business process consultant with deep expertise in service catalog development and operational optimization.',
        user_prompt: `Based on the process taxonomy and client data:

1. Add time estimates per process (from client data or industry benchmarks for {{category}} if client data is not available)
2. Add complexity scores (1-5 scale) based on process characteristics
3. Add volume indicators (high/medium/low) based on typical transaction volumes in {{category}}
4. Suggest delivery model for each process: Retain/CoE/BPO/Offshore/Automate
5. For each suggestion, provide a brief explanation of your reasoning

Process Taxonomy:
{{structuredTaxonomy}}

Client Data:
{{clientData}}

Please provide your recommendations in a structured JSON format that maintains the hierarchy of the taxonomy.`,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        workflow_id: workflowId,
        order_index: 5,
        type: 'human',
        label: 'Strategic Review',
        instructions: 'Review the AI-enriched taxonomy and delivery model recommendations. Provide strategic insights, override recommendations as needed, and add any additional context based on your expertise.',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        workflow_id: workflowId,
        order_index: 6,
        type: 'ai',
        label: 'Generate Deliverable',
        system_prompt: 'You are an expert at creating professional business presentations and reports.',
        user_prompt: `Create a comprehensive service catalog deliverable based on the enriched taxonomy and strategic insights. The deliverable should include:

1. Executive summary highlighting key findings and recommendations
2. Full taxonomy with delivery model recommendations
3. Implementation roadmap with prioritized initiatives
4. Strategic considerations and next steps

Enriched Taxonomy:
{{enrichedTaxonomy}}

Strategic Insights:
{{strategicInsights}}

Format the output as a professional report suitable for executive presentation.`,
        created_at: now,
        updated_at: now
      }
    ];
    
    const { error: stepsError } = await supabase
      .from('workflow_steps')
      .insert(steps);
    
    if (stepsError) throw stepsError;
    
    return { workflowId, steps };
  } catch (error) {
    console.error('Error creating service catalog workflow:', error);
    throw error;
  }
}; 