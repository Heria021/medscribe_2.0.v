// lib/rag.ts - Direct API functions for RAG system

export interface EmbedData {
  patient_id: string;
  event_type: string;
  data: string;
  metadata: Record<string, any>;
}

export interface SearchData {
  patient_id: string;
  query: string;
  max_results?: number;
  event_types?: string;
  include_context?: boolean;
  similarity_threshold?: number;
}

export interface RelevantDocument {
  id: string;
  event_type: string;
  content_preview: string;
  similarity_score: number;
  created_at: string;
  metadata: Record<string, any>;
}

export interface RAGResponse<T = any> {
  success: boolean;
  message: string | null;
  error: string | null;
  data?: T;
}

export interface RAGSearchResponse {
  success: boolean;
  message: string | null;
  error: string | null;
  patient_id?: string;
  query?: string;
  response?: string; // The AI-generated response
  relevant_documents_count?: number;
  relevant_documents?: RelevantDocument[];
  context_used?: boolean;
  similarity_threshold?: number;
  max_results?: number;
  processing_time_seconds?: number;
  generated_at?: string;
}

const BASE_URL = 'http://localhost:8000/api/v1/rag';

export async function embedToRAG(data: EmbedData): Promise<RAGResponse> {
  try {
    const res = await fetch(`${BASE_URL}/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`RAG embed API error: ${res.status} ${errorText}`);
    }

    return res.json();
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to call embed API',
      error: error.message,
    };
  }
}

export async function searchRAG(data: SearchData): Promise<RAGSearchResponse> {
  try {
    const res = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`RAG search API error: ${res.status} ${errorText}`);
    }

    const result: RAGSearchResponse = await res.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to call search API',
      error: error.message,
    };
  }
}