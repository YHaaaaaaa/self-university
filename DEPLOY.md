# Self University デプロイ手順

どのパソコン・スマホからでも使えるようにするための手順です。
所要時間：約30分

---

## 全体の流れ

```
① Supabase（データベース）を作成
② GitHub（コード保管）にアップロード
③ Vercel（アプリ公開）にデプロイ
④ 動作確認
```

---

## Step 1: Supabase プロジェクト作成

### 1-1. アカウント作成

1. https://supabase.com にアクセス
2. 「Start your project」→ GitHubまたはメールでサインアップ
3. 「New project」をクリック
4. 設定:
   - **Name**: `self-university`
   - **Database Password**: 安全なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を選択
5. 「Create new project」をクリック（1〜2分待つ）

### 1-2. データベースのセットアップ

1. 左メニュー **SQL Editor** を開く
2. 「New query」をクリック
3. このリポジトリの `supabase/migrations/001_initial_schema.sql` の内容をすべてコピー＆ペースト
4. 「Run」をクリック → `Success` と表示されればOK

### 1-3. 認証設定

1. 左メニュー **Authentication** → **Providers** を開く
2. **Email** が有効になっていることを確認
3. **Authentication** → **URL Configuration** を開く
4. 以下を設定（Vercelデプロイ後に本番URLも追加）:

| 項目 | 値 |
|------|-----|
| Site URL | `http://localhost:3000`（後でVercelのURLに変更） |
| Redirect URLs | `http://localhost:3000/**` |

5. **Authentication** → **Providers** → **Email** で:
   - 「Confirm email」を **OFF** にする（MVPではメール確認なしで即ログイン可能）

### 1-4. APIキーの取得

1. 左メニュー **Project Settings**（歯車アイコン）→ **API** を開く
2. 以下をメモ:

```
Project URL:  https://xxxxxxxx.supabase.co
anon public:  eyJhbGci...（長い文字列）
```

---

## Step 2: GitHub にコードをアップロード

### 2-1. GitHubでリポジトリ作成

1. https://github.com/new にアクセス
2. 設定:
   - **Repository name**: `self-university`
   - **Visibility**: Private（推奨）
3. 「Create repository」をクリック
4. 表示されるリポジトリURLをメモ（例: `https://github.com/あなたのユーザー名/self-university.git`）

### 2-2. ターミナルでプッシュ

プロジェクトフォルダで以下を実行:

```bash
cd "/Users/ta_yutaro_hanawa/Desktop/self univ"

# リモートを追加（URLは自分のものに置き換え）
git remote add origin https://github.com/あなたのユーザー名/self-university.git

# プッシュ
git push -u origin main
```

> GitHubのログインを求められたら、ブラウザで認証してください。

---

## Step 3: Vercel にデプロイ

### 3-1. Vercelアカウント作成

1. https://vercel.com にアクセス
2. 「Sign Up」→ **GitHub** でサインアップ（連携が簡単）

### 3-2. プロジェクトをインポート

1. ダッシュボードで「Add New...」→「Project」
2. GitHubの `self-university` リポジトリを選択 →「Import」
3. **Environment Variables** を追加:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Step 1-4 でメモした Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Step 1-4 でメモした anon public キー |

4. 「Deploy」をクリック（2〜3分待つ）

### 3-3. デプロイ完了

`https://self-university-xxxx.vercel.app` のようなURLが表示されます。
このURLをブックマークしてください。

---

## Step 4: Supabase に本番URLを登録

VercelのURLが確定したら、Supabaseに戻って設定を更新します。

1. **Authentication** → **URL Configuration**
2. 更新:

| 項目 | 値 |
|------|-----|
| Site URL | `https://self-university-xxxx.vercel.app`（自分のVercel URL） |
| Redirect URLs | `https://self-university-xxxx.vercel.app/**` |

3. 「Save」をクリック

---

## Step 5: 動作確認

1. VercelのURLをブラウザで開く
2. `/signup` で新規登録
3. ダッシュボードが表示されれば成功
4. スマホのブラウザでも同じURLを開いて確認

---

## ローカル開発（このMacで続けて開発する場合）

```bash
cp .env.example .env.local
# .env.local に Supabase の URL と anon key を記入

npm run dev
```

コードを変更してGitHubにプッシュすると、Vercelが自動で再デプロイします。

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| ログインできない | Supabaseの Site URL / Redirect URLs を確認 |
| ビルドエラー | Vercelの Environment Variables が正しく設定されているか確認 |
| 課題が表示されない | SQLマイグレーションが実行済みか確認 |
| メール確認が求められる | Supabaseで「Confirm email」をOFFにする |

---

## 費用

| サービス | 無料枠 |
|---------|--------|
| Supabase | 500MB DB、50,000 MAU |
| Vercel | 個人利用は無料 |
| GitHub | プライベートリポジトリ無料 |

個人利用なら**すべて無料**で運用できます。
