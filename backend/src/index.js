import express from "express";
import cors from "cors";
import { runMigrations } from "./db/index.js";
import authRoutes from "./routes/auth.js";
import rolesRoutes from "./routes/roles.js";
import candidatesRoutes from "./routes/candidates.js";
import interviewsRoutes from "./routes/interviews.js";
import feedbackRoutes from "./routes/feedback.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
app.use("/api/auth", authRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/candidates", candidatesRoutes);
app.use("/api/interviews", interviewsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start
runMigrations();
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
