export interface ApiResponse<T> {
  data: T; 
  message: string;
  success: boolean;
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}