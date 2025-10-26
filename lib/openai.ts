import OpenAI from 'openai';
import { supabase } from './supabase';

// Check if environment variable is defined
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error('Missing OpenAI API key');
}

// Create OpenAI client
export const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// Calculate API cost based on token usage for GPT-3.5 Turbo
export const calculateCost = (usage: { prompt_tokens: number; completion_tokens: number }) => {
  // GPT-3.5 Turbo pricing: $0.50 per 1M prompt tokens, $1.50 per 1M completion tokens
  const promptCost = (usage.prompt_tokens / 1000000) * 0.50;
  const completionCost = (usage.completion_tokens / 1000000) * 1.50;
  return promptCost + completionCost;
};

// Interpolate variables into prompts
export const interpolateInputs = (prompt: string, inputs: Record<string, any>): string => {
  let interpolatedPrompt = prompt;
  
  Object.entries(inputs).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    
    // Handle different types of values
    let stringValue = '';
    if (typeof value === 'object') {
      stringValue = JSON.stringify(value, null, 2);
    } else {
      stringValue = String(value);
    }
    
    interpolatedPrompt = interpolatedPrompt.replace(
      new RegExp(placeholder, 'g'),
      stringValue
    );
  });
  
  return interpolatedPrompt;
};

// Execute an AI step with OpenAI GPT-3.5 Turbo
export async function executeAIStep(step: any, inputs: any) {
  try {
    console.log('Executing AI step with model: gpt-3.5-turbo');
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('Step data:', JSON.stringify(step, null, 2));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: step.system_prompt || step.systemPrompt || 'You are a helpful assistant.' },
          { role: 'user', content: interpolateInputs(step.user_prompt || step.userPrompt || '', inputs) }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })
    
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error details:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
    
    const data = await response.json()
    
    // Calculate cost using GPT-5 Nano pricing
    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;
    const totalTokens = data.usage?.total_tokens || 0;
    const cost = calculateCost({ prompt_tokens: promptTokens, completion_tokens: completionTokens });
    
    return {
      content: data.choices[0].message.content,
      cost,
      tokens: totalTokens,
      promptTokens,
      completionTokens
    }
  } catch (error) {
    console.error('Error executing AI step:', error);
    throw new Error(`Failed to execute AI step: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 