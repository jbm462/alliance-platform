import { useState, useEffect } from 'react';
import { Plus, X, MoveUp, MoveDown, User, Bot } from 'lucide-react';

interface WorkflowFormProps {
  initialSteps?: { type: 'human' | 'ai', label: string }[];
}

export default function WorkflowForm({ initialSteps }: WorkflowFormProps = {}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState([{ type: 'human', label: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [version, setVersion] = useState('1.0');
  const [notes, setNotes] = useState('');
  
  // Apply initial steps from document processing if provided
  useEffect(() => {
    if (initialSteps && initialSteps.length > 0) {
      setSteps(initialSteps);
    }
  }, [initialSteps]);

  const addStep = (type: 'human' | 'ai') => {
    setSteps([...steps, { type, label: '' }]);
  };
  
  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };
  
  const updateStep = (index: number, label: string) => {
    const newSteps = [...steps];
    newSteps[index].label = label;
    setSteps(newSteps);
  };

  const changeStepType = (index: number) => {
    const newSteps = [...steps];
    newSteps[index].type = newSteps[index].type === 'human' ? 'ai' : 'human';
    setSteps(newSteps);
  };
  
  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === steps.length - 1) return;
    
    const newSteps = [...steps];
    const step = newSteps[index];
    
    if (direction === 'up') {
      newSteps[index] = newSteps[index - 1];
      newSteps[index - 1] = step;
    } else {
      newSteps[index] = newSteps[index + 1];
      newSteps[index + 1] = step;
    }
    
    setSteps(newSteps);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          description, 
          steps,
          version,
          versionNotes: notes,
          createdAt: new Date().toISOString()
        }),
        credentials: 'include',
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setSteps([{ type: 'human', label: '' }]);
        setVersion('1.0');
        setNotes('');
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          errorData = { message: await response.text() };
        }
        console.error('Server error response:', response.status, errorData);
        setSubmitError(errorData.message || `Failed to create workflow. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      setSubmitError('An error occurred. Please try again. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-human focus:ring-human"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-human focus:ring-human"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Version</label>
        <input
          type="text"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-human focus:ring-human"
          placeholder="1.0"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Version Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-human focus:ring-human"
          placeholder="What's new in this version?"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Steps</label>
        <div className="mt-1 space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-2 p-4 rounded-md border border-gray-200">
              <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                step.type === 'human' ? 'bg-human-light' : 'bg-ai-light'
              }`}>
                {step.type === 'human' ? (
                  <User className="h-5 w-5 text-human" />
                ) : (
                  <Bot className="h-5 w-5 text-ai" />
                )}
              </div>
              
              <input
                type="text"
                value={step.label}
                onChange={(e) => updateStep(index, e.target.value)}
                placeholder={`${step.type === 'human' ? 'Human' : 'AI'} step description`}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-human focus:ring-human"
                required
              />
              
              <button
                type="button"
                onClick={() => changeStepType(index)}
                className={`px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white ${
                  step.type === 'human' ? 'bg-human hover:bg-human-dark' : 'bg-ai hover:bg-ai-dark'
                }`}
              >
                {step.type === 'human' ? 'Human' : 'AI'}
              </button>
              
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => moveStep(index, 'up')}
                  disabled={index === 0}
                  className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                >
                  <MoveUp className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(index, 'down')}
                  disabled={index === steps.length - 1}
                  className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                >
                  <MoveDown className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex space-x-2">
          <button
            type="button"
            onClick={() => addStep('human')}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-human hover:bg-human-dark"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Human Step
          </button>
          <button
            type="button"
            onClick={() => addStep('ai')}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-ai hover:bg-ai-dark"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add AI Step
          </button>
        </div>
      </div>
      
      {submitSuccess && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Workflow created successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {submitError}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-human hover:bg-human-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Workflow'}
        </button>
      </div>
    </form>
  );
} 