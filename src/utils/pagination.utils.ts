import { Request, Response } from 'express';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class PaginationUtils {
  /**
   * Získá pagination parametry z requestu
   */
  static getPaginationOptions(req: Request): PaginationOptions {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Vytvoří paginated response
   */
  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    options: PaginationOptions
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / options.limit);
    const hasNext = options.page < totalPages;
    const hasPrev = options.page > 1;

    return {
      data,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    };
  }

  /**
   * Nastaví pagination hlavičky
   */
  static setPaginationHeaders(res: Response, total: number, options: PaginationOptions): void {
    const totalPages = Math.ceil(total / options.limit);
    
    res.setHeader('X-Total-Count', total.toString());
    res.setHeader('X-Total-Pages', totalPages.toString());
    res.setHeader('X-Current-Page', options.page.toString());
    res.setHeader('X-Per-Page', options.limit.toString());
  }
} 