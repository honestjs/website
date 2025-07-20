# Parameter Decorators in HonestJS

Parameter decorators allow you to extract data from the incoming request and inject it directly into your route handler's parameters. This provides a clean and declarative way to access request data with full type safety.

## Built-in Parameter Decorators

HonestJS comes with a comprehensive set of built-in decorators for common use cases:

### Request Data Decorators

-   `@Body(data?: string)`: Extracts the request body. Can optionally extract a specific property from the body.
-   `@Param(data?: string)`: Extracts route parameters.
-   `@Query(data?: string)`: Extracts query parameters.
-   `@Header(data?: string)`: Extracts request headers.

### Context Decorators

-   `@Req()` or `@Request()`: Injects the entire Hono request object.
-   `@Res()` or `@Response()`: Injects the Hono response object.
-   `@Ctx()` or `@Context()`: Injects the Hono `Context` object.
-   `@Var(data: string)` or `@Variable(data: string)`: Extracts a variable from the context (e.g., set by a middleware).

## Basic Usage Examples

```typescript
import { Body, Controller, Ctx, Get, Param, Post, Query, Header } from 'honestjs'
import type { Context } from 'hono'
import type { CreateUserDto, UpdateUserDto } from './users.types'

@Controller('users')
export class UsersController {
	@Post()
	async createUser(@Body() createUserDto: CreateUserDto) {
		return await this.usersService.create(createUserDto)
	}

	@Get(':id')
	async findUserById(@Param('id') id: string) {
		return await this.usersService.findById(id)
	}

	@Get()
	async findAllUsers(@Query('page') page?: string, @Query('limit') limit?: string, @Query('role') role?: string) {
		return await this.usersService.findAll({
			page: parseInt(page || '1'),
			limit: parseInt(limit || '10'),
			role,
		})
	}

	@Put(':id')
	async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return await this.usersService.update(id, updateUserDto)
	}

	@Get('profile')
	async getProfile(@Header('authorization') auth: string) {
		// Extract authorization header
		const token = auth?.replace('Bearer ', '')
		return await this.usersService.getProfileByToken(token)
	}

	@Get('context')
	async getContext(@Ctx() context: Context) {
		// Access the full Hono context
		return {
			path: context.req.path,
			method: context.req.method,
			url: context.req.url,
			headers: Object.fromEntries(context.req.header()),
		}
	}
}
```

## Advanced Parameter Extraction

### Extracting Specific Properties

You can extract specific properties from request data:

```typescript
@Controller('users')
export class UsersController {
	@Post()
	async createUser(@Body('name') name: string, @Body('email') email: string, @Body('age') age: number) {
		// Extract specific properties from request body
		return await this.usersService.create({ name, email, age })
	}

	@Get(':id/posts')
	async getUserPosts(
		@Param('id') userId: string,
		@Query('category') category?: string,
		@Query('published') published?: string
	) {
		return await this.postsService.findByUserId(userId, {
			category,
			published: published === 'true',
		})
	}

	@Get('search')
	async searchUsers(@Query('q') query: string, @Query('fields') fields?: string) {
		const searchFields = fields ? fields.split(',') : ['name', 'email']
		return await this.usersService.search(query, searchFields)
	}
}
```

### Working with Headers

Headers are commonly used for authentication and other metadata:

```typescript
@Controller('auth')
export class AuthController {
	@Post('login')
	async login(
		@Body() credentials: { email: string; password: string },
		@Header('user-agent') userAgent?: string,
		@Header('x-forwarded-for') clientIP?: string
	) {
		return await this.authService.login(credentials, {
			userAgent,
			clientIP,
		})
	}

	@Get('profile')
	async getProfile(@Header('authorization') auth: string, @Header('accept-language') language?: string) {
		const token = auth?.replace('Bearer ', '')
		return await this.authService.getProfile(token, language)
	}
}
```

### Context Variables

You can extract variables set by middleware:

::: code-group

```typescript [src/middleware/auth.middleware.ts]
// Middleware that sets user in context
class AuthMiddleware implements IMiddleware {
	async use(c: Context, next: Next) {
		const token = c.req.header('authorization')?.replace('Bearer ', '')
		if (token) {
			const user = await this.authService.validateToken(token)
			c.set('user', user)
		}
		await next()
	}
}
```

```typescript [src/controllers/users.controller.ts]
@Controller('users')
@UseMiddleware(AuthMiddleware)
export class UsersController {
	@Get('me')
	async getCurrentUser(@Var('user') user: User) {
		return user
	}

	@Get('me/posts')
	async getMyPosts(@Var('user') user: User) {
		return await this.postsService.findByUserId(user.id)
	}
}
```

:::

## Type Safety and Validation

Parameter decorators work seamlessly with TypeScript types and can be combined with pipes for validation:

```typescript
import { Body, Controller, Get, Param, Post, UsePipes } from 'honestjs'
import { ValidationPipe } from './pipes/validation.pipe'
import { TransformPipe } from './pipes/transform.pipe'

interface CreateUserDto {
	name: string
	email: string
	age: number
}

interface PaginationQuery {
	page: number
	limit: number
}

@Controller('users')
export class UsersController {
	@Post()
	@UsePipes(ValidationPipe, TransformPipe)
	async createUser(@Body() createUserDto: CreateUserDto) {
		// createUserDto is validated and transformed
		return await this.usersService.create(createUserDto)
	}

	@Get()
	async findAll(@Query() query: PaginationQuery) {
		// query is typed as PaginationQuery
		return await this.usersService.findAll(query)
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		// id is typed as string
		return await this.usersService.findById(id)
	}
}
```

## Creating Custom Parameter Decorators

You can create your own custom parameter decorators using the `createParamDecorator` helper function. This is useful for abstracting complex logic for extracting data from the request.

### Basic Custom Decorator

```typescript
import { createParamDecorator } from 'honestjs'
import type { Context } from 'hono'

export const ClientIP = createParamDecorator('ip', (_, ctx: Context) => {
	const forwardedFor = ctx.req.header('x-forwarded-for')
	const realIP = ctx.req.header('x-real-ip')
	const cfIP = ctx.req.header('cf-connecting-ip')

	const ip = forwardedFor?.split(',')[0].trim() || realIP || cfIP || 'unknown'
	return ip
})

export const UserAgent = createParamDecorator('userAgent', (_, ctx: Context) => {
	return ctx.req.header('user-agent') || 'unknown'
})

export const RequestId = createParamDecorator('requestId', (_, ctx: Context) => {
	return ctx.get('requestId') || 'unknown'
})
```

### Advanced Custom Decorator

```typescript
import { createParamDecorator } from 'honestjs'
import type { Context } from 'hono'

export const CurrentUser = createParamDecorator('user', (_, ctx: Context) => {
	const token = ctx.req.header('authorization')?.replace('Bearer ', '')
	if (!token) {
		return null
	}

	// Decode JWT and return user
	return decodeJWT(token)
})

export const Pagination = createParamDecorator('pagination', (_, ctx: Context) => {
	const page = parseInt(ctx.req.query('page') || '1')
	const limit = parseInt(ctx.req.query('limit') || '10')

	return {
		page: Math.max(1, page),
		limit: Math.min(100, Math.max(1, limit)),
		offset: (page - 1) * limit,
	}
})

export const SortOptions = createParamDecorator('sort', (_, ctx: Context) => {
	const sortBy = ctx.req.query('sortBy') || 'createdAt'
	const sortOrder = ctx.req.query('sortOrder') || 'desc'

	return {
		sortBy,
		sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
	}
})
```

### Using Custom Decorators

```typescript
@Controller('users')
export class UsersController {
	@Get()
	async findAll(
		@Pagination() pagination: { page: number; limit: number; offset: number },
		@SortOptions() sort: { sortBy: string; sortOrder: string }
	) {
		return await this.usersService.findAll(pagination, sort)
	}

	@Get('me')
	async getCurrentUser(@CurrentUser() user: User | null) {
		if (!user) {
			throw new Error('User not authenticated')
		}
		return user
	}

	@Get('analytics')
	async getAnalytics(@ClientIP() clientIP: string, @UserAgent() userAgent: string, @RequestId() requestId: string) {
		return await this.analyticsService.track({
			clientIP,
			userAgent,
			requestId,
		})
	}
}
```

## Parameter Metadata

The framework tracks parameter metadata for each handler method, which is used for:

-   **Type information**: Parameter types are captured for validation and transformation
-   **Decorator data**: Additional data passed to decorators is stored
-   **Factory functions**: Custom transformation logic is preserved
-   **Context indices**: Special handling for context parameters

This metadata enables advanced features like automatic validation, transformation, and documentation generation.

## Best Practices

### 1. Use Type Annotations

Always provide type annotations for better type safety:

```typescript
// ✅ Good
@Get(':id')
async findOne(@Param('id') id: string) {
	return await this.usersService.findById(id)
}

// ❌ Avoid
@Get(':id')
async findOne(@Param('id') id) {
	return await this.usersService.findById(id)
}
```

### 2. Handle Optional Parameters

Use optional types for parameters that might not be present:

```typescript
@Get()
async findAll(
	@Query('page') page?: string,
	@Query('limit') limit?: string,
	@Query('search') search?: string
) {
	return await this.usersService.findAll({
		page: page ? parseInt(page) : 1,
		limit: limit ? parseInt(limit) : 10,
		search
	})
}
```

### 3. Validate Required Parameters

Throw errors for required parameters that are missing:

```typescript
@Get(':id')
async findOne(@Param('id') id: string) {
	if (!id) {
		throw new Error('User ID is required')
	}
	return await this.usersService.findById(id)
}
```

### 4. Use Custom Decorators for Complex Logic

Extract complex parameter extraction logic into custom decorators:

```typescript
// ✅ Good - Custom decorator
export const AuthenticatedUser = createParamDecorator('user', (_, ctx: Context) => {
	const token = ctx.req.header('authorization')?.replace('Bearer ', '')
	if (!token) {
		throw new Error('Authentication required')
	}
	return decodeJWT(token)
})

@Get('me')
async getCurrentUser(@AuthenticatedUser() user: User) {
	return user
}

// ❌ Avoid - Complex logic in controller
@Get('me')
async getCurrentUser(@Header('authorization') auth: string) {
	const token = auth?.replace('Bearer ', '')
	if (!token) {
		throw new Error('Authentication required')
	}
	const user = decodeJWT(token)
	return user
}
```

### 5. Combine with Pipes for Validation

Use pipes to validate and transform parameters:

```typescript
@Post()
@UsePipes(ValidationPipe)
async createUser(@Body() createUserDto: CreateUserDto) {
	// createUserDto is validated before reaching this method
	return await this.usersService.create(createUserDto)
}
```

By following these practices, you can create clean, type-safe, and maintainable route handlers that effectively extract and process request data.
