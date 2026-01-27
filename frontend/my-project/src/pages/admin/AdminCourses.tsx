import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { coursesService } from "../../services/courses";
import { toast } from "react-hot-toast";

export const AdminCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. This runs as soon as the page opens
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await coursesService.getAll();
        if (data && data.results) {
          setCourses(data.results);
        } else if (Array.isArray(data)) {
          setCourses(data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // 3. This is what actually shows up on the screen
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white text-gray-900">
          Course Management
        </h1>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md">
          <Plus className="w-5 h-5" /> Add New Course
        </button>
      </div>

      {/* The Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-gray-500 italic">
            Loading courses...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-wider">
                  Faculty
                </th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {/* 4. We "map" over the array to create one row for every course */}
              {courses.map((course: any) => (
                <tr
                  key={course.id || course.code}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="p-4 font-bold text-blue-600">{course.code}</td>
                  <td className="p-4 text-gray-700 dark:text-gray-200 font-medium">
                    {course.title}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {course.faculty_display || "N/A"}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      {/* Placeholder for Edit */}
                      <button className="text-gray-400 hover:text-blue-500 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      {/* Placeholder for Delete */}
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 5. Show this if there are no courses */}
        {!loading && courses.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            No courses found in the database.
          </div>
        )}
      </div>
    </div>
  );
};
