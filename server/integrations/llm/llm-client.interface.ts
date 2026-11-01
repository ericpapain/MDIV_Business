export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | any[];
}

export interface ILlmProvider {
  name: 'groq' | 'openai' | 'mistral';
  call(messages: ChatMessage[], jsonMode: boolean, model?: string, temperature?: number): Promise<any>;
}
