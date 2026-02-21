import { Injectable, computed, signal } from '@angular/core';
import { Account } from '../models/api.types';

// NOTE: 今はモック。後で GET /accounts/me 等から取得に差し替える
const MOCK_ACCOUNT: Account = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  userId: 'user_1',
  email: 'user@example.com',
  status: 'connected',
  lastScanned: '2026-02-15T10:00:00Z',
  scanSettings: { period: '90d' },
  createdAt: '2026-02-01T00:00:00Z',
  updatedAt: '2026-02-15T10:00:00Z',
};

@Injectable({ providedIn: 'root' })
export class AccountStateService {
  private accountSig = signal<Account>(MOCK_ACCOUNT);

  account = computed(() => this.accountSig());
  accountId = computed(() => this.accountSig().id);
  email = computed(() => this.accountSig().email);
  isConnected = computed(() => this.accountSig().status === 'connected');

  setAccount(next: Account) {
    this.accountSig.set(next);
  }

  setPeriod(period: Account['scanSettings']['period']) {
    const a = this.accountSig();
    this.accountSig.set({ ...a, scanSettings: { ...a.scanSettings, period } });
  }

  connect() {
    const a = this.accountSig();
    this.accountSig.set({ ...a, status: 'connected' });
  }
}
