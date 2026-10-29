import { z } from "@hono/zod-openapi";
import * as httpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";

export { httpStatusCodes, jsonContent, jsonContentRequired };

export const createMessageSchema = (
  exampleMessage = "Operation successful",
  success = true
) => {
  return z
    .object({
      success: z.boolean().openapi({ example: success }),
      message: z.string().openapi({ example: exampleMessage }),
    })
    .openapi({
      example: {
        success,
        message: exampleMessage,
      },
    });
};

export const dataResponseSchema = <T extends z.ZodType>(
  dataSchema: T,
  exampleMessage = "Operation successful",
  exampleData?: unknown
) => {
  const schema = z.object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: exampleMessage }),
    data: dataSchema,
  });

  if (exampleData !== undefined) {
    return schema.openapi({
      example: {
        success: true,
        message: exampleMessage,
        data: exampleData,
      },
    });
  }

  return schema;
};

export const defaultErrorResponses = {
  [httpStatusCodes.BAD_REQUEST]: jsonContent(
    createMessageSchema("The request was invalid", false),
    "Bad Request"
  ),
  [httpStatusCodes.UNAUTHORIZED]: jsonContent(
    createMessageSchema("Unauthorized access", false),
    "Unauthorized"
  ),
  [httpStatusCodes.FORBIDDEN]: jsonContent(
    createMessageSchema("You do not have permission to perform this action", false),
    "Forbidden"
  ),
  [httpStatusCodes.NOT_FOUND]: jsonContent(
    createMessageSchema("The requested resource was not found", false),
    "Not Found"
  ),
  [httpStatusCodes.CONFLICT]: jsonContent(
    createMessageSchema("Resource conflict", false),
    "Conflict"
  ),
  [httpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
    createMessageSchema("Validation failed. Please check your inputs", false),
    "Validation Error"
  ),
  [httpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
    createMessageSchema("An unexpected error occurred", false),
    "Internal Server Error"
  ),
};
