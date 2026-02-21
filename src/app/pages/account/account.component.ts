import { Component, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Account, ScanSummary, RegistrationSource } from '../../core/models';
import { MOCK_ACCOUNT, MOCK_SCAN_SUMMARY, MOCK_SOURCES } from '../../core/mock-data';

type Period = Account['scanSettings']['period'];

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './account.component.html',
})
export class AccountComponent {
  account = signal<Account>({ ...MOCK_ACCOUNT });

  // newlyFound をモックから作る（後でAPIのsummaryに差し替え）
  summary = signal<ScanSummary>({
    ...MOCK_SCAN_SUMMARY,
    newlyFound: MOCK_SOURCES.slice(0, 3),
  });

  // UI用
  isConnected = computed(() => this.account().status === 'connected');
  isScanning = computed(() => !!this.account().isScanning);

  setPeriod(p: Period) {
    const a = this.account();
    this.account.set({
      ...a,
      scanSettings: { ...a.scanSettings, period: p },
    });
  }

  // モックのスキャン挙動（将来は POST /scan → GET /scan/status に置換）:contentReference[oaicite:1]{index=1}
  startScan() {
    const a = this.account();
    if (a.isScanning) return;

    this.account.set({ ...a, isScanning: true, scanProgress: 0 });

    // fake progress
    const timer = setInterval(() => {
      const cur = this.account();
      const next = Math.min(100, (cur.scanProgress ?? 0) + 12);
      this.account.set({ ...cur, scanProgress: next });

      if (next >= 100) {
        clearInterval(timer);
        const done = this.account();
        this.account.set({
          ...done,
          isScanning: false,
          lastScanned: new Date(),
        });
      }
    }, 250);
  }

  // “Connect” は今はダミー（Auth実装時に差し替え）
  connect() {
    const a = this.account();
    this.account.set({ ...a, status: 'connected' });
  }

  labelCategory(cat: RegistrationSource['category']) {
    switch (cat) {
      case 'newsletter': return 'Newsletter';
      case 'payment': return 'Payment';
      case 'account': return 'Account';
      default: return 'Other';
    }
  }
}
