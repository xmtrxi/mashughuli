interface ApiError {
  statusCode: number;
  statusMessage?: string;
  message?: string;
  data?: unknown;
  cause?: unknown;
}
interface ApiResponse<T> {
  success: boolean;
  data: T;
  token?: string;
}
