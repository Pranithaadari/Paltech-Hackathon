import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

function RoleModal({ onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { title: "", description: "", department: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    setLoading(true);
    try {
      if (initial?.id) {
        const { data } = await api.put(`/roles/${initial.id}`, form);
        onSave(data, "updated");
      } else {
        const { data } = await api.post("/roles", form);
        onSave(data, "created");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{initial?.id ? "Edit Role" : "Create Role"}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input className="form-input" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Frontend Engineer" required />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" value={form.department || ""}
                onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Role description..." />
            </div>
            {initial?.id && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="open">Open</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const statusBadge = (s) => {
  const c = { open: "badge-green", closed: "badge-red", paused: "badge-yellow" };
  return <span className={`badge ${c[s] || "badge-gray"}`}>{s}</span>;
};

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");

  const load = () => api.get("/roles").then((r) => setRoles(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSave = (role, action) => {
    if (action === "created") setRoles((p) => [role, ...p]);
    else setRoles((p) => p.map((r) => (r.id === role.id ? role : r)));
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this role and all its data?")) return;
    await api.delete(`/roles/${id}`);
    setRoles((p) => p.filter((r) => r.id !== id));
  };

  const filtered = roles.filter(
    (r) => r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.department || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      {modal && <RoleModal onClose={() => setModal(null)} onSave={handleSave} initial={modal === "new" ? null : modal} />}
      <div className="page-header">
        <div>
          <div className="page-title">Roles</div>
          <div className="page-subtitle">{roles.length} total roles</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("new")}>+ New Role</button>
      </div>
      <div className="card">
        <div className="card-header">
          <input className="form-input search-input" placeholder="Search roles..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>
            <div className="empty-title">No roles yet</div>
            <div className="empty-desc">Create your first role to get started</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th><th>Department</th><th>Status</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/coordinator/roles/${r.id}`} style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                        {r.title}
                      </Link>
                    </td>
                    <td className="text-muted">{r.department || "—"}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td className="text-muted text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-xs btn-outline" onClick={() => setModal(r)}>Edit</button>
                        <button className="btn btn-xs btn-danger" onClick={() => handleDelete(r.id)}>Delete</button>
                      </div>
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
