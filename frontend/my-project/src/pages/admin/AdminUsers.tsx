import { useState, useEffect, useMemo } from "react";
import { Users, Trash2, Search, Power, PowerOff } from "lucide-react";
import { authService } from "../../services/auth";
import { useToast } from "../../components/Common/Toast";
import { PageLoader } from "../../components/Common/Loader";

export const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await authService.getAdminUsers();
      const results = Array.isArray(data) ? data : data.results;
      setUsers(results || []);
    } catch (error) {
      showToast("error", "Failed to retrieve community members.");
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: TOGGLE ACTIVE STATUS (Soft Delete Logic) ---
  const handleToggleActive = async (user: any) => {
    try {
      // In a soft-delete setup, you might use a PATCH request
      await authService.updateUserStatus(user.id, {
        is_active: !user.is_active,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u,
        ),
      );

      showToast(
        "success",
        `${user.username} is now ${!user.is_active ? "Active" : "Inactive"}`,
      );
    } catch (error) {
      showToast("error", "Failed to update user status.");
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (!window.confirm(`Permanently remove ${username}?`)) return;
    try {
      await authService.deleteUser(id);
      showToast("success", "User removed from system.");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      showToast("error", "Failed to delete user.");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const searchStr = searchQuery.toLowerCase();
      return (
        u.username?.toLowerCase().includes(searchStr) ||
        u.email?.toLowerCase().includes(searchStr) ||
        u.index_number?.includes(searchStr)
      );
    });
  }, [users, searchQuery]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
            <Users className="text-primary-600 w-6 h-6" /> User Management
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {filteredUsers.length} Members Managed
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-4">Identity</th>
                <th className="p-4">Index</th>
                <th className="p-4">Access</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredUsers.map((u: any) => (
                <tr
                  key={u.id}
                  className={`transition-colors ${!u.is_active ? "opacity-60 bg-slate-50/50 dark:bg-slate-900/20" : "hover:bg-slate-50/30"}`}
                >
                  <td className="p-4">
                    <p className="font-bold dark:text-white">{u.username}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {u.email}
                    </p>
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-400">
                    {u.index_number || "---"}
                  </td>
                  <td className="p-4">
                    {u.is_admin ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] font-black uppercase rounded">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 dark:bg-slate-900 text-[10px] font-black uppercase rounded">
                        Student
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                        u.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {u.is_active ? (
                        <Power className="w-3 h-3" />
                      ) : (
                        <PowerOff className="w-3 h-3" />
                      )}
                      {u.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(u.id, u.username)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
