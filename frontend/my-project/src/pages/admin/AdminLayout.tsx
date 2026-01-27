import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CheckCircle,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; //

export const AdminLayout = () => {
  const { user, logout } = useAuth(); //
  const location = useLocation(); //

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/admin",
    },
    {
      title: "Courses",
      icon: <BookOpen className="w-5 h-5" />,
      path: "/admin/courses",
    }, //
    {
      title: "Users",
      icon: <Users className="w-5 h-5" />,
      path: "/admin/users",
    }, //
    {
      title: "Moderation",
      icon: <CheckCircle className="w-5 h-5" />,
      path: "/admin/moderation",
    }, //
  ];

  return (
    // We use a flex container to prevent overlapping
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f172a]">
      {/* Sidebar - Now 'sticky' instead of 'fixed' to allow normal page flow */}
      <aside className="sticky top-0 h-screen w-72 flex-shrink-0 bg-white dark:bg-[#1e293b] border-r border-gray-200 dark:border-slate-700 flex flex-col shadow-xl z-50">
        {/* Branding Area */}
        <div className="p-6">
          <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400 font-black text-xl uppercase tracking-widest">
            <ShieldCheck className="w-8 h-8" />
            <span>Admin</span>
          </div>
          <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
              Operator
            </p>
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 truncate">
              {user?.username}
            </p>
          </div>
        </div>

        {/* Navigation - Flex-grow makes this fill the space */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                    : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                <span
                  className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-primary-500"}`}
                >
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-tight">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Action Area - The logout button is now clearly boxed */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-700">
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out System
          </button>
        </div>
      </aside>

      {/* Main Content Area - This now stretches to fill the rest of the space */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-10">
          {/* Outlet renders the sub-pages */}
          <Outlet />
        </main>

        {/* Admin-Specific Footer: This will stay centered in the main content area */}
        <footer className="p-6 text-center border-t border-gray-200 dark:border-slate-800">
          <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
            System Managed by{" "}
            <span className="text-primary-500">Admin Control Unit</span> • 2026
          </p>
        </footer>
      </div>
    </div>
  );
};
