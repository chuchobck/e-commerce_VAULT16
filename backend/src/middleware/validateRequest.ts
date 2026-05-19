import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const parsed = schemas.body.safeParse(req.body);
        if (!parsed.success) throw parsed.error;
        req.body = parsed.data as any;
      }

      if (schemas.query) {
        const parsed = schemas.query.safeParse(req.query);
        if (!parsed.success) throw parsed.error;
        req.query = parsed.data as any;
      }

      if (schemas.params) {
        const parsed = schemas.params.safeParse(req.params);
        if (!parsed.success) throw parsed.error;
        req.params = parsed.data as any;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
