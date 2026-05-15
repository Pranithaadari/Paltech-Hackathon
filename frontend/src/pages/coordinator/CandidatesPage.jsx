import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../utils/api";

function CandidateModal({ onClose, onSave, roles }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", roleId: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.roleId)
      return setError("Name, email, and role are required");
    setLoading(true);
    try {
      const { data } = await api.post("/candidates", { ...form, roleId: +form.roleId });
      onSave(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add Candidate</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-select" value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: e.target.value })} required>
                  <option value="">Select role...</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Add Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const statusBadge = (s) => {
  const c = { applied: "badge-gray", screening: "badge-yellow", in_progress: "badge-blue", hired: "badge-green", rejected: "badge-red", advanced: "badge-purple" };
  return <span className={`badge ${c[s] || "badge-gray"}`}>{s?.replace("_", " ")}</span>;
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchParams] = useSearchParams();
  const roleFilter = searchParams.get("roleId");

  useEffect(() => {
    Promise.all([api.get("/candidates"), api.get("/roles")])
      .then(([c, r]) => { setCandidates(c.data); setRoles(r.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (c) => { setCandidates((p) => [c, ...p]); setShowModal(false); };

  let filtered = candidates;
  if (roleFilter) filtered = filtered.filter((c) => c.roleId === +roleFilter);
  if (statusFilter) filtered = filtered.filter((c) => c.status === statusFilter);
  if (search) filtered = filtered.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      {showModal && <CandidateModal onClose={() => setShowModal(false)} onSave={handleSave} roles={roles} />}
      <div className="page-header">
        <div>
          <div className="page-title">Candidates</div>
          <div className="page-subtitle">{filtered.length} candidates</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Candidate</button>
      </div>
      <div className="card">
        <div className="card-header" style={{ gap: 8, flexWrap: "wrap" }}>
          <input className="form-input search-input" placeholder="Search by name or email..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="form-select" style={{ width: 160 }} value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {["applied","screening","in_progress","hired","rejected"].map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <div className="empty-title">No candidates found</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Added</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/coordinator/candidates/${c.id}`} style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>{c.name}</Link>
                    </td>
                    <td className="text-muted">{c.email}</td>
                    <td className="text-muted">{roles.find((r) => r.id === c.roleId)?.title || "—"}</td>
                    <td>{statusBadge(c.status)}</td>
                    <td className="text-muted text-sm">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/coordinator/candidates/${c.id}`} className="btn btn-xs btn-outline">View</Link>
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
