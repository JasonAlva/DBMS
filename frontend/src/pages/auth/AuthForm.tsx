import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/AuthContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

interface AuthFormData {
  email: string;
  password: string;
  name: string;
  role: string;
  // Student fields
  studentId: string;
  department: string;
  semester: number;
  batch: string;
  // Teacher fields
  teacherId: string;
  designation: string;
}

export default function AuthForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState<AuthFormData>({
    email: "",
    password: "",
    name: "",
    role: "",
    // Student fields
    studentId: "",
    department: "",
    semester: 1,
    batch: "",
    // Teacher fields
    teacherId: "",
    designation: "",
  });

  const handleAuth = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";

      // Prepare payload based on auth mode and role
      let payload: any = {
        email: authForm.email,
        password: authForm.password,
      };

      if (authMode === "register") {
        payload = {
          ...payload,
          name: authForm.name,
          role: authForm.role,
        };

        // Add role-specific fields
        if (authForm.role === "STUDENT") {
          payload.studentId = authForm.studentId;
          payload.department = authForm.department;
          payload.semester = authForm.semester;
          payload.batch = authForm.batch;
        } else if (authForm.role === "TEACHER") {
          payload.teacherId = authForm.teacherId;
          payload.department = authForm.department;
          payload.designation = authForm.designation;
        }
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Authentication failed");
      }

      const data = await response.json();

      login(data); // store token & user globally
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Authentication failed", {
        description:
          error instanceof Error
            ? error.message
            : "Please check your credentials and try again",
      });
    }
  };

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      {authMode === "register" && (
        <Input
          placeholder="Full Name"
          value={authForm.name}
          onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
          required
        />
      )}

      {authMode === "register" && (
        <div>
          <label className="block text-sm text-gray-600 mb-1">Role</label>
          <Select
            value={authForm.role}
            onValueChange={(val) => setAuthForm({ ...authForm, role: val })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Role</SelectLabel>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Student-specific fields */}
      {authMode === "register" && authForm.role === "STUDENT" && (
        <>
          <Input
            placeholder="Student ID"
            value={authForm.studentId}
            onChange={(e) =>
              setAuthForm({ ...authForm, studentId: e.target.value })
            }
            required
          />
          <Input
            placeholder="Department"
            value={authForm.department}
            onChange={(e) =>
              setAuthForm({ ...authForm, department: e.target.value })
            }
            required
          />
          <Input
            type="number"
            placeholder="Semester"
            min="1"
            max="8"
            value={authForm.semester || ""}
            onChange={(e) =>
              setAuthForm({
                ...authForm,
                semester: parseInt(e.target.value) || 1,
              })
            }
            required
          />
          <Input
            placeholder="Batch (e.g., 2024)"
            value={authForm.batch}
            onChange={(e) =>
              setAuthForm({ ...authForm, batch: e.target.value })
            }
            required
          />
        </>
      )}

      {/* Teacher-specific fields */}
      {authMode === "register" && authForm.role === "TEACHER" && (
        <>
          <Input
            placeholder="Teacher ID"
            value={authForm.teacherId}
            onChange={(e) =>
              setAuthForm({ ...authForm, teacherId: e.target.value })
            }
            required
          />
          <Input
            placeholder="Department"
            value={authForm.department}
            onChange={(e) =>
              setAuthForm({ ...authForm, department: e.target.value })
            }
            required
          />
          <Input
            placeholder="Designation (e.g., Professor, Lecturer)"
            value={authForm.designation}
            onChange={(e) =>
              setAuthForm({ ...authForm, designation: e.target.value })
            }
            required
          />
        </>
      )}

      <Input
        type="email"
        placeholder="Email"
        value={authForm.email}
        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
        required
      />

      <Input
        type="password"
        placeholder="Password"
        value={authForm.password}
        onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
        required
      />

      <Button type="submit" className="w-full">
        {authMode === "login" ? "Login" : "Register"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
      >
        {authMode === "login"
          ? "Need an account? Register"
          : "Have an account? Login"}
      </Button>
    </form>
  );
}
