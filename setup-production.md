# AllIance Platform - Production Setup Guide

## Current Status
✅ **Code is production-ready** - Your codebase already has Supabase and OpenAI integration
❌ **Environment setup needed** - Need to configure credentials and database

## Step 1: Set up Supabase

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Create Database Tables:**
   Run this SQL in your Supabase SQL editor:

```sql
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
```

## Step 2: Configure Environment Variables

Edit your `.env.local` file with your actual credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Get API Keys

1. **OpenAI API Key:**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Create an API key
   - Add billing information

2. **NextAuth Secret:**
   - Generate a random string: `openssl rand -base64 32`

## Step 4: Deploy to Vercel (Optional)

1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables in Vercel:**
   - Go to your Vercel dashboard
   - Add all environment variables from `.env.local`
   - Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain

## Step 5: Test the Setup

1. Restart your development server
2. Try creating a workflow
3. Test workflow execution with AI steps

## What's Already Built

Your platform already includes:
- ✅ Complete Supabase integration
- ✅ OpenAI API integration with cost tracking
- ✅ Workflow management system
- ✅ File upload handling
- ✅ Client validation system
- ✅ Execution metrics and audit trail
- ✅ Version control for workflows

You're essentially **production-ready** once you configure the environment! 