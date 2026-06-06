import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllAssignments } from "@/lib/actions/assignments";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { Button } from "@/components/ui/button";

export default async function AssignmentsPage() {
  const assignments = await getAllAssignments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">課題</h1>
          <p className="text-sm text-muted-foreground">すべての課題一覧</p>
        </div>
        <Link href="/assignments/new">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            新規課題
          </Button>
        </Link>
      </div>

      {assignments && assignments.length > 0 ? (
        <div className="space-y-2">
          {assignments.map((a) => (
            <AssignmentCard key={a.id} assignment={a} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          課題がありません。{" "}
          <Link href="/assignments/new" className="font-medium text-foreground underline">
            最初の課題を作成
          </Link>
        </p>
      )}
    </div>
  );
}
