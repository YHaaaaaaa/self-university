#!/usr/bin/env node
/**
 * Self University 自動デプロイスクリプト
 *
 * 必要な環境変数（.env.deploy に設定）:
 *   SUPABASE_ACCESS_TOKEN  - https://supabase.com/dashboard/account/tokens
 *   SUPABASE_ORG_ID        - Supabase ダッシュボードの Organization ID
 *   VERCEL_TOKEN           - https://vercel.com/account/tokens
 *   GITHUB_TOKEN           - https://github.com/settings/tokens (repo権限)
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnvDeploy() {
  const envPath = join(ROOT, ".env.deploy");
  if (!existsSync(envPath)) {
    console.error("❌ .env.deploy が見つかりません。scripts/setup-env.mjs を実行してください。");
    process.exit(1);
  }
  const vars = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) vars[m[1].trim()] = m[2].trim();
  }
  return vars;
}

async function supabaseRequest(token, method, path, body) {
  const res = await fetch(`https://api.supabase.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Supabase API error: ${JSON.stringify(data)}`);
  return data;
}

function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  return Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function createSupabaseProject(token, orgId) {
  console.log("\n📦 Supabase プロジェクトを作成中...");
  const dbPassword = generatePassword();
  const project = await supabaseRequest(token, "POST", "/projects", {
    organization_id: orgId,
    name: "self-university",
    region: "ap-northeast-1",
    db_pass: dbPassword,
    plan: "free",
  });

  console.log(`   プロジェクト ID: ${project.id}`);
  console.log("   プロビジョニング中（2〜3分）...");

  // プロジェクトが ready になるまで待機
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const status = await supabaseRequest(token, "GET", `/projects/${project.id}`);
    process.stdout.write(".");
    if (status.status === "ACTIVE_HEALTHY") {
      console.log("\n   ✅ プロジェクト準備完了");
      break;
    }
    if (i === 59) throw new Error("プロジェクトの起動がタイムアウトしました");
  }

  // API キー取得
  const keys = await supabaseRequest(token, "GET", `/projects/${project.id}/api-keys`);
  const anonKey = keys.find((k) => k.name === "anon")?.api_key;
  const serviceKey = keys.find((k) => k.name === "service_role")?.api_key;
  const projectUrl = `https://${project.id}.supabase.co`;

  return { projectId: project.id, projectUrl, anonKey, serviceKey, dbPassword };
}

async function runMigration(projectId, serviceKey) {
  console.log("\n🗄️  データベースマイグレーション実行中...");
  const sql = readFileSync(join(ROOT, "supabase/migrations/001_initial_schema.sql"), "utf8");

  const res = await fetch(`https://${projectId}.supabase.co/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  // SQL Editor API経由で実行（Management API の database query endpoint）
  const queryRes = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN || loadEnvDeploy().SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!queryRes.ok) {
    const err = await queryRes.text();
    throw new Error(`マイグレーション失敗: ${err}`);
  }
  console.log("   ✅ マイグレーション完了");
}

async function createGitHubRepo(token) {
  console.log("\n🐙 GitHub リポジトリ作成中...");
  const res = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      name: "self-university",
      private: true,
      description: "自分だけの大学 - 毎日学習を継続するWebアプリ",
    }),
  });

  const repo = await res.json();
  if (!res.ok) {
    if (repo.message?.includes("already exists")) {
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await userRes.json();
      const url = `https://github.com/${user.login}/self-university.git`;
      console.log(`   ℹ️  リポジトリは既に存在します: ${url}`);
      return url;
    }
    throw new Error(`GitHub API error: ${JSON.stringify(repo)}`);
  }

  console.log(`   ✅ リポジトリ作成: ${repo.html_url}`);
  return repo.clone_url;
}

function pushToGitHub(repoUrl, token) {
  console.log("\n⬆️  GitHub にプッシュ中...");
  const authedUrl = repoUrl.replace("https://", `https://x-access-token:${token}@`);
  try {
    execSync(`git remote remove origin`, { cwd: ROOT, stdio: "ignore" });
  } catch {}
  execSync(`git remote add origin ${authedUrl}`, { cwd: ROOT });
  execSync(`git push -u origin main`, { cwd: ROOT, stdio: "inherit" });
  console.log("   ✅ プッシュ完了");
}

async function deployToVercel(token, supabaseUrl, anonKey) {
  console.log("\n🚀 Vercel にデプロイ中...");

  // プロジェクト作成 + デプロイ
  const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "self-university",
      projectSettings: {
        framework: "nextjs",
      },
      env: {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
      },
    }),
  });

  // npx vercel でデプロイ（より確実）
  writeFileSync(join(ROOT, ".env.local"), [
    `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`,
  ].join("\n") + "\n");

  execSync(
    `npx vercel deploy --prod --yes --token ${token} ` +
    `-e NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl} ` +
    `-e NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`,
    { cwd: ROOT, stdio: "inherit" }
  );
}

async function main() {
  console.log("🎓 Self University 自動デプロイ開始\n");
  const env = loadEnvDeploy();

  const { projectUrl, anonKey, serviceKey, projectId, dbPassword } =
    await createSupabaseProject(env.SUPABASE_ACCESS_TOKEN, env.SUPABASE_ORG_ID);

  process.env.SUPABASE_ACCESS_TOKEN = env.SUPABASE_ACCESS_TOKEN;
  await runMigration(projectId, serviceKey);

  const repoUrl = await createGitHubRepo(env.GITHUB_TOKEN);
  pushToGitHub(repoUrl, env.GITHUB_TOKEN);

  await deployToVercel(env.VERCEL_TOKEN, projectUrl, anonKey);

  // 結果を保存
  const result = {
    supabaseUrl: projectUrl,
    anonKey,
    projectId,
    dbPassword,
    deployedAt: new Date().toISOString(),
  };
  writeFileSync(join(ROOT, ".env.local"), [
    `NEXT_PUBLIC_SUPABASE_URL=${projectUrl}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}`,
  ].join("\n") + "\n");

  console.log("\n✅ デプロイ完了！");
  console.log("\n📋 設定情報（.env.local に保存済み）:");
  console.log(`   Supabase URL: ${projectUrl}`);
  console.log(`   Anon Key:     ${anonKey.substring(0, 20)}...`);
  console.log(`   DB Password:  ${dbPassword}（メモしておいてください）`);
  console.log("\n⚠️  次の手順（手動）:");
  console.log("   1. Supabase → Authentication → URL Configuration に Vercel URL を追加");
  console.log("   2. Supabase → Authentication → Providers → Email → Confirm email を OFF");
}

main().catch((err) => {
  console.error("\n❌ エラー:", err.message);
  process.exit(1);
});
