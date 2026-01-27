import { useState, useEffect } from "react";
import { Users, Trash2 } from "lucide-react";
import { authService } from "../../services/auth"; // You'll need an admin user service

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Hits: GET /users/admin/
    const fetchUsers = async () => {
      const data = await authService.getAdminUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
        <Users className="text-primary-600" /> User Management
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-black text-gray-400 uppercase">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map((u: any) => (
              <tr key={u.id}>
                <td className="p-4">
                  <p className="font-bold dark:text-white">{u.username}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </td>
                <td className="p-4">
                  {u.is_admin ? (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">
                      Admin
                    </span>
                  ) : u.is_moderator ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                      Moderator
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">
                      Student
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {/* Hits: DELETE /users/admin/{id}/ */}
                  <button className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
