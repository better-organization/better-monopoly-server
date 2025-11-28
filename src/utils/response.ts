import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Success response helper
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    timestamp: new Date().toISOString(),
  };

  if (message) response.message = message;
  if (data) response.data = data;

  res.status(statusCode).json(response);
};

// Error response helper
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  details?: any
): void => {
  const response: ApiResponse = {
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      message,
    },
  };

  if (details) response.error!.details = details;

  res.status(statusCode).json(response);
};

// Pagination helper
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const sendPaginatedSuccess = <T>(
  res: Response,
  items: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): void => {
  const pages = Math.ceil(total / limit);

  const paginatedData: PaginatedResponse<T> = {
    items,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };

  sendSuccess(res, paginatedData, message);
};
