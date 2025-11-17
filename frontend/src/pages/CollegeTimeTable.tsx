import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Send,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import type { S } from "node_modules/tailwindcss/dist/types-WlZgYgM8.d.mts";

const API_URL = "http://localhost:8000/api";

interface Message {
  role: string;
  content: string;
}

interface TimeTable {
  userId: string;
  courseName: string;
  courseCode: string;
  instructor: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  type: string;
}

interface User {
  id: string;
  email: string;

  role: string;
  name: string;
}

export default function CollegeTimetableApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [timetable, setTimetable] = useState<TimeTable[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Auth form states
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
  });

  // New entry form
  const [newEntry, setNewEntry] = useState({
    courseName: "",
    courseCode: "",
    instructor: "",
    dayOfWeek: "MONDAY",
    startTime: "",
    endTime: "",
    room: "",
    type: "LECTURE",
  });

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      fetchTimetable(savedToken);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });

      if (!response.ok) throw new Error("Authentication failed");

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      setIsLoggedIn(true);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      fetchTimetable(data.token);
    } catch (error) {
      alert("Authentication failed: " + error.message);
    }
  };

  const fetchTimetable = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/timetable`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      setTimetable(data);
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
    }
  };

  const addTimeTableEntry = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/timetable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newEntry),
      });
      if (!response.ok) throw new Error("Failed to add entry");

      fetchTimetable(token);
      setShowAddDialog(false);
      setNewEntry({
        courseName: "",
        courseCode: "",
        instructor: "",
        dayOfWeek: "MONDAY",
        startTime: "",
        endTime: "",
        room: "",
        type: "LECTURE",
      });
    } catch (error) {
      alert("Failed to add entry: " + error.message);
    }
  };

  const deleteEntry = async (id) => {
    try {
      await fetch(`${API_URL}/timetable/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTimetable(token);
    } catch (error) {
      alert("Failed to delete entry");
    }
  };

  const handleQuery = async () => {
    if (!inputQuery.trim()) return;

    const userMessage = { role: "user", content: inputQuery };
    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: inputQuery }),
      });
      if (!response.ok) throw new Error("Query failed");

      const data = await response.json();
      const assistantMessage = {
        role: "assistant",
        content: data.answer,
        entries: data.entries,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your query.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setToken("");
    setUser(null);
    setTimetable([]);
    setMessages([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              College Query System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === "register" && (
                <Input
                  placeholder="Full Name"
                  value={authForm.name}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, name: e.target.value })
                  }
                  required
                />
              )}
              <Input
                type="email"
                placeholder="Email"
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
                required
              />
              <Button type="submit" className="w-full">
                {authMode === "login" ? "Login" : "Register"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
              >
                {authMode === "login"
                  ? "Need an account? Register"
                  : "Have an account? Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysOrder = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  const groupedTimetable = timetable.reduce<Record<string, TimeTable[]>>(
    (acc, entry) => {
      if (!acc[entry.dayOfWeek]) acc[entry.dayOfWeek] = [];
      acc[entry.dayOfWeek].push(entry);
      return acc;
    },
    {}
  );
}
