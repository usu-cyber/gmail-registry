import { Component, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { RegistrationSource, SearchRecipe } from '../../core/models';
import { MOCK_SOURCES } from '../../core/mock-data';

@Component({
  selector: 'app-source-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './source-detail.component.html',
})
export class SourceDetailComponent {
  private route = inject(ActivatedRoute);

  sourceId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  source = computed<RegistrationSource | null>(() => {
    const id = this.sourceId();
    return MOCK_SOURCES.find(s => s.id === id) ?? null;
  });

  // Gmail検索URL（フロントで生成）
  gmailSearchUrl(query: string) {
    const encoded = encodeURIComponent(query);
    // u/0 は最初のアカウント。複数対応するなら将来ここを切り替え。
    return `https://mail.google.com/mail/u/0/#search/${encoded}`;
  }

  // カテゴリ表示
  labelCategory(cat: RegistrationSource['category']) {
    switch (cat) {
      case 'newsletter': return 'Newsletter';
      case 'payment': return 'Payment';
      case 'account': return 'Account';
      default: return 'Other';
    }
  }

  labelConfidence(c: RegistrationSource['confidence']) {
    switch (c) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      default: return 'Low';
    }
  }

  // SearchRecipe をモックから自動生成（後でAPIのsearchRecipesに置き換え）
  recipes = computed<SearchRecipe[]>(() => {
    const s = this.source();
    if (!s) return [];

    const domain = s.domain;
    const email = s.senderEmail;

    const base = [
      {
        id: 'from_domain',
        title: '送信元を広く確認',
        query: `from:(${domain})`,
        description: 'ドメイン単位で関連メールを探す。',
      },
      {
        id: 'from_email',
        title: '送信元アドレスで絞る',
        query: `from:(${email})`,
        description: '差出人アドレスが安定している場合に有効。',
      },
    ] satisfies SearchRecipe[];

    const newsletter = [
      {
        id: 'has_unsub',
        title: 'Unsubscribe付きだけ見る',
        query: `has:unsubscribe from:(${domain})`,
        description: 'メルマガっぽいメールが集まりやすい。',
      },
      {
        id: 'newsletter_subject',
        title: 'ニュースレター系件名',
        query: `from:(${domain}) subject:(newsletter OR update OR お知らせ OR 週刊)`,
      },
    ] satisfies SearchRecipe[];

    const payment = [
      {
        id: 'payment_subject',
        title: '領収書・明細を探す',
        query: `from:(${domain}) subject:(領収書 OR 明細 OR receipt OR invoice OR billing OR payment)`,
        description: '支払い・請求の証拠を拾う。',
      },
      {
        id: 'refund_subject',
        title: '返金・キャンセルを探す',
        query: `from:(${domain}) subject:(refund OR 返金 OR cancel OR キャンセル)`,
      },
    ] satisfies SearchRecipe[];

    const account = [
      {
        id: 'auth_subject',
        title: '認証・ログイン系を探す',
        query: `from:(${domain}) subject:(verify OR verification OR 認証 OR 確認 OR login OR sign-in OR security)`,
        description: 'アカウント関連の痕跡を見つける。',
      },
    ] satisfies SearchRecipe[];

    if (s.category === 'newsletter') return [...base, ...newsletter];
    if (s.category === 'payment') return [...base, ...payment];
    if (s.category === 'account') return [...base, ...account];
    return base;
  });

  async copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // クリップボード権限が無い環境もあるので握りつぶし（後でtoast入れる）
    }
  }
}
