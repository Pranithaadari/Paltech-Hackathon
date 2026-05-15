import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";

export default function RoleDetailPage() {
  const { id } = useParams();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roundForm, setRoundForm] = useState({ name: "", order: "", description: "" });
  const [areaForms, setAreaForms] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => api.get(`/roles/${id}`).then((r) => setRole(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const addRound = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/roles/${id}/rounds`, { ...roundForm, order: +roundForm.order });
      setRoundForm({ name: "", order: "", description: "" });
      setMsg("Round added!");
      await load();
    } catch (err) {
      setMsg(err.response?.data?.error || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const addEvalArea = async (roundId, e) => {
    e.preventDefault();
    const form = areaForms[roundId] || {};
    try {
      await api.post(`/roles/rounds/${roundId}/eval-areas`, form);
      setAreaForms((p) => ({ ...p, [roundId]: { name: "", description: "", maxScore: 10 } }));
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed");
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!role) return <div className="page"><div className="alert alert-error">Role not found</div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 4 }}>
            <Link to="/coordinator/roles" style={{ color: "var(--primary)", textDecoration: "none" }}>Roles</Link> / {role.title}
          </div>
          <div className="page-title">{role.title}</div>
          <div className="page-subtitle">{role.department} · <span className={`badge badge-${role.status === "open" ? "green" : "gray"}`}>{role.status}</span></div>
        </div>
        <Link to={`/coordinator/candidates?roleId=${id}`} className="btn btn-primary">View Candidates</Link>
      </div>

      {role.description && (
        <div className="card mb-4" style={{ marginBottom: 20 }}>
          <div className="card-body">{role.description}</div>
        </div>
      )}

      {/* Rounds */}
      <div className="card mb-4" style={{ marginBottom: 20 }}>
        <div className="card-header"><span className="card-title">Interview Rounds ({role.rounds?.length || 0})</span></div>
        <div className="card-body">
          {role.rounds?.map((round) => (
            <div key={round.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Round {round.order}: {round.name}</span>
                  {round.description && <div className="text-muted text-sm">{round.description}</div>}
                </div>
                <span className="badge badge-blue">{round.evalAreas?.length || 0} eval areas</span>
              </div>
              {round.evalAreas?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {round.evalAreas.map((a) => (
                    <span key={a.id} className="badge badge-purple">{a.name} (/{a.maxScore})</span>
                  ))}
                </div>
              )}
              {/* Add eval area */}
              <form onSubmit={(e) => addEvalArea(round.id, e)} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input className="form-input" style={{ flex: "1 1 140px" }} placeholder="Area name"
                  value={areaForms[round.id]?.name || ""}
                  onChange={(e) => setAreaForms((p) => ({ ...p, [round.id]: { ...p[round.id], name: e.target.value } }))} />
                <input className="form-input" style={{ width: 80 }} type="number" placeholder="Max" min="1" max="100"
                  value={areaForms[round.id]?.maxScore || 10}
                  onChange={(e) => setAreaForms((p) => ({ ...p, [round.id]: { ...p[round.id], maxScore: +e.target.value } }))} />
                <button className="btn btn-outline btn-sm" type="submit">+ Eval Area</button>
              </form>
            </div>
          ))}

          <div className="divider" />
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Add Round</div>
          {msg && <div className="alert alert-success" style={{ marginBottom: 10 }}>{msg}</div>}
          <form onSubmit={addRound} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input className="form-input" style={{ flex: "1 1 160px" }} placeholder="Round name *"
              value={roundForm.name} onChange={(e) => setRoundForm({ ...roundForm, name: e.target.value })} required />
            <input className="form-input" style={{ width: 80 }} type="number" placeholder="Order" min="1"
              value={roundForm.order} onChange={(e) => setRoundForm({ ...roundForm, order: e.target.value })} required />
            <input className="form-input" style={{ flex: "1 1 200px" }} placeholder="Description"
              value={roundForm.description} onChange={(e) => setRoundForm({ ...roundForm, description: e.target.value })} />
            <button className="btn btn-primary" type="submit" disabled={saving}>Add Round</button>
          </form>
        </div>
      </div>

      {/* Candidates */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Candidates ({role.candidates?.length || 0})</span>
          <Link to={`/coordinator/candidates?roleId=${id}`} className="btn btn-sm btn-outline">Manage</Link>
        </div>
        {role.candidates?.length ? (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
              <tbody>
                {role.candidates.map((c) => (
                  <tr key={c.id}>
                    <td><Link to={`/coordinator/candidates/${c.id}`} style={{ color: "var(--primary)", textDecoration: "none" }}>{c.name}</Link></td>
                    <td className="text-muted">{c.email}</td>
                    <td><span className="badge badge-blue">{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <div className="empty-desc">No candidates for this role yet</div>
          </div>
        )}
      </div>
    </div>
  );
}
