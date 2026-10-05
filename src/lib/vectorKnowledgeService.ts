// src/lib/vectorKnowledgeService.ts
/**
 * Service Client pour la Mémoire Vectorielle Haute Performance & RAG Hermétique (Brique 5)
 * Conçu pour 100 000+ utilisateurs et des millions de documents multi-tenants.
 */

import { getApiUrl } from './apiConfig';

export interface VectorSearchResult {
  document_id: string;
  document_type: string;
  document_name: string;
  chunk_index: number;
  chunk_text: string;
  similarity_score: number;
  metadata?: Record<string, any>;
}

export interface VectorIndexResponse {
  status: 'success' | 'error';
  document_id?: string;
  chunks_indexed?: number;
  model?: string;
  dimensions?: number;
  message?: string;
  error?: string;
}

export interface VectorQueryResponse {
  status: 'success' | 'error';
  company_id?: number;
  query?: string;
  results_count?: number;
  results?: VectorSearchResult[];
  error?: string;
}

export class VectorKnowledgeService {
  /**
   * Indexe un document complet dans la mémoire vectorielle partitionnée de l'entreprise
   */
  static async indexDocument(params: {
    companyId: number;
    documentId?: string;
    documentType: string;
    documentName: string;
    text: string;
    metadata?: Record<string, any>;
  }): Promise<VectorIndexResponse> {
    const url = getApiUrl('rag_document_indexer.php');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: params.companyId,
        document_id: params.documentId,
        document_type: params.documentType,
        document_name: params.documentName,
        text: params.text,
        metadata: params.metadata || {}
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Erreur réseau lors de l\'indexation' }));
      throw new Error(err.error || `Erreur HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Recherche sémantique par similarité cosinus avec isolation multi-tenant stricte
   */
  static async searchKnowledge(params: {
    companyId: number;
    query: string;
    topK?: number;
    minScore?: number;
    documentType?: string;
  }): Promise<VectorSearchResult[]> {
    const url = getApiUrl('rag_query.php');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: params.companyId,
        query: params.query,
        top_k: params.topK ?? 4,
        min_score: params.minScore ?? 0.65,
        document_type: params.documentType
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Erreur de recherche sémantique' }));
      throw new Error(err.error || `Erreur HTTP ${response.status}`);
    }

    const data: VectorQueryResponse = await response.json();
    return data.results || [];
  }
}
