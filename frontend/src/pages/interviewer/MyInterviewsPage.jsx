import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import api from "../../utils/api";

export default function MyInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");

  useEffect(() => {
    api.get("/interviews").then((r) => setInterviews(r.data)).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = interviews.filter((i) => i.status === "scheduled" && new Date(i.scheduledAt) > now)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  const past = interviews.filter((i) => i.status !== "scheduled" || new Date(i.scheduledAt) <= now)
    .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

  const displayed = tab === "upcoming" ? upcoming : past;

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">My Interviews</div>
          <div className="page-subtitle">{interviews.length} total</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="tabs" style={{ margin: 0, borderBottom: "none" }}>
            <button className={`tab ${tab === "upcoming" ? "active" : ""}`} onClick={() => setTab("upcoming")}>
              Upcoming ({upcoming.length})
            </button>
            <button className={`tab ${tab === "past" ? "active" : ""}`} onClick={() => setTab("past")}>
              Past ({past.length})
            </button>
          </div>
        </div>
        {displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎤</div>
            <div className="empty-title">No {tab} interviews</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th><th>Duration</th><th>Status</th><th>Meeting</th><th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((iv) => (
                  <tr key={iv.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{format(new Date(iv.scheduledAt), "MMM d, yyyy")}</div>
                      <div className="text-muted text-sm">{format(new Date(iv.scheduledAt), "h:mm a")}</div>
                    </td>
                    <td>{iv.durationMinutes}min</td>
                    <td>
                      <span className={`badge badge-${iv.status === "completed" ? "green" : iv.status === "cancelled" ? "red" : "blue"}`}>
                        {iv.status}
                      </span>
                    </td>
                    <td>
                      {iv.meetingLink
                        ? <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-primary">Join</a>
                        : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <Link to={`/interviewer/feedback/${iv.id}`} className="btn btn-xs btn-outline">
                        {iv.status === "completed" ? "View" : "Submit"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
