# HonestJS Documentation

Welcome to the HonestJS documentation! HonestJS is a modern, lightweight web framework for TypeScript and JavaScript, built on top of [Hono](https://hono.dev).

## What is HonestJS?

HonestJS provides a clean, decorator-based API for building web applications with:

-   **Decorator-based Architecture**: TypeScript decorators for Controllers, Services, and Modules
-   **Dependency Injection**: Simple yet powerful DI container for managing application components
-   **Comprehensive Middleware System**: Support for middleware, guards, pipes, and exception filters
-   **API Versioning**: Built-in support for API versioning with flexible versioning strategies
-   **Plugin System**: Extensible architecture with plugin support for custom functionality
-   **MVC Support**: Includes support for building full-stack applications with JSX-based views
-   **Error Handling**: Comprehensive error handling with customizable exception filters
-   **Route Management**: Advanced routing with parameter binding, query parsing, and header extraction

## Quick Start

Get up and running with HonestJS in minutes! Check out our [Getting Started](./getting-started.md) guide for a complete tutorial, or jump right in with this minimal example:

```typescript
import { Application, Controller, Get, Service, Module } from 'honestjs'
import 'reflect-metadata'

@Service()
class AppService {
	helloWorld(): string {
		return 'Hello, World!'
	}
}

@Controller()
class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	helloWorld(): string {
		return this.appService.helloWorld()
	}
}

@Module({
	controllers: [AppController],
	services: [AppService],
})
class AppModule {}

const { app, hono } = await Application.create(AppModule)
export default hono
```

## Documentation Sections

### Getting Started

-   **[Getting Started](./getting-started.md)** - Complete tutorial to build your first app
-   **[Configuration](./configuration.md)** - Application configuration options
-   **[API Reference](./api-reference.md)** - Complete API documentation

### Core Concepts

-   **[Routing](./concepts/routing.md)** - Route definitions, versioning, and path management
-   **[Dependency Injection](./concepts/dependency-injection.md)** - DI container and service management
-   **[Parameters](./concepts/parameters.md)** - Parameter decorators and data extraction
-   **[Error Handling](./concepts/error-handling.md)** - Exception filters and error management

### Components

-   **[Components Overview](./components/index.md)** - Introduction to components system
-   **[Middleware](./components/middleware.md)** - Request/response processing middleware
-   **[Guards](./components/guards.md)** - Authentication and authorization guards
-   **[Pipes](./components/pipes.md)** - Data transformation and validation pipes
-   **[Filters](./components/filters.md)** - Exception handling filters
-   **[Layout](./components/layout.md)** - Server-side rendering component

### Features

-   **[MVC Support](./features/mvc.md)** - Model-View-Controller architecture
-   **[Plugins](./features/plugins.md)** - Extending framework functionality
-   **[Helpers](./features/helpers.md)** - Utility functions and helper methods

## Framework Architecture

HonestJS is organized around several core concepts:

```
Application
├── Modules (organize components)
│   ├── Controllers (handle requests)
│   ├── Services (business logic)
│   └── Components (cross-cutting concerns)
│       ├── Middleware (request processing)
│       ├── Guards (authentication/authorization)
│       ├── Pipes (data transformation)
│       └── Filters (error handling)
└── Dependency Injection (automatic instantiation)
```

## Key Features

### Decorator-Based API

```typescript
@Controller('users', { version: 1 })
class UsersController {
	@Get()
	@UseGuards(AuthGuard)
	@UsePipes(ValidationPipe)
	async getUsers(@Query('page') page?: string) {
		return await this.usersService.findAll({ page })
	}
}
```

### Dependency Injection

```typescript
@Service()
class UserService {
	constructor(private readonly db: DatabaseService) {}

	async findAll() {
		return await this.db.query('SELECT * FROM users')
	}
}

@Controller('users')
class UsersController {
	constructor(private readonly userService: UserService) {}
	// UserService is automatically injected
}
```

### API Versioning

::: code-group

```typescript [src/main.ts]
// Global version
const { app, hono } = await Application.create(AppModule, {
	routing: { version: 1 },
})
```

```typescript [src/controllers/users.controller.ts]
// Controller-specific version
@Controller('users', { version: 2 })
class UsersController {}
```

```typescript [src/controllers/health.controller.ts]
// Version-neutral routes
@Controller('health', { version: VERSION_NEUTRAL })
class HealthController {}
```

:::

### Component System

::: code-group

```typescript [src/main.ts]
// Global components
const { app, hono } = await Application.create(AppModule, {
	components: {
		middleware: [new LoggerMiddleware()],
		guards: [new AuthGuard()],
		pipes: [new ValidationPipe()],
		filters: [new HttpExceptionFilter()],
	},
})
```

```typescript [src/controllers/users.controller.ts]
// Controller-level components
@Controller('users')
@UseMiddleware(LoggerMiddleware)
@UseGuards(AuthGuard)
class UsersController {}
```

```typescript [src/controllers/users.controller.ts]
// Handler-level components
@Controller('users')
class UsersController {
	@Get()
	@UseGuards(AdminGuard)
	@UsePipes(CustomPipe)
	getUsers() {}
}
```

:::

### Server-Side Rendering

```typescript
import { Layout } from 'honestjs'

@Controller('pages')
class PagesController {
	@Get('home')
	home() {
		return Layout({
			title: 'Home - My App',
			description: 'Welcome to our application',
			children: '<h1>Welcome to My App</h1>',
		})
	}
}
```

## Installation

::: code-group

```bash [bun (recommended)]
bun add honestjs reflect-metadata
```

```bash [npm]
npm install honestjs reflect-metadata
```

```bash [yarn]
yarn add honestjs reflect-metadata
```

:::

For detailed setup instructions, see our [Getting Started](./getting-started.md) guide.

## Examples

### Basic REST API

```typescript
import { Application, Controller, Get, Post, Put, Delete, Body, Param } from 'honestjs'

@Controller('api/users')
class UsersController {
	@Get()
	async findAll() {
		return await this.usersService.findAll()
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		return await this.usersService.findById(id)
	}

	@Post()
	async create(@Body() userData: CreateUserDto) {
		return await this.usersService.create(userData)
	}

	@Put(':id')
	async update(@Param('id') id: string, @Body() userData: UpdateUserDto) {
		return await this.usersService.update(id, userData)
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		return await this.usersService.delete(id)
	}
}
```

### Full-Stack Application

```typescript
import { Application, View, Page, Layout } from 'honestjs'

@View('pages')
class PagesController {
	@Page('home')
	home() {
		return Layout({
			title: 'Home',
			description: 'Welcome to our app',
			scripts: ['/app.js'],
			stylesheets: ['/styles.css'],
			children: `
				<header>
					<h1>Welcome to Our App</h1>
				</header>
				<main>
					<p>Built with HonestJS</p>
				</main>
			`,
		})
	}
}
```

## Community and Support

-   **GitHub**: [honestjs/honest](https://github.com/honestjs/honest)
-   **Issues**: [GitHub Issues](https://github.com/honestjs/honest/issues)
-   **Discussions**: [GitHub Discussions](https://github.com/honestjs/honest/discussions)

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/honestjs/honest/blob/main/CONTRIBUTING.md) for details.

## License

HonestJS is licensed under the MIT License. See the [LICENSE](https://github.com/honestjs/honest/blob/main/LICENSE) file for details.

---

Start building with HonestJS today! Check out the [Getting Started](./getting-started.md) guide for a detailed tutorial.
