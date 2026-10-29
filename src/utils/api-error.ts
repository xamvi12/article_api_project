export class ApiError extends Error {
  public status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message = "Bad Request") {
    return new ApiError(message, 400);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(message, 403);
  }

  static notFound(message = "Not Found") {
    return new ApiError(message, 404);
  }

  static conflict(message = "Conflict") {
    return new ApiError(message, 409);
  }

  static unprocessable(message = "Validation Error") {
    return new ApiError(message, 422);
  }

  static internal(message = "Internal Server Error") {
    return new ApiError(message, 500);
  }
}
