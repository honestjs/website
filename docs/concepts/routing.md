# Routing

Routing is the mechanism that maps incoming requests to the correct controller methods. HonestJS uses a combination of decorators on your controller classes and methods to define the routes for your application.

## Controllers

Controllers are responsible for handling incoming requests and returning responses. To create a controller, you use the `@Controller()` decorator on a class.

The `@Controller()` decorator can take an optional route prefix and configuration options. This prefix will be applied to all routes defined within that controller.

**Example:**

```typescript [src/modules/users/users.controller.ts]
import { Controller, Get } from 'honestjs'

@Controller('users')
export class UsersController {
	@Get()
	findAll() {
		return 'This route handles GET requests to /users'
	}

	@Get(':id')
	findOne() {
		return 'This route handles GET requests to /users/:id'
	}
}
```

In this example, the `@Controller('users')` decorator sets a base path for all routes in `UsersController`.

## Controller Options

The `@Controller()` decorator accepts configuration options:

```typescript
import { Controller, VERSION_NEUTRAL } from 'honestjs'

@Controller('users', {
	prefix: 'api', // Override global prefix
	version: 2, // Override global version
})
export class UsersController {
	// Routes will be accessible at /api/v2/users
}

@Controller('health', {
	version: VERSION_NEUTRAL, // Accessible with and without version
})
export class HealthController {
	// Routes will be accessible at both /health and /v1/health
}
```

## HTTP Method Decorators

To handle specific HTTP methods, HonestJS provides decorators for all standard methods:

-   `@Get(path?: string, options?: HttpMethodOptions)`
-   `@Post(path?: string, options?: HttpMethodOptions)`
-   `@Put(path?: string, options?: HttpMethodOptions)`
-   `@Delete(path?: string, options?: HttpMethodOptions)`
-   `@Patch(path?: string, options?: HttpMethodOptions)`
-   `@Options(path?: string, options?: HttpMethodOptions)`
-   `@All(path?: string, options?: HttpMethodOptions)`

These decorators are used on methods within a controller. They can take an optional path segment and options that will be appended to the controller's prefix.

```typescript [src/modules/users/users.controller.ts]
import { Controller, Get, Post, Body, Param } from 'honestjs'
import UsersService from './users.service'
import type { CreateUserDto, User } from './users.types'

@Controller('users')
class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	async createUser(@Body() body: CreateUserDto): Promise<User> {
		return await this.usersService.create(body)
	}

	@Get()
	async getUsers(): Promise<User[]> {
		return await this.usersService.findAll()
	}

	@Get(':id')
	async getUser(@Param('id') id: string): Promise<User> {
		return await this.usersService.findById(id)
	}

	@Put(':id')
	async updateUser(@Param('id') id: string, @Body() body: Partial<CreateUserDto>): Promise<User> {
		return await this.usersService.update(id, body)
	}

	@Delete(':id')
	async deleteUser(@Param('id') id: string): Promise<void> {
		await this.usersService.delete(id)
	}
}
```

## Route Parameters

You can capture dynamic values from the URL path using route parameters. To define a route parameter, use a colon (`:`) in the path. To access its value, use the `@Param()` decorator in the method signature.

```typescript [src/modules/users/users.controller.ts]
import { Controller, Get, Param } from 'honestjs'

@Controller('users')
class UsersController {
	@Get(':id')
	async getUser(@Param('id') id: string): Promise<User> {
		const user = await this.usersService.findById(id)
		if (!user) {
			throw new Error('User not found')
		}
		return user
	}

	@Get(':userId/posts/:postId')
	async getUserPost(@Param('userId') userId: string, @Param('postId') postId: string): Promise<Post> {
		return await this.postsService.findByUserAndId(userId, postId)
	}
}
```

In this case, a `GET` request to `/users/123` will call the `getUser` method, and the value of `id` will be `"123"`.

## Route Versioning

HonestJS supports flexible API versioning at multiple levels. You can set a global version, a version per controller, or even a version per route.

### Global Versioning

You can set a global version prefix when creating your application.

```typescript [src/main.ts]
const { app, hono } = await Application.create(AppModule, {
	routing: {
		version: 1,
	},
})
```

With this configuration, all routes will be prefixed with `/v1`. For example, `GET /users` becomes `GET /v1/users`.

### Controller-level Versioning

You can override the global version or set a specific version for a controller.

```typescript
import { Controller, VERSION_NEUTRAL } from 'honestjs'

@Controller('users', { version: 2 })
export class UsersController {
	// Routes in this controller will be prefixed with /v2
}

@Controller('health', { version: VERSION_NEUTRAL })
export class HealthController {
	// This controller's routes will be accessible both with and without version
}

@Controller('legacy', { version: null })
export class LegacyController {
	// This controller's routes will not have a version prefix, even if global version is set
}
```

### Route-level Versioning

You can also specify a version directly on a route decorator, which will override any controller or global settings.

```typescript
import { Controller, Get, VERSION_NEUTRAL } from 'honestjs'

@Controller('users')
export class UsersController {
	@Get('legacy', { version: 1 })
	getLegacyUsers() {
		// This will be accessible at /v1/users/legacy
	}

	@Get('new', { version: 2 })
	getNewUsers() {
		// This will be accessible at /v2/users/new
	}

	@Get('status', { version: VERSION_NEUTRAL })
	getStatus() {
		// This will be accessible at both /users/status and /v1/users/status
	}
}
```

### Multiple Versions

You can make routes available at multiple versions simultaneously:

```typescript
@Controller('users', { version: [1, 2] })
export class UsersController {
	@Get()
	getUsers() {
		// This will be accessible at both /v1/users and /v2/users
	}
}

@Controller('users')
export class UsersController {
	@Get('compatible', { version: [1, 2, 3] })
	getCompatibleUsers() {
		// This will be accessible at /v1/users/compatible, /v2/users/compatible, and /v3/users/compatible
	}
}
```

### Version-Neutral Routes

Sometimes you may want certain routes to be accessible both with and without version prefixes. For this, you can use the `VERSION_NEUTRAL` symbol.

```typescript
import { Controller, Get, VERSION_NEUTRAL } from 'honestjs'

@Controller('health')
export class HealthController {
	@Get('status', { version: VERSION_NEUTRAL })
	getStatus() {
		// This route will be accessible at both:
		// - /health/status (without version)
		// - /v1/health/status (with version, if global version is set)
		return { status: 'ok' }
	}
}
```

Version-neutral routes are particularly useful for:

-   Health check endpoints
-   Status endpoints
-   Public API endpoints that should remain accessible regardless of versioning
-   Utility endpoints that don't change between API versions

## Route Prefixes

Similar to versioning, you can control route prefixes at multiple levels:

::: code-group

```typescript [main.ts]
// Global prefix
const { app, hono } = await Application.create(AppModule, {
	routing: {
		prefix: 'api',
	},
})
```

```typescript [users.controller.ts]
// Controller-level prefix
@Controller('users', { prefix: 'v2/api' })
export class UsersController {
	// Routes will be accessible at /v2/api/users
}
```

```typescript [users.controller.ts]
// Route-level prefix
@Controller('users')
export class UsersController {
	@Get('data', { prefix: 'internal' })
	getInternalData() {
		// This will be accessible at /internal/users/data
	}
}
```

:::

## Route Information

You can get information about all registered routes in your application:

```typescript
const { app, hono } = await Application.create(AppModule)

// Get all routes
const routes = app.getRoutes()
console.log(
	'Registered routes:',
	routes.map((r) => r.fullPath)
)

// Get routes by controller
const userRoutes = app.getRoutes().filter((r) => r.controller === 'UsersController')

// Get routes by method
const getRoutes = app.getRoutes().filter((r) => r.method === 'GET')
```

## Route Examples

Here are some comprehensive examples of route definitions:

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from 'honestjs'

@Controller('api/users', { version: 1 })
export class UsersController {
	// GET /v1/api/users
	@Get()
	async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
		return await this.usersService.findAll({
			page: parseInt(page || '1'),
			limit: parseInt(limit || '10'),
		})
	}

	// GET /v1/api/users/:id
	@Get(':id')
	async findOne(@Param('id') id: string) {
		return await this.usersService.findById(id)
	}

	// POST /v1/api/users
	@Post()
	async create(@Body() createUserDto: CreateUserDto) {
		return await this.usersService.create(createUserDto)
	}

	// PUT /v1/api/users/:id
	@Put(':id')
	async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return await this.usersService.update(id, updateUserDto)
	}

	// DELETE /v1/api/users/:id
	@Delete(':id')
	async remove(@Param('id') id: string) {
		return await this.usersService.delete(id)
	}

	// GET /v1/api/users/:id/posts
	@Get(':id/posts')
	async getUserPosts(@Param('id') userId: string) {
		return await this.postsService.findByUserId(userId)
	}
}

@Controller('health', { version: VERSION_NEUTRAL })
export class HealthController {
	// GET /health/status AND GET /v1/health/status
	@Get('status')
	async getStatus() {
		return { status: 'ok', timestamp: new Date().toISOString() }
	}
}
```

By combining these features, you can build well-structured and maintainable routing for your applications with flexible versioning and prefixing strategies.
