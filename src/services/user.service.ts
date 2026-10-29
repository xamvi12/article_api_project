import { count, desc, eq, like } from "drizzle-orm";
import { db } from "../db/index.js";
import { accounts, articles, profiles } from "../db/schema/index.js";
import { ApiError } from "../utils/api-error.js";
import { createPaginatedResponse } from "../utils/pagination.js";

export class UserService {
  static async getUsers(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    const whereClause = search
      ? like(profiles.username, `%${search}%`)
      : undefined;

    const [countResult] = await db
      .select({ total: count() })
      .from(profiles)
      .where(whereClause);

    const total = Number(countResult?.total || 0);

    const rows = await db
      .select({
        id: profiles.id,
        userId: profiles.userId,
        username: profiles.username,
        displayName: profiles.displayName,
        bio: profiles.bio,
        image: profiles.image,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .where(whereClause)
      .orderBy(desc(profiles.createdAt))
      .limit(limit)
      .offset(offset);

    return createPaginatedResponse(rows, total, page, limit);
  }

  static async getProfileByUsername(username: string) {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);

    if (!profile) {
      throw ApiError.notFound(`User profile with username '${username}' not found`);
    }

    return profile;
  }

  static async updateProfile(
    userId: number,
    data: {
      displayName?: string;
      bio?: string | null;
      image?: string | null;
      username?: string;
    }
  ) {
    const [existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!existing) {
      throw ApiError.notFound("Profile not found");
    }

    if (data.username && data.username !== existing.username) {
      const [usernameExists] = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.username, data.username))
        .limit(1);

      if (usernameExists) {
        throw ApiError.conflict("Username already in use");
      }
    }

    const [updated] = await db
      .update(profiles)
      .set({
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.username !== undefined && { username: data.username }),
      })
      .where(eq(profiles.userId, userId))
      .returning();

    return updated;
  }

  static async deleteAccount(userId: number) {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, userId))
      .limit(1);

    if (!account) {
      throw ApiError.notFound("Account not found");
    }

    // cascade deletes profile, articles, and comments
    await db.delete(accounts).where(eq(accounts.id, userId));

    return { success: true, message: "Account and profile deleted successfully" };
  }

  static async getUserArticles(
    username: string,
    params: { page: number; limit: number }
  ) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);

    if (!profile) {
      throw ApiError.notFound(`User '${username}' not found`);
    }

    const [countResult] = await db
      .select({ total: count() })
      .from(articles)
      .where(eq(articles.authorId, profile.userId));

    const total = Number(countResult?.total || 0);

    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.authorId, profile.userId))
      .orderBy(desc(articles.createdAt))
      .limit(limit)
      .offset(offset);

    const formatted = rows.map((art) => ({
      id: art.id,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt,
      body: art.body,
      createdAt: art.createdAt,
      updatedAt: art.updatedAt,
      author: {
        id: profile.userId,
        username: profile.username,
        displayName: profile.displayName,
        image: profile.image,
      },
    }));

    return createPaginatedResponse(formatted, total, page, limit);
  }
}
