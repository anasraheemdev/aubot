export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }
  
  export interface ChatCompletionRequest {
    model: string;
    messages: Message[];
    temperature?: number;
    max_tokens?: number;
  }
  
  export interface ChatCompletionResponse {
    choices: {
      message: Message;
      finish_reason: string;
    }[];
  }
  
  export class OpenRouterClient {
    private apiKey: string;
    private baseUrl: string;
    private model: string;
  
    constructor(apiKey: string, model: string) {
      this.apiKey = apiKey;
      this.baseUrl = 'https://openrouter.ai/api/v1';
      this.model = model;
    }
  
    async createChatCompletion(messages: Message[]): Promise<string> {
      try {
        console.log('Making API request to OpenRouter with model:', this.model);
        
        const requestBody = {
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        };
        
        console.log('Request payload:', JSON.stringify(requestBody));
        
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': window.location.href,
            'X-Title': 'Startup Mentor Chatbot'
          },
          body: JSON.stringify(requestBody)
        });
  
        console.log('Response status:', response.status);
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        if (!response.ok) {
          return `Error ${response.status}: ${responseText}`;
        }
  
        const data = JSON.parse(responseText) as ChatCompletionResponse;
        
        if (!data.choices || data.choices.length === 0) {
          return "The API returned an empty response. Please check your model name and API key.";
        }
        
        return data.choices[0].message.content;
      } catch (error) {
        console.error('Error calling OpenRouter API:', error);
        return `API Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      }
    }
  }