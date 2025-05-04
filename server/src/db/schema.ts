import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"

import { Role } from "../auth"

const categoryTable = pgTable("category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
type Category = typeof categoryTable.$inferSelect
const categoryRelations = relations(categoryTable, ({ many }) => ({
  entries: many(entryTable),
}))

const entryTable = pgTable("entry", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categoryTable.id),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
type Entry = typeof entryTable.$inferSelect
const entryRelations = relations(entryTable, ({ one }) => ({
  category: one(categoryTable, {
    fields: [entryTable.categoryId],
    references: [categoryTable.id],
  }),
}))

export const userTable = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 20 })
    .notNull()
    .$type<Role>()
    .default(Role.USER),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
type User = typeof userTable.$inferSelect

export {
  type Category,
  categoryTable as category,
  categoryRelations,
  type Entry,
  entryTable as entry,
  entryRelations,
  type User,
  userTable as user,
}
