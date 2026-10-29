import { count, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { accounts, articles, comments, profiles } from "../db/schema/index.js";
import { ApiError } from "../utils/api-error.js";
import { createPaginatedResponse } from "../utils/pagination.js";

export class CommentService {
  static async createComment(articleId: string, authorId: number, body: string) {
    const [article] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    if (!article) {
      throw ApiError.notFound("Article not found");
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        articleId,
        authorId,
        body,
      })
      .returning();

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, authorId))
      .limit(1);

    return {
      id: newComment.id,
      articleId: newComment.articleId,
      body: newComment.body,
      createdAt: newComment.createdAt,
      updatedAt: newComment.updatedAt,
      author: {
        id: authorId,
        username: profile?.username || null,
        displayName: profile?.displayName || null,
        image: profile?.image || null,
      },
    };
  }

  static async getCommentsByArticle(
    articleId: string,
    params: { page: number; limit: number }
  ) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [article] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    if (!article) {
      throw ApiError.notFound("Article not found");
    }

    const [countResult] = await db
      .select({ total: count() })
      .from(comments)
      .where(eq(comments.articleId, articleId));

    const total = Number(countResult?.total || 0);

    const rows = await db
      .select({
        id: comments.id,
        articleId: comments.articleId,
        body: comments.body,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        author: {
          id: accounts.id,
          email: accounts.email,
          username: profiles.username,
          displayName: profiles.displayName,
          image: profiles.image,
        },
      })
      .from(comments)
      .innerJoin(accounts, eq(comments.authorId, accounts.id))
      .leftJoin(profiles, eq(accounts.id, profiles.userId))
      .where(eq(comments.articleId, articleId))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    return createPaginatedResponse(rows, total, page, limit);
  }

  static async getCommentById(commentId: string) {
    const [comment] = await db
      .select({
        id: comments.id,
        articleId: comments.articleId,
        body: comments.body,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        author: {
          id: accounts.id,
          email: accounts.email,
          username: profiles.username,
          displayName: profiles.displayName,
          image: profiles.image,
        },
      })
      .from(comments)
      .innerJoin(accounts, eq(comments.authorId, accounts.id))
      .leftJoin(profiles, eq(accounts.id, profiles.userId))
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!comment) {
      throw ApiError.notFound("Comment not found");
    }

    return comment;
  }

  static async updateComment(commentId: string, authorId: number, body: string) {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!comment) {
      throw ApiError.notFound("Comment not found");
    }

    if (comment.authorId !== authorId) {
      throw ApiError.forbidden("You do not have permission to edit this comment");
    }

    const [updated] = await db
      .update(comments)
      .set({ body })
      .where(eq(comments.id, commentId))
      .returning();

    return updated;
  }

  static async deleteComment(commentId: string, authorId: number) {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!comment) {
      throw ApiError.notFound("Comment not found");
    }

    if (comment.authorId !== authorId) {
      throw ApiError.forbidden("You do not have permission to delete this comment");
    }

    await db.delete(comments).where(eq(comments.id, commentId));

    return { success: true, message: "Comment deleted successfully" };
  }
}
