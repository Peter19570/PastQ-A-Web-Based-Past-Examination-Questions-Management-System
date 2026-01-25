import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { coursesService, Course } from '../../services/courses';
import { CourseCard } from '../../components/Courses/CourseCard';
import { Pagination } from '../../components/Common/Pagination';
import { SkeletonCard } from '../../components/Common/Loader';
import { useDebounce } from '../../hooks/useDebounce';
import { Input } from '../../components/Common/Input';

export const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const params: { search?: string; page?: number } = {
          page: currentPage,
        };
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }
        const data = await coursesService.getAll(params);
        setCourses(data.results || data);
        setTotalPages(data.count ? Math.ceil(data.count / 12) : 1);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, debouncedSearch]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Browse Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Explore all available courses and their past questions
        </p>

        <div className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search courses by name or code..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.code} course={course} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No courses found matching your search.' : 'No courses available.'}
          </p>
        </div>
      )}
    </div>
  );
};
