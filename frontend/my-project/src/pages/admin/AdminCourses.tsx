import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { coursesService } from "../../services/courses";
import { useToast } from "../../components/Common/Toast";
import { Button } from "../../components/Common/Button";
import { Modal } from "../../components/Common/Modal";
import { PageLoader } from "../../components/Common/Loader";
import { Pagination } from "../../components/Common/Pagination";

export const AdminCourses = () => {
  // --- STATE MANAGEMENT ---
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10; // Matches your Django 'page_size'

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    faculty: "science",
    department: "",
    level: "100",
    semester: "first",
    credit_hours: 3,
    description: "",
  });

  // --- ACTIONS ---

  useEffect(() => {
    fetchCourses();
  }, [currentPage]);

  const fetchCourses = async () => {
    try {
      const data = await coursesService.getAll();
      const results = Array.isArray(data) ? data : data.results;
      setCourses(results || []);
    } catch (error) {
      showToast("error", "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // When Edit is clicked, fill the form and open Modal
  const handleEditClick = (course: any) => {
    setEditingCode(course.code);
    setFormData({
      code: course.code,
      title: course.title,
      faculty: course.faculty,
      department: course.department,
      level: course.level,
      semester: course.semester,
      credit_hours: course.credit_hours,
      description: course.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (code: string) => {
    if (!window.confirm(`Delete course ${code}? This cannot be undone.`))
      return;

    try {
      await coursesService.delete(code);
      showToast("success", "Course deleted successfully");
      setCourses((prev) => prev.filter((c) => c.code !== code));
    } catch (error) {
      showToast("error", "Failed to delete course");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        code: formData.code.trim(),
        title: formData.title.trim(),
        credit_hours: Number(formData.credit_hours),
      };

      if (editingCode) {
        // Update existing
        await coursesService.update(editingCode, payload);
        showToast("success", "Course updated!");
      } else {
        // Create new
        await coursesService.create(payload);
        showToast("success", "Course added successfully!");
      }

      handleCloseModal();
      fetchCourses();
    } catch (error: any) {
      const serverErrors = error.response?.data;
      const msg = serverErrors
        ? Object.values(serverErrors)[0]
        : "Operation failed";
      showToast("error", `Backend: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCode(null);
    setFormData({
      code: "",
      title: "",
      faculty: "science",
      department: "",
      level: "100",
      semester: "first",
      credit_hours: 3,
      description: "",
    });
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
          Course Management
        </h1>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 bg-primary-600 text-white font-bold"
        >
          <Plus className="w-5 h-5" /> Add New Course
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="p-4">Code</th>
              <th className="p-4">Title</th>
              <th className="p-4">Faculty</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {courses.map((course) => (
              <tr
                key={course.code}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="p-4 font-black text-primary-600">
                  {course.code}
                </td>
                <td className="p-4 text-sm font-bold dark:text-slate-200">
                  {course.title}
                </td>
                <td className="p-4 text-xs text-slate-500 font-medium">
                  {course.faculty_display || course.faculty}
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(course)}
                      className="p-2 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.code)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCode ? "Edit Course" : "Create New Course"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Course Code
              </label>
              <input
                required
                disabled={!!editingCode} // Usually course codes shouldn't change
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500 text-sm dark:text-white disabled:opacity-50"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Title
              </label>
              <input
                required
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500 text-sm dark:text-white"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Faculty
              </label>
              <select
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm dark:text-white"
                value={formData.faculty}
                onChange={(e) =>
                  setFormData({ ...formData, faculty: e.target.value })
                }
              >
                <option value="science">Physical Sciences</option>
                <option value="engineering">Engineering & Technology</option>
                <option value="medicine">Health Sciences</option>
                <option value="arts">Arts & Humanities</option>
                <option value="business">Business & Law</option>
                <option value="agriculture">Agriculture</option>
                <option value="education">Education</option>
                <option value="social">Social Sciences</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Department
              </label>
              <input
                required
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500 text-sm dark:text-white"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Level
              </label>
              <select
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm dark:text-white"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
              >
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Semester
              </label>
              <select
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm dark:text-white"
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
              >
                <option value="first">First Semester</option>
                <option value="second">Second Semester</option>
                <option value="both">Both Semesters</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Credits
              </label>
              <input
                type="number"
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm dark:text-white"
                value={formData.credit_hours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credit_hours: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">
              Description
            </label>
            <textarea
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm dark:text-white"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              disabled={isSubmitting}
              type="submit"
              className="flex-1 bg-primary-600 text-white font-bold"
            >
              {isSubmitting
                ? "Processing..."
                : editingCode
                  ? "Update Course"
                  : "Save Course"}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={handleCloseModal}
              className="flex-1 font-bold"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
