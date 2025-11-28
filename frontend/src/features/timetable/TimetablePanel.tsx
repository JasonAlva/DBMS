import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TimeTableEntry {
  id?: string;
  userId?: string;
  courseName: string;
  courseCode: string;
  instructor: string;
  dayOfWeek: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  room: string;
  type: string;
}

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

function timeToMinutes(t?: string | number | null) {
  if (t == null) return 0;
  // If already a number assume minutes
  if (typeof t === "number") return Math.floor(t);
  const s = String(t).trim();
  if (s.includes(":")) {
    const [h, m] = s.split(":").map((x) => parseInt(x, 10) || 0);
    return h * 60 + m;
  }
  // Try parsing as ISO datetime
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) return dt.getHours() * 60 + dt.getMinutes();
  // Fallback: parse as an integer (minutes)
  const asInt = parseInt(s, 10);
  return isNaN(asInt) ? 0 : asInt;
}

function minutesToTime(m: number) {
  const hh = Math.floor(m / 60)
    .toString()
    .padStart(2, "0");
  const mm = (m % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function TimetablePanel({ role }: { role?: string }) {
  const [entries, setEntries] = useState<TimeTableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<TimeTableEntry>>({
    courseName: "",
    courseCode: "",
    instructor: "",
    dayOfWeek: "MONDAY",
    startTime: "",
    endTime: "",
    room: "",
    type: "LECTURE",
  });

  const fetchTimetable = async () => {
    const token = localStorage.getItem("token") || "";
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/timetable", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const addEntry = async () => {
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch("http://localhost:8000/api/timetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({
          ...form,
          courseName: "",
          courseCode: "",
          instructor: "",
          startTime: "",
          endTime: "",
          room: "",
          type: "LECTURE",
        });
        fetchTimetable();
      } else {
        const t = await res.text();
        alert("Failed to add entry: " + t);
      }
    } catch (err) {
      alert("Failed to add entry");
    }
  };

  const deleteEntry = async (id?: string) => {
    if (!id) return alert("Invalid id");
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch(`http://localhost:8000/api/timetable/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchTimetable();
      else alert("Failed to delete");
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // derive time points and slots from entries (fall back to 08:00-18:00 hourly)
  const { timePoints, timeSlots } = useMemo(() => {
    if (!entries || entries.length === 0) {
      const points = [] as number[];
      for (let t = 8 * 60; t <= 18 * 60; t += 60) points.push(t);
      return {
        timePoints: points.map(minutesToTime),
        timeSlots: points
          .slice(0, -1)
          .map((s, i) => ({ start: s, end: minutesToTime(points[i + 1]) })),
      };
    }

    const pts = new Set<number>();
    entries.forEach((e) => {
      if (e.startTime) pts.add(timeToMinutes(e.startTime));
      if (e.endTime) pts.add(timeToMinutes(e.endTime));
    });
    const sorted = Array.from(pts).sort((a, b) => a - b);
    // if single point, expand to one hour slot
    if (sorted.length === 1) sorted.push(sorted[0] + 60);
    // ensure at least hourly coverage between min and max
    if (sorted.length === 0) {
      for (let t = 8 * 60; t <= 18 * 60; t += 60) sorted.push(t);
    }
    const timePoints = sorted.map(minutesToTime);
    const timeSlots = sorted.slice(0, -1).map((s, i) => ({
      start: minutesToTime(s),
      end: minutesToTime(sorted[i + 1]),
    }));
    return { timePoints, timeSlots };
  }, [entries]);

  // helper to find entries overlapping a slot on a day
  const findEntriesForCell = (
    day: string,
    slotStart: string | number,
    slotEnd: string | number
  ) => {
    const sMin = timeToMinutes(slotStart);
    const eMin = timeToMinutes(slotEnd);
    return entries.filter(
      (en) =>
        en.dayOfWeek === day &&
        timeToMinutes(en.startTime) < eMin &&
        timeToMinutes(en.endTime) > sMin
    );
  };

  const isAdmin = (role || "").toLowerCase() === "admin";

  return (
    <Card className="w-full h-screen ">
      <CardHeader>
        <CardTitle>My Timetable</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <div className="flex flex-col h-full space-y-4 border-4">
          <div
            className={
              isAdmin
                ? "grid grid-rows-1 md:grid-rows-2 gap-4"
                : "grid grid-rows-1 gap-4 "
            }
          >
            <div className="space-y-2">
              {isAdmin ? (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Course Name"
                    value={form.courseName || ""}
                    onChange={(e) =>
                      setForm({ ...form, courseName: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Course Code"
                    value={form.courseCode || ""}
                    onChange={(e) =>
                      setForm({ ...form, courseCode: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Instructor"
                    value={form.instructor || ""}
                    onChange={(e) =>
                      setForm({ ...form, instructor: e.target.value })
                    }
                  />
                  <select
                    className="p-2 border rounded"
                    value={form.dayOfWeek}
                    onChange={(e) =>
                      setForm({ ...form, dayOfWeek: e.target.value })
                    }
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="time"
                    value={form.startTime || ""}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                  />
                  <Input
                    type="time"
                    value={form.endTime || ""}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Room"
                    value={form.room || ""}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                  />
                  <select
                    className="p-2 border rounded"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="LECTURE">Lecture</option>
                    <option value="LAB">Lab</option>
                    <option value="TUTORIAL">Tutorial</option>
                  </select>
                </div>
              ) : (
                <div className="p-2 text-sm text-gray-600">
                  Timetable view (read-only)
                </div>
              )}
              <div>
                {isAdmin && <Button onClick={addEntry}>Add Entry</Button>}
              </div>
            </div>

            <div className="overflow-auto h-full">
              <div className="inline-block min-w-full">
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `120px repeat(${timeSlots.length}, minmax(120px, 1fr))`,
                  }}
                >
                  <div className="border p-2 bg-gray-50 font-medium">
                    Day / Time
                  </div>
                  {timeSlots.map((ts, i) => (
                    <div
                      key={i}
                      className="border p-2 text-sm text-center bg-gray-100"
                    >
                      {ts.start} - {ts.end}
                    </div>
                  ))}

                  {DAYS.map((day) => (
                    <React.Fragment key={day}>
                      <div className="border p-2 font-semibold bg-white">
                        {day}
                      </div>
                      {timeSlots.map((ts, i) => {
                        const cellEntries = findEntriesForCell(
                          day,
                          ts.start,
                          ts.end
                        );
                        return (
                          <div
                            key={`${day}-${i}`}
                            className="border p-2 min-h-[64px] bg-white"
                          >
                            {cellEntries.length === 0 ? (
                              <div className="text-xs text-gray-400">
                                &nbsp;
                              </div>
                            ) : (
                              cellEntries.map((ce) => (
                                <div
                                  key={ce.id}
                                  className="mb-1 p-1 rounded bg-sky-50 border"
                                >
                                  <div className="text-sm font-medium">
                                    {ce.courseName}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {ce.courseCode} • {ce.room}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {ce.startTime} - {ce.endTime}
                                  </div>
                                  <div className="mt-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteEntry(ce.id)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
