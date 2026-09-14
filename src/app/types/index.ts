interface Source {
  id: string;
  url: string;
  title: string;
  snippet: string;
  credibility_score: number;
  domain_id?: string;
}

interface Search {
  id: string;
  analysis_id: string;
  prompt: string;
  summary: string;
}

interface AnalysisStreamEvent {
  type: "status" | "content" | "analysis_complete";
  content: string | {
    analysis_id?: string;
    veracity_score?: number;
    confidence_score?: number;
    num_sources?: number;
    source_credibility?: number;
  };
}

interface FinalAnalysis {
  id: string;
  veracity_score: number;
  confidence_score: number;
  analysis_text: string;
  status: string;
}

interface StreamingMessage {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  isStreaming?: boolean;
  streamedContent?: string;
}

interface ExtractedStatement {
  id: string;
  text: string;
}

type ExtractionReason = "ok" | "no_claims" | "llm_error" | "too_long";

interface ClaimExtractionResponse {
  statements: ExtractedStatement[];
  reason: ExtractionReason;
  language: string;
}

/* null means there is no notice to show */
type ExtractionNotice = "no_claims" | "error" | "too_long" | null;

  export type {Source, Search, FinalAnalysis, AnalysisStreamEvent, StreamingMessage,
    ExtractedStatement, ClaimExtractionResponse, ExtractionReason, ExtractionNotice}