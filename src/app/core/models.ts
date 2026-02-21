export type SourceCategory = 'newsletter' | 'payment' | 'account' | 'other';
export type SourceConfidence = 'high' | 'medium' | 'low';

export interface SourceFrequency {
  count: number;
  period: number;
  pattern?: string;
}

export interface SourceEvidence {
  type: string;
  description: string;
}

export interface SourceSampleEmail {
  date: string | Date;
  subject: string;
  snippet: string;
}

export interface RegistrationSource {
  id: string;
  displayName: string;
  domain: string;
  senderEmail: string;
  category: SourceCategory;
  confidence: SourceConfidence;
  isUrgent?: boolean;
  firstSeen?: string | Date;
  lastSeen: string | Date;
  frequency: SourceFrequency;
  evidence?: SourceEvidence[];
  sampleEmails?: SourceSampleEmail[];
}
