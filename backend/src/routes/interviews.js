import { Router } from "express";
import { db } from "../db/index.js";
import { interviews, candidates, rounds, users } from "../db/schema.js";
import { eq, and, or, gte, lte } from "drizzle-orm";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// Check for scheduling overlap
async function hasOverlap(interviewerId, scheduledAt, durationMinutes, excludeId = null) {
  const newStart = new Date(scheduledAt);
  const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);

  const existing = await db
    .select()
    .from(interviews)
    .where(and(eq(interviews.interviewerId, interviewerId), eq(interviews.status, "scheduled")));

  for (const iv of existing) {
    if (excludeId && iv.id === excludeId) continue;
    const ivStart = new Date(iv.scheduledAt);
    const ivEnd = new Date(ivStart.getTime() + iv.durationMinutes * 60000);
    if (newStart < ivEnd && newEnd > ivStart) return true;
  }
  return false;
}

// List interviews
router.get("/", async (req, res) => {
  try {
    const { candidateId, interviewerId, roundId } = req.query;
    let all = await db.select().from(interviews);
    if (candidateId) all = all.filter((i) => i.candidateId === +candidateId);
    if (interviewerId) all = all.filter((i) => i.interviewerId === +interviewerId);
    if (roundId) all = all.filter((i) => i.roundId === +roundId);

    // Interviewers only see their own
    if (req.user.role === "interviewer") {
      all = all.filter((i) => i.interviewerId === req.user.id);
    }
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single interview
router.get("/:id", async (req, res) => {
  try {
    const [interview] = await db.select().from(interviews).where(eq(interviews.id, +req.params.id));
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    if (req.user.role === "interviewer" && interview.interviewerId !== req.user.id)
      return res.status(403).json({ error: "Access denied" });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Schedule interview
router.post("/", requireRole("coordinator"), async (req, res) => {
  try {
    const { candidateId, roundId, interviewerId, scheduledAt, durationMinutes = 60, meetingLink } = req.body;
    if (!candidateId || !roundId || !interviewerId || !scheduledAt)
      return res.status(400).json({ error: "candidateId, roundId, interviewerId, scheduledAt are required" });

    const overlap = await hasOverlap(interviewerId, scheduledAt, durationMinutes);
    if (overlap)
      return res.status(409).json({ error: "Interviewer has a scheduling conflict at this time" });

    const [interview] = await db
      .insert(interviews)
      .values({ candidateId, roundId, interviewerId, scheduledAt, durationMinutes, meetingLink })
      .returning();
    res.status(201).json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update interview
router.put("/:id", requireRole("coordinator"), async (req, res) => {
  try {
    const { scheduledAt, durationMinutes, status, meetingLink, interviewerId } = req.body;
    const [existing] = await db.select().from(interviews).where(eq(interviews.id, +req.params.id));
    if (!existing) return res.status(404).json({ error: "Interview not found" });

    if (scheduledAt || durationMinutes) {
      const ivId = +req.params.id;
      const iverId = interviewerId || existing.interviewerId;
      const sAt = scheduledAt || existing.scheduledAt;
      const dur = durationMinutes || existing.durationMinutes;
      const overlap = await hasOverlap(iverId, sAt, dur, ivId);
      if (overlap) return res.status(409).json({ error: "Scheduling conflict" });
    }

    const [updated] = await db
      .update(interviews)
      .set({ scheduledAt, durationMinutes, status, meetingLink, interviewerId })
      .where(eq(interviews.id, +req.params.id))
      .returning();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel interview
router.post("/:id/cancel", requireRole("coordinator"), async (req, res) => {
  try {
    const [updated] = await db
      .update(interviews)
      .set({ status: "cancelled" })
      .where(eq(interviews.id, +req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Interview not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
