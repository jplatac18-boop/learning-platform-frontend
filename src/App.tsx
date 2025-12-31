import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { RequireAuth } from "./components/RequireAuth";

import { PublicLayout } from "./layouts/PublicLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";

import { LandingPage } from "./pages/LandingPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MyCoursesPage } from "./pages/MyCoursesPage";
import { InstructorCoursesPage } from "./pages/InstructorCoursesPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { InstructorCourseEditorPage } from "./pages/InstructorCourseEditorPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        {/* Panel de estudiante (permitimos también instructor/admin si quieres que vean "Mis cursos") */}
        <Route element={<RequireAuth allowedRoles={["student", "instructor", "admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/my-courses" element={<MyCoursesPage />} />
          </Route>
        </Route>

        {/* Panel de instructor (admin también puede entrar si lo deseas) */}
        <Route element={<RequireAuth allowedRoles={["instructor", "admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
            <Route path="/instructor/courses/:id/edit" element={<InstructorCourseEditorPage />} />
          </Route>
        </Route>

        {/* Panel de admin */}
        <Route element={<RequireAuth allowedRoles={["admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
