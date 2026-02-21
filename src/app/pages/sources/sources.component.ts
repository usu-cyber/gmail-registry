import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

import { RegistrationSource } from '../../core/models';
import { MOCK_SOURCES } from '../../core/mock-data';

type Category = 'all' | 'newsletter' | 'payment' | 'account' | 'other';
type Confidence = 'all' | 'high' | 'medium' | 'low';
type SortKey = 'lastSeen_desc' | 'lastSeen_asc' | 'name_asc' | 'name_desc';

@Component({
  selector: 'app-sources',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './sources.component.html',
})
export class SourcesComponent {
  // 元データ（後でAPIから入る）
  private readonly allSources = signal<RegistrationSource[]>(MOCK_SOURCES);

  // UI state（後でそのまま query param / API query に変換できる）
  category = signal<Category>('all');
  confidence = signal<Confidence>('all');
  urgentOnly = signal(false);
  search = signal('');
  sort = signal<SortKey>('lastSeen_desc');

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    let items = [...this.allSources()];

    // filter: category
    if (this.category() !== 'all') {
      items = items.filter(s => s.category === this.category());
    }

    // filter: confidence
    if (this.confidence() !== 'all') {
      items = items.filter(s => s.confidence === this.confidence());
    }

    // filter: urgent
    if (this.urgentOnly()) {
      items = items.filter(s => !!s.isUrgent);
    }

    // filter: search (displayName / domain / senderEmail)
    if (q) {
      items = items.filter(s => {
        const hay = `${s.displayName} ${s.domain} ${s.senderEmail}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // sort
    items.sort((a, b) => {
      const aLast = new Date(a.lastSeen as any).getTime();
      const bLast = new Date(b.lastSeen as any).getTime();

      switch (this.sort()) {
        case 'lastSeen_desc':
          return bLast - aLast;
        case 'lastSeen_asc':
          return aLast - bLast;
        case 'name_asc':
          return a.displayName.localeCompare(b.displayName);
        case 'name_desc':
          return b.displayName.localeCompare(a.displayName);
      }
    });

    return items;
  });

  setCategory(v: Category) {
    this.category.set(v);
  }

  setConfidence(v: Confidence) {
    this.confidence.set(v);
  }

  clearFilters() {
    this.category.set('all');
    this.confidence.set('all');
    this.urgentOnly.set(false);
    this.search.set('');
    this.sort.set('lastSeen_desc');
  }

  badgeForCategory(cat: RegistrationSource['category']) {
    switch (cat) {
      case 'newsletter': return 'Newsletter';
      case 'payment': return 'Payment';
      case 'account': return 'Account';
      default: return 'Other';
    }
  }

  badgeForConfidence(c: RegistrationSource['confidence']) {
    switch (c) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      default: return 'Low';
    }
  }
}
