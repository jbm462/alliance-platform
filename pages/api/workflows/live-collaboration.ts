import type { NextApiRequest, NextApiResponse } from 'next';

// Live collaboration workflow instances
let liveWorkflows: any[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Start a new live collaboration session
      const sessionId = `session-${Date.now()}`;
      const now = new Date().toISOString();
      
      const newSession = {
        id: sessionId,
        title: req.body.title || 'Live Collaboration Session',
        description: req.body.description || 'Real-time human-AI collaboration',
        started_at: now,
        status: 'active',
        current_phase: 'requirements',
        phases: [
          {
            id: 'requirements',
            name: 'Gather Requirements',
            duration: '0:00 - 0:15',
            status: 'active',
            steps: []
          },
          {
            id: 'analysis',
            name: 'Analysis & Planning',
            duration: '0:15 - 0:45',
            status: 'pending',
            steps: []
          },
          {
            id: 'execution',
            name: 'Execute & Refine',
            duration: '0:45 - 2:00',
            status: 'pending',
            steps: []
          }
        ],
        total_time_saved: 0,
        traditional_time: 0,
        ai_time: 0,
        value_created: 0,
        created_at: now,
        updated_at: now
      };
      
      liveWorkflows.push(newSession);
      
      return res.status(201).json({
        session: newSession,
        message: 'Live collaboration session started'
      });
    } catch (error) {
      console.error('Error starting live session:', error);
      return res.status(500).json({ error: 'Failed to start live session' });
    }
  }
  
  if (req.method === 'GET') {
    try {
      const { sessionId } = req.query;
      
      if (sessionId) {
        const session = liveWorkflows.find(s => s.id === sessionId);
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }
        return res.status(200).json({ session });
      } else {
        return res.status(200).json({ sessions: liveWorkflows });
      }
    } catch (error) {
      console.error('Error fetching live sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }
  
  if (req.method === 'PUT') {
    try {
      const { sessionId, action, data } = req.body;
      
      const session = liveWorkflows.find(s => s.id === sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      if (action === 'add_step') {
        const { phase, type, content, aiOutput, judgment, insight } = data;
        
        const step = {
          id: `step-${Date.now()}`,
          type, // 'human', 'ai', 'judgment', 'insight'
          content,
          aiOutput,
          judgment,
          insight,
          timestamp: new Date().toISOString()
        };
        
        const phaseIndex = session.phases.findIndex((p: any) => p.id === phase);
        if (phaseIndex !== -1) {
          session.phases[phaseIndex].steps.push(step);
          session.updated_at = new Date().toISOString();
        }
        
        return res.status(200).json({ session });
      }
      
      if (action === 'update_phase') {
        const { phase, status } = data;
        const phaseIndex = session.phases.findIndex((p: any) => p.id === phase);
        if (phaseIndex !== -1) {
          session.phases[phaseIndex].status = status;
          session.current_phase = phase;
          session.updated_at = new Date().toISOString();
        }
        
        return res.status(200).json({ session });
      }
      
      if (action === 'update_metrics') {
        const { total_time_saved, traditional_time, ai_time, value_created } = data;
        session.total_time_saved = total_time_saved || session.total_time_saved;
        session.traditional_time = traditional_time || session.traditional_time;
        session.ai_time = ai_time || session.ai_time;
        session.value_created = value_created || session.value_created;
        session.updated_at = new Date().toISOString();
        
        return res.status(200).json({ session });
      }
      
      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Error updating live session:', error);
      return res.status(500).json({ error: 'Failed to update session' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
