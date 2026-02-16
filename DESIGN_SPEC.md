# RegiScope for Gmail - 詳細設計書

**バージョン:** 2.0  
**最終更新:** 2026年2月15日  
**ステータス:** MVP実装完了（最小設計・Gmail API統合前）

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [セキュリティ方針](#2-セキュリティ方針)
3. [OOUI設計思想とアーキテクチャ](#3-ooui設計思想とアーキテクチャ)
4. [データモデル](#4-データモデル)
5. [画面仕様](#5-画面仕様)
6. [コンポーネント仕様](#6-コンポーネント仕様)
7. [インタラクション仕様](#7-インタラクション仕様)
8. [画面遷移図](#8-画面遷移図)
9. [スタイルガイド](#9-スタイルガイド)
10. [技術スタック](#10-技術スタック)
11. [実装上の注意点](#11-実装上の注意点)
12. [今後の開発予定](#12-今後の開発予定)

---

## 1. プロジェクト概要

### 1.1 目的

RegiScope for Gmailは、Gmailの受信メールを解析して**登録先候補**（メルマガ、支払いサービス、アカウント等）を自動抽出・整理するWebアプリケーションです。

### 1.2 MVP（最小設計）

**3つのコア画面のみに集中:**
1. **Account画面**: Gmail接続・スキャン設定・実行
2. **Sources画面**: 登録先候補の一覧・フィルタ・ソート
3. **Source詳細画面**: 個別の登録先情報・Gmail検索連携

### 1.3 コアバリュー

- **自動発見**: メールボックスから登録先を自動検出
- **カテゴリ分類**: Newsletter、Payment、Account等に自動分類
- **信頼度スコア**: 分類精度の可視化
- **Gmail連携**: ワンクリックでGmailの該当メールを検索
- **Urgent対応**: 支払い遅延やアカウント警告を優先表示
- **ローカル完結**: メール情報は外部AIに送信せず、ローカルで処理

### 1.4 ターゲットユーザー

- 複数のオンラインサービスに登録しているユーザー
- メルマガや通知メールが増えすぎて管理できないユーザー
- 支払いやアカウント管理を効率化したいユーザー

---

## 2. セキュリティ方針

### 2.1 基本原則

**RegiScope for Gmailは情報セキュリティを最優先とし、ユーザーのメール情報を外部AIサービスに送信しません。**

### 2.2 データ処理方針

#### ローカル完結型アーキテクチャ

- **メール解析**: すべてのメール解析処理はクライアント側（ブラウザ内）またはユーザー管理下のサーバーで実行
- **AI処理の制限**: 
  - メール内容を外部AI（OpenAI、Anthropic等）に送信しない
  - 分類ロジックはルールベースまたはローカルモデルで実装
- **データ保存**: ユーザーのデータはローカルストレージまたはユーザー管理下のデータベース（Supabase等）のみに保存

#### 実装範囲の制限

- **Insights機能（Beta）**: メールボックス全体の分析やAI提案機能は、現在の実装範囲外
  - 将来的にローカルLLMや完全オフラインのAIモデルで実装する可能性あり
  - 現時点ではUI/ルーティングから削除
- **外部通信**: Gmail API以外の外部サービスとの通信は最小限に制限

### 2.3 Gmail API利用時のセキュリティ

- **OAuth 2.0認証**: 安全な認証フロー
- **最小権限原則**: 必要最小限のスコープのみ要求
  - `gmail.readonly`: 読み取り専用アクセス
- **トークン管理**: アクセストークンの安全な保存と管理

### 2.4 将来的なAI機能の実装方針

Insights機能を実装する場合は、以下のいずれかの方式を採用：

1. **完全ローカルAI**: ブラウザ内で動作するLLM（WebLLM、Transformers.js等）
2. **オンプレミスLLM**: ユーザー自身が管理するサーバー上のLLM
3. **匿名化データのみ送信**: メール内容は送信せず、統計データのみ送信

---

## 3. OOUI設計思想とアーキテクチャ

### 3.1 OOUI（Object-Oriented UI）とは

RegiScope for GmailはOOUI設計思想に基づいて設計されています。OOUIでは、ユーザーインターフェースを「タスク」ではなく「オブジェクト」を中心に構築します。

### 3.2 中心オブジェクト

#### Account（Gmailアドレス）
- ユーザーが接続するGmailアカウント
- 複数アカウントの管理が可能
- スキャン設定や接続状態を保持

#### RegistrationSource（登録先候補）
- メールから抽出された「登録先」の実体
- カテゴリ、信頼度、根拠、メールサンプルを保持
- Gmail検索レシピを生成可能

### 3.3 オブジェクト中心のナビゲーション

```
Account
  ↓ スキャン実行
Sources（一覧）
  ↓ Source選択
Source詳細
  ↓ Gmail検索
Gmailで該当メール表示
```

各画面は明確なオブジェクトに対応し、ユーザーは「何を」操作しているかを常に理解できます。

### 3.4 情報アーキテクチャ（MVP）

```
├── Account（アカウント管理）
│   ├── Gmail接続
│   ├── スキャン設定
│   └── スキャン実行・結果サマリ
│
├── Sources（登録先一覧）
│   ├── フィルタ（カテゴリ、信頼度、urgent）
│   ├── ソート（名前、日付、信頼度）
│   └── 個別Source詳細へ遷移
│
└── Source詳細
    ├── 基本情報
    ├── 根拠（Evidence）
    ├── Gmail検索レシピ
    └── メールサンプル
```

**将来追加予定:**
- **Insights（メールボックス分析）**: 健康スコア、AI提案、アラート（ローカルAI実装時）
- **Pinned（お気に入り管理）**: よく使うSourceの固定表示

---

## 4. データモデル

### 4.1 Account（アカウント）

```typescript
interface Account {
  id: string;                    // アカウント一意ID
  email: string;                 // Gmailアドレス
  status: 'connected' | 'not_connected';  // 接続状態
  lastScanned?: Date;            // 最終スキャン日時
  scanSettings: {
    period: '7d' | '30d' | '90d' | '1y';  // 解析期間
    promotionsOnly: boolean;     // Promotions優先（削除予定）
  };
  isScanning?: boolean;          // スキャン中フラグ
  scanProgress?: number;         // スキャン進捗（0-100）
}
```

**補足:**
- `promotionsOnly`フィールドはMVPで削除済み（UIから削除）
- 複数アカウント対応済み（ヘッダーのドロップダウンで切り替え）

### 4.2 RegistrationSource（登録先候補）

```typescript
interface RegistrationSource {
  id: string;                    // Source一意ID
  displayName: string;           // 表示名（例: "Netflix"）
  domain: string;                // ドメイン（例: "netflix.com"）
  senderEmail: string;           // 送信元メールアドレス
  category: 'newsletter' | 'payment' | 'account' | 'other';
  confidence: 'high' | 'medium' | 'low';  // 信頼度
  isUrgent?: boolean;            // 至急対応フラグ
  evidence: Evidence[];          // 根拠リスト
  firstSeen: Date;               // 初回検出日
  lastSeen: Date;                // 最終検出日
  frequency: {
    count: number;               // メール数
    period: number;              // 期間（日数）
    pattern?: 'daily' | 'weekly' | 'monthly';  // パターン
  };
  sampleEmails: EmailSample[];   // サンプルメール
}
```

#### カテゴリの定義

| カテゴリ | 説明 | アイコン | カラー |
|---------|------|---------|--------|
| newsletter | メルマガ・ニュースレター | Mail | Purple |
| payment | 支払い・購入・領収書 | CreditCard | Green |
| account | アカウント・認証・パスワードリセット | User | Cyan |
| other | その他 | Tag | Gray |

#### 信頼度（Confidence）の定義

- **high**: 複数の根拠があり、分類の確度が高い
- **medium**: 一部の根拠のみ、または曖昧な分類
- **low**: 根拠が弱い、またはカテゴリ判定が難しい

#### Urgentフラグ

`isUrgent: true`の場合、以下のような緊急対応が必要な状態を示します：
- 支払い失敗・遅延
- アカウント停止警告
- セキュリティアラート
- サービス期限切れ

**UI表示:** 赤い"URGENT"バッジで視覚的に強調

### 4.3 Evidence（根拠）

```typescript
interface Evidence {
  type: 'list-unsubscribe' | 'receipt-keyword' | 'auth-keyword' | 
        'bulk-sender' | 'regular-pattern' | 'urgent-keyword';
  description: string;           // 根拠の説明文
}
```

#### 根拠タイプの説明

| タイプ | 説明 | 例 |
|-------|------|-----|
| list-unsubscribe | List-Unsubscribeヘッダーの存在 | メルマガの配信停止リンク |
| receipt-keyword | 領収書・購入キーワード | 「領収書」「購入」「payment」 |
| auth-keyword | 認証・アカウント関連キーワード | 「パスワードリセット」「verify」 |
| bulk-sender | 大量送信者の検出 | SPFレコード、DKIM署名 |
| regular-pattern | 定期的な送信パターン | 毎週月曜、毎月1日など |
| urgent-keyword | 緊急キーワード | 「至急」「failed」「warning」 |

### 4.4 EmailSample（メールサンプル）

```typescript
interface EmailSample {
  date: Date;                    // メール日時
  subject: string;               // 件名
  snippet: string;               // 本文スニペット
  messageId?: string;            // GmailメッセージID
}
```

### 4.5 SearchRecipe（検索レシピ）

```typescript
interface SearchRecipe {
  id: string;
  title: string;                 // レシピ名
  query: string;                 // Gmail検索クエリ
  description?: string;          // 説明
}
```

**検索レシピの例:**
- すべてのメール: `from:domain.com`
- 未読のみ: `from:domain.com is:unread`
- 30日以内: `from:domain.com newer_than:30d`
- 領収書のみ: `from:domain.com subject:領収書`

### 4.6 ScanSummary（スキャン結果サマリ）

```typescript
interface ScanSummary {
  totalSources: number;          // 総登録先数
  newsletterCount: number;       // メルマガ数
  paymentCount: number;          // 支払い数
  accountCount: number;          // アカウント数
  newlyFound: RegistrationSource[];  // 新規発見
}
```

### 4.7 MailboxInsights（メールボックス分析）

```typescript
interface MailboxInsights {
  healthScore: number;           // 健康スコア（0-100）
  storageUsedPercent: number;    // ストレージ使用率
  unreadCount: number;           // 未読メール数
  urgentCount: number;           // 緊急対応数
  categoryDistribution: {
    newsletter: number;
    payment: number;
    account: number;
    other: number;
  };
  trendData: {
    date: string;                // YYYY-MM-DD
    emails: number;              // メール数
  }[];
  topSenders: {
    name: string;
    domain: string;
    count: number;
    category: 'newsletter' | 'payment' | 'account' | 'other';
  }[];
  aiSuggestions: AISuggestion[];
  alerts: Alert[];
  quickActions: QuickAction[];
}
```

### 4.8 AISuggestion（AI提案）

```typescript
interface AISuggestion {
  id: string;
  type: 'unsubscribe' | 'archive' | 'urgent' | 'storage' | 'organization';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  affectedSourceIds?: string[]; // 関連するSource ID
}
```

### 4.9 Alert（アラート）

```typescript
interface Alert {
  id: string;
  type: 'urgent' | 'storage' | 'unread' | 'security';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
}
```

### 4.10 QuickAction（クイックアクション）

```typescript
interface QuickAction {
  id: string;
  label: string;
  description: string;
  sourceCount: number;           // 対象Source数
  category?: 'newsletter' | 'payment' | 'account' | 'other';
}
```

---

## 5. 画面仕様

### 5.1 Account画面（`/account`）

#### 目的
Gmailアカウントの接続・管理、スキャン設定、スキャン実行、結果サマリの表示

#### レイアウト

```
+------------------------------------------+
| Account                                  |
+------------------------------------------+
| [Account Card]                           |
|   user@example.com                       |
|   [Connected] 最終スキャン: 2026-02-15   |
|                                          |
|   解析範囲:                              |
|   [7d] [30d] [90d] [1y]                 |
|                                          |
|   [⚡ Scan]                              |
+------------------------------------------+
| [スキャン結果サマリ]                     |
|   [24] 登録先候補                        |
|   [8] メルマガ候補                       |
|   [12] 支払い候補                        |
|   [4] アカウント候補                     |
|   [登録先を見る →]                       |
+------------------------------------------+
| [今回新しく見つかった登録先]             |
|   • Netflix                              |
|   • Notion                               |
+------------------------------------------+
```

#### コンポーネント構成

1. **ページヘッダー**
   - タイトル: "Account"（h1, text-3xl）

2. **Account Card**
   - メールアドレス（h2, text-2xl）
   - ステータスバッジ
     - Connected: 緑背景（bg-green-100 text-green-800）
     - Not connected: 灰色背景（bg-gray-100 text-gray-800）
   - 最終スキャン日時（Calendar アイコン付き）

3. **解析範囲設定**
   - セグメント選択（7d / 30d / 90d / 1y）
   - ボタングループ形式
   - 選択中: 青背景（bg-blue-600 text-white）
   - 非選択: 灰色背景（bg-gray-100 text-gray-700）

4. **アクションボタン**
   - Not connected時: "Connect Google"（青ボタン）
   - Connected時: "⚡ Scan"（青ボタン、Zapアイコン付き）
   - スキャン中: "スキャン中..."（disabled、プログレスバー表示）

5. **スキャン結果サマリ**（Connected && スキャン済みの場合のみ表示）
   - 4つの統計カード（グラデーション背景）
     - 総数: 青グラデーション
     - Newsletter: 紫グラデーション
     - Payment: 緑グラデーション
     - Account: シアングラデーション
   - "登録先を見る"ボタン（黒背景、TrendingUp アイコン）

6. **新規発見リスト**（新規Sourceがある場合のみ表示）
   - Source名とドメイン
   - "Gmail で検索"リンク

#### インタラクション

- **Connect Googleボタン**: Google OAuth接続（現在はアラート表示）
- **Scanボタン**: スキャン実行、3秒後にlastScannedを更新
- **セグメントボタン**: クリックで解析期間を変更
- **登録先を見るボタン**: `/sources`に遷移
- **Gmail で検索リンク**: Gmail検索ページを新規タブで開く

### 5.2 Sources画面（`/sources`）

#### 目的
登録先候補の一覧表示、フィルタ・ソート機能

#### レイアウト

```
+------------------------------------------+
| Sources                                  |
| 24 sources found                         |
+------------------------------------------+
| [Filter]  [Sort]  [Search]              |
| Category: [All] [Newsletter] ...        |
| Confidence: [All] [High] ...            |
| □ Show urgent only                      |
+------------------------------------------+
| [Source Card 1]                          |
| [🟣] Netflix                   [URGENT]  |
| netflix.com                    High ★★★ |
| 14 emails in 90 days                    |
+------------------------------------------+
| [Source Card 2]                          |
| ...                                      |
+------------------------------------------+
```

#### コンポーネント構成

1. **ページヘッダー**
   - タイトル: "Sources"（h1）
   - カウント表示: "24 sources found"（text-gray-600）

2. **フィルタセクション**
   - **カテゴリフィルタ**（タブ形式）
     - All / Newsletter / Payment / Account / Other
     - アイコン付き（Motion でアニメーション）
     - 選択中: 青背景（bg-blue-50 text-blue-700 border-blue-700）
   - **信頼度フィルタ**（タブ形式）
     - All / High / Medium / Low
     - 選択中: 青テキスト
   - **Urgentフィルタ**（チェックボックス）
     - "Show urgent only"
     - 赤いフレームでアイコン（AlertTriangle）

3. **ソート**
   - ドロップダウンメニュー（Filter アイコン）
   - オプション: 名前（昇順）/ 最近の日付 / 信頼度

4. **検索ボックス**
   - プレースホルダー: "Search sources..."
   - リアルタイム検索（名前・ドメイン）

5. **Sourceカード**
   - **左側**
     - カテゴリアイコン（円形、カテゴリ別色）
     - 表示名（font-semibold）
     - ドメイン（text-sm text-gray-600）
   - **右側**
     - Urgentバッジ（赤背景、AlertTriangle アイコン）
     - 信頼度表示（★マーク + High/Medium/Low）
     - メール数と期間（例: "14 emails in 90 days"）
   - **ホバー**: 影が強くなる、カーソルがpointerに

#### インタラクション

- **カテゴリタブ**: クリックでフィルタ適用、アイコンがMotionでアニメーション
- **信頼度タブ**: クリックでフィルタ適用
- **Urgentチェック**: ONでurgent=trueのみ表示
- **ソートドロップダウン**: ソート順を変更
- **検索ボックス**: 入力でリアルタイムフィルタ
- **Sourceカード**: クリックで`/sources/:id`に遷移

#### フィルタロジック

複数フィルタは**AND条件**で適用:
```
表示対象 = Sources
  .filter(category === 'all' || source.category === category)
  .filter(confidence === 'all' || source.confidence === confidence)
  .filter(!urgentOnly || source.isUrgent === true)
  .filter(searchQuery === '' || source.displayName.includes(searchQuery) || source.domain.includes(searchQuery))
```

### 5.3 Source詳細画面（`/sources/:id`）

#### 目的
個別Sourceの詳細情報、根拠、Gmail検索レシピ、メールサンプルの表示

#### レイアウト

```
+------------------------------------------+
| ← Sources                                |
+------------------------------------------+
| [🟣] Netflix                   [URGENT]  |
| netflix.com                              |
| info@mailer.netflix.com                  |
|                                          |
| Category: Payment        Confidence: ★★★|
| First seen: 2024-01-15                   |
| Last seen: 2026-02-14                    |
| Frequency: 14 emails in 90 days (monthly)|
+------------------------------------------+
| Evidence (根拠)                          |
| • 件名に「payment failed」が含まれる     |
| • 件名に「billing」が含まれる            |
| • 月次で定期的に届く                     |
+------------------------------------------+
| Gmail検索レシピ                          |
| [すべてのメール]                         |
| from:netflix.com                         |
| [未読のみ]                               |
| from:netflix.com is:unread               |
+------------------------------------------+
| メールサンプル                           |
| 2026-02-14                               |
| 【重要】Netflix: Payment Failed          |
| Your recent payment could not...         |
+------------------------------------------+
```

#### コンポーネント構成

1. **Breadcrumb**
   - "← Sources" リンク（/sourcesに戻る）

2. **ヘッダーセクション**
   - カテゴリアイコン（大）
   - 表示名（h1, text-3xl）
   - Urgentバッジ（該当時）
   - ドメイン（text-xl text-gray-600）
   - 送信元メールアドレス（text-gray-500）

3. **メタ情報カード**
   - カテゴリバッジ（カテゴリ色背景）
   - 信頼度（★マーク + High/Medium/Low）
   - First seen（Calendar アイコン）
   - Last seen（Calendar アイコン）
   - 頻度（BarChart3 アイコン）

4. **Evidenceセクション**
   - タイトル: "Evidence (根拠)"
   - リスト形式で根拠を表示（CheckCircle2 アイコン）

5. **Gmail検索レシピ**
   - タイトル: "Gmail検索レシピ"
   - 各レシピカード
     - レシピ名
     - 検索クエリ（コード表示、bg-gray-50）
     - "Search in Gmail"ボタン（新規タブで開く）

6. **メールサンプル**
   - タイトル: "メールサンプル"
   - 各サンプルカード
     - 日付（text-sm text-gray-500）
     - 件名（font-medium）
     - スニペット（text-sm text-gray-600）

#### インタラクション

- **← Sourcesリンク**: `/sources`に戻る
- **Search in Gmailボタン**: Gmail検索ページを新規タブで開く
  - URL例: `https://mail.google.com/mail/u/0/#search/from:netflix.com`

### 5.4 Insights画面（`/insights`）【Beta】

#### 目的
メールボックス全体の健康状態、カテゴリ別分布、AI提案、アラートの表示

#### レイアウト

```
+------------------------------------------+
| Insights [Beta]                          |
| メールボックスの全体像を分析             |
+------------------------------------------+
| [健康スコア: 72/100] [Medium]           |
| [ストレージ: 58%] [未読: 234]           |
+------------------------------------------+
| [カテゴリ別分布] (円グラフ)             |
+------------------------------------------+
| [メール受信トレンド] (折れ線グラフ)     |
+------------------------------------------+
| [Top Senders] (棒グラフ)                |
+------------------------------------------+
| [AI提案]                                 |
| • 45個のメルマガを配信停止すると...     |
| • 古いメールをアーカイブすると...       |
+------------------------------------------+
| [アラート]                               |
| ⚠ 3件の至急対応が必要                   |
| ℹ 未読メールが200件を超えています       |
+------------------------------------------+
| [クイックアクション]                     |
| [未読をすべてマーク] [8 sources]        |
| [低頻度メルマガを整理] [12 sources]     |
+------------------------------------------+
```

#### コンポーネント構成

1. **ページヘッダー**
   - タイトル: "Insights"（h1）+ Betaバッジ（青背景）
   - 説明文: "メールボックスの全体像を分析"

2. **健康スコアセクション**
   - スコア表示（大きな数字、0-100）
   - ステータスラベル（Excellent / Good / Medium / Poor）
     - Excellent（90-100）: 緑
     - Good（70-89）: 青
     - Medium（50-69）: 黄
     - Poor（0-49）: 赤
   - プログレスバー（色はステータスに応じて）

3. **統計カード**（グリッド配置）
   - ストレージ使用率（Database アイコン）
   - 未読メール数（Mail アイコン）
   - 緊急対応数（AlertTriangle アイコン）

4. **カテゴリ別分布**
   - 円グラフ（recharts PieChart）
   - カテゴリごとに色分け
     - Newsletter: 紫
     - Payment: 緑
     - Account: シアン
     - Other: グレー

5. **メール受信トレンド**
   - 折れ線グラフ（recharts LineChart）
   - 過去7日間のメール数推移

6. **Top Senders**
   - 棒グラフ（recharts BarChart）
   - 送信者ごとのメール数とカテゴリ

7. **AI提案セクション**
   - タイトル: "AI Management Suggestions"（Sparkles アイコン）
   - 提案カード（優先度別にソート）
     - High: 赤ボーダー
     - Medium: 黄ボーダー
     - Low: グレーボーダー
   - 各提案
     - タイプアイコン（UserX / Archive / AlertTriangle / HardDrive / FolderTree）
     - タイトル（font-medium）
     - 説明文（text-sm）

8. **アラートセクション**
   - タイトル: "Alerts"（Bell アイコン）
   - アラートカード（重要度別にソート）
     - Critical: 赤背景（bg-red-50 border-red-200）
     - Warning: 黄背景（bg-yellow-50 border-yellow-200）
     - Info: 青背景（bg-blue-50 border-blue-200）
   - 各アラート
     - タイプアイコン（AlertTriangle / HardDrive / Mail / ShieldAlert）
     - タイトル（font-semibold）
     - 説明文（text-sm）

9. **クイックアクションセクション**
   - タイトル: "Quick Actions"（Zap アイコン）
   - アクションカード（グリッド配置）
     - ラベル（font-medium）
     - 説明文（text-sm）
     - 対象Source数（グレーバッジ）
     - ボタン（"Take Action"）

#### インタラクション

- **Take Actionボタン**: アクション実行（現在はアラート表示）
- **グラフ**: ホバーでツールチップ表示（recharts標準）

**注意:** Insights画面とFlow画面は、セキュリティ方針により現在のMVPでは実装していません。将来的にローカルAI実装後に追加予定です。

---

## 6. コンポーネント仕様

### 6.1 Layout

**ファイル:** `/src/app/components/Layout.tsx`

#### Props
```typescript
interface LayoutProps {
  children: ReactNode;
  currentAccount: string;         // 現在のアカウントメールアドレス
  accounts: Account[];            // アカウントリスト
  onScan?: () => void;
  onAccountSwitch?: (accountId: string) => void;
  onAddAccount?: () => void;
}
```

#### 構造
```
<div className="flex h-screen bg-gray-50">
  <Sidebar />
  <div className="flex-1 flex flex-col overflow-hidden">
    <Header {...props} />
    <main className="flex-1 overflow-auto">
      {children}
    </main>
  </div>
</div>
```

### 6.2 Sidebar

**ファイル:** `/src/app/components/Sidebar.tsx`

#### ナビゲーション項目

| Path | Label | Icon | Badge | Disabled |
|------|-------|------|-------|----------|
| /account | Account | Mail | - | false |
| /sources | Sources | Database | - | false |
| /insights | Insights | BarChart3 | Beta | false |
| /flow | Flow | GitBranch | - | false |
| /pinned | Pinned | Pin | Soon | true |

#### スタイル
- 幅: 240px（w-60）
- 背景: 白（bg-white）
- ボーダー: 右側にグレーボーダー
- ロゴセクション: "RegiScope for Gmail"（text-xl font-semibold）
- アクティブ項目: 青背景（bg-blue-50 text-blue-700 font-medium）
- 非アクティブ項目: グレーテキスト、ホバーで薄いグレー背景

### 6.3 Header

**ファイル:** `/src/app/components/Header.tsx`

#### Props
```typescript
interface HeaderProps {
  currentAccount: string;
  accounts: Account[];
  onScan?: () => void;
  onAccountSwitch?: (accountId: string) => void;
  onAddAccount?: () => void;
}
```

#### コンポーネント
1. **左側**: 空（余白）
2. **右側**: アカウントドロップダウン
   - 現在のアカウントメールアドレス
   - ChevronDown アイコン
   - クリックでドロップダウンメニュー表示

#### ドロップダウンメニュー
- アカウントリスト
  - 各アカウント: メールアドレス + Checkアイコン（選択中）
  - クリックでアカウント切り替え
- 区切り線
- "Add Account"（Plusアイコン）

#### スタイル
- 高さ: 64px（h-16）
- 背景: 白（bg-white）
- ボーダー: 下側にグレーボーダー
- ドロップダウン: 白背景、影付き（shadow-lg）

### 6.4 CategoryIcon

**ファイル:** `/src/app/components/CategoryIcon.tsx`

#### Props
```typescript
interface CategoryIconProps {
  category: 'newsletter' | 'payment' | 'account' | 'other';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}
```

#### カテゴリ別設定

| Category | Icon | Color | AnimationType |
|----------|------|-------|---------------|
| newsletter | Mail | Purple-500 | bounce |
| payment | CreditCard | Green-500 | scale |
| account | User | Cyan-500 | rotate |
| other | Tag | Gray-400 | opacity |

#### Motion アニメーション

- **animated=true**の場合、ホバー時にMotionアニメーション
- bounce: `animate={{ y: [0, -8, 0] }}`
- scale: `animate={{ scale: [1, 1.2, 1] }}`
- rotate: `animate={{ rotate: [0, 360] }}`
- opacity: `animate={{ opacity: [1, 0.5, 1] }}`

#### サイズ
- sm: w-8 h-8, アイコン w-4 h-4
- md: w-12 h-12, アイコン w-6 h-6
- lg: w-16 h-16, アイコン w-8 h-8

---

## 7. インタラクション仕様

### 7.1 アカウント切り替え

#### フロー
1. ヘッダーのアカウントドロップダウンをクリック
2. メニューが表示される
3. 別のアカウントを選択
4. `onAccountSwitch(accountId)`が呼ばれる
5. `currentAccountId`が更新される
6. 全画面が新しいアカウントのデータで再レンダリング

#### 注意点
- アカウント切り替え時、フィルタ・ソート状態はリセットされない
- 現在選択中のアカウントには右側にCheckアイコン表示

### 7.2 フィルタ機能（Sources面）

#### カテゴリフィルタ
- タブ形式（All / Newsletter / Payment / Account / Other）
- 複数選択不可（ラジオボタン的動作）
- 選択時、アイコンがMotionでアニメーション

#### 信頼度フィルタ
- タブ形式（All / High / Medium / Low）
- 複数選択不可

#### Urgentフィルタ
- チェックボックス形式
- ON時、`isUrgent=true`のSourceのみ表示

#### 検索フィルタ
- 入力ボックス（リアルタイム検索）
- displayNameとdomainで部分一致検索

### 7.3 ソート機能（Sources画面）

#### ソートオプション
- **名前（昇順）**: displayNameでアルファベット順
- **最近の日付**: lastSeenで降順
- **信頼度**: confidence順（High > Medium > Low）

#### UI
- ドロップダウンメニュー（Filter アイコン）
- 選択中のソート順を表示

### 7.4 Gmail連携

#### 検索レシピの生成

各Sourceに対して、以下の検索レシピを自動生成:

```typescript
const recipes: SearchRecipe[] = [
  {
    id: '1',
    title: 'すべてのメール',
    query: `from:${source.domain}`,
  },
  {
    id: '2',
    title: '未読のみ',
    query: `from:${source.domain} is:unread`,
  },
  {
    id: '3',
    title: '30日以内',
    query: `from:${source.domain} newer_than:30d`,
  },
];
```

#### Gmail検索URLの構築

```typescript
const gmailSearchUrl = (query: string) => {
  return `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(query)}`;
};
```

#### 動作
- "Search in Gmail"ボタンをクリック
- 新規タブでGmail検索ページを開く
- ユーザーは該当メールを直接確認できる

---

## 8. 画面遷移図

### 8.1 基本フロー

```
[Account画面]
    │
    │ (1) Gmail接続
    ↓
[Google OAuth認証]
    │
    │ (2) 接続完了
    ↓
[Account画面]
    │
    │ (3) スキャン実行
    ↓
[スキャン中（プログレスバー）]
    │
    │ (4) スキャン完了
    ↓
[Account画面（結果サマリ表示）]
    │
    │ (5) "登録先を見る"クリック
    ↓
[Sources画面]
    │
    │ (6) Sourceカードクリック
    ↓
[Source詳細画面]
    │
    │ (7) "Search in Gmail"クリック
    ↓
[Gmail（新規タブ）]
```

### 8.2 MVP並行フロー

```
[Account画面] ←──→ [Sources画面] ←─ サイドバーで切り替え
```

### 8.3 URLルーティング（MVP）

| Path | Component | 説明 |
|------|-----------|------|
| `/` | Navigate to `/account` | リダイレクト |
| `/account` | AccountView | アカウント管理 |
| `/sources` | SourcesView | 登録先一覧 |
| `/sources/:id` | SourceDetailView | Source詳細 |
| その他 | Navigate to `/account` | リダイレクト |

**将来追加予定:**
- `/insights`: Insights（メールボックス分析）
- `/pinned`: Pinned（お気に入り管理）

---

## 9. スタイルガイド

### 9.1 カラーパレット

#### プライマリカラー
- **Blue-600**: `#2563eb` - メインアクションボタン、選択状態
- **Blue-50**: `#eff6ff` - 選択時の背景色
- **Blue-700**: `#1d4ed8` - ホバー時のボタン

#### カテゴリカラー
- **Newsletter**: Purple系（`text-purple-600`, `bg-purple-100`）
- **Payment**: Green系（`text-green-600`, `bg-green-100`）
- **Account**: Cyan系（`text-cyan-600`, `bg-cyan-100`）
- **Other**: Gray系（`text-gray-600`, `bg-gray-100`）

#### Urgentカラー
- **Red-600**: `#dc2626` - Urgentバッジ背景、アラート
- **Red-50**: `#fef2f2` - Urgentアラート背景

#### グレースケール
- **Gray-50**: `#f9fafb` - ページ背景
- **Gray-100**: `#f3f4f6` - 非選択ボタン背景
- **Gray-200**: `#e5e7eb` - ボーダー
- **Gray-600**: `#4b5563` - サブテキスト
- **Gray-900**: `#111827` - メインタクスト

### 9.2 タイポグラフィ

#### 見出し
- **H1**: `text-3xl font-semibold` (30px, 600)
- **H2**: `text-2xl font-medium` (24px, 500)
- **H3**: `text-lg font-medium` (18px, 500)

#### 本文
- **Body**: `text-base` (16px)
- **Small**: `text-sm` (14px)
- **Extra Small**: `text-xs` (12px)

#### フォントウェイト
- **Semibold**: `font-semibold` (600)
- **Medium**: `font-medium` (500)
- **Normal**: `font-normal` (400)

### 9.3 スペーシング

#### コンテナ
- **ページパディング**: `p-8` (32px)
- **カード間マージン**: `mb-6` (24px)
- **セクション間**: `mb-8` (32px)

#### コンポーネント内部
- **ボタンパディング**: `px-6 py-3` (24px 12px)
- **カードパディング**: `p-8` (32px)
- **アイコンとテキスト間**: `gap-2` (8px)

### 9.4 シャドウ

- **カード**: `shadow-sm` - 軽い影
- **ホバー時**: `shadow-md` - やや強い影
- **ドロップダウン**: `shadow-lg` - 強い影

### 9.5 ボーダーラジウス

- **標準**: `rounded-lg` (8px)
- **大**: `rounded-xl` (12px)
- **円形**: `rounded-full`

### 9.6 アイコン

**使用ライブラリ:** lucide-react

#### 主要アイコン

| 用途 | アイコン |
|------|---------|
| Account | Mail |
| Sources | Database |
| Insights | BarChart3 |
| Flow | GitBranch |
| Newsletter | Mail |
| Payment | CreditCard |
| Account（カテゴリ） | User |
| Other | Tag |
| Urgent | AlertTriangle |
| Scan | Zap |
| Calendar | Calendar |
| Trend | TrendingUp |
| Filter | Filter |
| Search | Search |
| Check | Check |
| Plus | Plus |
| ChevronDown | ChevronDown |

#### アインサイズ
- **Small**: `w-4 h-4` (16px)
- **Medium**: `w-5 h-5` (20px)
- **Large**: `w-6 h-6` (24px)
- **Extra Large**: `w-8 h-8` (32px)

---

## 10. 技術スタック

### 10.1 フレームワーク・ライブラリ

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 18.x | UIライブラリ |
| TypeScript | 5.x | 型安全性 |
| Tailwind CSS | 4.0 | スタイリング |
| React Router | 6.x | ルーティング |
| motion | latest | アニメーション（旧Framer Motion） |
| lucide-react | latest | アイコン |
| recharts | latest | グラフ・チャート |

### 10.2 ディレクトリ構造

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # ルートコンポーネント
│   │   ├── types.ts                   # 型定義
│   │   ├── mockData.ts                # モックデータ
│   │   └── components/
│   │       ├── Layout.tsx             # レイアウト
│   │       ├── Sidebar.tsx            # サイドバー
│   │       ├── Header.tsx             # ヘッダー
│   │       ├── AccountView.tsx        # Account画面
│   │       ├── SourcesView.tsx        # Sources画面
│   │       ├── SourceDetailView.tsx   # Source詳細画面
│   │       ├── Insights.tsx           # Insights画面
│   │       ├── FlowView.tsx           # Flow画面
│   │       └── CategoryIcon.tsx       # カテゴリアイコン
│   ├── styles/
│   │   ├── theme.css                  # Tailwind v4設定
│   │   └── fonts.css                  # フォント設定
│   └── main.tsx                       # エントリーポイント
├── package.json
└── DESIGN_SPEC.md                     # 本ドキュメント
```

### 10.3 状態管理

現在はReactの`useState`でローカル状態管理。将来的にはSupabaseやContext APIを導入予定。

---

## 11. 実装上の注意点

### 11.1 Tailwind CSS v4

- **preflight有効**: デフォルトスタイルがリセットされる
- **theme.css**: カスタムトークンは`/src/styles/theme.css`で定義
- **インラインクラス**: コンポーネント内でTailwindクラスを直接使用
- **Font設定**: `/src/styles/fonts.css`のみにフォントインポートを追加

### 11.2 Motion（旧Framer Motion）

- **インストール**: `motion`パッケージ
- **インポート**: `import { motion } from 'motion/react'`
- **使用箇所**: CategoryIconのホバーアニメーション

### 11.3 React Router

- **BrowserRouter**: ルート階層で使用
- **Navigate**: リダイレクト用
- **useParams**: URLパラメータ取得（Source詳細）
- **useNavigate**: プログラマティックナビゲーション（Flow画面）

### 11.4 日英混在データ

- モックデータは日英混在（実際のGmailメールを想定）
- UIテキストは日本語中心だが、技術用語は英語（例: "Sources", "Account"）

### 11.5 レスポンシブ対応

現時点では**デスクトップ優先**で実装。モバイル対応は今後の課題。

### 11.6 アクセシビリティ

- **キーボード操作**: タブキーでフォーカス移動可能
- **アイコンのみボタン**: `<span className="sr-only">`で説明追加
- **カラーコントラスト**: WCAG AA準拠を目指す

---

## 12. 今後の開発予定

### 12.1 Gmail API統合（最優先）

- **OAuth認証**: Google OAuth 2.0フロー実装
- **メール取得**: Gmail API v1でメール一覧取得
- **解析ロジック**: メールヘッダー・本文からSourceを抽出
- **リアルタイムスキャン**: 実際のメールをスキャンしてSourceを生成

### 12.2 バックエンド（Supabase）

- **データベース**: Account、RegistrationSource、ScanHistoryテーブル
- **認証**: Supabase Authでユーザー管理
- **API**: Supabase Client経由でCRUD操作

### 12.3 追加機能

- **Pinnedビュー**: お気に入りSource管理
- **メール操作**: Gmail APIでメール削除・アーカイブ・マーク
- **配信停止**: List-Unsubscribeヘッダーを使った自動配信停止
- **エクスポート**: SourceリストをCSV/JSONでエクスポート
- **通知**: Urgent対応の通知（ブラウザ通知、メール通知）

### 12.4 UI/UX改善

- **モバイル対応**: レスポンシブレイアウト
- **ダークモード**: テーマ切り替え機能
- **多言語対応**: i18n導入（日本語・英語）
- **オンボーディング**: 初回利用時のチュートリアル

### 12.5 AI機能強化

- **より精度の高い分類**: LLMを使った高度な分類
- **カスタムルール**: ユーザー定義の分類ルール
- **スマート提案**: ユーザーの行動に基づいた提案

---

## 補足: プロンプトとしての使用方法

このドキュメントは、**Figmaでのデザイン作成**や**Angularでの実装**時に、以下のように活用できます：

### Figmaデザイン作成時

```
以下の詳細設計書に基づいて、RegiScope for GmailアプリのFigmaデザインを作成してください。

[DESIGN_SPEC.mdの内容を貼り付け]

特に以下の点に注意してください：
- カラーパレット（セクション8.1）に従う
- タイポグラフィ（セクション8.2）を正確に反映
- 画面仕様（セクション5）の各レイアウトを忠実に再現
- カテゴリアイコン（セクション8.6）を配置
```

### Angular実装時

```
以下の詳細設計書に基づいて、RegiScope for GmailアプリをAngularで実装してください。

[DESIGN_SPEC.mdの内容を貼り付け]

要件：
- Angular 17以上を使用
- データモデル（セクション4）をTypeScriptインターフェースとして定義
- 画面仕様（セクション5）を各Componentとして実装
- Tailwind CSSを使用してスタイリング
- ルーティング（セクション8.3）を設定
```

### 他のフレームワーク（Vue、Svelte等）

```
以下の詳細設計書に基づいて、RegiScope for Gmailアプリを[フレームワーク名]で実装してください。

[DESIGN_SPEC.mdの内容を貼り付け]

[フレームワーク固有の要件を追加]
```

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-02-15 | 1.0 | 初版作成（MVP実装完了時点） |
| 2026-02-15 | 1.1 | セキュリティ方針追加 |
| 2026-02-15 | 2.0 | MVP（最小設計）追加 |

---

**End of Document**