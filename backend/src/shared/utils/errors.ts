export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Recurso no encontrado') {
    super(404, 'NOT_FOUND', message);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'No autorizado') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Acceso denegado') {
    super(403, 'FORBIDDEN', message);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflicto con el estado actual del recurso') {
    super(409, 'CONFLICT', message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Solicitud inválida') {
    super(400, 'BAD_REQUEST', message);
  }
}

export class UnprocessableError extends ApiError {
  constructor(message = 'No se puede procesar la entidad') {
    super(422, 'UNPROCESSABLE', message);
  }
}
