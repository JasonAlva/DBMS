import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "@/auth/AuthContext";
import ProtectedRoute from "@/auth/ProtectedRoutes";

import AuthForm from "@/pages/auth/AuthForm";

import StudentDashboard from "@/pages/dashboard/student";
import TeacherDashboard from "@/pages/dashboard/teacher";
import AdminDashboard from "@/pages/dashboard/admin";

import ChatPage from "@/features/chat/ChatPage";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// ----------------------
// Login Page
// ----------------------
function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
}

// ----------------------
// Role-Based Dashboard Redirect
// ----------------------
function RoleDashboard() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.toLowerCase();

  if (role === "student") return <Navigate to="/dashboard/student" replace />;
  if (role === "teacher" )
    return <Navigate to="/dashboard/teacher" replace />;
  if (role === "admin") return <Navigate to="/dashboard/admin" replace />;

  return <Navigate to="/login" replace />;
}

// ----------------------
// APP
// ----------------------
export default function App() {
  return ( 
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Default redirect */}
      <Route path="/" element={<RoleDashboard />} />

      {/* Dashboards */}
      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute allowed={["student"]}>
            <DashboardLayout role="student">
              <StudentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/teacher"
        element={
          <ProtectedRoute allowed={["teacher", "instructor"]}>
            <DashboardLayout role="teacher">
              <TeacherDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowed={["admin"]}>
            <DashboardLayout role="admin">
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Chat */}
      <Route
        path="/dashboard/chat"
        element={
          <ProtectedRoute
            allowed={["student", "teacher", "instructor", "admin"]}
          >
            <DashboardLayout role="common">
              <ChatPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
