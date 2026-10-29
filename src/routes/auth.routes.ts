import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import type { AppBindings } from "../types.js";
import {
  createMessageSchema,
  dataResponseSchema,
  defaultErrorResponses,
  httpStatusCodes,
  jsonContent,
  jsonContentRequired,
} from "../utils/openapi-helpers.js";

const registerSchema = z.object({
  email: z.email().openapi({
    description: "user email address",
    example: "vivian@gmail.com",
  }),
  password: z.string().min(6).openapi({
    description: "account password (minimum 6 characters)",
    example: "secret123",
  }),
  username: z.string().min(3).max(30).openapi({
    description: "unique author username",
    example: "vivi",
  }),
  displayName: z.string().optional().openapi({
    description: "public display name",
    example: "Agwaraonye Vivian",
  }),
});

const loginSchema = z.object({
  email: z.email().openapi({
    description: "registered email address",
    example: "vivian@gmail.com",
  }),
  password: z.string().min(6).openapi({
    description: "account password",
    example: "secret123",
  }),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6).openapi({
    description: "current account password",
    example: "secret123",
  }),
  newPassword: z.string().min(6).openapi({
    description: "new account password",
    example: "newSecret456",
  }),
});

export const authResponseDataSchema = z.object({
  token: z.string().openapi({
    description: "jwt bearer access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  }),
  user: z.object({
    id: z.number().int().openapi({ description: "account user id", example: 1 }),
    email: z.email().openapi({ description: "user email", example: "vivian@gmail.com" }),
    username: z.string().nullable().openapi({ description: "author username", example: "vivi" }),
    displayName: z.string().nullable().openapi({ description: "public display name", example: "Agwaraonye Vivian" }),
    image: z.string().nullable().optional().openapi({ description: "avatar url", example: "https://example.com/avatar.jpg" }),
  }).openapi({ description: "authenticated user summary" }),
});

export const userProfileDataSchema = z.object({
  id: z.string().openapi({ description: "profile id", example: "prof_12345678" }),
  userId: z.number().int().openapi({ description: "account user id", example: 1 }),
  username: z.string().openapi({ description: "unique username handle", example: "vivi" }),
  displayName: z.string().nullable().openapi({ description: "display name", example: "Agwaraonye Vivian" }),
  bio: z.string().nullable().openapi({ description: "author biography", example: "Software engineer and tech blogger." }),
  image: z.string().nullable().openapi({ description: "profile avatar image url", example: "https://example.com/avatar.jpg" }),
  createdAt: z.coerce.date().openapi({ description: "profile creation timestamp", example: "2026-10-29T10:00:00.000Z" }),
  updatedAt: z.coerce.date().openapi({ description: "profile last updated timestamp", example: "2026-10-29T10:00:00.000Z" }),
});

export const userAccountDetailsSchema = z.object({
  id: z.number().int().openapi({ description: "user account id", example: 1 }),
  email: z.email().openapi({ description: "email address", example: "vivian@gmail.com" }),
  profile: userProfileDataSchema.nullable().openapi({ description: "user profile info" }),
  createdAt: z.coerce.date().openapi({ description: "account creation timestamp", example: "2026-10-29T10:00:00.000Z" }),
});


export const registerRoute = createRoute({
  method: "post",
  path: "/register",
  tags: ["Auth"],
  summary: "register user",
  request: {
    body: jsonContentRequired(registerSchema, "registration data"),
  },
  responses: {
    [httpStatusCodes.CREATED]: jsonContent(
      dataResponseSchema(authResponseDataSchema, "user registered"),
      "user registered"
    ),
    ...defaultErrorResponses,
  },
});

export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  tags: ["Auth"],
  summary: "login user",
  request: {
    body: jsonContentRequired(loginSchema, "login data"),
  },
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      dataResponseSchema(authResponseDataSchema, "logged in"),
      "logged in"
    ),
    ...defaultErrorResponses,
  },
});

export const meRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Auth"],
  summary: "get current user",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      dataResponseSchema(userAccountDetailsSchema, "current user details"),
      "current user"
    ),
    ...defaultErrorResponses,
  },
});

export const changePasswordRoute = createRoute({
  method: "patch",
  path: "/change-password",
  tags: ["Auth"],
  summary: "change password",
  security: [{ BearerAuth: [] }],
  middleware: [authMiddleware],
  request: {
    body: jsonContentRequired(changePasswordSchema, "password data"),
  },
  responses: {
    [httpStatusCodes.OK]: jsonContent(
      createMessageSchema("Password updated successfully", true),
      "password updated"
    ),
    ...defaultErrorResponses,
  },
});

export type RegisterRoute = typeof registerRoute;
export type LoginRoute = typeof loginRoute;
export type MeRoute = typeof meRoute;
export type ChangePasswordRoute = typeof changePasswordRoute;

export const authRouter = new OpenAPIHono<AppBindings>()
  .openapi(registerRoute, AuthController.register)
  .openapi(loginRoute, AuthController.login)
  .openapi(meRoute, AuthController.getMe)
  .openapi(changePasswordRoute, AuthController.changePassword);
