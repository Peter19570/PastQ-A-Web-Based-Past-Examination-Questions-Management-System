import { Link, useNavigate } from "react-router-dom";
import {
  Moon,
  Sun,
  LogIn,
  LogOut,
  User,
  BookOpen,
  Upload,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../Common/Button";

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                PastQ
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/courses"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Courses
              </Link>
              <Link
                to="/past-questions"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Past Questions
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/upload")}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/admin")}
                  >
                    Admin
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  {user?.first_name || "Profile"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate("/register")}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/courses"
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </Link>
            <Link
              to="/past-questions"
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Past Questions
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/upload"
                  className="block py-2 text-gray-700 dark:text-gray-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Upload
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block py-2 text-gray-700 dark:text-gray-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="block py-2 text-gray-700 dark:text-gray-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-gray-700 dark:text-gray-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-gray-700 dark:text-gray-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-2 text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="w-full text-left py-2 text-gray-700 dark:text-gray-300"
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
