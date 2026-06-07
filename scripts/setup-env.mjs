#!/usr/bin/env node
/**
 * .env.deploy ファイルを対話的に作成するスクリプト
 * 各サービスのトークン取得ページを開きながら設定を収集します
 */

import { writeFileSync, existsSync } from "fs";
import { createInterface } from "readline";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

const PAGES = {
  SUPABASE_TOKEN: "https://supabase.com/dashboard/account/tokens",
  SUPABASE_ORG: "https://supabase.com/dashboard/org",
  VERCEL_TOKEN: "https://vercel.com/account/tokens",
  GITHUB_TOKEN: "https://github.com/settings/tokens/new?scopes=repo&description=Self+University+Deploy",
};

async function main() {
  console.log("🎓 Self University デプロイ設定\n");
  console.log("以下のトークンが必要です。ブラウザで各ページを開いて取得してください。\n");

  for (const [name, url] of Object.entries(PAGES)) {
    console.log(`  ${name}: ${url}`);
    try {
      execSync(`open "${url}"`);
    } catch {
      console.log(`  （ブラウザで手動で開いてください: ${url}）`);
    }
  }

  console.log("\n--- トークンを入力してください ---\n");

  const SUPABASE_ACCESS_TOKEN = await ask("Supabase Access Token: ");
  const SUPABASE_ORG_ID = await ask("Supabase Organization ID (ダッシュボードURLの org/xxx 部分): ");
  const VERCEL_TOKEN = await ask("Vercel Token: ");
  const GITHUB_TOKEN = await ask("GitHub Personal Access Token: ");

  const content = [
    `# Self University デプロイ用トークン（gitにコミットしないこと）`,
    `SUPABASE_ACCESS_TOKEN=${SUPABASE_ACCESS_TOKEN.trim()}`,
    `SUPABASE_ORG_ID=${SUPABASE_ORG_ID.trim()}`,
    `VERCEL_TOKEN=${VERCEL_TOKEN.trim()}`,
    `GITHUB_TOKEN=${GITHUB_TOKEN.trim()}`,
  ].join("\n") + "\n";

  writeFileSync(join(ROOT, ".env.deploy"), content);
  console.log("\n✅ .env.deploy を作成しました");
  console.log("\n次のコマンドでデプロイを実行:");
  console.log("  node scripts/deploy.mjs\n");

  rl.close();
}

main();
