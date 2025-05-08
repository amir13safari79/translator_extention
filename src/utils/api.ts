import { ApiChoice } from './storage';

// API call timeout in milliseconds (60 seconds)
const API_TIMEOUT = 60000;

/**
 * Create a promise that rejects after the specified timeout
 */
function timeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    timeoutPromise(timeout)
  ]);
}

/**
 * Translate text to Persian using the selected API service
 */
export async function translateText(text: string, apiKey: string, apiChoice: ApiChoice): Promise<string> {
  if (apiChoice === 'grok') {
    return translateWithGrok(text, apiKey);
  } else {
    return translateWithGPT(text, apiKey);
  }
}

/**
 * Translate text to Persian using OpenAI's GPT API
 */
async function translateWithGPT(text: string, apiKey: string): Promise<string> {
  try {
    const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a high-quality translator from any language to Persian (Farsi). Translate the user\'s text to natural, fluent Persian. Provide ONLY the translation without any explanations, notes, or original text.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      })
    }, API_TIMEOUT);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'No translation received';
  } catch (error) {
    console.error('Translation API error:', error);
    if (error instanceof Error && error.message.includes('timed out')) {
      throw new Error('GPT API request timed out. Please try again later.');
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to translate text with GPT');
  }
}

/**
 * Translate text to Persian using Grok API
 */
async function translateWithGrok(text: string, apiKey: string): Promise<string> {
  try {
    const response = await fetchWithTimeout('https://api.grok.x/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a high-quality translator from any language to Persian (Farsi). Translate the user\'s text to natural, fluent Persian. Provide ONLY the translation without any explanations, notes, or original text.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3
      })
    }, API_TIMEOUT);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'No translation received';
  } catch (error) {
    console.error('Translation API error:', error);
    if (error instanceof Error && error.message.includes('timed out')) {
      throw new Error('Grok API request timed out. Please try again later.');
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to translate text with Grok');
  }
} 