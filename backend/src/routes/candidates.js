import { Router } from "express";
import { db } from "../db/index.js";
import { candidates, rounds } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// List candidates
router.get("/", async (req, res) => {
  try {
    const { roleId, status } = req.query;
    let query = db.select().from(candidates);
    const all = await query.orderBy(desc(candidates.createdAt));
    let filtered = all;
    if (roleId) filtered = filtered.filter((c) => c.roleId === +roleId);
    if (status) filtered = filtered.filter((c) => c.status === status);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single candidate
router.get("/:id", async (req, res) => {
  try {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, +req.params.id));
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create candidate
router.post("/", requireRole("coordinator"), async (req, res) => {
  try {
    const { name, email, phone, roleId, notes, resumeUrl } = req.body;
    if (!name || !email || !roleId)
      return res.status(400).json({ error: "Name, email, and roleId are required" });
    const [candidate] = await db
      .insert(candidates)
      .values({ name, email, phone, roleId, notes, resumeUrl })
      .returning();
    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update candidate
router.put("/:id", requireRole("coordinator"), async (req, res) => {
  try {
    const { name, email, phone, status, notes, resumeUrl, currentRoundId } = req.body;
    const [updated] = await db
      .update(candidates)
      .set({ name, email, phone, status, notes, resumeUrl, currentRoundId })
      .where(eq(candidates.id, +req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Candidate not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Advance candidate to next round
router.post("/:id/advance", requireRole("coordinator"), async (req, res) => {
  try {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, +req.params.id));
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    const roleRounds = await db
      .select()
      .from(rounds)
      .where(eq(rounds.roleId, candidate.roleId))
      .orderBy(rounds.order);

    if (!roleRounds.length) return res.status(400).json({ error: "No rounds defined for this role" });

    let nextRound = null;
    if (!candidate.currentRoundId) {
      nextRound = roleRounds[0];
    } else {
      const currentIdx = roleRounds.findIndex((r) => r.id === candidate.currentRoundId);
      nextRound = roleRounds[currentIdx + 1] || null;
    }

    const newStatus = nextRound ? "in_progress" : "hired";
    const [updated] = await db
      .update(candidates)
      .set({ currentRoundId: nextRound?.id || candidate.currentRoundId, status: newStatus })
      .where(eq(candidates.id, +req.params.id))
      .returning();

    res.json({ candidate: updated, nextRound, message: nextRound ? `Advanced to ${nextRound.name}` : "Candidate hired!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject candidate
router.post("/:id/reject", requireRole("coordinator"), async (req, res) => {
  try {
    const [updated] = await db
      .update(candidates)
      .set({ status: "rejected" })
      .where(eq(candidates.id, +req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Candidate not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete candidate
router.delete("/:id", requireRole("coordinator"), async (req, res) => {
  try {
    const [deleted] = await db.delete(candidates).where(eq(candidates.id, +req.params.id)).returning();
    if (!deleted) return res.status(404).json({ error: "Candidate not found" });
    res.json({ message: "Candidate deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
