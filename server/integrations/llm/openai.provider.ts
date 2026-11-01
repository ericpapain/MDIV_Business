import { ENV, AI_ENDPOINTS } from '../../config/env';
import type { ChatMessage, ILlmProvider } from './llm-client.interface';

export class OpenAIProvider implements ILlmProvider {
  public readonly name = 'openai' as const;

  async call(messages: ChatMessage[], jsonMode: boolean, model = 'gpt-4o-mini', temperature = 0.7): Promise<any> {
    if (!ENV.OPENAI_API_KEY) throw new Error('Clé OPENAI_API_KEY non configurée');

    const body: any = { model, messages, temperature };
    if (jsonMode) body.response_format = { type: 'json_object' };

    const res = await fetch(AI_ENDPOINTS.OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ENV.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`OpenAI (${res.status}): ${errTxt.slice(0, 150)}`);
    }

    return await res.json();
  }
}

export const openAIProvider = new OpenAIProvider();
