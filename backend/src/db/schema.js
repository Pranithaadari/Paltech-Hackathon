import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["coordinator", "interviewer"] }).notNull().default("interviewer"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  department: text("department"),
  status: text("status", { enum: ["open", "closed", "paused"] }).notNull().default("open"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const rounds = sqliteTable("rounds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  description: text("description"),
});

export const evalAreas = sqliteTable("eval_areas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roundId: integer("round_id").notNull().references(() => rounds.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  maxScore: integer("max_score").notNull().default(10),
});

export const candidates = sqliteTable("candidates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  roleId: integer("role_id").notNull().references(() => roles.id),
  currentRoundId: integer("current_round_id").references(() => rounds.id),
  status: text("status", {
    enum: ["applied", "screening", "in_progress", "advanced", "rejected", "hired"],
  }).notNull().default("applied"),
  resumeUrl: text("resume_url"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const interviews = sqliteTable("interviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id, { onDelete: "cascade" }),
  roundId: integer("round_id").notNull().references(() => rounds.id),
  interviewerId: integer("interviewer_id").notNull().references(() => users.id),
  scheduledAt: text("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  status: text("status", { enum: ["scheduled", "completed", "cancelled", "no_show"] }).notNull().default("scheduled"),
  meetingLink: text("meeting_link"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const feedback = sqliteTable("feedback", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  interviewId: integer("interview_id").notNull().references(() => interviews.id, { onDelete: "cascade" }),
  interviewerId: integer("interviewer_id").notNull().references(() => users.id),
  overallRecommendation: text("overall_recommendation", {
    enum: ["strong_yes", "yes", "neutral", "no", "strong_no"],
  }),
  overallNotes: text("overall_notes"),
  submittedAt: text("submitted_at").default(sql`(datetime('now'))`),
});

export const feedbackScores = sqliteTable("feedback_scores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  feedbackId: integer("feedback_id").notNull().references(() => feedback.id, { onDelete: "cascade" }),
  evalAreaId: integer("eval_area_id").notNull().references(() => evalAreas.id),
  score: real("score").notNull(),
  notes: text("notes"),
});
