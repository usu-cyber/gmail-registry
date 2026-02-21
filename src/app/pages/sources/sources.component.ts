import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, combineLatest, map, startWith, switchMap } from 'rxjs';

import { SourceApi } from '../../core/api/source.api';
import { GetSourcesParams } from '../../core/api/source.api';
import { GetSourcesResponse } from '../../core/models/api.responses';

import { AccountStateService } from '../../core/services/account-state';


type CategoryUI = 'all' | 'newsletter' | 'payment' | 'account' | 'other';
type ConfidenceUI = 'all' | 'high' | 'medium' | 'low';
type SortKey = 'lastSeen_desc' | 'lastSeen_asc' | 'name_asc' | 'name_desc';

// --- query param parse helpers
function asCategory(v: string | null): CategoryUI {
  if (!v) return 'all';
  if (v === 'newsletter' || v === 'payment' || v === 'account' || v === 'other') return v;
  return 'all';
}
function asConfidence(v: string | null): ConfidenceUI {
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
  private sourceApi = inject(SourceApi);
private accountState = inject(AccountStateService);


  // UI state（= URL query params と同期）
  category = signal<CategoryUI>('all');
  confidence = signal<ConfidenceUI>('all');
  urgentOnly = signal(false);
  search = signal('');
  sort = signal<SortKey>('lastSeen_desc');

  // API結果（Observable）
  sources$: Observable<GetSourcesResponse>;

  // 表示用に配列だけ欲しいとき（templateで使いやすい）
  sourcesList$ = computed(() => this._lastSources()?.sources ?? []);
  private _lastSources = signal<GetSourcesResponse | null>(null);

  constructor() {
    // 初期化：URL → state
    const qp = this.route.snapshot.queryParamMap;
    this.category.set(asCategory(qp.get('category')));
    this.confidence.set(asConfidence(qp.get('confidence')));
    this.urgentOnly.set(asBool(qp.get('urgent')));
    this.search.set(qp.get('q') ?? '');
    this.sort.set(asSort(qp.get('sort')));

    // state → URL（replace）
    effect(() => {
      const params: Record<string, string | null> = {
        category: this.category() === 'all' ? null : this.category(),
        confidence: this.confidence() === 'all' ? null : this.confidence(),
        urgent: this.urgentOnly() ? '1' : null,
        q: this.search().trim() ? this.search().trim() : null,
        sort: this.sort() === 'lastSeen_desc' ? null : this.sort(),
      };

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: params,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });

    // URL変化（戻る/進む等）→ state
    this.route.queryParamMap.subscribe(map => {
      this.category.set(asCategory(map.get('category')));
      this.confidence.set(asConfidence(map.get('confidence')));
      this.urgentOnly.set(asBool(map.get('urgent')));
      this.search.set(map.get('q') ?? '');
      this.sort.set(asSort(map.get('sort')));
    });

    // state changes → API params → API call
    const state$ = combineLatest([
      this.route.queryParamMap.pipe(startWith(this.route.snapshot.queryParamMap)),
    ]).pipe(
      map(([m]) => {
        const category = asCategory(m.get('category'));
        const confidence = asConfidence(m.get('confidence'));
        const urgentOnly = asBool(m.get('urgent'));
        const q = m.get('q') ?? '';
        const sort = asSort(m.get('sort'));

        const params: GetSourcesParams = {
          search: q.trim() ? q.trim() : undefined,
          isUrgent: urgentOnly ? true : undefined,
          category: category === 'all' ? undefined : category,
          confidence: confidence === 'all' ? undefined : confidence,
          // sort mapping（仕様側が sortBy/order を想定）:contentReference[oaicite:1]{index=1}
          sortBy: sort.startsWith('name') ? 'displayName' : 'lastSeen',
          order: sort.endsWith('_asc') ? 'asc' : 'desc',
          page: 1,
          limit: 50,
        };
        return params;
      })
    );
    this.sources$ = state$.pipe(
      switchMap(params => this.sourceApi.list(this.accountState.accountId(), params)),
      map(res => {
        this._lastSources.set(res);
        return res;
      })
    );
  }

  // UI handlers（HTMLは今のままでOK）
  setCategory(v: CategoryUI) { this.category.set(v); }
  setConfidence(v: ConfidenceUI) { this.confidence.set(v); }

  clearFilters() {
    this.category.set('all');
    this.confidence.set('all');
    this.urgentOnly.set(false);
    this.search.set('');
    this.sort.set('lastSeen_desc');
  }

  badgeForCategory(cat: string) {
    switch (cat) {
      case 'newsletter': return 'Newsletter';
      case 'payment': return 'Payment';
      case 'account': return 'Account';
      default: return 'Other';
    }
  }
  badgeForConfidence(c: string) {
    switch (c) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      default: return 'Low';
    }
  }

}
