import { useState } from 'react';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';

interface APQCUploaderProps {
  instanceId?: string;
  stepId?: string;
  onProcessComplete: (data: any) => void;
}

export default function APQCUploader({ instanceId, stepId, onProcessComplete }: APQCUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      
      // Check if file type is supported
      if (extension !== 'xlsx' && extension !== 'xls' && extension !== 'csv') {
        setUploadError('Only Excel (.xlsx, .xls) and CSV files are supported.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setUploadError('');
      setUploadSuccess(false);
      setPreviewData([]);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }
    
    setIsUploading(true);
    setUploadError('');
    setUploadSuccess(false);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Add instance and step IDs if provided
      if (instanceId) {
        formData.append('instanceId', instanceId);
      }
      
      if (stepId) {
        formData.append('stepId', stepId);
      }
      
      // Upload the file
      const response = await fetch('/api/file-upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }
      
      const data = await response.json();
      
      // Check if data appears to be APQC taxonomy
      const hasProcessColumns = data.data.some((row: any) => {
        const keys = Object.keys(row).map(k => k.toLowerCase());
        return keys.some(k => 
          k.includes('process') || 
          k.includes('activity') || 
          k.includes('category') ||
          k.includes('level')
        );
      });
      
      if (!hasProcessColumns) {
        setUploadError('The uploaded file does not appear to be an APQC taxonomy. Please ensure the file contains process data.');
        setIsUploading(false);
        return;
      }
      
      // Set preview data (limited to 5 rows)
      setPreviewData(data.data.slice(0, 5));
      
      // Set success and call callback
      setUploadSuccess(true);
      onProcessComplete(data.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
        <Upload className="h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Upload APQC taxonomy or other process framework file
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supported formats: Excel (.xlsx, .xls), CSV
        </p>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="mt-4 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-human-light file:text-human
            hover:file:bg-human-light/90"
        />
      </div>
      
      {file && (
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">{file.name}</span>
            <span className="ml-2 text-xs text-gray-500">({(file.size / 1024).toFixed(0)} KB)</span>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-human hover:bg-human-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human disabled:opacity-50"
          >
            {isUploading ? 'Processing...' : 'Process Taxonomy'}
          </button>
        </div>
      )}
      
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{uploadError}</p>
          </div>
        </div>
      )}
      
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <Check className="h-5 w-5 text-green-400" />
            <p className="ml-3 text-sm text-green-700">
              Taxonomy processed successfully!
            </p>
          </div>
        </div>
      )}
      
      {previewData.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700">Data Preview (First 5 rows)</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(previewData[0]).map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((cell: any, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 