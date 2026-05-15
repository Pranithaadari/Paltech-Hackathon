import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import api from "../../utils/api";

const RECOMMENDATIONS = [
  { value: "strong_yes", label: "💚 Strong Yes" },
  { value: "yes", label: "✅ Yes" },
  { value: "neutral", label: "🟡 Neutral" },
  { value: "no", label: "❌ No" },
  { value: "strong_no", label: "🔴 Strong No" },
];

export default function FeedbackPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [evalAreas, setEvalAreas] = useState([]);
  const [existing, setExisting] = useState(null);
  const [form, setForm] = useState({ overallRecommendation: "", overallNotes: "", scores: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      const [iv, fb] = await Promise.all([
        api.get(`/interviews/${interviewId}`),
        api.get(`/feedback/interview/${interviewId}`),
      ]);
      setInterview(iv.data);
      if (fb.data) {
        setExisting(fb.data);
        const scoresMap = {};
        fb.data.scores?.forEach((s) => { scoresMap[s.evalAreaId] = { score: s.score, notes: s.notes || "" }; });
        setForm({ overallRecommendation: fb.data.overallRecommendation || "", overallNotes: fb.data.overallNotes || "", scores: scoresMap });
      }

      // Load round's eval areas
      const roundId = iv.data.roundId;
      const roleResp = await api.get(`/roles`);
      // Find round from roles... simpler: get candidate's role
      const cand = await api.get(`/candidates/${iv.data.candidateId}`);
      const role = await api.get(`/roles/${cand.data.roleId}`);
      const round = role.data.rounds?.find((r) => r.id === roundId);
      setEvalAreas(round?.evalAreas || []);
    };
    load().catch(console.error).finally(() => setLoading(false));
  }, [interviewId]);

  const setScore = (areaId, field, value) => {
    setForm((prev) => ({
      ...prev,
      scores: { ...prev.scores, [areaId]: { ...prev.scores[areaId], [field]: value } },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.overallRecommendation) return setError("Please select an overall recommendation");
    setSaving(true);
    setError("");
    try {
      const scores = Object.entries(form.scores).map(([evalAreaId, s]) => ({
        evalAreaId: +evalAreaId, score: +s.score, notes: s.notes,
      }));
      await api.post("/feedback", {
        interviewId: +interviewId,
        overallRecommendation: form.overallRecommendation,
        overallNotes: form.overallNotes,
        scores,
      });
      setSuccess("Feedback submitted successfully!");
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit feedback");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!interview) return <div className="page"><div className="alert alert-error">Interview not found</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Interview Feedback</div>
          <div className="page-subtitle">
            Interview #{interview.id} · {format(new Date(interview.scheduledAt), "MMM d, yyyy h:mm a")}
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 700 }}>
        <div className="card-header">
          <span className="card-title">{existing ? "Edit Feedback" : "Submit Feedback"}</span>
          {interview.status === "completed" && <span className="badge badge-green">Completed</span>}
        </div>
        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            {/* Eval areas */}
            {evalAreas.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>Evaluation Scores</div>
                {evalAreas.map((area) => (
                  <div key={area.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{area.name}</div>
                        {area.description && <div className="text-muted text-sm">{area.description}</div>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="number" className="form-input" style={{ width: 70 }}
                          min="0" max={area.maxScore} step="0.5"
                          placeholder="0"
                          value={form.scores[area.id]?.score || ""}
                          onChange={(e) => setScore(area.id, "score", e.target.value)} />
                        <span className="text-muted text-sm">/ {area.maxScore}</span>
                      </div>
                    </div>
                    <input className="form-input" placeholder="Notes for this area..."
                      value={form.scores[area.id]?.notes || ""}
                      onChange={(e) => setScore(area.id, "notes", e.target.value)} />
                  </div>
                ))}
              </div>
            )}

            {/* Overall recommendation */}
            <div className="form-group">
              <label className="form-label">Overall Recommendation *</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {RECOMMENDATIONS.map((r) => (
                  <button key={r.value} type="button"
                    onClick={() => setForm({ ...form, overallRecommendation: r.value })}
                    className={`btn ${form.overallRecommendation === r.value ? "btn-primary" : "btn-outline"}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Overall Notes</label>
              <textarea className="form-textarea" rows={5}
                placeholder="Summarize your assessment, key observations, strengths and weaknesses..."
                value={form.overallNotes}
                onChange={(e) => setForm({ ...form, overallNotes: e.target.value })} />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Submitting..." : existing ? "Update Feedback" : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
