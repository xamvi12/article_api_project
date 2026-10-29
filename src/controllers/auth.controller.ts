import type { AppRouteHandler } from "../types.js";
import type {
  RegisterRoute,
  LoginRoute,
  MeRoute,
  ChangePasswordRoute,
} from "../routes/auth.routes.js";
import { AuthService } from "../services/auth.service.js";
import { getAuthUser } from "../middlewares/auth.middleware.js";
import { httpStatusCodes } from "../utils/openapi-helpers.js";

export class AuthController {
  static register: AppRouteHandler<RegisterRoute> = async (c) => {
    const body = c.req.valid("json");
    const result = await AuthService.register(body);
    return c.json(
      {
        success: true,
        message: "Account registered successfully",
        data: result,
      },
      httpStatusCodes.CREATED
    );
  };

  static login: AppRouteHandler<LoginRoute> = async (c) => {
    const body = c.req.valid("json");
    const result = await AuthService.login(body);
    return c.json(
      {
        success: true,
        message: "Logged in successfully",
        data: result,
      },
      httpStatusCodes.OK
    );
  };

  static getMe: AppRouteHandler<MeRoute> = async (c) => {
    const user = getAuthUser(c);
    const result = await AuthService.getMe(user.id);
    return c.json(
      {
        success: true,
        message: "Profile retrieved successfully",
        data: result,
      },
      httpStatusCodes.OK
    );
  };

  static changePassword: AppRouteHandler<ChangePasswordRoute> = async (c) => {
    const user = getAuthUser(c);
    const body = c.req.valid("json");
    const result = await AuthService.changePassword(user.id, body);
    return c.json(result, httpStatusCodes.OK);
  };
}
