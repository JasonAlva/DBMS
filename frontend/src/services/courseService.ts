import { apiClient } from "./api";

export interface Course {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  departmentId: string;
  semester: number;
  description?: string;
  syllabus?: string;
  maxStudents?: number;
  isActive: boolean;
  teacherId?: string;
  createdAt: string;
  updatedAt: string;
}

export const courseService = {
  async getAll(): Promise<Course[]> {
    return apiClient.get("/courses");
  },

  async getById(id: string): Promise<Course> {
    return apiClient.get(`/courses/${id}`);
  },

  async create(data: Partial<Course>): Promise<Course> {
    return apiClient.post("/courses", data);
  },

  async update(id: string, data: Partial<Course>): Promise<Course> {
    return apiClient.put(`/courses/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/courses/${id}`);
  },
};
