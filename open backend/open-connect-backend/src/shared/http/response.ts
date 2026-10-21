export function ok<T>(data: T) {
  return { success: true, data };
}

export function created<T>(data: T) {
  return { success: true, data };
}

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function paginated<T>(items: T[], pagination: Pagination) {
  return { success: true, data: { items, pagination } };
}
