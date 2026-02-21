import { Injectable, computed, inject, signal } from '@angular/core';
import { AccountStateService } from './account-state';

@Injectable({ providedIn: 'root' })
export class ScanStateService {
  private accountState = inject(AccountStateService);

  private scanning = signal(false);
  private progressSig = signal(0);

  account = computed(() => this.accountState.account());
  isConnected = computed(() => this.accountState.isConnected());
  isScanning = computed(() => this.scanning());
  progress = computed(() => this.progressSig());

  setPeriod(period: '7d' | '30d' | '90d' | '1y') {
    this.accountState.setPeriod(period);
  }

  connect() {
    this.accountState.connect();
  }

  // モックScan（後で API: POST /scan → GET /scan/status に差し替え）:contentReference[oaicite:0]{index=0}
  startScan() {
    if (!this.isConnected() || this.isScanning()) return;

    this.scanning.set(true);
    this.progressSig.set(0);

    const timer = setInterval(() => {
      const next = Math.min(100, this.progressSig() + 12);
      this.progressSig.set(next);

      if (next >= 100) {
        clearInterval(timer);
        this.scanning.set(false);

        // 本番では Scan完了時に account.lastScanned を更新（APIから取得）
        // モックでは AccountState を直接更新
        const a = this.accountState.account();
        this.accountState.setAccount({
          ...a,
          lastScanned: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }, 250);
  }
}
