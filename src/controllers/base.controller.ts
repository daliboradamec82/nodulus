import { Request, Response, NextFunction } from 'express';
import { ResponseUtils } from '../utils/response.utils';

export abstract class BaseController {
  protected responseUtils = ResponseUtils;

  /**
   * Zpracování chyb
   */
  protected handleError(error: any, res: Response, next: NextFunction): void {
    console.error('Controller error:', error);
    
    if (error.name === 'ValidationError') {
      this.responseUtils.validationError(res, [error.message]);
      return;
    }

    if (error.name === 'CastError') {
      this.responseUtils.error(res, 'Invalid ID format', 400);
      return;
    }

    if (error.code === 11000) {
      this.responseUtils.error(res, 'Duplicate entry', 409);
      return;
    }

    this.responseUtils.internalError(res);
  }

  /**
   * Async wrapper pro error handling
   */
  protected asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Validace ObjectId
   */
  protected validateObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * Sanitizace stringu
   */
  protected sanitizeString(str: string): string {
    return str
      .trim()
      .replace(/[<>]/g, '')
      .substring(0, 1000);
  }

  /**
   * Pagination helper
   */
  protected getPaginationOptions(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return {
      skip,
      limit,
      page
    };
  }

  /**
   * Sort helper
   */
  protected getSortOptions(sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    return sort;
  }

  /**
   * Filter helper
   */
  protected getFilterOptions(filters: any) {
    const filter: any = {};
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        if (typeof filters[key] === 'string') {
          filter[key] = { $regex: filters[key], $options: 'i' };
        } else {
          filter[key] = filters[key];
        }
      }
    });

    return filter;
  }
} 