import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const folders = pgTable("folders", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const files = pgTable("files", {
  id: integer("id").primaryKey().notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  size: text("size").notNull(),
  folderId: integer("folder_id").references(() => folders.id),
  userId: text("user_id").notNull(),
  isTrash: boolean("is_trash").default(false).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});
