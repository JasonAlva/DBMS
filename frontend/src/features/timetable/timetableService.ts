import type {
  TimeTableType,
  FullTimeTable,
  SubjectsDetailsList,
  Teacher,
  Subject,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const timetableService = {
  // Get all schedules
  async getSchedule(): Promise<FullTimeTable> {
    try {
      const schedules = await request("/schedules", { method: "GET" });
      // Transform backend schedule format to frontend format if needed
      return schedules || [];
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
      return [];
    }
  },

  // Create a new schedule
  async saveSchedule(
    semester: number,
    section: number,
    timetable: TimeTableType
  ): Promise<void> {
    // This would need to be implemented based on backend API
    // For now, creating individual schedule entries
    return request("/schedules", {
      method: "POST",
      body: JSON.stringify({ semester, section, timetable }),
    });
  },

  // Generate timetable automatically (placeholder - implement based on backend)
  async generateTimeTable(): Promise<FullTimeTable> {
    try {
      // This endpoint doesn't exist yet in backend
      // Return empty for now
      console.warn("Auto-generation not implemented in backend yet");
      return [];
    } catch (error) {
      console.error("Failed to generate timetable:", error);
      return [];
    }
  },

  // Get subjects/courses details list
  async getSubjectsDetailsList(): Promise<SubjectsDetailsList> {
    try {
      const courses = await request("/courses", { method: "GET" });
      // Transform courses to SubjectsDetailsList format
      const subjectsMap: SubjectsDetailsList = {};
      courses.forEach((course: any) => {
        subjectsMap[course.courseName || course.courseCode] = {
          subjectName: course.courseName,
          teacherName: course.teacher?.user?.name || "TBA",
          roomCodes: ["Room TBA"],
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        };
      });
      return subjectsMap;
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      return {};
    }
  },

  // Get teachers list
  async getTeachersList(): Promise<Teacher[]> {
    try {
      const teachers = await request("/teachers", { method: "GET" });
      return teachers.map((teacher: any) => ({
        id: teacher.id,
        name: teacher.user?.name || "Unknown",
        department: teacher.department,
        email: teacher.user?.email,
      }));
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      return [];
    }
  },

  // Get subjects list (same as courses)
  async getSubjectsList(): Promise<Subject[]> {
    try {
      const courses = await request("/courses", { method: "GET" });
      return courses.map((course: any) => ({
        id: course.id,
        name: course.courseName,
        code: course.courseCode,
        credits: course.credits,
      }));
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      return [];
    }
  },
};
