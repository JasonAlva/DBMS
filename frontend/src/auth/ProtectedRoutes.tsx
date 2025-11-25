import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoutes({
  children,
  allowed,
}: {
  children: React.ReactNode;
  allowed: string[];
}) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;
  // Normalize allowed roles to uppercase to compare reliably with user.role
  const allowedUpper = (allowed || []).map((r) => r.toString().toUpperCase());
  if (
    allowed &&
    allowed.length > 0 &&
    !allowedUpper.includes(user.role.toUpperCase())
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
