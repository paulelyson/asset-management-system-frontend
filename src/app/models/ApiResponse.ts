export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  /**
   * Endpoint-specific extras that are neither the payload nor pagination —
   * currently only the equipment list's `pendingApprovalCount`. Optional
   * because most endpoints don't send it.
   */
  meta?: Record<string, unknown>;
}