import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetSourcesResponse } from '../models/api.responses';
import { RegistrationSource } from '../models/api.types';

export type GetSourcesParams = {
  category?: 'newsletter' | 'payment' | 'account' | 'other';
  confidence?: 'high' | 'medium' | 'low';
  isUrgent?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
};

@Injectable({ providedIn: 'root' })
export class SourceApi {
  // NOTE: 今はモック運用なので未実装。次段で HttpClient を入れて本APIに接続します。
  list(_accountId: string, _params: GetSourcesParams = {}): Observable<GetSourcesResponse> {
    throw new Error('SourceApi.list is not implemented (use mock)');
  }
  getById(_accountId: string, _sourceId: string): Observable<RegistrationSource | null> {
    throw new Error('SourceApi.getById not implemented');
  }

}
