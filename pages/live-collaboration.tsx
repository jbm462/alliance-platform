import type { NextPage } from 'next';
import Head from 'next/head';
import Layout from '../components/Layout';
import { useState, useEffect } from 'react';
import { User, Bot, Lightbulb, CheckCircle, Play, Pause, Save, FileText, Upload } from 'lucide-react';

interface CollaborationStep {
  id: string;
  type: 'human' | 'ai' | 'judgment' | 'insight';
  content: string;
  timestamp: string;
  aiOutput?: string;
  judgment?: string;
  insight?: string;
}

interface LiveSession {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  current_phase: string;
  phases: Array<{
    id: string;
    name: string;
    duration: string;
    status: 'active' | 'pending' | 'completed';
    steps: CollaborationStep[];
  }>;
  total_time_saved: number;
  traditional_time: number;
  ai_time: number;
  value_created: number;
}

const LiveCollaboration: NextPage = () => {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [activePhase, setActivePhase] = useState('requirements');

  // Start a new collaboration session
  const startSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/workflows/live-collaboration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Process Taxonomy Creation',
          description: 'Live collaboration to create a standard common process framework taxonomy'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        setActivePhase('requirements');
      }
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a human step
  const addHumanStep = async (content: string) => {
    if (!session || !content.trim()) return;

    try {
      const response = await fetch('/api/workflows/live-collaboration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          action: 'add_step',
          data: {
            phase: activePhase,
            type: 'human',
            content: content.trim()
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        setCurrentInput('');
      }
    } catch (error) {
      console.error('Error adding human step:', error);
    }
  };

  // Add an AI step
  const addAIStep = async (prompt: string) => {
    if (!session || !prompt.trim()) return;

    setIsAITyping(true);
    try {
      // Call AI API
      const aiResponse = await fetch('/api/ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: {
            type: 'ai',
            system_prompt: 'You are a business process expert. Provide detailed, actionable insights.',
            user_prompt: prompt
          },
          inputs: { userInput: prompt }
        })
      });

      let aiOutput = 'AI integration temporarily unavailable';
      let aiCost = 0;
      let aiTokens = 0;

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        aiOutput = aiData.content;
        aiCost = aiData.cost;
        aiTokens = aiData.tokens;
      }

      // Add AI step to session
      const response = await fetch('/api/workflows/live-collaboration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          action: 'add_step',
          data: {
            phase: activePhase,
            type: 'ai',
            content: prompt.trim(),
            aiOutput: aiOutput
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
      }
    } catch (error) {
      console.error('Error adding AI step:', error);
    } finally {
      setIsAITyping(false);
    }
  };

  // Add judgment step
  const addJudgmentStep = async (judgment: string) => {
    if (!session || !judgment.trim()) return;

    try {
      const response = await fetch('/api/workflows/live-collaboration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          action: 'add_step',
          data: {
            phase: activePhase,
            type: 'judgment',
            content: judgment.trim()
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
      }
    } catch (error) {
      console.error('Error adding judgment step:', error);
    }
  };

  // Add insight step
  const addInsightStep = async (insight: string) => {
    if (!session || !insight.trim()) return;

    try {
      const response = await fetch('/api/workflows/live-collaboration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          action: 'add_step',
          data: {
            phase: activePhase,
            type: 'insight',
            content: insight.trim()
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
      }
    } catch (error) {
      console.error('Error adding insight step:', error);
    }
  };

  // Get current phase
  const getCurrentPhase = () => {
    return session?.phases.find(p => p.id === activePhase);
  };

  if (!session) {
    return (
      <Layout>
        <Head>
          <title>Live Collaboration | AllIance</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Live Human-AI Collaboration</h1>
            <p className="text-lg text-gray-600 mb-8">Work together with AI in real-time to solve complex problems</p>
            <button
              onClick={startSession}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-human hover:bg-human-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-human disabled:opacity-50"
            >
              {isLoading ? 'Starting...' : 'Start Collaboration Session'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const currentPhase = getCurrentPhase();

  return (
    <Layout>
      <Head>
        <title>Live Collaboration | AllIance</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{session.title}</h1>
                <p className="text-sm text-gray-500">{session.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Save className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Phase Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Collaboration Phases</h3>
                <div className="space-y-3">
                  {session.phases.map((phase) => (
                    <div
                      key={phase.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        activePhase === phase.id
                          ? 'border-human bg-human-light'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setActivePhase(phase.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{phase.name}</span>
                        <span className="text-xs text-gray-500">{phase.duration}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {phase.steps.length} steps
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content - Live Collaboration */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Phase Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">{currentPhase?.name}</h2>
                  <p className="text-sm text-gray-500">{currentPhase?.duration}</p>
                </div>

                {/* Live Steps */}
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                  {currentPhase?.steps.map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.type === 'human' ? 'bg-blue-100' :
                        step.type === 'ai' ? 'bg-purple-100' :
                        step.type === 'judgment' ? 'bg-green-100' :
                        'bg-yellow-100'
                      }`}>
                        {step.type === 'human' ? <User className="h-4 w-4 text-blue-600" /> :
                         step.type === 'ai' ? <Bot className="h-4 w-4 text-purple-600" /> :
                         step.type === 'judgment' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                         <Lightbulb className="h-4 w-4 text-yellow-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-sm font-medium ${
                            step.type === 'human' ? 'text-blue-600' :
                            step.type === 'ai' ? 'text-purple-600' :
                            step.type === 'judgment' ? 'text-green-600' :
                            'text-yellow-600'
                          }`}>
                            {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">{step.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-900">{step.content}</p>
                        {step.aiOutput && (
                          <div className="mt-2 p-3 bg-purple-50 rounded-md">
                            <p className="text-sm text-purple-800">{step.aiOutput}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <textarea
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder="What are you working on? Describe your input, question, or observation..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-human focus:border-human sm:text-sm"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => addHumanStep(currentInput)}
                        disabled={!currentInput.trim()}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <User className="h-4 w-4 mr-1" />
                        Human Input
                      </button>
                      
                      <button
                        onClick={() => addAIStep(currentInput)}
                        disabled={!currentInput.trim() || isAITyping}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Bot className="h-4 w-4 mr-1" />
                        {isAITyping ? 'AI Thinking...' : 'Ask AI'}
                      </button>
                      
                      <button
                        onClick={() => addJudgmentStep(currentInput)}
                        disabled={!currentInput.trim()}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Judgment
                      </button>
                      
                      <button
                        onClick={() => addInsightStep(currentInput)}
                        disabled={!currentInput.trim()}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Lightbulb className="h-4 w-4 mr-1" />
                        Insight
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LiveCollaboration;
