import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ScanStateService } from '../../core/services/scan-state';
import { ScanSummary, RegistrationSource } from '../../core/models';
import { MOCK_SCAN_SUMMARY, MOCK_SOURCES } from '../../core/mock-data';
import { GoogleAuthService } from '../../core/services/google-auth.service';
import { GmailApi } from '../../core/api/gmail.api';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './account.component.html',
})
export class AccountComponent {
  scan = inject(ScanStateService);
  auth = inject(GoogleAuthService);
  gmail = inject(GmailApi);
  summary = signal<ScanSummary>({
    ...MOCK_SCAN_SUMMARY,
    newlyFound: MOCK_SOURCES.slice(0, 3),
  });
  lastResult = signal<any>(null);
  lastError = signal<string | null>(null);
  lastList = signal<any>(null);
  metaList = signal<any[]>([]);

  labelCategory(cat: RegistrationSource['category']) {
    switch (cat) {
      case 'newsletter': return 'Newsletter';
      case 'payment': return 'Payment';
      case 'account': return 'Account';
      default: return 'Other';
    }
  }
  ngOnInit() {
    this.auth.init(['https://www.googleapis.com/auth/gmail.readonly']);
  }
  connectGoogle() {
    this.lastError.set(null);
    this.auth.requestAccessToken().catch((err) => {
      this.lastError.set(JSON.stringify(err, null, 2));
    });
  }

  testList() {
    this.lastError.set(null);
    this.lastResult.set(null);

    // まずは軽いクエリで。自分の受信箱に確実に存在しそうなものが良い
    const q = 'newer_than:365d';

    this.gmail.listMessages('newer_than:365d', 5).subscribe({
      next: (res) => {
        this.lastResult.set(res);
        this.lastList.set(res);
      },
      error: (err) => this.lastError.set(JSON.stringify(err, null, 2)),
    });
  }
  async fetchMetadata() {
    this.lastError.set(null);
    this.metaList.set([]);

    if (!this.auth.accessToken()) {
      try {
        await this.auth.requestAccessToken();
      } catch (err) {
        this.lastError.set(JSON.stringify(err, null, 2));
        return;
      }
    }

    // ① まず list を取る（存在しない場合のため）
    this.gmail.listMessages('newer_than:365d', 5).subscribe({
      next: (list) => {
        this.lastList.set(list);

        const ids: string[] = (list?.messages ?? []).map((m: any) => m.id);
        if (!ids.length) {
          this.lastError.set('No messages found (list returned empty).');
          return;
        }

        // ② 次に metadata を取る（専用メソッドでも getMessage でもOK）
        forkJoin(ids.map(id => this.gmail.getMessageMetadata(id))).pipe(
          map(items => items.map(x => {
            const headers = x?.payload?.headers ?? [];
            const h = (name: string) => headers.find((z: any) => z.name === name)?.value ?? '';
            return {
              id: x.id,
              from: h('From'),
              listUnsubscribe: h('List-Unsubscribe'),
              subject: h('Subject'),
              date: h('Date'),
            };
          }))
        ).subscribe({
          next: (rows) => this.metaList.set(rows),
          error: (err) => this.lastError.set(JSON.stringify(err, null, 2)),
        });
      },
      error: (err) => this.lastError.set(JSON.stringify(err, null, 2)),
    });
  }

}
