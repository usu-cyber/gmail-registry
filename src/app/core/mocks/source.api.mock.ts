import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SourceApi, GetSourcesParams } from '../api/source.api';
import { GetSourcesResponse } from '../models/api.responses';
import { RegistrationSource } from '../models/api.types';

// ✅ 1) 配列はクラスの外に固定で置く（list/getById で共用）
const MOCK_SOURCES: RegistrationSource[] = [
  {
    id: '770e8400-e29b-41d4-a716-446655440000',
    accountId: '550e8400-e29b-41d4-a716-446655440000',
    displayName: 'Netflix',
    domain: 'netflix.com',
    senderEmail: 'info@mailer.netflix.com',
    category: 'payment',
    confidence: 'high',
    isUrgent: true,
    firstSeen: '2024-01-15T00:00:00Z',
    lastSeen: '2026-02-14T10:30:00Z',
    frequency: { count: 14, period: 90, pattern: 'monthly' },
    isPinned: false,
    createdAt: '2026-02-18T10:05:00Z',
    updatedAt: '2026-02-18T10:05:00Z',
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440001',
    accountId: '550e8400-e29b-41d4-a716-446655440000',
    displayName: 'Notion',
    domain: 'notion.so',
    senderEmail: 'no-reply@notion.so',
    category: 'account',
    confidence: 'high',
    isUrgent: false,
    firstSeen: '2025-06-01T00:00:00Z',
    lastSeen: '2026-02-20T09:15:00Z',
    frequency: { count: 8, period: 90, pattern: 'weekly' },
    isPinned: true,
    createdAt: '2026-02-18T10:05:00Z',
    updatedAt: '2026-02-18T12:00:00Z',
  },
];

@Injectable()
export class MockSourceApi extends SourceApi {
  override list(accountId: string, params: GetSourcesParams = {}): Observable<GetSourcesResponse> {
    let filtered = MOCK_SOURCES.filter(x => x.accountId === accountId);

    // 超ざっくりフィルタ（UIの検索体験だけ先に作るため）
    if (params.category) filtered = filtered.filter(x => x.category === params.category);
    if (params.confidence) filtered = filtered.filter(x => x.confidence === params.confidence);
    if (typeof params.isUrgent === 'boolean') filtered = filtered.filter(x => x.isUrgent === params.isUrgent);
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(x => {
        const hay = `${x.displayName} ${x.domain} ${x.senderEmail}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return of({
      sources: filtered,
      meta: { page: params.page ?? 1, limit: params.limit ?? 20, total: filtered.length, totalPages: 1 },
    }).pipe(delay(200));
  }

  override getById(accountId: string, sourceId: string): Observable<RegistrationSource | null> {
    const found = MOCK_SOURCES.find(x => x.accountId === accountId && x.id === sourceId) ?? null;
    return of(found).pipe(delay(200));
  }
}
