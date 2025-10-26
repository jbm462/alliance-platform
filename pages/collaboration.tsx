import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import Layout from '../components/Layout';
import { Send, User, Bot, Plus, X } from 'lucide-react';

const Collaboration: NextPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'human', name: 'Sarah Johnson', content: 'I need to analyze the Q3 financial data for TechCorp. Can we collaborate on this?', timestamp: '10:30 AM' },
    { id: 2, sender: 'ai', name: 'FinanceGPT', content: 'Of course, Sarah. I can help analyze the Q3 financial data. Would you like me to start by extracting key metrics from the reports?', timestamp: '10:31 AM' },
    { id: 3, sender: 'human', name: 'Sarah Johnson', content: 'Yes, please focus on revenue growth, profit margins, and cash flow trends compared to previous quarters.', timestamp: '10:33 AM' },
    { id: 4, sender: 'ai', name: 'FinanceGPT', content: 'I\'ve analyzed the data and found the following key insights:\n\n- Revenue grew 12% YoY, but declined 3% from Q2\n- Profit margins expanded to 28%, up from 25% in Q2\n- Operating cash flow increased by 15% from the previous quarter\n\nWould you like me to visualize these trends?', timestamp: '10:35 AM' },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Sarah Johnson', type: 'human', role: 'Financial Analyst' },
    { id: 2, name: 'FinanceGPT', type: 'ai', role: 'Financial AI Assistant' },
  ]);
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const newId = messages.length + 1;
    setMessages([
      ...messages,
      {
        id: newId,
        sender: 'human',
        name: 'Sarah Johnson',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    
    setNewMessage('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          sender: 'ai',
          name: 'FinanceGPT',
          content: 'I\'ll analyze this further and provide strategic recommendations based on these financial trends. Would you like me to focus on any specific area of the business?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };
  
  return (
    <Layout>
      <Head>
        <title>Collaboration Environment | AllIance</title>
        <meta name="description" content="Collaborate with AI and human experts" />
      </Head>
      
      <div className="flex flex-col h-[calc(100vh-16rem)]">
        <div className="pb-5 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Financial Analysis Collaboration</h1>
          <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-human hover:bg-human-dark">
            Save Session
          </button>
        </div>
        
        {/* Main collaboration area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'human' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 rounded-lg px-4 py-2 ${
                      message.sender === 'human' 
                        ? 'bg-human text-white' 
                        : 'bg-ai-light text-gray-800'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <span className="font-medium text-sm">
                        {message.name}
                      </span>
                      <span className="ml-2 text-xs opacity-75">
                        {message.timestamp}
                      </span>
                    </div>
                    <div className="whitespace-pre-line">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-human focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-human hover:bg-human-dark text-white px-4 py-2 rounded-r-md"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Participants sidebar */}
          <div className="w-64 border-l border-gray-200 p-4 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Participants</h2>
            <div className="space-y-3">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      participant.type === 'human' ? 'bg-human-light' : 'bg-ai-light'
                    }`}>
                      {participant.type === 'human' ? (
                        <User className={`h-4 w-4 ${participant.type === 'human' ? 'text-human' : 'text-ai'}`} />
                      ) : (
                        <Bot className={`h-4 w-4 ${participant.type === 'human' ? 'text-human' : 'text-ai'}`} />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                      <p className="text-xs text-gray-500">{participant.role}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <button className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-human hover:bg-human-dark">
              <Plus className="h-4 w-4 mr-2" />
              Add Participant
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Collaboration; 