import { Router } from "express";
import { db } from "../db/index.js";
import { feedback, feedbackScores, interviews, evalAreas } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// Get feedback for an interview
router.get("/interview/:interviewId", async (req, res) => {
  try {
    const [iv] = await db.select().from(interviews).where(eq(interviews.id, +req.params.interviewId));
    if (!iv) return res.status(404).json({ error: "Interview not found" });
    if (req.user.role === "interviewer" && iv.interviewerId !== req.user.id)
      return res.status(403).json({ error: "Access denied" });

    const [fb] = await db.select().from(feedback).where(eq(feedback.interviewId, +req.params.interviewId));
    if (!fb) return res.json(null);
    const scores = await db.select().from(feedbackScores).where(eq(feedbackScores.feedbackId, fb.id));
    res.json({ ...fb, scores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit feedback
router.post("/", async (req, res) => {
  try {
    const { interviewId, overallRecommendation, overallNotes, scores = [] } = req.body;
    if (!interviewId) return res.status(400).json({ error: "interviewId is required" });

    const [iv] = await db.select().from(interviews).where(eq(interviews.id, interviewId));
    if (!iv) return res.status(404).json({ error: "Interview not found" });
    if (req.user.role === "interviewer" && iv.interviewerId !== req.user.id)
      return res.status(403).json({ error: "Access denied" });

    // Upsert feedback
    const existing = await db.select().from(feedback).where(eq(feedback.interviewId, interviewId));
    let fb;
    if (existing.length) {
      [fb] = await db
        .update(feedback)
        .set({ overallRecommendation, overallNotes })
        .where(eq(feedback.id, existing[0].id))
        .returning();
      await db.delete(feedbackScores).where(eq(feedbackScores.feedbackId, fb.id));
    } else {
      [fb] = await db
        .insert(feedback)
        .values({ interviewId, interviewerId: req.user.id, overallRecommendation, overallNotes })
        .returning();
    }

    // Insert scores
    if (scores.length) {
      await db.insert(feedbackScores).values(
        scores.map((s) => ({ feedbackId: fb.id, evalAreaId: s.evalAreaId, score: s.score, notes: s.notes }))
      );
    }

    // Mark interview completed
    await db.update(interviews).set({ status: "completed" }).where(eq(interviews.id, interviewId));

    const savedScores = await db.select().from(feedbackScores).where(eq(feedbackScores.feedbackId, fb.id));
    res.status(201).json({ ...fb, scores: savedScores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all feedback for a candidate
router.get("/candidate/:candidateId", authenticate, async (req, res) => {
  try {
    const candidateInterviews = await db
      .select()
      .from(interviews)
      .where(eq(interviews.candidateId, +req.params.candidateId));
    const result = [];
    for (const iv of candidateInterviews) {
      const [fb] = await db.select().from(feedback).where(eq(feedback.interviewId, iv.id));
      if (fb) {
        const scores = await db.select().from(feedbackScores).where(eq(feedbackScores.feedbackId, fb.id));
        result.push({ interview: iv, feedback: fb, scores });
      }
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
