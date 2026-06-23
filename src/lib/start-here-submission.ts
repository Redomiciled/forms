import { z } from "zod";

import {
  startHereFormSchema,
  type StartHerePreparedSubmission,
} from "./start-here";

const clickUpTaskIdSchema = z.string().regex(/^[A-Za-z0-9_-]{3,128}$/);

export const startHereSubmissionSourceSchema = z.enum(["landing_page"]);

export const startHereSubmissionRequestSchema = z.object({
  values: startHereFormSchema,
  adminMode: z.boolean().optional().default(false),
  qaMode: z.boolean().optional().default(false),
  taskId: clickUpTaskIdSchema.optional(),
});

export type StartHereSubmissionRequest = z.infer<
  typeof startHereSubmissionRequestSchema
>;

export type StartHereSubmissionSource = z.infer<
  typeof startHereSubmissionSourceSchema
>;

export type StartHerePersistenceResult = {
  submissionId: string;
  mode: "live";
  action: "created" | "updated";
  taskId?: string;
};

export type StartHereSubmissionSuccessResponse = {
  ok: true;
  submission: StartHerePreparedSubmission;
  persistence: StartHerePersistenceResult;
};

export type StartHereSubmissionErrorCode =
  | "VALIDATION_FAILED"
  | "CLICKUP_CONFIG_MISSING"
  | "CLICKUP_CREATE_FAILED"
  | "CLICKUP_FIELD_UPDATE_FAILED"
  | "CLICKUP_REQUEST_FAILED"
  | "SUBMISSION_FAILED";

export type StartHereSubmissionErrorResponse = {
  ok: false;
  error: {
    code: StartHereSubmissionErrorCode;
    message: string;
  };
  submissionId?: string;
  taskId?: string;
};

export type StartHereSubmissionResponse =
  | StartHereSubmissionSuccessResponse
  | StartHereSubmissionErrorResponse;
