interface Source {
    id: string;
    url: string;
    title: string;
    snippet: string;
    credibility_score: number;
    domain_id?: string;
  }
  
  interface FinalAnalysis {
    id: string;
    veracity_score: number;
    confidence_score: number;
    analysis_text: string;
    status: string;
  }

  export type {Source, FinalAnalysis}