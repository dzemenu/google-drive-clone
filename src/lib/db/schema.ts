import { pgTable, serial, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  url: text("url").notNull(),
  size: varchar("size", { length: 50 }),
  folderId: integer("folder_id").references(() => folders.id),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
