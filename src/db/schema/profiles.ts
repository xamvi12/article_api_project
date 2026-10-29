import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { accounts } from "./accounts.js";

export const profiles = sqliteTable("profiles", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: integer()
    .notNull()
    .unique()
    .references(() => accounts.id, { onDelete: "cascade" }), // cascade delete when account is removed
  image: text(),
  username: text().notNull().unique(),
  bio: text(),
  displayName: text(),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => /* @__PURE__*/ new Date())
    .notNull(),
  updatedAt: integer({ mode: "timestamp" })
    .$onUpdate(() => /* @__PURE__*/ new Date())
    .notNull(),
});
