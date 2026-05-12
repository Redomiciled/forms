import type { StartHereFormValues } from "@/lib/start-here";

export type UpdateValue = <Key extends keyof StartHereFormValues>(
  key: Key,
  value: StartHereFormValues[Key]
) => void;
