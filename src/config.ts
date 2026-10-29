import "dotenv/config";

export const config = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_FILE_NAME: process.env.DB_FILE_NAME || "article_api.sqlite",
  JWT_SECRET: process.env.JWT_SECRET || "default_jwt_secret_key_vivi",
};
