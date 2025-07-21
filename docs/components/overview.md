# Components

Components in HonestJS are reusable building blocks that provide cross-cutting functionality across your application. They include middleware, guards, pipes, filters, and the Layout component for server-side rendering.

## Overview

Components are applied to controllers and route handlers to add functionality like authentication, validation, logging, and error handling. They can be applied at different levels:

-   **Global**: Applied to all routes in the application
-   **Controller**: Applied to all routes in a specific controller
-   **Handler**: Applied to a specific route handler

## Available Components

### [Middleware](./middleware.md)

Functions that run before the route handler and can modify the request/response. Used for logging, authentication, request parsing, and more.

```typescript
@UseMiddleware(LoggerMiddleware, AuthMiddleware)
@Controller('users')
class UsersController {
	@UseMiddleware(RateLimitMiddleware)
	@Get()
	getUsers() {}
}
```

### [Guards](./guards.md)

Functions that determine whether a request should be handled by the route handler. Used for authentication and authorization.

```typescript
@UseGuards(AuthGuard, RoleGuard)
@Controller('admin')
class AdminController {
	@UseGuards(AdminGuard)
	@Get('users')
	getUsers() {}
}
```

### [Pipes](./pipes.md)

Functions that transform input data before it reaches the route handler. Used for validation, transformation, and data sanitization.

```typescript
@UsePipes(ValidationPipe, TransformPipe)
@Controller('users')
class UsersController {
	@UsePipes(CustomPipe)
	@Post()
	createUser(@Body() user: UserDto) {}
}
```

### [Filters](./filters.md)

Functions that catch and handle exceptions thrown during request processing. Used for error handling and response formatting.

```typescript
@UseFilters(HttpExceptionFilter, ValidationExceptionFilter)
@Controller('users')
class UsersController {
	@UseFilters(CustomExceptionFilter)
	@Get()
	getUsers() {}
}
```

## Component Execution Order

Components are executed in the following order:

1. **Global Components** (middleware, guards, pipes, filters)
2. **Controller Components** (middleware, guards, pipes, filters)
3. **Handler Components** (middleware, guards, pipes, filters)
4. **Route Handler** (your controller method)
5. **Exception Filters** (if an exception is thrown)

## Global Configuration

You can configure global components when creating your application:

```typescript
const { app, hono } = await Application.create(AppModule, {
	components: {
		middleware: [new LoggerMiddleware()],
		guards: [new AuthGuard()],
		pipes: [new ValidationPipe()],
		filters: [new HttpExceptionFilter()],
	},
})
```

## Component Decorators

Use decorators to apply components to controllers and handlers:

```typescript
import { UseMiddleware, UseGuards, UsePipes, UseFilters } from 'honestjs'

@Controller('users')
@UseMiddleware(LoggerMiddleware)
@UseGuards(AuthGuard)
@UsePipes(ValidationPipe)
@UseFilters(HttpExceptionFilter)
class UsersController {
	@Get()
	@UseMiddleware(RateLimitMiddleware)
	@UseGuards(RoleGuard)
	getUsers() {}
}
```

## Creating Custom Components

You can create custom components by implementing the appropriate interfaces:

### Custom Middleware

```typescript
import type { IMiddleware } from 'honestjs'
import type { Context, Next } from 'hono'

export class CustomMiddleware implements IMiddleware {
	async use(c: Context, next: Next) {
		console.log(`[${c.req.method}] ${c.req.url}`)
		await next()
	}
}
```

### Custom Guard

```typescript
import type { IGuard } from 'honestjs'
import type { Context } from 'hono'

export class CustomGuard implements IGuard {
	async canActivate(context: Context): Promise<boolean> {
		const token = context.req.header('authorization')
		return !!token
	}
}
```

### Custom Pipe

```typescript
import type { IPipe, ArgumentMetadata } from 'honestjs'

export class CustomPipe implements IPipe {
	transform(value: unknown, metadata: ArgumentMetadata): unknown {
		// Transform the value
		return value
	}
}
```

### Custom Filter

```typescript
import type { IFilter } from 'honestjs'
import type { Context } from 'hono'

export class CustomFilter implements IFilter {
	async catch(exception: Error, context: Context) {
		console.error('Custom filter caught:', exception)
		return context.json({ error: 'Custom error' }, 500)
	}
}
```

## Best Practices

### 1. Use Appropriate Component Types

Choose the right component for your use case:

-   **Middleware**: For request/response modification, logging, etc.
-   **Guards**: For authentication and authorization
-   **Pipes**: For data transformation and validation
-   **Filters**: For exception handling
-   **Layout**: For server-side rendering

### 2. Apply Components at the Right Level

```typescript
// ✅ Good - Apply authentication globally
@UseGuards(AuthGuard)
@Controller('api')
class ApiController {
	// All routes require authentication
}

// ✅ Good - Apply specific logic at handler level
@Controller('api')
class ApiController {
	@UseGuards(AdminGuard)
	@Get('admin')
	getAdminData() {}
}
```

### 3. Keep Components Focused

Each component should have a single responsibility:

```typescript
// ✅ Good - Single responsibility
export class LoggerMiddleware implements IMiddleware {
	async use(c: Context, next: Next) {
		console.log(`[${c.req.method}] ${c.req.url}`)
		await next()
	}
}

// ❌ Avoid - Multiple responsibilities
export class LoggerMiddleware implements IMiddleware {
	async use(c: Context, next: Next) {
		console.log(`[${c.req.method}] ${c.req.url}`)
		// Authentication logic - should be in a guard
		const token = c.req.header('authorization')
		if (!token) {
			return c.json({ error: 'Unauthorized' }, 401)
		}
		await next()
	}
}
```

### 4. Handle Errors Gracefully

Always handle errors in your components:

```typescript
export class CustomMiddleware implements IMiddleware {
	async use(c: Context, next: Next) {
		try {
			await next()
		} catch (error) {
			console.error('Middleware error:', error)
			throw error // Re-throw to let filters handle it
		}
	}
}
```

### 5. Use Type Safety

Leverage TypeScript for better type safety:

```typescript
export class ValidationPipe implements IPipe {
	transform(value: unknown, metadata: ArgumentMetadata): unknown {
		if (metadata.type === 'body' && metadata.metatype) {
			// Validate against the expected type
			return validate(value, metadata.metatype)
		}
		return value
	}
}
```

Components provide a powerful way to add cross-cutting functionality to your HonestJS applications while maintaining clean, organized, and maintainable code.
