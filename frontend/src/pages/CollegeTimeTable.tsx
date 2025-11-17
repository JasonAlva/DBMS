import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const API_URL = "http://localhost:8000/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  entries?: TimeTable[];
}

interface TimeTable {
  id?: string;
  userId?: string;
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
  const [token, setToken] = useState<string>("");
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

  const fetchTimetable = async (authToken: string) => {
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

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
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
      if (error instanceof Error) {
        alert("Authentication failed: " + error.message);
      } else {
        alert("unknown error");
      }
    }
  };

  const addTimeTableEntry = async () => {
    try {
      const response = await fetch(`${API_URL}/timetable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      if (error instanceof Error) {
        alert("Failed to add entry: " + error.message);
      }
    }
  };

  const deleteEntry = async (id?: string) => {
    if (!id) {
      alert("Invalid entry id");
      return;
    }
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

    const userMessage: Message = { role: "user", content: inputQuery };
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
      const assistantMessage: Message = {
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
      <div className="min-h-screen from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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

  return (
    <div className="min-h-screen from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">
            College Query System
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid md:grid-cols-2 gap-4">
        {/* Timetable Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Timetable</CardTitle>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Class
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Timetable Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Input
                      placeholder="Course Name"
                      value={newEntry.courseName}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, courseName: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Course Code"
                      value={newEntry.courseCode}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, courseCode: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Instructor"
                      value={newEntry.instructor}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, instructor: e.target.value })
                      }
                    />
                    <select
                      className="w-full p-2 border rounded"
                      value={newEntry.dayOfWeek}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, dayOfWeek: e.target.value })
                      }
                    >
                      {daysOrder.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="time"
                        value={newEntry.startTime}
                        onChange={(e) =>
                          setNewEntry({
                            ...newEntry,
                            startTime: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="time"
                        value={newEntry.endTime}
                        onChange={(e) =>
                          setNewEntry({ ...newEntry, endTime: e.target.value })
                        }
                      />
                    </div>
                    <Input
                      placeholder="Room"
                      value={newEntry.room}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, room: e.target.value })
                      }
                    />
                    <select
                      className="w-full p-2 border rounded"
                      value={newEntry.type}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, type: e.target.value })
                      }
                    >
                      <option value="LECTURE">Lecture</option>
                      <option value="LAB">Lab</option>
                      <option value="TUTORIAL">Tutorial</option>
                    </select>
                    <Button onClick={addTimeTableEntry} className="w-full">
                      Add Entry
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {daysOrder.map((day) => {
                const dayEntries = groupedTimetable[day] || [];
                if (dayEntries.length === 0) return null;
                return (
                  <div key={day}>
                    <h3 className="font-semibold text-sm text-gray-600 mb-2">
                      {day}
                    </h3>
                    <div className="space-y-2">
                      {dayEntries.map((entry, i) => (
                        <div
                          key={entry.id ?? entry.userId ?? i}
                          className="bg-white p-3 rounded-lg border shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">
                                {entry.courseName}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {entry.courseCode}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {entry.startTime} - {entry.endTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {entry.room}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                <User className="w-3 h-3" />
                                {entry.instructor}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                deleteEntry(entry.id ?? entry.userId)
                              }
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {timetable.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No classes added yet. Click "Add Class" to start!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="flex flex-col h-[700px]">
          <CardHeader>
            <CardTitle>Ask About Your Schedule</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Ask me anything about your timetable!</p>
                  <p className="text-sm mt-2">
                    Try: "What classes do I have on Monday?"
                  </p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.entries && msg.entries.length > 0 && (
                      <div className="mt-2 space-y-1 text-xs opacity-90">
                        {msg.entries.map((entry, i) => (
                          <div key={i} className="bg-white/10 p-2 rounded">
                            <div>
                              {entry.courseName} - {entry.dayOfWeek}
                            </div>
                            <div>
                              {entry.startTime} - {entry.endTime} | {entry.room}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ask about your schedule..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleQuery()}
              />
              <Button onClick={handleQuery} disabled={isLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
