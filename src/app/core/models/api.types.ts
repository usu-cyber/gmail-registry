export type Category = 'newsletter' | 'payment' | 'account' | 'other';
export type Confidence = 'high' | 'medium' | 'low';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ScanSettings {
  period: '7d' | '30d' | '90d' | '1y';
}

export interface Account {
  id: string;
  userId: string;
  email: string;
  status: 'connected' | 'not_connected';
  lastScanned?: string;
  scanSettings: ScanSettings;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationSource {
  id: string;
  accountId: string;
  displayName: string;
  domain: string;
  senderEmail: string;
  category: Category;
  confidence: Confidence;
  isUrgent: boolean;
  firstSeen: string;
  lastSeen: string;
  frequency: {
    count: number;
    period: number;
    pattern?: 'daily' | 'weekly' | 'monthly';
  };
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}
