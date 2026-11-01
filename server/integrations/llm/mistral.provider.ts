import { ENV, AI_ENDPOINTS } from '../../config/env';
import type { ChatMessage, ILlmProvider } from './llm-client.interface';

export class MistralProvider implements ILlmProvider {
  public readonly name = 'mistral' as const;

  async call(messages: ChatMessage[], jsonMode: boolean, model = 'mistral-small-latest', temperature = 0.7): Promise<any> {
    if (!ENV.MISTRAL_API_KEY) throw new Error('Clé MISTRAL_API_KEY non configurée');

    const body: any = { model, messages, temperature };
    if (jsonMode) body.response_format = { type: 'json_object' };

    const res = await fetch(AI_ENDPOINTS.MISTRAL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ENV.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`Mistral (${res.status}): ${errTxt.slice(0, 150)}`);
    }

    return await res.json();
  }
}

export const mistralProvider = new MistralProvider();
