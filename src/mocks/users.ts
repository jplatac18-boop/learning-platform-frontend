// src/mocks/users.ts
import type { User } from "../types/auth";

export const usersSeed: User[] = [
  {
    id: 1,
    username: "alice",
    email: "alice@example.com",
    role: "student",
  },
  {
    id: 2,
    username: "bob",
    email: "bob@example.com",
    role: "instructor",
  },
  {
    id: 3,
    username: "admin",
    email: "admin@example.com",
    role: "admin",
  },
];
