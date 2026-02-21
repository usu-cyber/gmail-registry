import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ScanStateService } from '../../core/services/scan-state';
import { ScanSummary, RegistrationSource } from '../../core/models';
import { MOCK_SCAN_SUMMARY, MOCK_SOURCES } from '../../core/mock-data';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './account.component.html',
})
export class AccountComponent {
  scan = inject(ScanStateService);

  summary = signal<ScanSummary>({
    ...MOCK_SCAN_SUMMARY,
    newlyFound: MOCK_SOURCES.slice(0, 3),
  });

  labelCategory(cat: RegistrationSource['category']) {
    switch (cat) {
      case 'newsletter': return 'Newsletter';
      case 'payment': return 'Payment';
      case 'account': return 'Account';
      default: return 'Other';
    }
  }
}
