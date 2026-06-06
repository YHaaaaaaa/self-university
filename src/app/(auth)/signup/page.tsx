import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { signUp } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          <h1 className="text-lg font-semibold">Self University</h1>
          <p className="text-sm text-muted-foreground">入学登録</p>
        </div>

        <form action={signUp} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">表示名</label>
            <Input name="display_name" type="text" required placeholder="山田 太郎" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">メール</label>
            <Input name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">パスワード</label>
            <Input name="password" type="password" required minLength={6} placeholder="6文字以上" />
          </div>
          <Button type="submit" className="w-full">
            入学する
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-medium text-foreground underline">
            ログイン
          </Link>
        </p>
      </Card>
    </div>
  );
}
