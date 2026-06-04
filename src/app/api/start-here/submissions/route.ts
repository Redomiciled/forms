import {
  persistStartHereSubmission,
  StartHereClickUpError,
} from "@/lib/start-here-clickup";
import {
  type StartHereSubmissionResponse,
  startHereSubmissionRequestSchema,
} from "@/lib/start-here-submission";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = startHereSubmissionRequestSchema.safeParse(body);

  if (!parsed.success) {
    return json<StartHereSubmissionResponse>(
      {
        ok: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Please check the highlighted fields and try again.",
        },
      },
      400
    );
  }

  try {
    const result = await persistStartHereSubmission(parsed.data.values, {
      qaMode: parsed.data.qaMode,
      ...(parsed.data.taskId ? { taskId: parsed.data.taskId } : {}),
    });

    return json<StartHereSubmissionResponse>({
      ok: true,
      submission: result.submission,
      persistence: result.persistence,
    });
  } catch (error) {
    if (error instanceof StartHereClickUpError) {
      return json<StartHereSubmissionResponse>(
        {
          ok: false,
          error: {
            code: error.code,
            message: error.message,
          },
          ...(error.taskId ? { taskId: error.taskId } : {}),
        },
        error.status
      );
    }

    return json<StartHereSubmissionResponse>(
      {
        ok: false,
        error: {
          code: "SUBMISSION_FAILED",
          message: "We could not submit the form. Please try again.",
        },
      },
      500
    );
  }
}

function json<T>(body: T, status = 200) {
  return Response.json(body, { status });
}
