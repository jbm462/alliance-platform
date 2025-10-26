import { useState } from 'react';
import { Upload, File, X, FileText } from 'lucide-react';

type Step = { type: 'human' | 'ai'; label: string };

interface DocumentInputProps {
  onExtractSteps: (steps: Step[]) => void;
}

export default function DocumentInput({ onExtractSteps }: DocumentInputProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState('');
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  const toggleTextInput = () => {
    setShowTextInput(!showTextInput);
  };
  
  const analyzeText = (text: string): Step[] => {
    // This is a simple mock implementation
    // In a real app, this would be done by an AI service
    
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const steps: Step[] = [];
    
    // Very basic parsing logic
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Try to determine if this step is better suited for AI or human
      if (
        lowerLine.includes('analyze') || 
        lowerLine.includes('extract') || 
        lowerLine.includes('calculate') || 
        lowerLine.includes('generate') || 
        lowerLine.includes('process') ||
        lowerLine.includes('summarize')
      ) {
        steps.push({ type: 'ai', label: line.trim() });
      } else if (
        lowerLine.includes('review') || 
        lowerLine.includes('decide') || 
        lowerLine.includes('evaluate') || 
        lowerLine.includes('recommend') || 
        lowerLine.includes('assess') ||
        lowerLine.includes('approve')
      ) {
        steps.push({ type: 'human', label: line.trim() });
      } else {
        // Default to human for undefined steps
        steps.push({ type: 'human', label: line.trim() });
      }
    }
    
    return steps;
  };
  
  const processContent = async () => {
    setIsProcessing(true);
    setProcessingError('');
    
    try {
      let extractedSteps: Step[] = [];
      
      if (showTextInput && textInput.trim()) {
        // Process text input directly
        extractedSteps = analyzeText(textInput);
      } else if (files.length > 0) {
        // Process uploaded files
        // For this demo, we'll just read the text content of the first file
        const file = files[0];
        const text = await readFileAsText(file);
        extractedSteps = analyzeText(text);
      } else {
        throw new Error('No content to process');
      }
      
      // If no steps were extracted, use some fallback steps
      if (extractedSteps.length === 0) {
        extractedSteps = [
          { type: 'ai', label: 'Extract key information from documents' },
          { type: 'human', label: 'Review extracted information and make corrections' },
          { type: 'ai', label: 'Generate initial analysis based on documents' }
        ];
      }
      
      onExtractSteps(extractedSteps);
    } catch (error) {
      console.error('Error processing content:', error);
      setProcessingError('Failed to process content. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => {
            setShowTextInput(false);
            setTextInput('');
          }}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            !showTextInput 
              ? 'bg-human text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Upload Files
        </button>
        <button
          type="button"
          onClick={() => {
            setShowTextInput(true);
            setFiles([]);
          }}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            showTextInput 
              ? 'bg-human text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Paste Text
        </button>
      </div>
      
      {!showTextInput ? (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="mt-1 text-sm text-gray-600">
            Upload documents to automatically extract workflow steps
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mt-2 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-human-light file:text-human
              hover:file:bg-human-light/90"
          />
        </div>
      ) : (
        <div className="border-2 border-gray-300 rounded-md p-4">
          <div className="flex items-center mb-2">
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            <h4 className="text-sm font-medium text-gray-700">Paste text from meeting notes, emails, or documents</h4>
          </div>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={6}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-human focus:ring-human text-sm"
            placeholder="Enter process steps or descriptions here..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Tip: Enter each step on a new line. The AI will analyze each line to determine if it's a human or AI step.
          </p>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
          <ul className="mt-2 divide-y divide-gray-200">
            {files.map((file, index) => (
              <li key={index} className="py-2 flex justify-between items-center">
                <div className="flex items-center">
                  <File className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">{file.name}</span>
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
      
      <button
        type="button"
        onClick={processContent}
        disabled={isProcessing || (files.length === 0 && (!textInput || textInput.trim().length === 0))}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-human hover:bg-human-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Process with AI'}
      </button>
      
      {processingError && (
        <p className="mt-2 text-sm text-red-600">{processingError}</p>
      )}
    </div>
  );
} 