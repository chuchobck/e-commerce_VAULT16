// Respuesta exitosa del backend
export interface ApiResponse<T> {
  success: true
  data: T
  meta?: PaginationMeta
}

// Respuesta de error del backend
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

// Meta de paginación (listados)
export interface PaginationMeta {
  page:       number
  pageSize:   number
  total:      number
  totalPages: number
}

// Tipo helper para el error axios
export interface ApiError {
  response?: {
    data: ApiErrorResponse
    status: number
  }
  message: string
}
