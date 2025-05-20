import { pgTable, text, serial, integer, boolean, timestamp, varchar, date, foreignKey, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Base User Schema
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles),
  firDetails: many(firDetails),
}));

// Profile Schema
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  address: text("address"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profileRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

// Police Station Schema
export const policeStations = pgTable("police_stations", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  contact: text("contact").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const policeStationRelations = relations(policeStations, ({ many }) => ({
  officers: many(officers),
  firDetails: many(firDetails),
}));

// Officer Schema
export const officers = pgTable("officers", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  badgeNumber: text("badge_number").notNull().unique(),
  rank: text("rank").notNull(),
  stationId: varchar("station_id").references(() => policeStations.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const officerRelations = relations(officers, ({ one }) => ({
  station: one(policeStations, {
    fields: [officers.stationId],
    references: [policeStations.id],
  }),
}));

// Criminal Schema
export const criminals = pgTable("criminals", {
  id: varchar("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  status: text("status").notNull(), // active, incarcerated, released, wanted
  lastCrimeDate: date("last_crime_date").notNull(),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const criminalRelations = relations(criminals, ({ many }) => ({
  crimes: many(crimes),
  criminalCrimeTypes: many(criminalCrimeTypes),
}));

// Crime Type Schema
export const crimeTypes = pgTable("crime_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  severity: text("severity").notNull(), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const crimeTypeRelations = relations(crimeTypes, ({ many }) => ({
  criminalCrimeTypes: many(criminalCrimeTypes),
}));

// Criminal Crime Types (Many-to-Many)
export const criminalCrimeTypes = pgTable("criminal_crime_types", {
  id: serial("id").primaryKey(),
  criminalId: varchar("criminal_id").references(() => criminals.id).notNull(),
  crimeTypeId: integer("crime_type_id").references(() => crimeTypes.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const criminalCrimeTypeRelations = relations(criminalCrimeTypes, ({ one }) => ({
  criminal: one(criminals, {
    fields: [criminalCrimeTypes.criminalId],
    references: [criminals.id],
  }),
  crimeType: one(crimeTypes, {
    fields: [criminalCrimeTypes.crimeTypeId],
    references: [crimeTypes.id],
  }),
}));

// FIR Details Schema
export const firDetails = pgTable("fir_details", {
  id: varchar("id").primaryKey(),
  complainantName: text("complainant_name").notNull(),
  complainantId: text("complainant_id").notNull(),
  userId: integer("user_id").references(() => users.id),
  dateFiled: date("date_filed").notNull(),
  incidentType: text("incident_type").notNull(),
  stationId: varchar("station_id").references(() => policeStations.id).notNull(),
  status: text("status").notNull(), // new, investigating, resolved, closed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const firDetailRelations = relations(firDetails, ({ one, many }) => ({
  user: one(users, {
    fields: [firDetails.userId],
    references: [users.id],
  }),
  station: one(policeStations, {
    fields: [firDetails.stationId],
    references: [policeStations.id],
  }),
  crimes: many(crimes),
}));

// Crime Schema
export const crimes = pgTable("crimes", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull(), // open, closed, under_investigation
  firId: varchar("fir_id").references(() => firDetails.id),
  criminalId: varchar("criminal_id").references(() => criminals.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const crimeRelations = relations(crimes, ({ one }) => ({
  fir: one(firDetails, {
    fields: [crimes.firId],
    references: [firDetails.id],
  }),
  criminal: one(criminals, {
    fields: [crimes.criminalId],
    references: [criminals.id],
  }),
}));

// Activity Schema for dashboard
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  type: text("type").notNull(), // new, updated, progress
  location: text("location").notNull(),
  officer: text("officer").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Schemas for insertion and selection
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPoliceStationSchema = createInsertSchema(policeStations).omit({ createdAt: true, updatedAt: true });
export const insertOfficerSchema = createInsertSchema(officers).omit({ createdAt: true, updatedAt: true });
export const insertCriminalSchema = createInsertSchema(criminals).omit({ createdAt: true, updatedAt: true });
export const insertCrimeTypeSchema = createInsertSchema(crimeTypes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFirDetailSchema = createInsertSchema(firDetails).omit({ createdAt: true, updatedAt: true });
export const insertCrimeSchema = createInsertSchema(crimes).omit({ createdAt: true, updatedAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, timestamp: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertPoliceStation = z.infer<typeof insertPoliceStationSchema>;
export type InsertOfficer = z.infer<typeof insertOfficerSchema>;
export type InsertCriminal = z.infer<typeof insertCriminalSchema>;
export type InsertCrimeType = z.infer<typeof insertCrimeTypeSchema>;
export type InsertFirDetail = z.infer<typeof insertFirDetailSchema>;
export type InsertCrime = z.infer<typeof insertCrimeSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type PoliceStation = typeof policeStations.$inferSelect;
export type Officer = typeof officers.$inferSelect;
export type Criminal = typeof criminals.$inferSelect;
export type CrimeType = typeof crimeTypes.$inferSelect;
export type FirDetail = typeof firDetails.$inferSelect;
export type Crime = typeof crimes.$inferSelect;
export type Activity = typeof activities.$inferSelect;

// For Replit Auth
export type UpsertUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role?: string;
};
