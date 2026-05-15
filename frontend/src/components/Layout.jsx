import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const coordinatorNav = [
  { label: "Dashboard", icon: "📊", to: "/coordinator" },
  { label: "Roles", icon: "💼", to: "/coordinator/roles" },
  { label: "Candidates", icon: "👤", to: "/coordinator/candidates" },
  { label: "Schedule Interview", icon: "📅", to: "/coordinator/schedule" },
];

const interviewerNav = [
  { label: "Dashboard", icon: "📊", to: "/interviewer" },
  { label: "My Interviews", icon: "🎤", to: "/interviewer/interviews" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === "coordinator" ? coordinatorNav : interviewerNav;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>🎯</span> HireFlow
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">{user?.role === "coordinator" ? "Coordinator" : "Interviewer"}</div>
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.split("/").length === 2}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="nav-link" onClick={handleLogout} style={{ color: "#ef4444" }}>
            <span className="nav-icon">🚪</span> Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
