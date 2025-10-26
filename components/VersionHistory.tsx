import { History, ArrowDown } from 'lucide-react';

interface Version {
  version: string;
  date: string;
  notes: string;
  author: string;
}

interface VersionHistoryProps {
  workflowId: string;
  currentVersion: string;
}

export default function VersionHistory({ workflowId, currentVersion }: VersionHistoryProps) {
  // In a real app, this would fetch version history from an API
  // For now, we'll use mock data
  const versionHistory: Version[] = [
    {
      version: '2.1',
      date: '2023-06-15',
      notes: 'Added visualization step and improved strategic recommendations.',
      author: 'Sarah Johnson'
    },
    {
      version: '2.0',
      date: '2023-05-22',
      notes: 'Complete redesign with AI-driven initial analysis step.',
      author: 'Sarah Johnson'
    },
    {
      version: '1.3',
      date: '2023-04-10',
      notes: 'Added industry context step for better contextualization.',
      author: 'Michael Chen'
    },
    {
      version: '1.2',
      date: '2023-03-05',
      notes: 'Improved metric extraction algorithm.',
      author: 'Sarah Johnson'
    },
    {
      version: '1.1',
      date: '2023-02-18',
      notes: 'Added formatting step for final report.',
      author: 'David Wilson'
    },
    {
      version: '1.0',
      date: '2023-01-30',
      notes: 'Initial version of financial report analysis workflow.',
      author: 'Sarah Johnson'
    }
  ];
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Version History</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Track the evolution of this workflow over time
          </p>
        </div>
        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
          <History className="h-4 w-4 text-gray-500 mr-1" />
          <span className="text-sm font-medium text-gray-700">Current: v{currentVersion}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {versionHistory.map((version, index) => (
            <li key={index} className={`px-4 py-4 sm:px-6 ${version.version === currentVersion ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    version.version === currentVersion ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <span className={`text-sm font-medium ${
                      version.version === currentVersion ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      v{version.version}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      version.version === currentVersion ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {version.notes}
                    </p>
                    <div className="flex mt-1">
                      <p className="text-xs text-gray-500">
                        {version.author}
                      </p>
                      <span className="mx-1 text-gray-500">•</span>
                      <p className="text-xs text-gray-500">
                        {version.date}
                      </p>
                    </div>
                  </div>
                </div>
                
                {version.version === currentVersion ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Current
                  </span>
                ) : (
                  <button 
                    className="text-sm text-human hover:text-human-dark font-medium"
                    onClick={() => {
                      // In a real app, this would restore this version
                      alert(`Restoring version ${version.version}`);
                    }}
                  >
                    Restore
                  </button>
                )}
              </div>
              
              {index < versionHistory.length - 1 && (
                <div className="flex justify-center mt-2">
                  <ArrowDown className="h-4 w-4 text-gray-300" />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 