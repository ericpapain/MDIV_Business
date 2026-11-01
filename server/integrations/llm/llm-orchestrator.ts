import { getDb } from '../../database/db-connection';
import type { ChatMessage } from './llm-client.interface';
import { groqProvider } from './groq.provider';
import { openAIProvider } from './openai.provider';
import { mistralProvider } from './mistral.provider';

export async function callLLM(messages: ChatMessage[], jsonMode = false): Promise<any> {
  const clonedMessages: ChatMessage[] = messages.map(m => ({ ...m }));

  const db = getDb();
  const settings = db.aiSettings || {
    primaryProvider: 'groq',
    groqModel: 'qwen/qwen3.8-27b',
    openaiModel: 'gpt-4o-mini',
    mistralModel: 'mistral-small-latest',
    temperature: 0.7,
    fallbackEnabled: true,
  };

  const primary = settings.primaryProvider || 'groq';
  const fallback = settings.fallbackEnabled !== false;

  const sequence: Array<'groq' | 'openai' | 'mistral'> = [];
  if (primary === 'openai') {
    sequence.push('openai');
    if (fallback) sequence.push('groq', 'mistral');
  } else if (primary === 'mistral') {
    sequence.push('mistral');
    if (fallback) sequence.push('groq', 'openai');
  } else if (primary === 'groq') {
    sequence.push('groq');
    if (fallback) sequence.push('openai', 'mistral');
  } else {
    sequence.push('groq', 'openai', 'mistral');
  }

  const errors: string[] = [];

  for (const prov of sequence) {
    try {
      if (prov === 'groq') {
        return await groqProvider.call(
          clonedMessages,
          jsonMode,
          settings.groqModel || 'qwen/qwen3.8-27b',
          settings.temperature ?? 0.7
        );
      }
      if (prov === 'openai') {
        return await openAIProvider.call(
          clonedMessages,
          jsonMode,
          settings.openaiModel || 'gpt-4o-mini',
          settings.temperature ?? 0.7
        );
      }
      if (prov === 'mistral') {
        return await mistralProvider.call(
          clonedMessages,
          jsonMode,
          settings.mistralModel || 'mistral-small-latest',
          settings.temperature ?? 0.7
        );
      }
    } catch (err: any) {
      errors.push(`${prov}: ${err.message}`);
    }
  }

  throw new Error(`Tous les services IA ont échoué. Détails : ${errors.join(' | ')}`);
}
