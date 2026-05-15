import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { format } from "date-fns";

function StatusBadge({ status }) {
  const map = {
    scheduled: "badge-blue", completed: "badge-green", cancelled: "badge-red",
    applied: "badge-gray", in_progress: "badge-blue", hired: "badge-green",
    rejected: "badge-red", screening: "badge-yellow",
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status?.replace("_", " ")}</span>;
}

export default function CoordinatorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/coordinator").then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Coordinator Dashboard</div>
          <div className="page-subtitle">Overview of your hiring pipeline</div>
        </div>
        <Link to="/coordinator/roles" className="btn btn-primary">+ New Role</Link>
      </div>

      <div className="stats-grid">
        {[
          { label: "Total Roles", value: stats?.totalRoles, icon: "💼", color: "#4f46e5" },
          { label: "Open Roles", value: stats?.openRoles, icon: "🟢", color: "#10b981" },
          { label: "Total Candidates", value: stats?.totalCandidates, icon: "👤", color: "#3b82f6" },
          { label: "Active Candidates", value: stats?.activeCandidates, icon: "⚡", color: "#f59e0b" },
          { label: "Hired", value: stats?.hiredCandidates, icon: "🎉", color: "#10b981" },
          { label: "Interviews Scheduled", value: stats?.scheduledInterviews, icon: "📅", color: "#8b5cf6" },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="form-row" style={{ gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Interviews</span>
            <Link to="/coordinator/schedule" className="btn btn-sm btn-outline">Schedule</Link>
          </div>
          <div className="card-body">
            {stats?.upcomingInterviews?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stats.upcomingInterviews.map((iv) => (
                  <div key={iv.id} style={{ padding: "10px", background: "var(--bg)", borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Interview #{iv.id}</div>
                    <div className="text-muted text-sm">
                      {format(new Date(iv.scheduledAt), "MMM d, yyyy 'at' h:mm a")} · {iv.durationMinutes}min
                    </div>
                    <StatusBadge status={iv.status} />
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
          <div className="card-header">
            <span className="card-title">Recent Candidates</span>
            <Link to="/coordinator/candidates" className="btn btn-sm btn-outline">View All</Link>
          </div>
          <div className="card-body">
            {stats?.recentCandidates?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {stats.recentCandidates.map((c) => (
                  <Link to={`/coordinator/candidates/${c.id}`} key={c.id} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{ padding: "10px", background: "var(--bg)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                        <div className="text-muted text-sm">{c.email}</div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 24 }}>
                <div className="empty-icon">👤</div>
                <div className="empty-desc">No candidates yet</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
