import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./accounts.js";

export const articles = sqliteTable("articles", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  authorId: integer()
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  title: text().notNull(),
  slug: text().notNull().unique(),
  excerpt: text(),
  body: text().notNull(),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__*/ new Date())
    .notNull(),
  updatedAt: integer({ mode: "timestamp" })
    .$onUpdate(() => /* @__PURE__*/ new Date())
    .notNull(),
});
