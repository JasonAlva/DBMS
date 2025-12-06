import { apiClient } from "./api";

export interface Teacher {
  id: string;
  userId: string;
  teacherId: string;
  department: string;
  designation: string;
  specialization?: string;
  phoneNumber?: string;
  officeRoom?: string;
  officeHours?: string;
  joiningDate?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const teacherService = {
  async getAll(skip = 0, limit = 100): Promise<Teacher[]> {
    return apiClient.get(`/teachers?skip=${skip}&limit=${limit}`);
  },

  async getById(id: string): Promise<Teacher> {
    return apiClient.get(`/teachers/${id}`);
  },

  async create(data: Partial<Teacher>): Promise<Teacher> {
    return apiClient.post("/teachers", data);
  },

  async update(id: string, data: Partial<Teacher>): Promise<Teacher> {
    return apiClient.put(`/teachers/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/teachers/${id}`);
  },
};
