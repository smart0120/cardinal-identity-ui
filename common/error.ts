import * as Sentry from "@sentry/react";
import type { CaptureContext } from "@sentry/types";

import { notify } from "./Notification";

export class CapturedError extends Error {
  constructor(
    override readonly name: string,
    override readonly message: string,
    readonly source: string,
    readonly originalError: unknown
  ) {
    super(message);
  }
}

export const describeRPCError = (msg: string): string => {
  try {
    const result = JSON.parse(msg.substring("503 : ".length)) as {
      error: {
        code: string;
        message: string;
      };
    };
    return `${result.error.message} (${result.error.code})`;
  } catch (e) {
    // ignore parse error
  }
  return msg;
};

/**
 * Captures an exception.
 */
export const handleException = (
  err: unknown,
  {
    name = err instanceof Error ? err.name : "CapturedError",
    source = name ?? "unspecified",
    userMessage,
    groupInSentry,
  }: {
    /**
     * Custom name to apply to the error.
     */
    name?: string;
    /**
     * Source to apply to the error.
     */
    source?: string;
    /**
     * Notification to send to the user.
     */
    userMessage?: {
      title: string;
      /**
       * Defaults to error's message.
       */
      description?: string;
    };
    /**
     * If true, applies a fingerprint to group the errors by source and name.
     */
    groupInSentry?: boolean;
  }
): void => {
  const captured = new CapturedError(name, "unknown", source, err);

  console.error(`[${captured.name}] (from ${captured.source})`);
  console.error(captured);
  console.error(captured.originalError);

  notify({
    message: userMessage?.title ?? name ?? "Unknown Error",
    description: userMessage?.description ?? captured.message,
    type: "error",
  });

  const sentryArgs: CaptureContext = {
    tags: {
      source,
    },
    extra: {
      originalError: captured.originalError,
      userMessage,
      originalStack:
        captured.originalError instanceof Error
          ? captured.originalError.stack
          : undefined,
    },
  };
  if (groupInSentry) {
    sentryArgs.fingerprint = [captured.name, source];
  }
  Sentry.captureException(captured, sentryArgs);
};
