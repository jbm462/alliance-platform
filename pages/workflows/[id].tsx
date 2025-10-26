import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { ArrowLeft, ArrowDown, User, Bot, Play, Share, Edit, Star } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
// Removed NextAuth imports - using simplified auth
import MetricsDisplay from '../../components/MetricsDisplay';
import VersionHistory from '../../components/VersionHistory';

// Define the workflow type
interface WorkflowStep {
  type: 'human' | 'ai';
  label: string;
  instructions?: string;
  system_prompt?: string;
  user_prompt?: string;
}

interface Workflow {
  id: string;
  title: string;
  description: string;
  steps: WorkflowStep[];
  author: string;
  usageCount: number;
  rating: number;
  createdAt: string;
  version?: string;
  versionNotes?: string;
}

const WorkflowDetails: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(-1); // -1 means no step is active
  const [workflowInstance, setWorkflowInstance] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [stepInput, setStepInput] = useState('');

  useEffect(() => {
    if (id) {
      const fetchWorkflow = async () => {
        try {
          const response = await fetch(`/api/workflows/${id}`);
          if (response.ok) {
            const data = await response.json();
            setWorkflow({
              id: data.id,
              title: data.title,
              description: data.description,
              steps: data.steps.sort((a: any, b: any) => a.order_index - b.order_index).map((step: any) => ({
                type: step.type,
                label: step.label,
                systemPrompt: step.system_prompt,
                userPrompt: step.user_prompt,
                instructions: step.instructions
              })),
              author: data.author_id || 'Demo User',
              usageCount: 0,
              rating: 4.5,
              createdAt: data.created_at,
              version: data.version,
              versionNotes: data.version_notes
            });
          } else {
            setError('Workflow not found');
          }
        } catch (err) {
          setError('Failed to load workflow');
        } finally {
          setLoading(false);
        }
      };
      
      fetchWorkflow();
    }
  }, [id]);
  
  // Handle back button
  const handleBack = () => {
    router.push('/workflows');
  };
  
  // Handle start workflow
  const handleStartWorkflow = async () => {
    if (!workflow) return;
    
    setIsExecuting(true);
    try {
      const response = await fetch(`/api/workflows/${id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkflowInstance(data.instance);
        setActiveStep(0);
      } else {
        setError('Failed to start workflow');
      }
    } catch (err) {
      setError('Failed to start workflow');
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Handle next step
  const handleNextStep = async () => {
    if (!workflow || !workflowInstance) return;
    
    try {
      const response = await fetch(`/api/workflows/${id}/execute`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceId: workflowInstance.id,
          action: 'complete_step',
          stepData: {
            input: stepInput,
            completed_at: new Date().toISOString()
          }
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkflowInstance(data.instance);
        
        if (data.instance.status === 'completed') {
          setActiveStep(-1);
          setWorkflowInstance(null);
          setStepInput('');
        } else {
          setActiveStep(data.instance.current_step_index);
          setStepInput('');
        }
      }
    } catch (err) {
      setError('Failed to complete step');
    }
  };
  
  // Handle step input change
  const handleStepInputChange = (value: string) => {
    setStepInput(value);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-human mx-auto"></div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Loading workflow...</h3>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-human hover:bg-human-dark"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Workflows
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!workflow) {
    return (
      <Layout>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Workflow not found</h3>
            <div className="mt-6">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-human hover:bg-human-dark"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Workflows
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Head>
        <title>{workflow.title} | AllIance</title>
        <meta name="description" content={workflow.description} />
      </Head>
      
      {/* Header */}
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="mr-4 text-gray-400 hover:text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{workflow.title}</h1>
        </div>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          {activeStep === -1 ? (
            <button
              onClick={handleStartWorkflow}
              disabled={isExecuting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-human hover:bg-human-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="mr-2 h-4 w-4" />
              {isExecuting ? 'Starting...' : 'Start Workflow'}
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Step {activeStep + 1} of {workflow.steps.length}
              </span>
              <button
                onClick={handleNextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-human hover:bg-human-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human"
              >
                {activeStep < workflow.steps.length - 1 ? 'Next Step' : 'Complete Workflow'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Workflow details */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Created by {workflow.author}</p>
              <p className="text-sm text-gray-500">Used {workflow.usageCount} times</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-500">
                <Share className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-500">
                <Edit className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="ml-1 text-sm text-gray-500">{workflow.rating}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-700">{workflow.description}</p>
          </div>
          
          {workflow.version && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Version: {workflow.version}</h3>
              {workflow.versionNotes && (
                <p className="mt-1 text-sm text-gray-500">{workflow.versionNotes}</p>
              )}
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Workflow Steps</h3>
            <div className="mt-4 space-y-6">
              {workflow.steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex items-start ${
                    activeStep === index ? 'bg-gray-50 p-4 rounded-lg border border-gray-200' : ''
                  }`}
                >
                  {index > 0 && (
                    <div className="mr-3 flex flex-col items-center">
                      <ArrowDown className="h-5 w-5 text-gray-300" />
                    </div>
                  )}
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    step.type === 'human' ? 'bg-human-light' : 'bg-ai-light'
                  }`}>
                    {step.type === 'human' ? (
                      <User className="h-5 w-5 text-human" />
                    ) : (
                      <Bot className="h-5 w-5 text-ai" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${step.type === 'human' ? 'text-human-dark' : 'text-ai-dark'}`}>
                      {step.type === 'human' ? 'Human' : 'AI'} Step {index + 1}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {step.label}
                    </p>
                    
                    {activeStep === index && (
                      <div className="mt-4">
                        {step.type === 'human' ? (
                          <div className="space-y-4">
                            <p className="text-sm font-medium text-gray-700">
                              Complete this step by providing your input:
                            </p>
                            {step.instructions && (
                              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                <p className="text-sm text-blue-800">
                                  <strong>Instructions:</strong> {step.instructions}
                                </p>
                              </div>
                            )}
                            <textarea
                              rows={4}
                              value={stepInput}
                              onChange={(e) => handleStepInputChange(e.target.value)}
                              className="shadow-sm block w-full focus:ring-human focus:border-human sm:text-sm border border-gray-300 rounded-md"
                              placeholder="Enter your contribution..."
                            />
                            <button
                              onClick={handleNextStep}
                              disabled={!stepInput.trim()}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-human hover:bg-human-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Submit and Continue
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm font-medium text-gray-700">
                              AI is processing this step...
                            </p>
                            {step.system_prompt && (
                              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                <p className="text-sm text-green-800">
                                  <strong>AI Prompt:</strong> {step.system_prompt}
                                </p>
                                {step.user_prompt && (
                                  <p className="text-sm text-green-700 mt-2">
                                    <strong>User Input:</strong> {step.user_prompt}
                                  </p>
                                )}
                              </div>
                            )}
                            <div className="animate-pulse flex space-x-4">
                              <div className="flex-1 space-y-4 py-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="space-y-2">
                                  <div className="h-4 bg-gray-200 rounded"></div>
                                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                              </div>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                              <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> AI integration coming soon! For now, click "Continue" to proceed.
                              </p>
                            </div>
                            <button
                              onClick={handleNextStep}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-ai hover:bg-ai-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ai"
                            >
                              Continue to Next Step
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add metrics display */}
      {/* <div className="mt-6">
        <MetricsDisplay workflowId={workflow.id} />
      </div> */}
      
      {/* Add version history */}
      {/* <div className="mt-6">
        <VersionHistory workflowId={workflow.id} currentVersion={workflow.version || '1.0'} />
      </div> */}
    </Layout>
  );
};

// Removed server-side props - using client-side loading

export default WorkflowDetails; 