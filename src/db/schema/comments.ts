import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./accounts.js";
import { articles } from "./articles.js";

export const comments = sqliteTable("comments", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  articleId: text()
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  authorId: integer()
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  body: text().notNull(),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__*/ new Date())
    .notNull(),
  updatedAt: integer({ mode: "timestamp" })
    .$onUpdate(() => /* @__PURE__*/ new Date())
    .notNull(),
});
