import { defineRelations } from "drizzle-orm";
import * as schema from "./schema/index.js";

export const relations = defineRelations(schema, (r) => ({
  accounts: {
    profile: r.one.profiles({
      from: r.accounts.id,
      to: r.profiles.userId,
    }),
    articles: r.many.articles(),
    comments: r.many.comments(),
    sessions: r.many.sessions(),
  },

  profiles: {
    account: r.one.accounts({
      from: r.profiles.userId,
      to: r.accounts.id,
    }),
  },

  sessions: {
    account: r.one.accounts({
      from: r.sessions.userId,
      to: r.accounts.id,
    }),
  },

  articles: {
    comments: r.many.comments(),
    author: r.one.accounts({
      from: r.articles.authorId,
      to: r.accounts.id,
    }),
  },

  comments: {
    article: r.one.articles({
      from: r.comments.articleId,
      to: r.articles.id,
    }),
    author: r.one.accounts({
      from: r.comments.authorId,
      to: r.accounts.id,
    }),
  },
}));
