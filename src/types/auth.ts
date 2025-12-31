export type Role = "student" | "instructor" | "admin";

export interface AuthTokens {
  access: string;
  refresh: string;
}

/**
 * Ajusta este tipo a lo que realmente te devuelve el endpoint /api/users/me/
 * (SimpleJWT por defecto NO devuelve usuario; normalmente haces un endpoint "me").
 */
export interface AuthUser {
  id: number;
  username: string;
  role: Role;

  // opcionales útiles (según tu backend)
  is_staff?: boolean;
  student_enabled?: boolean;
  instructor_enabled?: boolean;
}
