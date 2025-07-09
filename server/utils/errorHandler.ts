import type { H3Event } from 'h3'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
}

export class ApiError extends Error {
  statusCode: number
  
  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApiError'
  }
}

/**
 * Wraps an API handler with error handling
 */
export function withErrorHandler<T>(
  handler: (event: H3Event) => Promise<T>
) {
  return async (event: H3Event): Promise<ApiResponse<T>> => {
    try {
      const data = await handler(event)
      return {
        success: true,
        data,
      }
    } catch (error: any) {
      console.error('API Error:', error)
      
      // Handle known error types
      if (error instanceof ApiError) {
        setResponseStatus(event, error.statusCode)
        return {
          success: false,
          error: error.message,
          statusCode: error.statusCode,
        }
      }
      
      // Handle Prisma errors
      if (error?.code && error?.code.startsWith('P')) {
        setResponseStatus(event, 400)
        return {
          success: false,
          error: 'Database operation failed',
          message: error.message,
          statusCode: 400,
        }
      }
      
      // Handle validation errors
      if (error?.issues) {
        setResponseStatus(event, 400)
        return {
          success: false,
          error: 'Validation error',
          message: error.issues.map((issue: any) => issue.message).join(', '),
          statusCode: 400,
        }
      }
      
      // Handle JWT errors
      if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
        setResponseStatus(event, 401)
        return {
          success: false,
          error: 'Authentication failed',
          message: error.message,
          statusCode: 401,
        }
      }
      
      // Default error handling
      setResponseStatus(event, 500)
      return {
        success: false,
        error: 'Internal server error',
        message: error?.message || 'An unexpected error occurred',
        statusCode: 500,
      }
    }
  }
}

/**
 * Validates request body against a schema
 */
export async function validateBody<T>(event: H3Event, schema: any): Promise<T> {
  const body = await readBody(event)
  
  if (!body) {
    throw new ApiError('Request body is required', 400)
  }
  
  try {
    return schema.parse(body)
  } catch (error: any) {
    throw new ApiError(`Validation failed: ${error.issues?.map((i: any) => i.message).join(', ') || error.message}`, 400)
  }
}

/**
 * Validates query parameters against a schema
 */
export function validateQuery<T>(event: H3Event, schema: any): T {
  const query = getQuery(event)
  
  try {
    return schema.parse(query)
  } catch (error: any) {
    throw new ApiError(`Query validation failed: ${error.issues?.map((i: any) => i.message).join(', ') || error.message}`, 400)
  }
}

/**
 * Requires authentication and returns the user
 */
export async function requireAuth(event: H3Event) {
  try {
    const user = await useAuthUser(event)
    if (!user) {
      throw new ApiError('Authentication required', 401)
    }
    return user
  } catch (error) {
    throw new ApiError('Invalid or expired token', 401)
  }
}

/**
 * Checks if user has required permissions
 */
export function requirePermission(user: any, requiredRole: string) {
  if (!user) {
    throw new ApiError('Authentication required', 401)
  }
  
  if (user.primaryRole !== requiredRole && user.primaryRole !== 'ADMIN') {
    throw new ApiError('Insufficient permissions', 403)
  }
  
  return true
}
