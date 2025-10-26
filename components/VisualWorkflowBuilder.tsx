import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  MarkerType,
  NodeProps,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { User, Cpu, FileQuestion, Plus, X, Edit, ChevronDown, ChevronUp } from 'lucide-react';

// Node types
const nodeTypes = {
  human: HumanNode,
  ai: AINode,
  client_validate: ClientValidationNode
};

// Custom node components
function HumanNode({ id, data }: NodeProps) {
  return (
    <div className="bg-white border-2 border-human rounded-md p-4 shadow-md w-60">
      <div className="flex items-center mb-2">
        <div className="bg-human bg-opacity-10 p-2 rounded-full mr-2">
          <User className="h-5 w-5 text-human" />
        </div>
        <div className="font-medium text-human">Human Step</div>
        {data.showControls && (
          <div className="ml-auto flex">
            <button
              onClick={data.onEdit}
              className="text-gray-500 hover:text-gray-700 mr-1"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => data.onDelete(id)}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="text-sm font-medium text-gray-900 mb-1">{data.label}</div>
      {data.instructions && (
        <div className="text-xs text-gray-500 mt-1 truncate">
          {data.instructions.substring(0, 60)}
          {data.instructions.length > 60 ? '...' : ''}
        </div>
      )}
    </div>
  );
}

function AINode({ id, data }: NodeProps) {
  return (
    <div className="bg-white border-2 border-ai rounded-md p-4 shadow-md w-60">
      <div className="flex items-center mb-2">
        <div className="bg-ai bg-opacity-10 p-2 rounded-full mr-2">
          <Cpu className="h-5 w-5 text-ai" />
        </div>
        <div className="font-medium text-ai">AI Step</div>
        {data.showControls && (
          <div className="ml-auto flex">
            <button
              onClick={data.onEdit}
              className="text-gray-500 hover:text-gray-700 mr-1"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => data.onDelete(id)}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="text-sm font-medium text-gray-900 mb-1">{data.label}</div>
      {data.systemPrompt && (
        <div className="text-xs text-gray-500 mt-1 truncate">
          {data.systemPrompt.substring(0, 60)}
          {data.systemPrompt.length > 60 ? '...' : ''}
        </div>
      )}
    </div>
  );
}

function ClientValidationNode({ id, data }: NodeProps) {
  return (
    <div className="bg-white border-2 border-orange-500 rounded-md p-4 shadow-md w-60">
      <div className="flex items-center mb-2">
        <div className="bg-orange-100 p-2 rounded-full mr-2">
          <FileQuestion className="h-5 w-5 text-orange-500" />
        </div>
        <div className="font-medium text-orange-600">Client Validation</div>
        {data.showControls && (
          <div className="ml-auto flex">
            <button
              onClick={data.onEdit}
              className="text-gray-500 hover:text-gray-700 mr-1"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => data.onDelete(id)}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="text-sm font-medium text-gray-900 mb-1">{data.label}</div>
      {data.instructions && (
        <div className="text-xs text-gray-500 mt-1 truncate">
          {data.instructions.substring(0, 60)}
          {data.instructions.length > 60 ? '...' : ''}
        </div>
      )}
    </div>
  );
}

// Interface for the steps
interface WorkflowStep {
  id: string;
  type: 'human' | 'ai' | 'client_validate';
  label: string;
  systemPrompt?: string;
  userPrompt?: string;
  instructions?: string;
}

interface VisualWorkflowBuilderProps {
  initialSteps?: WorkflowStep[];
  readOnly?: boolean;
  currentStepIndex?: number;
  onStepsChange?: (steps: WorkflowStep[]) => void;
}

// Main component
export default function VisualWorkflowBuilder({
  initialSteps = [],
  readOnly = false,
  currentStepIndex = -1,
  onStepsChange
}: VisualWorkflowBuilderProps) {
  // Reference to the ReactFlow instance
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  
  // States for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // State for the step being edited
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  
  // Load initial steps
  useEffect(() => {
    if (initialSteps && initialSteps.length > 0) {
      const newNodes: Node[] = initialSteps.map((step, index) => ({
        id: step.id,
        type: step.type,
        position: { x: 250, y: 100 + index * 150 },
        data: {
          ...step,
          showControls: !readOnly,
          onEdit: () => {
            setEditingStep(step);
            setShowEditor(true);
          },
          onDelete: (id: string) => {
            if (window.confirm('Are you sure you want to delete this step?')) {
              const updatedNodes = nodes.filter(node => node.id !== id);
              setNodes(updatedNodes);
              
              // Update edges
              const updatedEdges = edges.filter(
                edge => edge.source !== id && edge.target !== id
              );
              setEdges(updatedEdges);
              
              // Notify parent component
              if (onStepsChange) {
                const updatedSteps = updatedNodes
                  .sort((a, b) => (a.position.y - b.position.y))
                  .map(node => ({
                    id: node.id,
                    type: node.type as 'human' | 'ai' | 'client_validate',
                    label: node.data.label,
                    systemPrompt: node.data.systemPrompt,
                    userPrompt: node.data.userPrompt,
                    instructions: node.data.instructions
                  }));
                
                onStepsChange(updatedSteps);
              }
            }
          }
        },
        className: currentStepIndex === index ? 'border-4 border-blue-500' : ''
      }));
      
      // Create edges between nodes
      const newEdges: Edge[] = [];
      
      for (let i = 0; i < newNodes.length - 1; i++) {
        newEdges.push({
          id: `e${newNodes[i].id}-${newNodes[i + 1].id}`,
          source: newNodes[i].id,
          target: newNodes[i + 1].id,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20
          },
          style: {
            strokeWidth: 2,
            stroke: '#64748b'
          }
        });
      }
      
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [initialSteps, currentStepIndex]);
  
  // Handle adding a new step
  const addStep = (type: 'human' | 'ai' | 'client_validate') => {
    const newId = `step_${Date.now()}`;
    const lastNode = nodes.length > 0 
      ? nodes.reduce((prev, current) => 
          prev.position.y > current.position.y ? prev : current
        ) 
      : null;
    
    const yPos = lastNode ? lastNode.position.y + 150 : 100;
    
    const newNode: Node = {
      id: newId,
      type,
      position: { x: 250, y: yPos },
      data: {
        id: newId,
        type,
        label: type === 'human' 
          ? 'New Human Step' 
          : type === 'ai' 
            ? 'New AI Step' 
            : 'New Client Validation',
        showControls: true,
        onEdit: () => {
          setEditingStep({
            id: newId,
            type,
            label: type === 'human' 
              ? 'New Human Step' 
              : type === 'ai' 
                ? 'New AI Step' 
                : 'New Client Validation'
          });
          setShowEditor(true);
        },
        onDelete: (id: string) => {
          if (window.confirm('Are you sure you want to delete this step?')) {
            setNodes(nodes.filter(node => node.id !== id));
          }
        }
      }
    };
    
    // Add an edge if there are existing nodes
    if (lastNode) {
      const newEdge: Edge = {
        id: `e${lastNode.id}-${newId}`,
        source: lastNode.id,
        target: newId,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20
        },
        style: {
          strokeWidth: 2,
          stroke: '#64748b'
        }
      };
      
      setEdges([...edges, newEdge]);
    }
    
    // Add the new node
    setNodes([...nodes, newNode]);
    
    // Notify parent component
    if (onStepsChange) {
      const updatedSteps = [...nodes, newNode]
        .sort((a, b) => (a.position.y - b.position.y))
        .map(node => ({
          id: node.id,
          type: node.data.type,
          label: node.data.label,
          systemPrompt: node.data.systemPrompt,
          userPrompt: node.data.userPrompt,
          instructions: node.data.instructions
        }));
      
      onStepsChange(updatedSteps);
    }
  };
  
  // Handle updating a step
  const updateStep = (updatedStep: WorkflowStep) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === updatedStep.id) {
        return {
          ...node,
          data: {
            ...node.data,
            ...updatedStep
          }
        };
      }
      return node;
    });
    
    setNodes(updatedNodes);
    setShowEditor(false);
    setEditingStep(null);
    
    // Notify parent component
    if (onStepsChange) {
      const updatedSteps = updatedNodes
        .sort((a, b) => (a.position.y - b.position.y))
        .map(node => ({
          id: node.id,
          type: node.data.type,
          label: node.data.label,
          systemPrompt: node.data.systemPrompt,
          userPrompt: node.data.userPrompt,
          instructions: node.data.instructions
        }));
      
      onStepsChange(updatedSteps);
    }
  };
  
  // Get steps in order
  const getOrderedSteps = useCallback(() => {
    return nodes
      .sort((a, b) => (a.position.y - b.position.y))
      .map(node => ({
        id: node.id,
        type: node.data.type,
        label: node.data.label,
        systemPrompt: node.data.systemPrompt,
        userPrompt: node.data.userPrompt,
        instructions: node.data.instructions
      }));
  }, [nodes]);
  
  // Handle node drag end
  const onNodeDragStop = useCallback(() => {
    // Notify parent component of order change
    if (onStepsChange) {
      onStepsChange(getOrderedSteps());
    }
  }, [onStepsChange, getOrderedSteps]);
  
  return (
    <ReactFlowProvider>
      <div ref={reactFlowWrapper} style={{ height: 600 }} className="border border-gray-200 rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeDragStop={onNodeDragStop}
          fitView
        >
          <Background />
          <Controls />
          
          {!readOnly && (
            <Panel position="top-right">
              <div className="bg-white p-2 rounded-md shadow-md">
                <div className="text-sm font-medium mb-2">Add Step:</div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => addStep('human')}
                    className="flex items-center bg-human text-white px-3 py-2 rounded-md text-sm"
                  >
                    <User className="h-4 w-4 mr-1" />
                    Human
                  </button>
                  
                  <button
                    onClick={() => addStep('ai')}
                    className="flex items-center bg-ai text-white px-3 py-2 rounded-md text-sm"
                  >
                    <Cpu className="h-4 w-4 mr-1" />
                    AI
                  </button>
                  
                  <button
                    onClick={() => addStep('client_validate')}
                    className="flex items-center bg-orange-500 text-white px-3 py-2 rounded-md text-sm"
                  >
                    <FileQuestion className="h-4 w-4 mr-1" />
                    Client
                  </button>
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
      
      {/* Step Editor */}
      {showEditor && editingStep && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingStep.type === 'human' 
                  ? 'Edit Human Step' 
                  : editingStep.type === 'ai' 
                    ? 'Edit AI Step' 
                    : 'Edit Client Validation Step'}
              </h3>
              <button
                onClick={() => setShowEditor(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="step-label" className="block text-sm font-medium text-gray-700">
                  Step Label
                </label>
                <input
                  type="text"
                  id="step-label"
                  value={editingStep.label}
                  onChange={(e) => setEditingStep({ ...editingStep, label: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              {editingStep.type === 'human' && (
                <div>
                  <label htmlFor="step-instructions" className="block text-sm font-medium text-gray-700">
                    Instructions
                  </label>
                  <textarea
                    id="step-instructions"
                    rows={4}
                    value={editingStep.instructions || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, instructions: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Instructions for this human step..."
                  />
                </div>
              )}
              
              {editingStep.type === 'ai' && (
                <>
                  <div>
                    <label htmlFor="system-prompt" className="block text-sm font-medium text-gray-700">
                      System Prompt
                    </label>
                    <textarea
                      id="system-prompt"
                      rows={3}
                      value={editingStep.systemPrompt || ''}
                      onChange={(e) => setEditingStep({ ...editingStep, systemPrompt: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="System prompt for the AI..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="user-prompt" className="block text-sm font-medium text-gray-700">
                      User Prompt
                    </label>
                    <textarea
                      id="user-prompt"
                      rows={5}
                      value={editingStep.userPrompt || ''}
                      onChange={(e) => setEditingStep({ ...editingStep, userPrompt: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="User prompt template (use {{variables}} for dynamic content)..."
                    />
                  </div>
                </>
              )}
              
              {editingStep.type === 'client_validate' && (
                <div>
                  <label htmlFor="client-instructions" className="block text-sm font-medium text-gray-700">
                    Client Instructions
                  </label>
                  <textarea
                    id="client-instructions"
                    rows={4}
                    value={editingStep.instructions || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, instructions: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Instructions for the client..."
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStep(editingStep)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Save Step
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ReactFlowProvider>
  );
} 