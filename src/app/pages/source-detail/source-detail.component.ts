import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { switchMap } from 'rxjs';

import { SourceApi } from '../../core/api/source.api';
import { AccountStateService } from '../../core/services/account-state';

@Component({
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    @if (source$ | async; as s) {
      <div class="p-6 space-y-4">
        <div class="text-2xl font-semibold">{{ s.displayName }}</div>

        <div class="text-sm opacity-70">
          {{ s.domain }} / {{ s.category }} / {{ s.confidence }}
        </div>

        <div class="mt-6 rounded-xl border p-4">
          <div class="text-sm font-medium">Search Recipe</div>
          <div class="text-xs mt-2 font-mono bg-gray-100 p-2 rounded">
            from:{{ s.senderEmail }}
          </div>
        </div>

        <div class="mt-6 text-sm opacity-60">
          First seen: {{ s.firstSeen }}
        </div>
        <div class="text-sm opacity-60">
          Last seen: {{ s.lastSeen }}
        </div>
      </div>
    }
  `,
})
export class SourceDetailComponent {
  private route = inject(ActivatedRoute);
  private api = inject(SourceApi);
  private accountState = inject(AccountStateService);

  source$ = this.route.paramMap.pipe(
    switchMap(p =>
      this.api.getById(
        this.accountState.accountId(),
        p.get('id')!
      )
    )
  );
}
