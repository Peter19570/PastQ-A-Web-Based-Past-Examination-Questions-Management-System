export const SEMESTERS = [
  { value: 'First', label: 'First Semester' },
  { value: 'Second', label: 'Second Semester' },
  { value: 'Summer', label: 'Summer' },
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
