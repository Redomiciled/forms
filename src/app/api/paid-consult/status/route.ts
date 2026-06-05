import { NextResponse } from "next/server";

import { getPaidConsultCompletionFromClickUpTask } from "@/lib/paid-consult-clickup";
import { parsePaidConsultTaskId } from "@/lib/paid-consult";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const taskId = parsePaidConsultTaskId(
    url.searchParams.get("id") ?? undefined
  );

  if (!taskId) {
    return NextResponse.json(
      { completed: false, error: "Invalid paid consult task id." },
      { status: 400 }
    );
  }

  const status = await getPaidConsultCompletionFromClickUpTask(taskId);

  return NextResponse.json(status, {
    headers: {
      "cache-control": "no-store",
    },
  });
}
