import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RegistrationSource } from '../../core/models';
import { MOCK_SOURCES } from '../../core/mock-data';

type Category = 'all' | 'newsletter' | 'payment' | 'account' | 'other';
type Confidence = 'all' | 'high' | 'medium' | 'low';
type SortKey = 'lastSeen_desc' | 'lastSeen_asc' | 'name_asc' | 'name_desc';

function asCategory(v: string | null): Category {
  if (!v) return 'all';
  if (v === 'newsletter' || v === 'payment' || v === 'account' || v === 'other') return v;
  return 'all';
}
function asConfidence(v: string | null): Confidence {
  if (!v) return 'all';
  if (v === 'high' || v === 'medium' || v === 'low') return v;
  return 'all';
}
function asSort(v: string | null): SortKey {
  if (!v) return 'lastSeen_desc';
  if (v === 'lastSeen_desc' || v === 'lastSeen_asc' || v === 'name_asc' || v === 'name_desc') return v;
  return 'lastSeen_desc';
}
function asBool(v: string | null): boolean {
  return v === '1' || v === 'true';
}

@Component({
  selector: 'app-sources',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './sources.component.html',
})
export class SourcesComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // 元データ（後でAPIへ置換）
  private allSources = signal<RegistrationSource[]>(MOCK_SOURCES);

  // UI state（＝ query param と1対1）
  category = signal<Category>('all');
  confidence = signal<Confidence>('all');
  urgentOnly = signal(false);
  search = signal('');
  sort = signal<SortKey>('lastSeen_desc');

  // ① 初期化：URLクエリ → state
  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    this.category.set(asCategory(qp.get('category')));
    this.confidence.set(asConfidence(qp.get('confidence')));
    this.urgentOnly.set(asBool(qp.get('urgent')));
    this.search.set(qp.get('q') ?? '');
    this.sort.set(asSort(qp.get('sort')));

    // ② 以後：state → URLクエリ（変更時に反映）
    effect(() => {
      const params: Record<string, string | null> = {
        category: this.category() === 'all' ? null : this.category(),
        confidence: this.confidence() === 'all' ? null : this.confidence(),
        urgent: this.urgentOnly() ? '1' : null,
        q: this.search().trim() ? this.search().trim() : null,
        sort: this.sort() === 'lastSeen_desc' ? null : this.sort(),
      };

      // 連打で履歴が増えるのが嫌なので replaceUrl
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: params,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });

    // ③ ブラウザ戻る/進む等：URLクエリ → state（同期）
    this.route.queryParamMap.subscribe(map => {
      // stateに同じ値を入れてもOK（signalは同値なら再描画は最小）
      this.category.set(asCategory(map.get('category')));
      this.confidence.set(asConfidence(map.get('confidence')));
      this.urgentOnly.set(asBool(map.get('urgent')));
      this.search.set(map.get('q') ?? '');
      this.sort.set(asSort(map.get('sort')));
    });
  }

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    let items = [...this.allSources()];

    if (this.category() !== 'all') items = items.filter(s => s.category === this.category());
    if (this.confidence() !== 'all') items = items.filter(s => s.confidence === this.confidence());
    if (this.urgentOnly()) items = items.filter(s => !!s.isUrgent);

    if (q) {
      items = items.filter(s => {
        const hay = `${s.displayName} ${s.domain} ${s.senderEmail}`.toLowerCase();
        return hay.includes(q);
      });
    }

    items.sort((a, b) => {
      const aLast = new Date(a.lastSeen as any).getTime();
      const bLast = new Date(b.lastSeen as any).getTime();
      switch (this.sort()) {
        case 'lastSeen_desc': return bLast - aLast;
        case 'lastSeen_asc': return aLast - bLast;
        case 'name_asc': return a.displayName.localeCompare(b.displayName);
        case 'name_desc': return b.displayName.localeCompare(a.displayName);
      }
    });

    return items;
  });

  setCategory(v: Category) { this.category.set(v); }
  setConfidence(v: Confidence) { this.confidence.set(v); }

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
