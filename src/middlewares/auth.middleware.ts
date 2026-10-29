import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { config } from "../config.js";
import { ApiError } from "../utils/api-error.js";
import type { AppBindings, AuthUser } from "../types.js";

export const getAuthUser = (c: Context<AppBindings>): AuthUser => {
  const user = c.get("user");
  if (!user) {
    throw ApiError.unauthorized("Authentication required");
  }
  return user;
};

export const authMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Authorization header missing or invalid. Use 'Bearer <token>'");
  }

  const token = authHeader.slice(7).trim();
  try {
    const payload = (await verify(token, config.JWT_SECRET, "HS256")) as unknown as AuthUser;
    if (!payload?.id) {
      throw ApiError.unauthorized("Invalid token payload");
    }
    c.set("user", {
      id: Number(payload.id),
      email: String(payload.email),
    });
    await next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.unauthorized("Invalid or expired session token");
  }
});

export const optionalAuthMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    try {
      const payload = (await verify(token, config.JWT_SECRET, "HS256")) as unknown as AuthUser;
      if (payload?.id) {
        c.set("user", {
          id: Number(payload.id),
          email: String(payload.email),
        });
      }
    } catch {
      // continue as guest if token is missing or invalid
    }
  }
  await next();
});
