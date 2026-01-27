export const SEMESTERS = [
{ value: 'first', label: 'First Semester' },
  { value: 'second', label: 'Second Semester' },
  { value: 'summer', label: 'Summer Semester' },
  { value: 'unknown', label: 'Unknown' },
];

export const EXAM_TYPES = [
  { value: 'midterm', label: 'Midterm Exam' },
  { value: 'final', label: 'Final Exam' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'test', label: 'Test' },
  { value: 'other', label: 'Other' },
];

export const CURRENT_YEAR = new Date().getFullYear();

export const YEARS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - i);

export const FILE_TYPES = {
  pdf: 'application/pdf',
  image: 'image/jpeg,image/png,image/jpg',
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ITEMS_PER_PAGE = 12;

export const DEBOUNCE_DELAY = 300;
