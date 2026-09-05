import { Response } from 'express';

export function sendSuccess(res: Response, data: any = {}, message = 'Operation successful', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

export function sendError(res: Response, code: string, message: string, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}
