import { Router } from "express";
import { db } from "../db/index.js";
import { roles, candidates, interviews, feedback, users } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// Coordinator dashboard
router.get("/coordinator", requireRole("coordinator"), async (req, res) => {
  try {
    const allRoles = await db.select().from(roles);
    const allCandidates = await db.select().from(candidates);
    const allInterviews = await db.select().from(interviews);

    const stats = {
      totalRoles: allRoles.length,
      openRoles: allRoles.filter((r) => r.status === "open").length,
      totalCandidates: allCandidates.length,
      activeCandidates: allCandidates.filter((c) => ["screening", "in_progress"].includes(c.status)).length,
      hiredCandidates: allCandidates.filter((c) => c.status === "hired").length,
      rejectedCandidates: allCandidates.filter((c) => c.status === "rejected").length,
      scheduledInterviews: allInterviews.filter((i) => i.status === "scheduled").length,
      completedInterviews: allInterviews.filter((i) => i.status === "completed").length,
      upcomingInterviews: allInterviews
        .filter((i) => i.status === "scheduled" && new Date(i.scheduledAt) > new Date())
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        .slice(0, 5),
      recentCandidates: allCandidates.slice(0, 5),
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Interviewer dashboard
router.get("/interviewer", async (req, res) => {
  try {
    const myInterviews = await db
      .select()
      .from(interviews)
      .where(eq(interviews.interviewerId, req.user.id));

    const upcoming = myInterviews
      .filter((i) => i.status === "scheduled" && new Date(i.scheduledAt) > new Date())
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    const past = myInterviews
      .filter((i) => ["completed", "cancelled", "no_show"].includes(i.status))
      .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
      .slice(0, 10);

    const pendingFeedback = [];
    for (const iv of myInterviews.filter((i) => i.status === "scheduled")) {
      const fb = await db.select().from(feedback).where(eq(feedback.interviewId, iv.id));
      if (!fb.length) pendingFeedback.push(iv);
    }

    res.json({
      totalInterviews: myInterviews.length,
      upcomingInterviews: upcoming,
      pastInterviews: past,
      pendingFeedback,
      completedInterviews: myInterviews.filter((i) => i.status === "completed").length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List interviewers (for coordinator use)
router.get("/interviewers", requireRole("coordinator"), async (req, res) => {
  try {
    const interviewers = await db
      .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
      .from(users)
      .where(eq(users.role, "interviewer"));
    res.json(interviewers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
