import { z } from "zod";

import {
  startHereFormSchema,
  type StartHerePreparedSubmission,
} from "./start-here";

export const startHereSubmissionRequestSchema = z.object({
  values: startHereFormSchema,
  adminMode: z.boolean().optional().default(false),
  qaMode: z.boolean().optional().default(false),
});

export type StartHereSubmissionRequest = z.infer<
  typeof startHereSubmissionRequestSchema
>;

export type StartHerePersistenceResult = {
  submissionId: string;
  mode: "live";
  action: "created";
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
