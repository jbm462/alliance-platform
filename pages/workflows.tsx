import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import { Plus, ArrowRight, ArrowDown, User, Bot, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
// Removed NextAuth import - using simplified auth

interface WorkflowStep {
  id: string;
  type: 'human' | 'ai' | 'client_validate';
  label: string;
  order_index: number;
}

interface Workflow {
  id: string;
  title: string;
  description: string;
  author_id: string;
  steps: WorkflowStep[];
  created_at: string;
  updated_at: string;
  version: string;
  is_public: boolean;
  category: string;
  // Optional properties for display
  author?: string;
  usageCount?: number;
  rating?: number;
}

const Workflows: NextPage = () => {
  const [workflowsData, setWorkflowsData] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/workflows');
        if (response.ok) {
          const data = await response.json();
          setWorkflowsData(data);
        }
      } catch (error) {
        console.error('Error fetching workflows:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkflows();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Human-AI Workflows | AllIance</title>
        <meta name="description" content="Create and discover human-AI collaboration workflows" />
      </Head>

      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Human-AI Workflows</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Link
            href="/workflows/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-human hover:bg-human-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Create New Workflow
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-human mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading workflows...</p>
          </div>
        </div>
      ) : workflowsData.length === 0 ? (
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new workflow.
            </p>
            <div className="mt-6">
              <Link
                href="/workflows/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-human hover:bg-human-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create New Workflow
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {workflowsData.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{workflow.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{workflow.description}</p>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500">Workflow Steps:</h4>
                  <div className="mt-2 space-y-2">
                    {workflow.steps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        {index > 0 && (
                          <div className="mr-3 flex flex-col items-center">
                            <ArrowDown className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          step.type === 'human' ? 'bg-human-light' : 'bg-ai-light'
                        }`}>
                          {step.type === 'human' ? (
                            <User className="h-4 w-4 text-human" />
                          ) : (
                            <Bot className="h-4 w-4 text-ai" />
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className={`text-sm ${step.type === 'human' ? 'text-human-dark font-medium' : 'text-ai-dark'}`}>
                            {step.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>By {workflow.author_id || 'Demo User'}</span>
                    <span className="mx-2">•</span>
                    <span>{workflow.steps.length} steps</span>
                    <span className="mx-2">•</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {workflow.category}
                    </span>
                  </div>
                  <Link 
                    href={`/workflows/${workflow.id}`}
                    className="inline-flex items-center text-sm font-medium text-human hover:text-human-dark"
                  >
                    View details
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Workflows; 