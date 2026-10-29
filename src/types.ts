import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";

export interface AuthUser {
  id: number;
  email: string;
}

export type AppBindings = {
  Variables: {
    user: AuthUser | null;
  };
};

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;
