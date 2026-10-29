import type { AppRouteHandler } from "../types.js";
import type {
  GetMyArticlesRoute,
  CreateArticleRoute,
  ListArticlesRoute,
  GetArticleRoute,
  UpdateArticleRoute,
  DeleteArticleRoute,
} from "../routes/article.routes.js";
import { ArticleService } from "../services/article.service.js";
import { getAuthUser } from "../middlewares/auth.middleware.js";
import { httpStatusCodes } from "../utils/openapi-helpers.js";

export class ArticleController {
  static getMyArticles: AppRouteHandler<GetMyArticlesRoute> = async (c) => {
    const user = getAuthUser(c);
    const { page, limit } = c.req.valid("query");
    const result = await ArticleService.getMyArticles(user.id, { page, limit });
    return c.json(result, httpStatusCodes.OK);
  };

  static createArticle: AppRouteHandler<CreateArticleRoute> = async (c) => {
    const user = getAuthUser(c);
    const body = c.req.valid("json");
    const result = await ArticleService.createArticle(user.id, body);
    return c.json(
      {
        success: true,
        message: "Article created successfully",
        data: result,
      },
      httpStatusCodes.CREATED
    );
  };

  static getArticles: AppRouteHandler<ListArticlesRoute> = async (c) => {
    const { page, limit, search } = c.req.valid("query");
    const result = await ArticleService.getArticles({ page, limit, search });
    return c.json(result, httpStatusCodes.OK);
  };

  static getArticleById: AppRouteHandler<GetArticleRoute> = async (c) => {
    const { id } = c.req.valid("param");
    const result = await ArticleService.getArticleById(id);
    return c.json(
      {
        success: true,
        message: "Article retrieved successfully",
        data: result,
      },
      httpStatusCodes.OK
    );
  };

  static updateArticle: AppRouteHandler<UpdateArticleRoute> = async (c) => {
    const user = getAuthUser(c);
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const result = await ArticleService.updateArticle(id, user.id, body);
    return c.json(
      {
        success: true,
        message: "Article updated successfully",
        data: result,
      },
      httpStatusCodes.OK
    );
  };

  static deleteArticle: AppRouteHandler<DeleteArticleRoute> = async (c) => {
    const user = getAuthUser(c);
    const { id } = c.req.valid("param");
    const result = await ArticleService.deleteArticle(id, user.id);
    return c.json(result, httpStatusCodes.OK);
  };
}
