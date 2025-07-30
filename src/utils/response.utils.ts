import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export class ResponseUtils {
  /**
   * Úspěšná odpověď
   */
  static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    res.status(statusCode).json(response);
  }

  /**
   * Chybová odpověď
   */
  static error(res: Response, message: string, statusCode: number = 400, errors?: any[]): void {
    const response: ApiResponse = {
      success: false,
      message,
      errors
    };
    res.status(statusCode).json(response);
  }

  /**
   * Validační chyba
   */
  static validationError(res: Response, errors: any[]): void {
    this.error(res, 'Validation failed', 400, errors);
  }

  /**
   * Neautorizovaný přístup
   */
  static unauthorized(res: Response, message: string = 'Unauthorized access'): void {
    this.error(res, message, 401);
  }

  /**
   * Zakázaný přístup
   */
  static forbidden(res: Response, message: string = 'Access forbidden'): void {
    this.error(res, message, 403);
  }

  /**
   * Nenalezeno
   */
  static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, 404);
  }

  /**
   * Interní chyba serveru
   */
  static internalError(res: Response, message: string = 'Internal server error'): void {
    this.error(res, message, 500);
  }

  /**
   * Příliš mnoho požadavků
   */
  static tooManyRequests(res: Response, retryAfter?: number): void {
    const response: ApiResponse = {
      success: false,
      message: 'Too many requests, please try again later'
    };
    
    const headers: any = {};
    if (retryAfter) {
      headers['Retry-After'] = retryAfter;
    }
    
    res.status(429).json(response);
  }
} 