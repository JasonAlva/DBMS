import { apiClient } from "./api";

export interface Student {
  id: string;
  userId: string;
  studentId: string;
  department: string;
  semester: number;
  batch: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface StudentUpdate {
  department?: string;
  semester?: number;
  batch?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
}

export const studentService = {
  async getAll(skip = 0, limit = 100): Promise<Student[]> {
    return apiClient.get(`/students?skip=${skip}&limit=${limit}`);
  },

  async getById(id: string): Promise<Student> {
    return apiClient.get(`/students/${id}`);
  },

  async create(data: Partial<Student>): Promise<Student> {
    return apiClient.post("/students", data);
  },

  async update(id: string, data: StudentUpdate): Promise<Student> {
    return apiClient.put(`/students/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/students/${id}`);
  },
};
