import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/api";

export default function ScheduleInterviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [form, setForm] = useState({
    candidateId: searchParams.get("candidateId") || "",
    roundId: "",
    interviewerId: "",
    scheduledAt: "",
    durationMinutes: 60,
    meetingLink: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/candidates"),
      api.get("/dashboard/interviewers"),
      api.get("/roles"),
    ]).then(([c, i, r]) => {
      setCandidates(c.data);
      setInterviewers(i.data);
      setRoles(r.data);
    }).finally(() => setLoading(false));
  }, []);

  // Load rounds when candidate changes
  useEffect(() => {
    if (!form.candidateId) return setRounds([]);
    const candidate = candidates.find((c) => c.id === +form.candidateId);
    if (!candidate) return;
    api.get(`/roles/${candidate.roleId}`).then((r) => setRounds(r.data.rounds || []));
  }, [form.candidateId, candidates]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.candidateId || !form.roundId || !form.interviewerId || !form.scheduledAt)
      return setError("All required fields must be filled");
    setSaving(true);
    setError("");
    try {
      await api.post("/interviews", {
        ...form,
        candidateId: +form.candidateId,
        roundId: +form.roundId,
        interviewerId: +form.interviewerId,
        durationMinutes: +form.durationMinutes,
      });
      setSuccess("Interview scheduled successfully!");
      setTimeout(() => navigate("/coordinator"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to schedule interview");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Schedule Interview</div>
          <div className="page-subtitle">Set up a new interview session</div>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-header"><span className="card-title">Interview Details</span></div>
        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Candidate *</label>
              <select className="form-select" value={form.candidateId}
                onChange={(e) => setForm({ ...form, candidateId: e.target.value, roundId: "" })} required>
                <option value="">Select candidate...</option>
                {candidates.filter((c) => !["hired","rejected"].includes(c.status)).map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Round *</label>
              <select className="form-select" value={form.roundId}
                onChange={(e) => setForm({ ...form, roundId: e.target.value })}
                disabled={!form.candidateId} required>
                <option value="">Select round...</option>
                {rounds.map((r) => <option key={r.id} value={r.id}>Round {r.order}: {r.name}</option>)}
              </select>
              {!form.candidateId && <div className="form-hint">Select a candidate first</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Interviewer *</label>
              <select className="form-select" value={form.interviewerId}
                onChange={(e) => setForm({ ...form, interviewerId: e.target.value })} required>
                <option value="">Select interviewer...</option>
                {interviewers.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.email})</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date & Time *</label>
                <input className="form-input" type="datetime-local" value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input className="form-input" type="number" min="15" max="240" step="15"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: +e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Meeting Link</label>
              <input className="form-input" type="url" placeholder="https://meet.google.com/..."
                value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} />
            </div>
            <div className="modal-footer" style={{ padding: 0, paddingTop: 8 }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Scheduling..." : "Schedule Interview"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
