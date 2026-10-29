import type { NotFoundHandler } from "hono";

export const notFoundHandler: NotFoundHandler = (c) => {
  return c.json(
    {
      success: false,
      message: `Route not found: ${c.req.method} ${c.req.path}`,
    },
    404
  );
};
