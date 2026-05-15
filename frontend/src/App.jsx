import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CoordinatorDashboard from "./pages/coordinator/Dashboard";
import RolesPage from "./pages/coordinator/RolesPage";
import RoleDetailPage from "./pages/coordinator/RoleDetailPage";
import CandidatesPage from "./pages/coordinator/CandidatesPage";
import CandidateDetailPage from "./pages/coordinator/CandidateDetailPage";
import ScheduleInterviewPage from "./pages/coordinator/ScheduleInterviewPage";
import InterviewerDashboard from "./pages/interviewer/Dashboard";
import MyInterviewsPage from "./pages/interviewer/MyInterviewsPage";
import FeedbackPage from "./pages/interviewer/FeedbackPage";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to={user.role === "coordinator" ? "/coordinator" : "/interviewer"} replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "coordinator" ? "/coordinator" : "/interviewer"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Coordinator routes */}
          <Route path="/coordinator" element={
            <ProtectedRoute allowedRoles={["coordinator"]}><Layout /></ProtectedRoute>
          }>
            <Route index element={<CoordinatorDashboard />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="roles/:id" element={<RoleDetailPage />} />
            <Route path="candidates" element={<CandidatesPage />} />
            <Route path="candidates/:id" element={<CandidateDetailPage />} />
            <Route path="schedule" element={<ScheduleInterviewPage />} />
          </Route>

          {/* Interviewer routes */}
          <Route path="/interviewer" element={
            <ProtectedRoute allowedRoles={["interviewer"]}><Layout /></ProtectedRoute>
          }>
            <Route index element={<InterviewerDashboard />} />
            <Route path="interviews" element={<MyInterviewsPage />} />
            <Route path="feedback/:interviewId" element={<FeedbackPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
