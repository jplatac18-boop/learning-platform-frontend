// src/mocks/courses.ts
import type { Course } from "../types/courses";

export const coursesSeed: Course[] = [
  {
    id: 101,
    title: "Introducción a React",
    description:
      "Aprende los fundamentos de React, componentes, props, estado y hooks básicos.",
    category: "Desarrollo web",
    level: "basico",
    duration: 180,
    imageUrl: "/images/courses/react-intro.png",
    status: "published",
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-05T12:00:00Z",
    instructor: {
      id: 2,
      userId: 2,
      username: "bob",
    },
  },
  {
    id: 102,
    title: "Spring Boot para APIs REST",
    description:
      "Crea APIs REST robustas con Spring Boot, validación, seguridad y documentación.",
    category: "Backend",
    level: "intermedio",
    duration: 240,
    imageUrl: "/images/courses/spring-boot-rest.png",
    status: "published",
    createdAt: "2025-01-02T09:00:00Z",
    updatedAt: "2025-01-06T16:30:00Z",
    instructor: {
      id: 2,
      userId: 2,
      username: "bob",
    },
  },
  {
    id: 103,
    title: "Testing end-to-end con Cypress",
    description:
      "Automatiza pruebas E2E para tus aplicaciones web usando Cypress.",
    category: "Testing",
    level: "avanzado",
    duration: 150,
    imageUrl: "/images/courses/cypress-e2e.png",
    status: "draft",
    createdAt: "2025-01-03T11:15:00Z",
    updatedAt: "2025-01-04T14:45:00Z",
    instructor: {
      id: 2,
      userId: 2,
      username: "bob",
    },
  },
];
