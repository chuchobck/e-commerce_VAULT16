import { Request } from 'express';
import { Paginated, PaginatedMeta } from '../types/api.types';

export interface PageParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePageParams(req: Request): PageParams {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  { page, limit }: PageParams,
): Paginated<T> {
  const meta: PaginatedMeta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
  return { items, meta };
}
