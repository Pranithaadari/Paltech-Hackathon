import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format, isPast } from "date-fns";
import api from "../../utils/api";

export default function InterviewerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/interviewer").then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">My Dashboard</div>
          <div className="page-subtitle">Your interview assignments and feedback tasks</div>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: "Total Interviews", value: data?.totalInterviews, icon: "🎤", color: "#4f46e5" },
          { label: "Upcoming", value: data?.upcomingInterviews?.length, icon: "📅", color: "#3b82f6" },
          { label: "Completed", value: data?.completedInterviews, icon: "✅", color: "#10b981" },
          { label: "Pending Feedback", value: data?.pendingFeedback?.length, icon: "📝", color: "#f59e0b" },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value ?? 0}</div>
          </div>
        ))}
      </div>

      {data?.pendingFeedback?.length > 0 && (
        <div className="alert alert-info mb-4" style={{ marginBottom: 20 }}>
          ⚠️ You have {data.pendingFeedback.length} interview(s) awaiting feedback submission.
        </div>
      )}

      <div className="form-row" style={{ gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Interviews</span>
            <Link to="/interviewer/interviews" className="btn btn-sm btn-outline">View All</Link>
          </div>
          <div className="card-body">
            {data?.upcomingInterviews?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.upcomingInterviews.slice(0, 5).map((iv) => (
                  <div key={iv.id} style={{ background: "var(--bg)", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Interview #{iv.id}</div>
                    <div className="text-muted text-sm">
                      {format(new Date(iv.scheduledAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    <div className="text-muted text-sm">{iv.durationMinutes} minutes</div>
                    {iv.meetingLink && (
                      <a href={iv.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="btn btn-xs btn-primary" style={{ marginTop: 6 }}>Join Meeting</a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 24 }}>
                <div className="empty-icon">📅</div>
                <div className="empty-desc">No upcoming interviews</div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Pending Feedback</span></div>
          <div className="card-body">
            {data?.pendingFeedback?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.pendingFeedback.map((iv) => (
                  <div key={iv.id} style={{ background: "var(--warning-light)", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Interview #{iv.id}</div>
                    <div className="text-muted text-sm" style={{ marginBottom: 8 }}>
                      {format(new Date(iv.scheduledAt), "MMM d, yyyy")}
                    </div>
                    <Link to={`/interviewer/feedback/${iv.id}`} className="btn btn-sm btn-primary">
                      Submit Feedback
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 24 }}>
                <div className="empty-icon">✅</div>
                <div className="empty-title">All caught up!</div>
                <div className="empty-desc">No pending feedback</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
