# Self University（自分だけの大学）

意志力に依存せず、大学制度のような仕組みで毎日学習を継続するWebアプリ。

## 技術スタック

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **Supabase** (認証・DB)
- **OpenAI API** (将来のAI評価用・構造のみ)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase プロジェクト作成

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. SQL Editor で `supabase/migrations/001_initial_schema.sql` を実行
3. Authentication > Settings で Email認証を有効化

### 3. 環境変数

```bash
cp .env.example .env.local
```

`.env.local` に以下を設定:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス。

## 使い方

1. **新規登録** → デフォルト科目（英語・中国語・読書・欧州政治研究・数理・論理）が自動作成
2. **課題を作成** → 15〜30分の小さな課題を科目に紐づけて登録
3. **毎日ダッシュボードを開く** → 今日の課題を確認
4. **提出** → テキストで1分以内に提出 → 自動で完了

## ページ構成

| パス | 機能 |
|------|------|
| `/dashboard` | 今日の課題・進捗率・GPA・学習状況 |
| `/assignments` | 課題一覧・新規作成 |
| `/assignments/[id]` | 課題詳細・提出 |
| `/courses` | 科目一覧 |
| `/courses/[id]` | 科目詳細・進捗 |

## DB スキーマ

```
profiles          ← auth.users を拡張
courses           ← 履修科目
assignments       ← 課題（毎日繰り返し対応）
submissions       ← 提出内容
progress          ← 日次進捗スナップショット
academic_status   ← GPA・学習状況
```

## 将来の拡張

- [ ] OpenAI による提出物の自動評価 (`src/lib/openai.ts`)
- [ ] Slack 通知
- [ ] 自動課題生成
- [ ] カレンダー連携
