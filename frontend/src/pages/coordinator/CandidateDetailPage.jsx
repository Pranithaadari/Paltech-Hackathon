import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import api from "../../utils/api";

const statusBadge = (s) => {
  const c = { applied: "badge-gray", screening: "badge-yellow", in_progress: "badge-blue", hired: "badge-green", rejected: "badge-red" };
  return <span className={`badge ${c[s] || "badge-gray"}`}>{s?.replace("_", " ")}</span>;
};

export default function CandidateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [msg, setMsg] = useState(null);

  const load = async () => {
    const [c, ivs, fbs] = await Promise.all([
      api.get(`/candidates/${id}`),
      api.get(`/interviews?candidateId=${id}`),
      api.get(`/feedback/candidate/${id}`),
    ]);
    setCandidate(c.data);
    setInterviews(ivs.data);
    setFeedbackList(fbs.data);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, [id]);

  const advance = async () => {
    setActionLoading("advance");
    try {
      const { data } = await api.post(`/candidates/${id}/advance`);
      setMsg({ type: "success", text: data.message });
      await load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Failed" });
    } finally {
      setActionLoading("");
    }
  };

  const reject = async () => {
    if (!confirm("Reject this candidate?")) return;
    setActionLoading("reject");
    try {
      await api.post(`/candidates/${id}/reject`);
      setMsg({ type: "success", text: "Candidate rejected" });
      await load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.error || "Failed" });
    } finally {
      setActionLoading("");
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!candidate) return <div className="page"><div className="alert alert-error">Not found</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>
            <Link to="/coordinator/candidates" style={{ color: "var(--primary)", textDecoration: "none" }}>Candidates</Link> / {candidate.name}
          </div>
          <div className="page-title">{candidate.name}</div>
          <div className="page-subtitle">{candidate.email} · {statusBadge(candidate.status)}</div>
        </div>
        <div className="flex gap-2">
          {!["hired", "rejected"].includes(candidate.status) && (
            <>
              <button className="btn btn-success" onClick={advance} disabled={actionLoading === "advance"}>
                {actionLoading === "advance" ? "..." : "⬆ Advance"}
              </button>
              <button className="btn btn-danger" onClick={reject} disabled={actionLoading === "reject"}>
                {actionLoading === "reject" ? "..." : "✕ Reject"}
              </button>
            </>
          )}
          <Link to={`/coordinator/schedule?candidateId=${id}`} className="btn btn-outline">📅 Schedule</Link>
        </div>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type}`} onClick={() => setMsg(null)} style={{ cursor: "pointer" }}>
          {msg.text}
        </div>
      )}

      <div className="form-row" style={{ gap: 20, alignItems: "flex-start" }}>
        {/* Info card */}
        <div className="card">
          <div className="card-header"><span className="card-title">Info</span></div>
          <div className="card-body">
            {[["Phone", candidate.phone], ["Status", candidate.status?.replace("_"," ")], ["Added", new Date(candidate.createdAt).toLocaleDateString()]].map(([l, v]) => (
              <div key={l} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>{l}</div>
                <div>{v || "—"}</div>
              </div>
            ))}
            {candidate.notes && (
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Notes</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{candidate.notes}</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Interviews */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Interviews ({interviews.length})</span>
              <Link to={`/coordinator/schedule?candidateId=${id}`} className="btn btn-sm btn-outline">+ Schedule</Link>
            </div>
            {interviews.length ? (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Date</th><th>Duration</th><th>Status</th></tr></thead>
                  <tbody>
                    {interviews.map((iv) => (
                      <tr key={iv.id}>
                        <td>{format(new Date(iv.scheduledAt), "MMM d, yyyy h:mm a")}</td>
                        <td>{iv.durationMinutes}min</td>
                        <td><span className={`badge badge-${iv.status === "completed" ? "green" : iv.status === "cancelled" ? "red" : "blue"}`}>{iv.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 24 }}>
                <div className="empty-desc">No interviews scheduled</div>
              </div>
            )}
          </div>

          {/* Feedback */}
          <div className="card">
            <div className="card-header"><span className="card-title">Feedback ({feedbackList.length})</span></div>
            {feedbackList.length ? (
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {feedbackList.map((fb) => (
                  <div key={fb.feedback.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontWeight: 600 }}>Interview #{fb.interview.id}</span>
                      <span className={`badge badge-${fb.feedback.overallRecommendation?.includes("yes") ? "green" : fb.feedback.overallRecommendation?.includes("no") ? "red" : "yellow"}`}>
                        {fb.feedback.overallRecommendation?.replace("_", " ")}
                      </span>
                    </div>
                    {fb.feedback.overallNotes && <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>{fb.feedback.overallNotes}</p>}
                    {fb.scores?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {fb.scores.map((s) => (
                          <span key={s.id} className="badge badge-purple">Area #{s.evalAreaId}: {s.score}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 24 }}>
                <div className="empty-desc">No feedback yet</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
