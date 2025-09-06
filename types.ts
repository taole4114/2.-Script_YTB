export enum ApiProvider {
  GEMINI = 'Gemini',
  OPENAI = 'OpenAI',
  OPENROUTER = 'OpenRouter',
}

export interface OutlineSection {
  title: string;
  wordTarget: string;
  description: string;
}

export interface ScriptPart {
  content: string;
}

export interface ApiKey {
  key: string;
  provider: ApiProvider;
  model?: string; // For OpenRouter mainly
  lastUsed: number;
  exhaustedUntil?: number; // Timestamp until which the key is considered exhausted
}