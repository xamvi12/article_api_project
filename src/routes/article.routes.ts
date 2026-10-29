import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { ArticleController } from "../controllers/article.controller.js";
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

const createArticleSchema = z.object({
  title: z.string().trim().min(3).max(200).openapi({
    description: "article title",
    example: "Getting Started with Node SQLite",
  }),
  excerpt: z.string().trim().max(500).optional().openapi({
    description: "short preview or summary",
    example: "A simple introduction to SQLite with Hono.",
  }),
  body: z.string().min(5).openapi({
    description: "full article content",
    example: "Here is the full article content explaining how to use SQLite with Node.js...",
  }),
});

const updateArticleSchema = z.object({
  title: z.string().trim().min(3).max(200).optional().openapi({
    description: "updated title",
    example: "Getting Started with Node SQLite (Second Edition)",
  }),
  excerpt: z.string().trim().max(500).optional().openapi({
    description: "updated excerpt",
    example: "An updated guide to SQLite with Hono.",
  }),
  body: z.string().min(5).optional().openapi({
    description: "updated body content",
    example: "Updated content with additional insights...",
  }),
});

export const articleAuthorSchema = z.object({
  id: z.number().int().openapi({ description: "author account id", example: 1 }),
  email: z.email().openapi({ description: "author email", example: "vivian@gmail.com" }),
  username: z.string().nullable().openapi({ description: "author username handle", example: "vivian" }),
  displayName: z.string().nullable().openapi({ description: "author display name", example: "Agwaraonye Vivian" }),
  image: z.string().nullable().openapi({ description: "author avatar url", example: "https://example.com/avatar.jpg" }),
});

export const articleItemSchema = z.object({
  id: z.string().openapi({ description: "article unique id", example: "art_12345678" }),
  title: z.string().openapi({ description: "article title", example: "Getting Started with Node SQLite" }),
  slug: z.string().openapi({ description: "url-friendly slug", example: "getting-started-with-node-sqlite-x92a1" }),
  excerpt: z.string().nullable().openapi({ description: "article preview summary", example: "A simple introduction to SQLite with Hono." }),
  body: z.string().openapi({ description: "article content", example: "Here is the full article content..." }),
  createdAt: z.coerce.date().openapi({ description: "created timestamp", example: "2026-10-29T10:00:00.000Z" }),
  updatedAt: z.coerce.date().openapi({ description: "last updated timestamp", example: "2026-10-29T10:00:00.000Z" }),
  author: articleAuthorSchema,
});

export const myArticleItemSchema = z.object({
  id: z.string().openapi({ description: "article unique id", example: "art_12345678" }),
  title: z.string().openapi({ description: "article title", example: "Getting Started with Node SQLite" }),
  slug: z.string().openapi({ description: "url-friendly slug", example: "getting-started-with-node-sqlite-x92a1" }),
  excerpt: z.string().nullable().openapi({ description: "article preview summary", example: "A simple introduction to SQLite with Hono." }),
  body: z.string().openapi({ description: "article content", example: "Here is the full article content..." }),
  createdAt: z.coerce.date().openapi({ description: "created timestamp", example: "2026-10-29T10:00:00.000Z" }),
  updatedAt: z.coerce.date().openapi({ description: "last updated timestamp", example: "2026-10-29T10:00:00.000Z" }),
});

export const articleRecordSchema = z.object({
  id: z.string().openapi({ description: "article unique id", example: "art_12345678" }),
  authorId: z.number().int().openapi({ description: "author account id", example: 1 }),
  title: z.string().openapi({ description: "article title", example: "Getting Started with Node SQLite" }),
  slug: z.string().openapi({ description: "url slug", example: "getting-started-with-node-sqlite-x92a1" }),
  excerpt: z.string().nullable().openapi({ description: "preview excerpt", example: "A simple introduction to SQLite." }),
  body: z.string().openapi({ description: "body text", example: "Full content text..." }),
  createdAt: z.coerce.date().openapi({ description: "created date", example: "2026-10-29T10:00:00.000Z" }),
  updatedAt: z.coerce.date().openapi({ description: "updated date", example: "2026-10-29T10:00:00.000Z" }),
});

const listArticlesQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional().openapi({
    param: { name: "search", in: "query" },
    description: "search filter by article title",
  }),
});

export const getMyArticlesRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Articles"],
  summary: "get my articles",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    query: paginationQuerySchema,
  },
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      paginatedResponseSchema(myArticleItemSchema, "my articles retrieved"),
      "my articles"
    ),
    ...defaultErrorResponses,
  },
});

export const createArticleRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Articles"],
  summary: "create article",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    body: jsonContentRequired(createArticleSchema, "article creation data"),
  },
  responses: {
    [httpStatusCodes.CREATED]: jsonContent(
      dataResponseSchema(articleRecordSchema, "article created successfully"),
      "article created"
    ),
    ...defaultErrorResponses,
  },
});

export const listArticlesRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Articles"],
  summary: "list articles",
  request: {
    query: listArticlesQuerySchema,
  },
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      paginatedResponseSchema(articleItemSchema, "articles retrieved"),
      "articles list"
    ),
    ...defaultErrorResponses,
  },
});

export const getArticleRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Articles"],
  summary: "get article",
  request: {
    params: z.object({
      id: z.string().openapi({
        param: { name: "id", in: "path" },
        description: "article unique id or slug",
        example: "getting-started-with-node-sqlite-x92a1",
      }),
    }),
  },
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      dataResponseSchema(articleItemSchema, "article retrieved"),
      "article details"
    ),
    ...defaultErrorResponses,
  },
});

export const updateArticleRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Articles"],
  summary: "update article",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({
      id: z.string().openapi({
        param: { name: "id", in: "path" },
        description: "article unique id",
        example: "art_12345678",
      }),
    }),
    body: jsonContentRequired(updateArticleSchema, "article update data"),
  },
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      dataResponseSchema(articleRecordSchema, "article updated successfully"),
      "article updated"
    ),
    ...defaultErrorResponses,
  },
});

export const deleteArticleRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Articles"],
  summary: "delete article",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    params: z.object({
      id: z.string().openapi({
        param: { name: "id", in: "path" },
        description: "article unique id",
        example: "art_12345678",
      }),
    }),
  },
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      createMessageSchema("Article deleted successfully", true),
      "article deleted"
    ),
    ...defaultErrorResponses,
  },
});

export type GetMyArticlesRoute = typeof getMyArticlesRoute;
export type CreateArticleRoute = typeof createArticleRoute;
export type ListArticlesRoute = typeof listArticlesRoute;
export type GetArticleRoute = typeof getArticleRoute;
export type UpdateArticleRoute = typeof updateArticleRoute;
export type DeleteArticleRoute = typeof deleteArticleRoute;

export const articleRouter = new OpenAPIHono<AppBindings>()
  .openapi(getMyArticlesRoute, ArticleController.getMyArticles)
  .openapi(createArticleRoute, ArticleController.createArticle)
  .openapi(listArticlesRoute, ArticleController.getArticles)
  .openapi(getArticleRoute, ArticleController.getArticleById)
  .openapi(updateArticleRoute, ArticleController.updateArticle)
  .openapi(deleteArticleRoute, ArticleController.deleteArticle);
