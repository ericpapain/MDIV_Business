import { getDb, saveDb } from '../../database/db-connection';
import { callLLM } from '../../integrations/llm/llm-orchestrator';

export class RagService {
  indexDocument(companyId: number, docName: string, text: string, category = 'general') {
    const db = getDb();
    if (!(db as any).vector_documents) (db as any).vector_documents = [];

    const newDoc = {
      id: 'rag_' + Date.now(),
      company_id: companyId,
      name: docName,
      category,
      chunks_count: Math.ceil(text.length / 500),
      text_preview: text.slice(0, 300),
      indexed_at: new Date().toISOString(),
    };

    (db as any).vector_documents.unshift(newDoc);
    saveDb(db);
    return newDoc;
  }

  async queryRag(companyId: number, query: string) {
    const db = getDb();
    const docs = ((db as any).vector_documents || []).filter((d: any) => !d.company_id || d.company_id === companyId);
    const contextSnippets = docs.map((d: any) => `[Source: ${d.name}]\n${d.text_preview}`).join('\n\n');

    const prompt = `Tu es le moteur RAG (Retrieval Augmented Generation) hermétique de MDIV Business.
Question de l'utilisateur : "${query}".
Contexte documentaire de l'entreprise :
"""\n${contextSnippets || 'Aucun document pertinent indexé pour le moment.'}\n"""

Réponds de façon précise en t'appuyant rigoureusement sur le contexte.`;

    const aiRes = await callLLM([
      { role: 'system', content: prompt },
      { role: 'user', content: query }
    ]);

    return {
      answer: aiRes.choices?.[0]?.message?.content || "Réponse RAG générée.",
      sources: docs.slice(0, 3).map((d: any) => d.name),
    };
  }

  recordFeedback(companyId: number, fields: any) {
    const db = getDb();
    if (!(db as any).ai_feedback) (db as any).ai_feedback = [];

    const feedback = {
      id: 'fb_' + Date.now(),
      company_id: companyId,
      tool: fields.tool || 'general',
      rating: fields.rating || 'positive',
      comment: fields.comment || '',
      correction: fields.correction || '',
      created_at: new Date().toISOString(),
    };

    (db as any).ai_feedback.unshift(feedback);
    saveDb(db);
    return feedback;
  }
}

export const ragService = new RagService();
