import { Clock, UserCheck, Cpu, Users, Hourglass, Repeat, DollarSign, Award } from 'lucide-react';

interface WorkflowMetrics {
  totalExecutionTime: number;
  humanTimeSpent: number;
  aiProcessingTime: number;
  waitingOnClientTime: number;
  totalCost: number;
  stepsCompleted: number;
  outputQualityScore?: number;
}

interface MetricsDisplayProps {
  metrics: WorkflowMetrics;
  industryAverage?: {
    totalExecutionTime: number;
    totalCost: number;
  };
}

export default function MetricsDisplay({ metrics, industryAverage }: MetricsDisplayProps) {
  // Calculate time savings if industry average is provided
  const timeSavings = industryAverage
    ? ((industryAverage.totalExecutionTime - metrics.totalExecutionTime) / industryAverage.totalExecutionTime) * 100
    : null;
  
  // Calculate cost savings if industry average is provided
  const costSavings = industryAverage
    ? ((industryAverage.totalCost - metrics.totalCost) / industryAverage.totalCost) * 100
    : null;
  
  // Calculate AI contribution percentage
  const aiContribution = (metrics.aiProcessingTime / metrics.totalExecutionTime) * 100;
  
  // Format time in hours and minutes
  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes}m`;
    }
    
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Workflow Execution Metrics
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Real-time metrics showing actual performance and value generation
        </p>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Execution Time */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-human bg-opacity-10 rounded-md p-3">
                    <Clock className="h-6 w-6 text-human" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Execution Time
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {formatTime(metrics.totalExecutionTime)}
                        </div>
                        
                        {timeSavings !== null && (
                          <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                            {timeSavings.toFixed(0)}% faster
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Human Time */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-human bg-opacity-10 rounded-md p-3">
                    <UserCheck className="h-6 w-6 text-human" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Human Time Spent
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {formatTime(metrics.humanTimeSpent)}
                        </div>
                        
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                          {((metrics.humanTimeSpent / metrics.totalExecutionTime) * 100).toFixed(0)}%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Processing Time */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-ai bg-opacity-10 rounded-md p-3">
                    <Cpu className="h-6 w-6 text-ai" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        AI Processing Time
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {formatTime(metrics.aiProcessingTime)}
                        </div>
                        
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                          {aiContribution.toFixed(0)}%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Client Wait Time */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                    <Hourglass className="h-6 w-6 text-yellow-800" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Client Wait Time
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {formatTime(metrics.waitingOnClientTime)}
                        </div>
                        
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                          {((metrics.waitingOnClientTime / metrics.totalExecutionTime) * 100).toFixed(0)}%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* API Cost */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <DollarSign className="h-6 w-6 text-green-800" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        AI API Cost
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          ${metrics.totalCost.toFixed(2)}
                        </div>
                        
                        {costSavings !== null && (
                          <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                            {costSavings.toFixed(0)}% savings
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Steps Completed */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <Repeat className="h-6 w-6 text-blue-800" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Steps Completed
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {metrics.stepsCompleted}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quality Score (if available) */}
            {metrics.outputQualityScore !== undefined && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <Award className="h-6 w-6 text-purple-800" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Output Quality Score
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {metrics.outputQualityScore.toFixed(1)}/5.0
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Industry Comparison (if available) */}
            {industryAverage && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                      <Users className="h-6 w-6 text-indigo-800" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Traditional Process Time
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {formatTime(industryAverage.totalExecutionTime)}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Summary at bottom */}
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="text-sm text-gray-700">
          {timeSavings !== null ? (
            <p>
              <span className="font-medium text-green-600">{timeSavings.toFixed(0)}% faster</span> than 
              traditional methods, with an AI contribution of <span className="font-medium text-ai">{aiContribution.toFixed(0)}%</span>.
              {costSavings !== null && (
                <span> Cost savings of <span className="font-medium text-green-600">${(industryAverage!.totalCost - metrics.totalCost).toFixed(2)}</span>.</span>
              )}
            </p>
          ) : (
            <p>
              AI contribution: <span className="font-medium text-ai">{aiContribution.toFixed(0)}%</span> of total execution time.
              Human experts focused on high-value strategic tasks.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 