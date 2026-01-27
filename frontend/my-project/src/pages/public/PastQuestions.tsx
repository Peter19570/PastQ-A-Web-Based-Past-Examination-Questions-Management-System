import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import {
  pastQuestionsService,
  PastQuestion,
} from "../../services/pastQuestions";
import { PastQuestionCard } from "../../components/PastQuestions/PastQuestionCard";
import { Pagination } from "../../components/Common/Pagination";
import { SkeletonCard } from "../../components/Common/Loader";
import { useDebounce } from "../../hooks/useDebounce";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Common/Toast";
import { Input } from "../../components/Common/Input";
import { SEMESTERS, YEARS } from "../../utils/constants";

export const PastQuestions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pastQuestions, setPastQuestions] = useState<PastQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedYear, setSelectedYear] = useState(
    searchParams.get("year") || "",
  );
  const [selectedSemester, setSelectedSemester] = useState(
    searchParams.get("semester") || "",
  );
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchPastQuestions = async () => {
      setLoading(true);
      try {
        const params: {
          search?: string;
          year?: number;
          semester?: string;
          page?: number;
        } = {
          page: currentPage,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedYear) params.year = parseInt(selectedYear);
        if (selectedSemester) params.semester = selectedSemester;

        const data = await pastQuestionsService.getAll(params);
        setPastQuestions(data.results || data);
        setTotalPages(data.count ? Math.ceil(data.count / 12) : 1);
      } catch (error) {
        console.error("Failed to fetch past questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPastQuestions();
  }, [currentPage, debouncedSearch, selectedYear, selectedSemester]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    updateSearchParams({ search: value });
  };

  const updateSearchParams = (updates: Record<string, string>) => {
    const params: Record<string, string> = {};
    if (updates.search || searchQuery)
      params.search = updates.search || searchQuery;
    if (updates.year || selectedYear)
      params.year = updates.year || selectedYear;
    if (updates.semester || selectedSemester)
      params.semester = updates.semester || selectedSemester;
    setSearchParams(params);
  };

  const handleDownload = (id: number) => {
    if (!isAuthenticated) {
      showToast("info", "Please login to download past questions");
      navigate("/login");
      return;
    }
    navigate(`/past-questions/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Past Questions
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Browse and download past exam questions
        </p>

        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search past questions..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
                    updateSearchParams({ year: e.target.value });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="">All Years</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => {
                    setSelectedSemester(e.target.value);
                    setCurrentPage(1);
                    updateSearchParams({ semester: e.target.value });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="">All Semesters</option>
                  {SEMESTERS.map((sem) => (
                    <option key={sem.value} value={sem.value}>
                      {sem.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : pastQuestions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastQuestions.map((pq) => (
              <PastQuestionCard
                key={pq.id}
                pastQuestion={pq}
                onDownload={handleDownload}
              />
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
            {searchQuery
              ? "No past questions found matching your search."
              : "No past questions available."}
          </p>
        </div>
      )}
    </div>
  );
};
