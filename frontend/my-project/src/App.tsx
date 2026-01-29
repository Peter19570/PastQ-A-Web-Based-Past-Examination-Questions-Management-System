import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/Common/Toast";
import { Layout } from "./components/Layout/Layout";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";

// Public Pages
import { Landing } from "./pages/public/Landing";
import { Login } from "./pages/public/Login";
import { Register } from "./pages/public/Register";
import { Courses } from "./pages/public/Courses";
import { CourseDetail } from "./pages/public/CourseDetail";
import { PastQuestions } from "./pages/public/PastQuestions";
import { PastQuestionDetail } from "./pages/public/PastQuestionDetail";
import { ForgotPassword } from "./pages/public/ForgotPassword";
import { ResetPasswordConfirm } from "./pages/public/ResetPasswordConfirm";

// Protected Pages
import { Dashboard } from "./pages/protected/Dashboard";
import { Upload } from "./pages/protected/Upload";
import { MyUploads } from "./pages/protected/MyUploads";
import { Profile } from "./pages/protected/Profile";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminRoute } from "./components/Auth/AdminRoute";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminCourses } from "./pages/admin/AdminCourses";
import { AdminModeration } from "./pages/admin/AdminModeration";
import { AdminUsers } from "./pages/admin/AdminUsers";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Layout>
            <Routes>
              {/* --- PUBLIC ROUTES --- */}
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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:id"
                element={<ResetPasswordConfirm />}
              />

              {/* --- STUDENT PROTECTED ROUTES --- */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/my-uploads" element={<MyUploads />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* --- ADMIN PROTECTED ROUTES --- */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="courses" element={<AdminCourses />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="moderation" element={<AdminModeration />} />
                </Route>
              </Route>
            </Routes>
          </Layout>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
