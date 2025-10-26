import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ClientValidationPageProps {
  validation: {
    id: string;
    instance_id: string;
    step_id: string;
    status: string;
    secure_link: string;
    created_at: string;
    expires_at: string;
    completed_at?: string;
    instance: {
      workflow: {
        title: string;
        description: string;
      }
    }
  } | null;
  error?: string;
}

const ClientValidationPage: NextPage<ClientValidationPageProps> = ({ validation, error }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Handle expired validation
  const isExpired = validation && 
    (validation.status === 'expired' || new Date(validation.expires_at) < new Date());
  
  // Handle already completed validation
  const isCompleted = validation && validation.status === 'completed';
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setSubmitError('');
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation) {
      return;
    }
    
    if (files.length === 0) {
      setSubmitError('Please select at least one file to upload');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      files.forEach(file => {
        formData.append('file', file);
      });
      
      // Upload files
      const uploadResponses = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('instanceId', validation.instance_id);
          formData.append('stepId', validation.step_id);
          
          const response = await fetch('/api/file-upload', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }
          
          return file.name;
        })
      );
      
      // Complete the validation
      const completeResponse = await fetch(`/api/client-validations/${validation.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: uploadResponses
        })
      });
      
      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(errorData.message || 'Failed to complete validation');
      }
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting validation:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Head>
          <title>Error | Client Upload</title>
        </Head>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!validation) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Head>
          <title>Loading | Client Upload</title>
        </Head>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <p className="text-center text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Client Upload | {validation.instance.workflow.title}</title>
      </Head>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Secure Upload Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {validation.instance.workflow.title}
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isExpired ? (
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    This upload link has expired
                  </h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    Please contact the person who sent you this link for assistance.
                  </p>
                </div>
              </div>
            </div>
          ) : isCompleted ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Upload completed
                  </h3>
                  <p className="mt-2 text-sm text-green-700">
                    Thank you for providing the requested files. You may close this page.
                  </p>
                </div>
              </div>
            </div>
          ) : submitSuccess ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Files uploaded successfully
                  </h3>
                  <p className="mt-2 text-sm text-green-700">
                    Thank you for providing the requested files. You may close this page.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="text-sm text-gray-700 mb-4">
                  {validation.instance.workflow.description}
                </p>
                <p className="text-sm text-gray-700 mb-4">
                  Please upload any relevant documents that will help us understand your processes better.
                  This could include organization charts, process documentation, time studies, or other materials.
                </p>
                <p className="text-xs text-gray-500 mb-6">
                  This secure link will expire on {new Date(validation.expires_at).toLocaleDateString()}.
                </p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="mt-1 text-sm text-gray-600">
                  Upload files
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="mt-2 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>
              
              {files.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                  <ul className="mt-2 divide-y divide-gray-200">
                    {files.map((file, index) => (
                      <li key={index} className="py-2 flex justify-between items-center">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="ml-2 text-xs text-gray-500">({(file.size / 1024).toFixed(0)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {submitError && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || files.length === 0}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Uploading...' : 'Upload Files'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  
  try {
    // Fetch the client validation
    const { data, error } = await supabase
      .from('client_validations')
      .select(`
        *,
        instance:workflow_instances(
          *,
          workflow:workflows(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      return {
        props: {
          validation: null,
          error: 'Client validation not found'
        }
      };
    }
    
    return {
      props: {
        validation: data
      }
    };
  } catch (error) {
    console.error('Error fetching client validation:', error);
    
    return {
      props: {
        validation: null,
        error: 'Failed to load client validation'
      }
    };
  }
};

export default ClientValidationPage; 