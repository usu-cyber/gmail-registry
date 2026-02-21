import { Injectable, computed, signal } from '@angular/core';
import { Account } from '../models';
import { MOCK_ACCOUNT } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class ScanStateService {
  // まずはモックを初期値に（後で Account API に置換）
  private accountSig = signal<Account>({ ...MOCK_ACCOUNT });

  account = computed(() => this.accountSig());
  isConnected = computed(() => this.accountSig().status === 'connected');
  isScanning = computed(() => !!this.accountSig().isScanning);
  progress = computed(() => this.accountSig().scanProgress ?? 0);

  setPeriod(period: Account['scanSettings']['period']) {
    const a = this.accountSig();
    this.accountSig.set({ ...a, scanSettings: { ...a.scanSettings, period } });
  }

  connect() {
    const a = this.accountSig();
    this.accountSig.set({ ...a, status: 'connected' });
  }

  // モックのスキャン（後で POST /scan → status に置換）:contentReference[oaicite:1]{index=1}
  startScan() {
    const a = this.accountSig();
    if (a.isScanning) return;
    if (a.status !== 'connected') return;

    this.accountSig.set({ ...a, isScanning: true, scanProgress: 0 });

    const timer = setInterval(() => {
      const cur = this.accountSig();
      const next = Math.min(100, (cur.scanProgress ?? 0) + 12);
      this.accountSig.set({ ...cur, scanProgress: next });

      if (next >= 100) {
        clearInterval(timer);
        const done = this.accountSig();
        this.accountSig.set({
          ...done,
          isScanning: false,
          lastScanned: new Date(),
        });
      }
    }, 250);
  }
}
