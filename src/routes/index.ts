import { OpenAPIHono } from "@hono/zod-openapi";
import { authRouter } from "./auth.routes.js";
import { userRouter } from "./user.routes.js";
import { articleRouter } from "./article.routes.js";
import { commentRouter } from "./comment.routes.js";
import type { AppBindings } from "../types.js";

export const routes = new OpenAPIHono<AppBindings>()
  .route("/auth", authRouter)
  .route("/users", userRouter)
  .route("/articles", articleRouter)
  .route("/", commentRouter);
