# Introduction

HonestJS is a modern backend web framework for TypeScript and JavaScript, built on [Hono](https://hono.dev).

## Philosophy

-   **Developer Experience:** HonestJS is designed to be intuitive and easy to use. By leveraging decorators and a module-based architecture, it helps you write organized, maintainable, and scalable code.
-   **Performance:** Built on Hono, one of the fastest web frameworks available, HonestJS is engineered for speed and low overhead.
-   **Flexibility:** While providing a structured approach to building applications, it remains flexible. You can easily integrate other Hono middleware or use the underlying Hono instance directly.

## Key Features

-   **NestJS-like Architecture:** Utilizes decorators for Controllers, Services, and Modules.
-   **Dependency Injection:** A simple yet powerful DI container for managing application components.
-   **Extensibility:** Supports middleware, guards, pipes, filters, and plugins.
-   **MVC and Frontend Rendering:** Includes support for building full-stack applications with JSX-based views.

## Getting Started: Hello, World!

This guide demonstrates how to create a basic "Hello, World!" application with HonestJS.

### 1. Project Setup

First, create a new project and install the necessary dependencies.

```bash
bun init
bun add honestjs reflect-metadata
bun add -d typescript @types/bun
```

Ensure your `tsconfig.json` has the following options enabled for decorator support:

```json
{
	"compilerOptions": {
		"experimentalDecorators": true, // [!code ++]
		"emitDecoratorMetadata": true // [!code ++]
		// ... other options
	}
}
```

### 2. Create a Service

Services are responsible for business logic. This service will provide the "Hello, World!" message.

`src/app.service.ts`

```typescript
import { Service } from 'honestjs'

@Service()
class AppService {
	helloWorld(): string {
		return 'Hello, World!'
	}
}

export default AppService
```

### 3. Create a Controller

Controllers handle incoming requests and use services to fulfill them.

`src/app.controller.ts`

```typescript
import { Controller, Get } from 'honestjs'
import AppService from './app.service'

@Controller()
class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	helloWorld(): string {
		return this.appService.helloWorld()
	}
}

export default AppController
```

### 4. Create a Module

Modules organize the application's components.

`src/app.module.ts`

```typescript
import { Module } from 'honestjs'
import AppController from './app.controller'
import AppService from './app.service'

@Module({
	controllers: [AppController],
	services: [AppService],
})
class AppModule {}

export default AppModule
```

### 5. Create the Application Entrypoint

Finally, create the main application file to bootstrap the HonestJS app.

`src/main.ts`

```typescript
import { Application } from 'honestjs'
import 'reflect-metadata'
import AppModule from './app.module'

const { hono } = await Application.create(AppModule)

export default hono
```

Now, run the application:

```bash
bun src/main.ts
```
