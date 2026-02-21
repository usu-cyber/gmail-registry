import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { SourceApi } from '../../core/api/source.api';

@Component({
  selector: 'app-sources',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="p-4">
      <div class="text-lg font-semibold">Sources</div>

      <ul class="mt-3 space-y-2">
        @for (s of (sources$ | async)?.sources; track s.id) {
          <li class="rounded border p-3">
            <div class="font-medium">{{ s.displayName }}</div>
            <div class="text-sm opacity-70">
              {{ s.domain }} / {{ s.category }} / {{ s.confidence }}
            </div>
          </li>
        }
      </ul>
    </div>
  `,
})
export class SourcesComponent {
  private sourceApi = inject(SourceApi);

  sources$ = this.sourceApi.list(
    '550e8400-e29b-41d4-a716-446655440000',
    { search: '' }
  );
}
