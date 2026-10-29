import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { accounts, profiles } from "../db/schema/index.js";
import { config } from "../config.js";
import { ApiError } from "../utils/api-error.js";

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    username: string;
    displayName?: string;
  }) {
    const [existingAccount] = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.email, data.email))
      .limit(1);

    if (existingAccount) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const [existingUsername] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.username, data.username))
      .limit(1);

    if (existingUsername) {
      throw ApiError.conflict("This username is already taken");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [newAccount] = await db
      .insert(accounts)
      .values({
        email: data.email,
        password: hashedPassword,
      })
      .returning();

    const [newProfile] = await db
      .insert(profiles)
      .values({
        userId: newAccount.id,
        username: data.username,
        displayName: data.displayName || data.username,
      })
      .returning();

    const token = await sign(
      {
        id: newAccount.id,
        email: newAccount.email,
      },
      config.JWT_SECRET,
      "HS256"
    );

    return {
      token,
      user: {
        id: newAccount.id,
        email: newAccount.email,
        username: newProfile.username,
        displayName: newProfile.displayName,
      },
    };
  }

  static async login(data: { email: string; password: string }) {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.email, data.email))
      .limit(1);

    if (!account) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.password, account.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, account.id))
      .limit(1);

    const token = await sign(
      {
        id: account.id,
        email: account.email,
      },
      config.JWT_SECRET,
      "HS256"
    );

    return {
      token,
      user: {
        id: account.id,
        email: account.email,
        username: profile?.username || null,
        displayName: profile?.displayName || null,
        image: profile?.image || null,
      },
    };
  }

  static async getMe(userId: number) {
    const [account] = await db
      .select({
        id: accounts.id,
        email: accounts.email,
        createdAt: accounts.createdAt,
      })
      .from(accounts)
      .where(eq(accounts.id, userId))
      .limit(1);

    if (!account) {
      throw ApiError.notFound("User account not found");
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    return {
      id: account.id,
      email: account.email,
      profile: profile || null,
      createdAt: account.createdAt,
    };
  }

  static async changePassword(
    userId: number,
    data: { currentPassword: string; newPassword: string }
  ) {
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, userId))
      .limit(1);

    if (!account) {
      throw ApiError.notFound("Account not found");
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, account.password);
    if (!isPasswordValid) {
      throw ApiError.badRequest("Current password is incorrect");
    }

    const newHashedPassword = await bcrypt.hash(data.newPassword, 10);

    await db
      .update(accounts)
      .set({ password: newHashedPassword })
      .where(eq(accounts.id, userId));

    return { success: true, message: "Password updated successfully" };
  }
}
