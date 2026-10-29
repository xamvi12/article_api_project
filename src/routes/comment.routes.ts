import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { CommentController } from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { paginationQuerySchema, paginatedResponseSchema } from "../utils/pagination.js";
import type { AppBindings } from "../types.js";
import {
  createMessageSchema,
  dataResponseSchema,
  defaultErrorResponses,
  httpStatusCodes,
  jsonContent,
  jsonContentRequired,
} from "../utils/openapi-helpers.js";

const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(1000).openapi({
    description: "comment body text",
    example: "This was a really helpful article!",
  }),
});

const updateCommentSchema = z.object({
  body: z.string().trim().min(1).max(1000).openapi({
    description: "updated comment text",
    example: "Updated comment text with more context.",
  }),
});

export const commentAuthorSchema = z.object({
  id: z.number().int().openapi({ description: "author account id", example: 1 }),
  email: z.email().nullable().optional().openapi({ description: "author email", example: "vivian@gmail.com" }),
  username: z.string().nullable().openapi({ description: "author username handle", example: "vivi" }),
  displayName: z.string().nullable().openapi({ description: "author display name", example: "Agwaraonye Vivian" }),
  image: z.string().nullable().openapi({ description: "author avatar url", example: "https://example.com/avatar.jpg" }),
});

export const commentItemSchema = z.object({
  id: z.string().openapi({ description: "comment unique id", example: "com_12345678" }),
  articleId: z.string().openapi({ description: "target article id", example: "art_12345678" }),
  body: z.string().openapi({ description: "comment body content", example: "This was a really helpful article!" }),
  createdAt: z.coerce.date().openapi({ description: "comment creation date", example: "2026-10-29T10:00:00.000Z" }),
  updatedAt: z.coerce.date().openapi({ description: "comment updated date", example: "2026-10-29T10:00:00.000Z" }),
  author: commentAuthorSchema,
});

export const commentCreatedSchema = z.object({
  id: z.string().openapi({ description: "comment unique id", example: "com_12345678" }),
  articleId: z.string().openapi({ description: "target article id", example: "art_12345678" }),
  body: z.string().openapi({ description: "comment body text", example: "This was a really helpful article!" }),
  createdAt: z.coerce.date().openapi({ description: "creation timestamp", example: "2026-10-29T10:00:00.000Z" }),
  updatedAt: z.coerce.date().openapi({ description: "updated timestamp", example: "2026-10-29T10:00:00.000Z" }),
  author: z.object({
    id: z.number().int().openapi({ description: "author user id", example: 1 }),
    username: z.string().nullable().openapi({ description: "author username", example: "vivi" }),
    displayName: z.string().nullable().openapi({ description: "author display name", example: "Agwaraonye Vivian" }),
    image: z.string().nullable().openapi({ description: "avatar url", example: "https://example.com/avatar.jpg" }),
  }),
});

export const commentRecordSchema = z.object({
  id: z.string().openapi({ description: "comment unique id", example: "com_12345678" }),
  articleId: z.string().openapi({ description: "target article id", example: "art_12345678" }),
  authorId: z.number().int().openapi({ description: "author user id", example: 1 }),
  body: z.string().openapi({ description: "comment content", example: "Updated comment text with more context." }),
  createdAt: z.coerce.date().openapi({ description: "creation timestamp", example: "2026-10-29T10:00:00.000Z" }),
  updatedAt: z.coerce.date().openapi({ description: "updated timestamp", example: "2026-10-29T10:00:00.000Z" }),
});

export const createCommentRoute = createRoute({
  method: "post",
  path: "/articles/{articleId}/comments",
  tags: ["Comments"],
  summary: "create comment",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({
      articleId: z.string().openapi({
        param: { name: "articleId", in: "path" },
        description: "article unique id",
        example: "art_12345678",
      }),
    }),
    body: jsonContentRequired(createCommentSchema, "comment data"),
  },
  responses: {
    [httpStatusCodes.CREATED]: jsonContent(
      dataResponseSchema(commentCreatedSchema, "comment created successfully"),
      "comment created"
    ),
    ...defaultErrorResponses,
  },
});

export const listCommentsRoute = createRoute({
  method: "get",
  path: "/articles/{articleId}/comments",
  tags: ["Comments"],
  summary: "list comments",
  request: {
    params: z.object({
      articleId: z.string().openapi({
        param: { name: "articleId", in: "path" },
        description: "article unique id",
        example: "art_12345678",
      }),
    }),
    query: paginationQuerySchema,
  },
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      paginatedResponseSchema(commentItemSchema, "comments retrieved"),
      "comments list"
    ),
    ...defaultErrorResponses,
  },
});

export const getCommentByIdRoute = createRoute({
  method: "get",
  path: "/comments/{commentId}",
  tags: ["Comments"],
  summary: "get comment",
  request: {
    params: z.object({
      commentId: z.string().openapi({
        param: { name: "commentId", in: "path" },
        description: "comment unique id",
        example: "com_12345678",
      }),
    }),
  },
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      dataResponseSchema(commentItemSchema, "comment retrieved"),
      "comment details"
    ),
    ...defaultErrorResponses,
  },
});

export const updateCommentRoute = createRoute({
  method: "patch",
  path: "/comments/{commentId}",
  tags: ["Comments"],
  summary: "update comment",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({
      commentId: z.string().openapi({
        param: { name: "commentId", in: "path" },
        description: "comment unique id",
        example: "com_12345678",
      }),
    }),
    body: jsonContentRequired(updateCommentSchema, "comment update data"),
  },
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      dataResponseSchema(commentRecordSchema, "comment updated successfully"),
      "comment updated"
    ),
    ...defaultErrorResponses,
  },
});

export const deleteCommentRoute = createRoute({
  method: "delete",
  path: "/comments/{commentId}",
  tags: ["Comments"],
  summary: "delete comment",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({
      commentId: z.string().openapi({
        param: { name: "commentId", in: "path" },
        description: "comment unique id",
        example: "com_12345678",
      }),
    }),
  },
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      createMessageSchema("Comment deleted successfully", true),
      "comment deleted"
    ),
    ...defaultErrorResponses,
  },
});

export type CreateCommentRoute = typeof createCommentRoute;
export type ListCommentsRoute = typeof listCommentsRoute;
export type GetCommentByIdRoute = typeof getCommentByIdRoute;
export type UpdateCommentRoute = typeof updateCommentRoute;
export type DeleteCommentRoute = typeof deleteCommentRoute;

export const commentRouter = new OpenAPIHono<AppBindings>()
  .openapi(createCommentRoute, CommentController.createComment)
  .openapi(listCommentsRoute, CommentController.getComments)
  .openapi(getCommentByIdRoute, CommentController.getCommentById)
  .openapi(updateCommentRoute, CommentController.updateComment)
  .openapi(deleteCommentRoute, CommentController.deleteComment);
