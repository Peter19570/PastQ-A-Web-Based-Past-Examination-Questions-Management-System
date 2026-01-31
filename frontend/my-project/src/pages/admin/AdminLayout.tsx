import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";

export const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
      path: "/admin",
    },
    {
      title: "Past Questions",
      path: "/admin/questions",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      title: "Courses",
      icon: <BookOpen className="w-4 h-4" />,
      path: "/admin/courses",
    },
    {
      title: "Users",
      icon: <Users className="w-4 h-4" />,
      path: "/admin/users",
    },
    {
      title: "Moderation",
      icon: <CheckCircle className="w-4 h-4" />,
      path: "/admin/moderation",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a]">
      {/* ADMIN SUB-HEADER */}
      <div className="sticky top-[64px] z-40 w-full bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Admin Label - Hidden on extra small screens to save space */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-black uppercase tracking-tighter dark:text-white">
                Admin Panel
              </span>
            </div>

            {/* Horizontal Tabs - Now Scrollable */}
            <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 scroll-smooth">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                        : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area - Always Centered */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>

      {/* Centered Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-200 dark:border-slate-800 text-center">
        <p className="text-xs text-gray-400 dark:text-slate-500 font-medium italic">
          System managed by Admin Control Unit • 2026
        </p>
      </footer>
    </div>
  );
};
