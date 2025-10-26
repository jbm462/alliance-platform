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
            
            {/* Completed Steps Summary */}
            {workflowInstance && workflowInstance.steps_completed && workflowInstance.steps_completed.length > 0 && (
              <div className="mt-4 mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Completed Steps</h4>
                <div className="space-y-4">
                  {workflowInstance.steps_completed.map((completedStep: any, index: number) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-800">Step {completedStep.step_index + 1} Completed</span>
                        <span className="text-xs text-green-600">{completedStep.completed_at}</span>
                      </div>
                      <div className="text-sm text-green-700">
                        <strong>Human Decision:</strong> {completedStep.data?.input || 'No input recorded'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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
                      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <div className="space-y-6">
                          {/* Human Decision Section */}
                          <div className="bg-white border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              <div className="h-8 w-8 rounded-full bg-human-light flex items-center justify-center mr-3">
                                <User className="h-4 w-4 text-human" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900">Human Decision</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {step.type === 'human' ? 'What decision or input are you providing?' : 'What decision did you make based on the AI output?'}
                            </p>
                            {step.type === 'human' && step.instructions && (
                              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                                <p className="text-sm text-blue-800">
                                  <strong>Instructions:</strong> {step.instructions}
                                </p>
                              </div>
                            )}
                            <textarea
                              rows={3}
                              value={stepInput}
                              onChange={(e) => handleStepInputChange(e.target.value)}
                              className="shadow-sm block w-full focus:ring-human focus:border-human sm:text-sm border border-gray-300 rounded-md"
                              placeholder={step.type === 'human' ? 'Describe your decision or input...' : 'Describe how you refined the AI output...'}
                            />
                          </div>

                          {/* AI Assist Section */}
                          {step.type === 'ai' && (
                            <div className="bg-white border border-green-200 rounded-lg p-4">
                              <div className="flex items-center mb-3">
                                <div className="h-8 w-8 rounded-full bg-ai-light flex items-center justify-center mr-3">
                                  <Bot className="h-4 w-4 text-ai" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">AI Assist</h3>
                              </div>
                              {step.system_prompt && (
                                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
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
                              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <p className="text-sm text-yellow-800">
                                  <strong>AI Output:</strong> [AI integration coming soon - this will show the actual AI response]
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Judgment Call Section */}
                          {step.type === 'ai' && (
                            <div className="bg-white border border-purple-200 rounded-lg p-4">
                              <div className="flex items-center mb-3">
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                  <svg className="h-4 w-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Judgment Call</h3>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">
                                How did you refine, filter, or improve the AI output?
                              </p>
                              <textarea
                                rows={2}
                                value={stepInput}
                                onChange={(e) => handleStepInputChange(e.target.value)}
                                className="shadow-sm block w-full focus:ring-purple-500 focus:border-purple-500 sm:text-sm border border-gray-300 rounded-md"
                                placeholder="Describe how you refined the AI output..."
                              />
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="flex justify-end">
                            <button
                              onClick={handleNextStep}
                              disabled={!stepInput.trim()}
                              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-human hover:bg-human-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {activeStep < workflow.steps.length - 1 ? 'Complete Step & Continue' : 'Complete Workflow'}
                            </button>
                          </div>
                        </div>
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