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

export interface SearchRecipe {
  id: string;
  title: string;
  query: string;
  description?: string;
}

export type AccountStatus = 'connected' | 'disconnected';
export type ScanPeriod = '7d' | '30d' | '90d' | '1y';

export interface ScanSettings {
  period: ScanPeriod;
  promotionsOnly: boolean;
}

export interface Account {
  id: string;
  email: string;
  status: AccountStatus;
  lastScanned?: string | Date;
  scanSettings: ScanSettings;
  isScanning?: boolean;
  scanProgress?: number;
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

export interface ScanSummary {
  totalSources: number;
  newsletterCount: number;
  paymentCount: number;
  accountCount: number;
  newlyFound: RegistrationSource[];
}
