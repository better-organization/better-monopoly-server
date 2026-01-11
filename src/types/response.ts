// Common response type for all API endpoints

export interface ResponseType<T> {
  success: boolean;
  data: T;
}
