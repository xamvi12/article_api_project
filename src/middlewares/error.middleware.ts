import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ApiError } from "../utils/api-error.js";
import { config } from "../config.js";

export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[API ERROR] ${c.req.method} ${c.req.path}:`, err);

  let status = 500;
  let message = "Internal Server Error";

  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message || "An unexpected error occurred";
  }

  const validStatus = (status >= 400 && status < 600 ? status : 500) as ContentfulStatusCode;

  return c.json(
    {
      success: false,
      message,
      ...(config.NODE_ENV !== "production" && { stack: err.stack }),
    },
    validStatus
  );
};
