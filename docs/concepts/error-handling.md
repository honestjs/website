# Error Handling in HonestJS

HonestJS provides a comprehensive error handling system that allows you to catch, process, and respond to errors in a consistent and organized way.

## Overview

The error handling system in HonestJS consists of several components:

-   **Exception Filters**: Classes that catch and handle specific types of exceptions
-   **Global Error Handlers**: Application-wide error handling configuration
-   **HTTP Exceptions**: Built-in exception types for HTTP-specific errors
-   **Error Response Formatting**: Standardized error response structure

## Exception Filters

Exception filters are the primary way to handle errors in HonestJS. They catch exceptions thrown during request processing and can return custom responses.

### Creating Exception Filters

```typescript
import type { IFilter } from 'honestjs'
import type { Context } from 'hono'

export class HttpExceptionFilter implements IFilter {
	async catch(exception: Error, context: Context) {
		console.error('HTTP Exception:', exception)

		return context.json(
			{
				status: 500,
				message: 'Internal Server Error',
				timestamp: new Date().toISOString(),
				path: context.req.path,
			},
			500
		)
	}
}

export class ValidationExceptionFilter implements IFilter {
	async catch(exception: Error, context: Context) {
		console.error('Validation Error:', exception)

		return context.json(
			{
				status: 400,
				message: 'Validation Error',
				details: exception.message,
				timestamp: new Date().toISOString(),
				path: context.req.path,
			},
			400
		)
	}
}
```

### Applying Exception Filters

```typescript
import { Controller, Get, UseFilters } from 'honestjs'
import { HttpExceptionFilter, ValidationExceptionFilter } from './filters'

@Controller('users')
@UseFilters(HttpExceptionFilter, ValidationExceptionFilter)
class UsersController {
	@Get(':id')
	async getUser(@Param('id') id: string) {
		if (!id) {
			throw new Error('User ID is required')
		}

		const user = await this.usersService.findById(id)
		if (!user) {
			throw new Error('User not found')
		}

		return user
	}
}
```

### Filter-Specific Exception Handling

You can create filters that handle specific types of exceptions:

```typescript
export class DatabaseExceptionFilter implements IFilter {
	async catch(exception: Error, context: Context) {
		if (exception.message.includes('database') || exception.message.includes('connection')) {
			console.error('Database Error:', exception)

			return context.json(
				{
					status: 503,
					message: 'Service Unavailable',
					details: 'Database connection error',
					timestamp: new Date().toISOString(),
					path: context.req.path,
				},
				503
			)
		}

		// Return undefined to let other filters handle it
		return undefined
	}
}

export class AuthenticationExceptionFilter implements IFilter {
	async catch(exception: Error, context: Context) {
		if (exception.message.includes('unauthorized') || exception.message.includes('authentication')) {
			console.error('Authentication Error:', exception)

			return context.json(
				{
					status: 401,
					message: 'Unauthorized',
					details: 'Authentication required',
					timestamp: new Date().toISOString(),
					path: context.req.path,
				},
				401
			)
		}

		return undefined
	}
}
```

## HTTP Exceptions

HonestJS integrates with Hono's HTTPException for HTTP-specific errors:

```typescript
import { HTTPException } from 'hono/http-exception'
import { Controller, Get, Param } from 'honestjs'

@Controller('users')
class UsersController {
	@Get(':id')
	async getUser(@Param('id') id: string) {
		if (!id) {
			throw new HTTPException(400, { message: 'User ID is required' })
		}

		const user = await this.usersService.findById(id)
		if (!user) {
			throw new HTTPException(404, { message: 'User not found' })
		}

		return user
	}

	@Post()
	async createUser(@Body() userData: CreateUserDto) {
		if (!userData.email) {
			throw new HTTPException(422, {
				message: 'Validation failed',
				details: { email: 'Email is required' },
			})
		}

		return await this.usersService.create(userData)
	}
}
```

## Global Error Handling

You can configure global error handling when creating your application:

```typescript
import { Application } from 'honestjs'
import type { Context } from 'hono'

const { app, hono } = await Application.create(AppModule, {
	// Custom error handler for unhandled exceptions
	onError: (error: Error, context: Context) => {
		console.error('Unhandled error:', error)

		// Log error details
		console.error('Stack trace:', error.stack)
		console.error('Request path:', context.req.path)
		console.error('Request method:', context.req.method)

		// Return appropriate response based on environment
		if (process.env.NODE_ENV === 'production') {
			return context.json(
				{
					status: 500,
					message: 'Internal Server Error',
					timestamp: new Date().toISOString(),
					path: context.req.path,
				},
				500
			)
		} else {
			return context.json(
				{
					status: 500,
					message: error.message,
					stack: error.stack,
					timestamp: new Date().toISOString(),
					path: context.req.path,
				},
				500
			)
		}
	},

	// Custom not found handler
	notFound: (context: Context) => {
		return context.json(
			{
				status: 404,
				message: 'Not Found',
				details: `Route ${context.req.path} not found`,
				timestamp: new Date().toISOString(),
				suggestions: ['/api/users', '/api/posts', '/api/health'],
			},
			404
		)
	},
})
```

## Error Response Format

HonestJS provides a standardized error response format:

```typescript
interface ErrorResponse {
	status: number
	message: string
	timestamp: string
	path: string
	requestId?: string
	code?: string
	details?: Record<string, any>
	errors?: Array<{ property: string; constraints: Record<string, string> }>
}
```

### Example Error Responses

```json
{
	"status": 400,
	"message": "Validation Error",
	"timestamp": "2024-01-01T12:00:00.000Z",
	"path": "/api/users",
	"code": "VALIDATION_ERROR",
	"details": {
		"email": "Invalid email format"
	}
}
```

```json
{
	"status": 404,
	"message": "User not found",
	"timestamp": "2024-01-01T12:00:00.000Z",
	"path": "/api/users/123",
	"code": "NOT_FOUND"
}
```

```json
{
	"status": 500,
	"message": "Internal Server Error",
	"timestamp": "2024-01-01T12:00:00.000Z",
	"path": "/api/users",
	"requestId": "req-123",
	"details": {
		"stack": "Error: Database connection failed..."
	}
}
```

## Custom Error Classes

You can create custom error classes for better error handling:

```typescript
export class ValidationError extends Error {
	constructor(message: string, public field: string, public value: any) {
		super(message)
		this.name = 'ValidationError'
	}
}

export class BusinessLogicError extends Error {
	constructor(message: string, public code: string, public details?: Record<string, any>) {
		super(message)
		this.name = 'BusinessLogicError'
	}
}

export class DatabaseError extends Error {
	constructor(message: string, public operation: string, public table?: string) {
		super(message)
		this.name = 'DatabaseError'
	}
}
```

### Using Custom Error Classes

```typescript
@Controller('users')
class UsersController {
	@Post()
	async createUser(@Body() userData: CreateUserDto) {
		if (!userData.email) {
			throw new ValidationError('Email is required', 'email', userData.email)
		}

		if (!this.isValidEmail(userData.email)) {
			throw new ValidationError('Invalid email format', 'email', userData.email)
		}

		try {
			return await this.usersService.create(userData)
		} catch (error) {
			if (error.message.includes('duplicate')) {
				throw new BusinessLogicError('User already exists', 'USER_EXISTS', { email: userData.email })
			}
			throw error
		}
	}
}
```

### Handling Custom Errors

```typescript
export class ValidationExceptionFilter implements IFilter {
	async catch(exception: Error, context: Context) {
		if (exception instanceof ValidationError) {
			return context.json(
				{
					status: 400,
					message: 'Validation Error',
					code: 'VALIDATION_ERROR',
					details: {
						field: exception.field,
						value: exception.value,
						message: exception.message,
					},
					timestamp: new Date().toISOString(),
					path: context.req.path,
				},
				400
			)
		}

		return undefined
	}
}

export class BusinessLogicExceptionFilter implements IFilter {
	async catch(exception: Error, context: Context) {
		if (exception instanceof BusinessLogicError) {
			return context.json(
				{
					status: 409,
					message: exception.message,
					code: exception.code,
					details: exception.details,
					timestamp: new Date().toISOString(),
					path: context.req.path,
				},
				409
			)
		}

		return undefined
	}
}
```

## Error Handling Best Practices

### 1. Use Appropriate HTTP Status Codes

```typescript
// ✅ Good - Use appropriate status codes
throw new HTTPException(400, { message: 'Bad Request' })
throw new HTTPException(401, { message: 'Unauthorized' })
throw new HTTPException(403, { message: 'Forbidden' })
throw new HTTPException(404, { message: 'Not Found' })
throw new HTTPException(422, { message: 'Validation Error' })
throw new HTTPException(500, { message: 'Internal Server Error' })

// ❌ Avoid - Don't use generic 500 for client errors
throw new HTTPException(500, { message: 'Validation Error' })
```

### 2. Provide Meaningful Error Messages

```typescript
// ✅ Good - Clear, actionable error messages
throw new Error('User ID is required')
throw new Error('Email must be a valid email address')
throw new Error('Password must be at least 8 characters long')

// ❌ Avoid - Vague error messages
throw new Error('Invalid input')
throw new Error('Error occurred')
```

### 3. Include Request Context

```typescript
export class LoggerExceptionFilter implements IFilter {
	async catch(exception: Error, context: Context) {
		console.error('Error details:', {
			message: exception.message,
			stack: exception.stack,
			path: context.req.path,
			method: context.req.method,
			headers: Object.fromEntries(context.req.header()),
			timestamp: new Date().toISOString(),
		})

		return undefined // Let other filters handle the response
	}
}
```

### 4. Handle Different Environments

```typescript
export class ProductionExceptionFilter implements IFilter {
	async catch(exception: Error, context: Context) {
		if (process.env.NODE_ENV === 'production') {
			// Don't expose internal details in production
			return context.json(
				{
					status: 500,
					message: 'Internal Server Error',
					timestamp: new Date().toISOString(),
					path: context.req.path,
				},
				500
			)
		}

		// Show detailed error in development
		return context.json(
			{
				status: 500,
				message: exception.message,
				stack: exception.stack,
				timestamp: new Date().toISOString(),
				path: context.req.path,
			},
			500
		)
	}
}
```

### 5. Use Request IDs for Tracking

```typescript
export class RequestIdMiddleware implements IMiddleware {
	async use(c: Context, next: Next) {
		const requestId = c.req.header('x-request-id') || generateRequestId()
		c.set('requestId', requestId)

		// Add request ID to response headers
		c.header('x-request-id', requestId)

		await next()
	}
}

export class ErrorTrackingFilter implements IFilter {
	async catch(exception: Error, context: Context) {
		const requestId = context.get('requestId')

		console.error(`[${requestId}] Error:`, {
			message: exception.message,
			stack: exception.stack,
			path: context.req.path,
		})

		return context.json(
			{
				status: 500,
				message: 'Internal Server Error',
				requestId,
				timestamp: new Date().toISOString(),
				path: context.req.path,
			},
			500
		)
	}
}
```

### 6. Chain Exception Filters

```typescript
@Controller('users')
@UseFilters(
	LoggerExceptionFilter, // Log all errors
	ValidationExceptionFilter, // Handle validation errors
	AuthenticationExceptionFilter, // Handle auth errors
	HttpExceptionFilter // Handle HTTP exceptions
)
class UsersController {
	// Your controller methods
}
```

By following these practices, you can create robust error handling that provides clear, actionable feedback to clients while maintaining security and debugging capabilities.
