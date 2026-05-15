import { Router } from "express";
import { db } from "../db/index.js";
import { roles, rounds, evalAreas, candidates } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// List roles
router.get("/", async (req, res) => {
  try {
    const all = await db.select().from(roles).orderBy(desc(roles.createdAt));
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single role with rounds & eval areas
router.get("/:id", async (req, res) => {
  try {
    const [role] = await db.select().from(roles).where(eq(roles.id, +req.params.id));
    if (!role) return res.status(404).json({ error: "Role not found" });
    const roleRounds = await db.select().from(rounds).where(eq(rounds.roleId, +req.params.id));
    const roundsWithAreas = await Promise.all(
      roleRounds.map(async (r) => {
        const areas = await db.select().from(evalAreas).where(eq(evalAreas.roundId, r.id));
        return { ...r, evalAreas: areas };
      })
    );
    const roleCandidates = await db.select().from(candidates).where(eq(candidates.roleId, +req.params.id));
    res.json({ ...role, rounds: roundsWithAreas, candidates: roleCandidates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create role
router.post("/", requireRole("coordinator"), async (req, res) => {
  try {
    const { title, description, department } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    const [role] = await db
      .insert(roles)
      .values({ title, description, department, createdBy: req.user.id })
      .returning();
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update role
router.put("/:id", requireRole("coordinator"), async (req, res) => {
  try {
    const { title, description, department, status } = req.body;
    const [updated] = await db
      .update(roles)
      .set({ title, description, department, status })
      .where(eq(roles.id, +req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Role not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete role
router.delete("/:id", requireRole("coordinator"), async (req, res) => {
  try {
    const [deleted] = await db.delete(roles).where(eq(roles.id, +req.params.id)).returning();
    if (!deleted) return res.status(404).json({ error: "Role not found" });
    res.json({ message: "Role deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rounds for a role
router.post("/:id/rounds", requireRole("coordinator"), async (req, res) => {
  try {
    const { name, order, description } = req.body;
    if (!name || order == null) return res.status(400).json({ error: "Name and order are required" });
    const [round] = await db
      .insert(rounds)
      .values({ roleId: +req.params.id, name, order, description })
      .returning();
    res.status(201).json(round);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eval areas for a round
router.post("/rounds/:roundId/eval-areas", requireRole("coordinator"), async (req, res) => {
  try {
    const { name, description, maxScore } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const [area] = await db
      .insert(evalAreas)
      .values({ roundId: +req.params.roundId, name, description, maxScore: maxScore || 10 })
      .returning();
    res.status(201).json(area);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
