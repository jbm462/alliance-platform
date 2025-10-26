import { createClient } from '@supabase/supabase-js';

// Check if environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define database schemas for TypeScript
export interface Workflow {
  id: string;
  title: string;
  description: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  version: string;
  version_notes: string;
  is_public: boolean;
  category: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  order_index: number;
  type: 'human' | 'ai' | 'client_validate';
  label: string;
  system_prompt?: string;
  user_prompt?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowInstance {
  id: string;
  workflow_id: string;
  started_by: string;
  started_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed' | 'failed';
  current_step_index: number;
  client_id?: string;
  client_name?: string;
  total_execution_time_ms?: number;
  human_time_spent_ms?: number;
  ai_processing_time_ms?: number;
  client_wait_time_ms?: number;
  total_cost?: number;
  output_quality_score?: number;
}

export interface StepExecution {
  id: string;
  instance_id: string;
  step_id: string;
  started_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed' | 'failed';
  execution_time_ms?: number;
  token_count?: number;
  cost?: number;
  output?: string;
  model_used?: string;
  input_data?: any;
  output_data?: any;
}

export interface ClientValidation {
  id: string;
  instance_id: string;
  step_id: string;
  created_at: string;
  expires_at: string;
  status: 'pending' | 'completed' | 'expired';
  secure_link: string;
  completed_at?: string;
  uploaded_files?: string[];
} 