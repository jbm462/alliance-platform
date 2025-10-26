-- AllIance Platform Database Setup
-- Run this script in your Supabase SQL Editor

-- Create workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version TEXT DEFAULT '1.0',
  version_notes TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'custom'
);

-- Create workflow_steps table
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('human', 'ai', 'client_validate')),
  label TEXT NOT NULL,
  system_prompt TEXT,
  user_prompt TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_instances table
CREATE TABLE workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  started_by TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  current_step_index INTEGER DEFAULT 0,
  client_id TEXT,
  client_name TEXT,
  total_execution_time_ms INTEGER DEFAULT 0,
  human_time_spent_ms INTEGER DEFAULT 0,
  ai_processing_time_ms INTEGER DEFAULT 0,
  client_wait_time_ms INTEGER DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  output_quality_score INTEGER
);

-- Create step_executions table
CREATE TABLE step_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  execution_time_ms INTEGER,
  token_count INTEGER,
  cost DECIMAL(10,4),
  output TEXT,
  model_used TEXT,
  input_data JSONB,
  output_data JSONB
);

-- Create client_validations table
CREATE TABLE client_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  secure_link TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  uploaded_files TEXT[]
);

-- Create file_uploads table
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  storage_path TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_workflows_author ON workflows(author_id);
CREATE INDEX idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_instances_workflow ON workflow_instances(workflow_id);
CREATE INDEX idx_step_executions_instance ON step_executions(instance_id);
CREATE INDEX idx_client_validations_instance ON client_validations(instance_id);

-- Insert some sample data for testing
INSERT INTO workflows (id, title, description, author_id, category) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  'Service Catalog Development',
  'A comprehensive workflow for developing a service catalog for organizations, leveraging APQC taxonomy and AI-driven analysis.',
  '1',
  'service_catalog'
);

INSERT INTO workflow_steps (workflow_id, order_index, type, label, system_prompt, user_prompt, instructions) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440000',
  0,
  'human',
  'Upload Organization Data',
  NULL,
  NULL,
  'Upload organizational charts, process documents, and any existing service documentation.'
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  1,
  'ai',
  'Analyze Organization Structure',
  'You are an expert business analyst specializing in organizational structure and service taxonomy.',
  'Analyze the uploaded organizational data and identify key business functions, departments, and existing services. Map these to APQC process framework categories.',
  NULL
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  2,
  'human',
  'Review AI Analysis',
  NULL,
  NULL,
  'Review the AI analysis of your organization structure. Make corrections and add any missing information.'
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  3,
  'ai',
  'Generate Service Catalog',
  'You are a service management expert. Create comprehensive service catalogs that follow ITIL best practices.',
  'Based on the organizational analysis and human feedback, generate a comprehensive service catalog with service descriptions, SLAs, and dependencies.',
  NULL
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  4,
  'client_validate',
  'Client Review & Approval',
  NULL,
  NULL,
  'Present the service catalog to stakeholders for review and approval.'
);

-- Success message
SELECT 'AllIance Platform database setup completed successfully!' as message; 