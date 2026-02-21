import { PaginationMeta, RegistrationSource } from './api.types';

export interface GetSourcesResponse {
  sources: RegistrationSource[];
  meta: PaginationMeta;
}

export interface StartScanRequest {
  period?: '7d' | '30d' | '90d' | '1y';
  forceRescan?: boolean;
}

export interface StartScanResponse {
  scanId: string;
  accountId: string;
  status: 'queued' | 'processing';
  message: string;
}

export interface GetScanStatusResponse {
  scanId?: string;
  accountId: string;
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
