import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/Common/Toast";
import { Layout } from "./components/Layout/Layout";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";

import { Landing } from "./pages/public/Landing";
import { Login } from "./pages/public/Login";
import { Register } from "./pages/public/Register";
import { Courses } from "./pages/public/Courses";
import { PastQuestions } from "./pages/public/PastQuestions";
import { PastQuestionDetail } from "./pages/public/PastQuestionDetail";

import { Dashboard } from "./pages/protected/Dashboard";
import { Upload } from "./pages/protected/Upload";
import { MyUploads } from "./pages/protected/MyUploads";
import { Profile } from "./pages/protected/Profile";
import { CourseDetail } from "./pages/public/CourseDetail";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminRoute } from "./components/Auth/AdminRoute";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminCourses } from "./pages/admin/AdminCourses";
import { AdminModeration } from "./pages/admin/AdminModeration";
import { AdminUsers } from "./pages/admin/AdminUsers";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:code" element={<CourseDetail />} />
                <Route path="/past-questions" element={<PastQuestions />} />
                <Route
                  path="/past-questions/:id"
                  element={<PastQuestionDetail />}
                />
                {/* Student Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes - uses your new AdminRoute gatekeeper */}
                <Route path="/admin" element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    {/* This "index" means it's the home page for /admin */}
                    <Route path="courses" element={<AdminCourses />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="moderation" element={<AdminModeration />} />
                  </Route>
                </Route>

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <Upload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-uploads"
                  element={
                    <ProtectedRoute>
                      <MyUploads />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Layout>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
