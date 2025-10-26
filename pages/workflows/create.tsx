import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import WorkflowForm from '../../components/WorkflowForm';
import { useSession } from 'next-auth/react';
import DocumentInput from '../../components/DocumentInput';
import { useState } from 'react';

const CreateWorkflow: NextPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [extractedSteps, setExtractedSteps] = useState<{ type: 'human' | 'ai', label: string }[]>();
  
  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
  }
  
  const handleExtractSteps = (steps: { type: 'human' | 'ai', label: string }[]) => {
    setExtractedSteps(steps);
  };
  
  return (
    <Layout>
      <Head>
        <title>Create Workflow | AllIance</title>
        <meta name="description" content="Create a new human-AI collaboration workflow" />
      </Head>
      
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Create New Workflow</h1>
        <p className="mt-1 text-sm text-gray-500">
          Design a workflow that combines human expertise with AI capabilities
        </p>
      </div>
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Extract Steps from Documents</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Upload meeting notes, emails, or other documents to automatically extract workflow steps.</p>
          </div>
          <div className="mt-5">
            <DocumentInput onExtractSteps={handleExtractSteps} />
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <WorkflowForm initialSteps={extractedSteps} />
        </div>
      </div>
    </Layout>
  );
};

export default CreateWorkflow; 