export const ENV = {
  PORT: Number(Bun.env.PORT) || 4000,
  REDIS_URL: Bun.env.REDIS_URL || "redis://localhost:6379",
  MONGO_URI: Bun.env.MONGO_URI || "mongodb://127.0.0.1:27017/blog_views",
  ALLOWED_ORIGIN: Bun.env.FRONTEND_URL || "http://localhost:3000",
  MY_DOMAIN: Bun.env.MY_DOMAIN || "localhost",
};
