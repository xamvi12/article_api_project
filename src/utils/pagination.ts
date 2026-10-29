import { z } from "@hono/zod-openapi";
import { createMessageSchema } from "./openapi-helpers.js";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).openapi({
    param: { name: "page", in: "query" },
    description: "Page number (1-based index)",
    example: 1,
  }),
  limit: z.coerce.number().int().min(1).max(50).default(10).openapi({
    param: { name: "limit", in: "query" },
    description: "Maximum number of items to return per page (1 to 50)",
    example: 10,
  }),
});

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = "Items retrieved successfully"
): PaginatedResponse<T> {
  return {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export const paginationMetaSchema = z
  .object({
    page: z.number().int().openapi({
      description: "Current page number",
      example: 1,
    }),
    limit: z.number().int().openapi({
      description: "Items per page",
      example: 10,
    }),
    total: z.number().int().openapi({
      description: "Total number of items available across all pages",
      example: 42,
    }),
    totalPages: z.number().int().openapi({
      description: "Total number of pages",
      example: 5,
    }),
  })
  .openapi({
    description: "Pagination metadata",
    example: {
      page: 1,
      limit: 10,
      total: 42,
      totalPages: 5,
    },
  });

export const paginatedResponseSchema = <T extends z.ZodType>(
  itemSchema: T,
  exampleMessage = "Items retrieved successfully",
  exampleItems?: unknown[],
  exampleMeta?: Partial<PaginationMeta>
) => {
  const meta: PaginationMeta = {
    page: 1,
    limit: 10,
    total: exampleItems ? exampleItems.length : 42,
    totalPages: 5,
    ...exampleMeta,
  };

  const schema = z.object({
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: exampleMessage }),
    data: z.array(itemSchema).openapi({
      description: "List of items for the current page",
    }),
    pagination: paginationMetaSchema,
  });

  if (exampleItems !== undefined) {
    return schema.openapi({
      example: {
        success: true,
        message: exampleMessage,
        data: exampleItems,
        pagination: meta,
      },
    });
  }

  return schema;
};
