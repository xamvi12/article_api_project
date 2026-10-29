import { count, desc, eq, like, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { accounts, articles, profiles } from "../db/schema/index.js";
import { ApiError } from "../utils/api-error.js";
import { createPaginatedResponse } from "../utils/pagination.js";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base || "article"}-${suffix}`;
}

export class ArticleService {
  static async createArticle(
    authorId: number,
    data: { title: string; excerpt?: string; body: string }
  ) {
    const slug = generateSlug(data.title);

    const [newArticle] = await db
      .insert(articles)
      .values({
        authorId,
        title: data.title,
        slug,
        excerpt: data.excerpt,
        body: data.body,
      })
      .returning();

    return newArticle;
  }

  static async getArticles(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    const whereClause = search ? like(articles.title, `%${search}%`) : undefined;

    const [countResult] = await db
      .select({ total: count() })
      .from(articles)
      .where(whereClause);

    const total = Number(countResult?.total || 0);

    const rows = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        body: articles.body,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        author: {
          id: accounts.id,
          email: accounts.email,
          username: profiles.username,
          displayName: profiles.displayName,
          image: profiles.image,
        },
      })
      .from(articles)
      .innerJoin(accounts, eq(articles.authorId, accounts.id))
      .leftJoin(profiles, eq(accounts.id, profiles.userId))
      .where(whereClause)
      .orderBy(desc(articles.createdAt))
      .limit(limit)
      .offset(offset);

    return createPaginatedResponse(rows, total, page, limit);
  }

  static async getMyArticles(
    authorId: number,
    params: { page: number; limit: number }
  ) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [countResult] = await db
      .select({ total: count() })
      .from(articles)
      .where(eq(articles.authorId, authorId));

    const total = Number(countResult?.total || 0);

    const rows = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        body: articles.body,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      })
      .from(articles)
      .where(eq(articles.authorId, authorId))
      .orderBy(desc(articles.createdAt))
      .limit(limit)
      .offset(offset);

    return createPaginatedResponse(rows, total, page, limit);
  }

  static async getArticleById(idOrSlug: string) {
    const [article] = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        body: articles.body,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        author: {
          id: accounts.id,
          email: accounts.email,
          username: profiles.username,
          displayName: profiles.displayName,
          image: profiles.image,
        },
      })
      .from(articles)
      .innerJoin(accounts, eq(articles.authorId, accounts.id))
      .leftJoin(profiles, eq(accounts.id, profiles.userId))
      .where(or(eq(articles.id, idOrSlug), eq(articles.slug, idOrSlug)))
      .limit(1);

    if (!article) {
      throw ApiError.notFound("Article not found");
    }

    return article;
  }

  static async updateArticle(
    id: string,
    authorId: number,
    data: { title?: string; excerpt?: string; body?: string }
  ) {
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id))
      .limit(1);

    if (!article) {
      throw ApiError.notFound("Article not found");
    }

    if (article.authorId !== authorId) {
      throw ApiError.forbidden("You do not have permission to modify this article");
    }

    const newSlug = data.title && data.title !== article.title ? generateSlug(data.title) : undefined;

    const [updated] = await db
      .update(articles)
      .set({
        ...(data.title !== undefined && { title: data.title }),
        ...(newSlug !== undefined && { slug: newSlug }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.body !== undefined && { body: data.body }),
      })
      .where(eq(articles.id, id))
      .returning();

    return updated;
  }

  static async deleteArticle(id: string, authorId: number) {
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id))
      .limit(1);

    if (!article) {
      throw ApiError.notFound("Article not found");
    }

    if (article.authorId !== authorId) {
      throw ApiError.forbidden("You do not have permission to delete this article");
    }

    await db.delete(articles).where(eq(articles.id, id));

    return { success: true, message: "Article deleted successfully" };
  }
}
