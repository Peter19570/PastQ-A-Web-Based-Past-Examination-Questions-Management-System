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
import { PastQuestionDetail } from './pages/public/PastQuestionDetail'; // Adjust path as needed

import { Dashboard } from "./pages/protected/Dashboard";
import { Upload } from "./pages/protected/Upload";
import { MyUploads } from "./pages/protected/MyUploads";
import { Profile } from "./pages/protected/Profile";

import { AdminDashboard } from "./pages/admin/AdminDashboard";

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
                <Route path="/past-questions" element={<PastQuestions />} />
                <Route path="/past-questions/:id" element={<PastQuestionDetail />} />

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
