import { ENV, AI_ENDPOINTS } from '../../config/env';
import type { ChatMessage, ILlmProvider } from './llm-client.interface';

export class GroqProvider implements ILlmProvider {
  public readonly name = 'groq' as const;

  async call(messages: ChatMessage[], jsonMode: boolean, model = 'qwen/qwen3.8-27b', temperature = 0.7): Promise<any> {
    if (!ENV.GROQ_API_KEY) throw new Error('Clé GROQ_API_KEY non configurée');

    const body: any = { model, messages, temperature };
    if (jsonMode) body.response_format = { type: 'json_object' };

    const res = await fetch(AI_ENDPOINTS.GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`Groq (${res.status}): ${errTxt.slice(0, 150)}`);
    }

    return await res.json();
  }
}

export const groqProvider = new GroqProvider();
