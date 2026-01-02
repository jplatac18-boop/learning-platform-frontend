export type Role = "student" | "instructor" | "admin";

export type User = {
  id: number;
  username: string;
  email: string;
  role: Role;
};

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthUser {
  id: number;
  username: string;
  role: Role;
  email: string;  
  // Flags opcionales según tu backend/Django
  isStaff?: boolean;
  studentEnabled?: boolean;
  instructorEnabled?: boolean;
}
