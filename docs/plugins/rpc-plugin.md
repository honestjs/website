# RPC Plugin

A comprehensive RPC plugin for HonestJS that combines route analysis, schema generation, and client generation into a
single solution.

## Overview

The RPC Plugin automatically analyzes your HonestJS controllers and generates:

-   **Type-safe TypeScript RPC clients** with proper parameter typing
-   **JSON schemas** and TypeScript interfaces from your controller types
-   **Complete route metadata** with parameter and return type information

This plugin eliminates the need for manual API client creation and ensures type safety between your backend and frontend.

## Features

-   **Route Analysis**: Automatically analyzes controller methods and extracts type information using ts-morph
-   **Schema Generation**: Generates JSON schemas and TypeScript interfaces from types used in controllers
-   **Client Generation**: Creates a fully-typed TypeScript RPC client with proper parameter typing
-   **Type Safety**: Full TypeScript support with generated types and interfaces

## Installation

```bash
npm install @honestjs/rpc-plugin
# or
yarn add @honestjs/rpc-plugin
# or
pnpm add @honestjs/rpc-plugin
```

## Basic Setup

```typescript
import { RPCPlugin } from '@honestjs/rpc-plugin'
import { Application } from 'honestjs'

const app = new Application({
	plugins: [
		new RPCPlugin({
			outputDir: './generated/rpc',
		}),
	],
})
```

## Configuration Options

```typescript
interface RPCPluginOptions {
	readonly controllerPattern?: string // Glob pattern for controller files (default: 'src/modules/*/*.controller.ts')
	readonly tsConfigPath?: string // Path to tsconfig.json (default: 'tsconfig.json')
	readonly outputDir?: string // Output directory for generated files (default: './generated/rpc')
	readonly generateOnInit?: boolean // Generate files on initialization (default: true)
}
```

## What It Generates

### TypeScript RPC Client (`client.ts`)

The plugin generates a single comprehensive file that includes both the client and all type definitions:

-   **Controller-based organization**: Methods grouped by controller
-   **Type-safe parameters**: Path, query, and body parameters with proper typing
-   **Flexible request options**: Clean separation of params, query, body, and headers
-   **Error handling**: Built-in error handling with custom ApiError class
-   **Header management**: Easy custom header management
-   **Custom fetch support**: Inject custom fetch implementations for testing, middleware, and compatibility
-   **Integrated types**: All DTOs, interfaces, and utility types included in the same file

```typescript
// Generated client usage
import { ApiClient } from './generated/rpc/client'

// Create client instance with base URL
const apiClient = new ApiClient('http://localhost:3000')

// Type-safe API calls
const user = await apiClient.users.create({
	body: { name: 'John', email: 'john@example.com' },
})

const users = await apiClient.users.list({
	query: { page: 1, limit: 10 },
})

const user = await apiClient.users.getById({
	params: { id: '123' },
})

// Set custom headers
apiClient.setDefaultHeaders({
	'X-API-Key': 'your-api-key',
	Authorization: 'Bearer your-jwt-token',
})
```

The generated `client.ts` file contains everything you need:

-   **ApiClient class** with all your controller methods
-   **Type definitions** for requests, responses, and DTOs
-   **Utility types** like RequestOptions and ApiResponse
-   **Generated interfaces** from your controller types

## Custom Fetch Functions

The RPC client supports custom fetch implementations, which is useful for:

-   **Testing**: Inject mock fetch functions for unit testing
-   **Custom Logic**: Add logging, retries, or other middleware
-   **Environment Compatibility**: Use different fetch implementations (node-fetch, undici, etc.)
-   **Interceptors**: Wrap requests with custom logic before/after execution

### Basic Custom Fetch Example

```typescript
// Simple logging wrapper
const loggingFetch = (input: RequestInfo | URL, init?: RequestInit) => {
	console.log(`[${new Date().toISOString()}] Making ${init?.method || 'GET'} request to:`, input)
	return fetch(input, init)
}

const apiClient = new ApiClient('http://localhost:3000', {
	fetchFn: loggingFetch,
})
```

### Advanced Custom Fetch Examples

```typescript
// Retry logic with exponential backoff
const retryFetch = (maxRetries = 3) => {
	return async (input: RequestInfo | URL, init?: RequestInit) => {
		for (let i = 0; i <= maxRetries; i++) {
			try {
				const response = await fetch(input, init)
				if (response.ok) return response

				if (i === maxRetries) return response

				// Wait with exponential backoff
				await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
			} catch (error) {
				if (i === maxRetries) throw error
			}
		}
		throw new Error('Max retries exceeded')
	}
}

const apiClientWithRetry = new ApiClient('http://localhost:3000', {
	fetchFn: retryFetch(3),
})

// Request/response interceptor
const interceptorFetch = (input: RequestInfo | URL, init?: RequestInit) => {
	// Pre-request logic
	const enhancedInit = {
		...init,
		headers: {
			...init?.headers,
			'X-Request-ID': crypto.randomUUID(),
		},
	}

	return fetch(input, enhancedInit).then((response) => {
		// Post-response logic
		console.log(`Response status: ${response.status}`)
		return response
	})
}

const apiClientWithInterceptor = new ApiClient('http://localhost:3000', {
	fetchFn: interceptorFetch,
})
```

### Testing with Custom Fetch

```typescript
// Mock fetch for testing
const mockFetch = jest.fn().mockResolvedValue({
	ok: true,
	json: () => Promise.resolve({ data: { id: '123', name: 'Test User' } }),
})

const testApiClient = new ApiClient('http://test.com', {
	fetchFn: mockFetch,
})

// Your test can now verify the mock was called
expect(mockFetch).toHaveBeenCalledWith('http://test.com/api/v1/users/123', expect.objectContaining({ method: 'GET' }))
```

## How It Works

### 1. Route Analysis

-   Scans your HonestJS route registry
-   Uses ts-morph to analyze controller source code
-   Extracts method signatures, parameter types, and return types
-   Builds comprehensive route metadata

### 2. Schema Generation

-   Analyzes types used in controller methods
-   Generates JSON schemas using ts-json-schema-generator
-   Creates TypeScript interfaces from schemas
-   Integrates with route analysis for complete type coverage

### 3. Client Generation

-   Groups routes by controller for organization
-   Generates type-safe method signatures
-   Creates parameter validation and typing
-   Builds the complete RPC client with proper error handling

## Benefits of the Unified Approach

-   **No Duplication**: Single source of truth for all type information
-   **Tight Coupling**: Components share data directly without file I/O
-   **Better Performance**: Eliminates redundant analysis and file generation
-   **Consistent Types**: All generated code uses the same type definitions
-   **Easier Maintenance**: Single plugin to configure and maintain

## Example Generated Output

### Generated Client

```typescript
export class ApiClient {
	get users() {
		return {
			create: async (
				options: RequestOptions<{ name: string; email: string }, undefined, undefined, undefined>
			): Promise<ApiResponse<any>> => {
				return this.request('POST', `/api/v1/users/`, options)
			},
			list: async (
				options?: RequestOptions<undefined, { page: number; limit: number }, undefined, undefined>
			): Promise<ApiResponse<any>> => {
				return this.request('GET', `/api/v1/users/`, options)
			},
		}
	}
}

// RequestOptions type definition
export type RequestOptions<
	TParams = undefined,
	TQuery = undefined,
	TBody = undefined,
	THeaders = undefined
> = (TParams extends undefined ? object : { params: TParams }) &
	(TQuery extends undefined ? object : { query: TQuery }) &
	(TBody extends undefined ? object : { body: TBody }) &
	(THeaders extends undefined ? object : { headers: THeaders })
```

## Plugin Lifecycle

The plugin automatically generates files when your HonestJS application starts up (if `generateOnInit` is true). You can
also manually trigger generation:

```typescript
const rpcPlugin = new RPCPlugin()
await rpcPlugin.analyze() // Manually trigger analysis and generation
```

## Advanced Usage

### Custom Controller Pattern

If your controllers follow a different file structure:

```typescript
new RPCPlugin({
	controllerPattern: 'src/controllers/**/*.controller.ts',
	outputDir: './src/generated/api',
})
```

### Manual Generation Control

Disable automatic generation and control when files are generated:

```typescript
const rpcPlugin = new RPCPlugin({
	generateOnInit: false,
})

// Later in your code
await rpcPlugin.analyze()
```

### Accessing Generated Data

The plugin provides access to analyzed data:

```typescript
const rpcPlugin = new RPCPlugin()

// Get analyzed routes
const routes = rpcPlugin.getRoutes()

// Get generated schemas
const schemas = rpcPlugin.getSchemas()

// Get generation info
const info = rpcPlugin.getGenerationInfo()
```

## Integration with HonestJS

### Controller Example

Here's how your controllers should be structured for optimal RPC generation:

```typescript
import { Controller, Post, Get, Body, Param, Query } from 'honestjs'

interface CreateUserDto {
	name: string
	email: string
}

interface ListUsersQuery {
	page?: number
	limit?: number
}

@Controller('/users')
export class UsersController {
	@Post('/')
	async create(@Body() createUserDto: CreateUserDto): Promise<User> {
		// Implementation
	}

	@Get('/')
	async list(@Query() query: ListUsersQuery): Promise<User[]> {
		// Implementation
	}

	@Get('/:id')
	async getById(@Param('id') id: string): Promise<User> {
		// Implementation
	}
}
```

### Module Registration

Ensure your controllers are properly registered in modules:

```typescript
import { Module } from 'honestjs'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
	controllers: [UsersController],
	providers: [UsersService],
})
export class UsersModule {}
```

## Error Handling

The generated client includes comprehensive error handling:

```typescript
try {
	const user = await apiClient.users.create({
		body: { name: 'John', email: 'john@example.com' },
	})
} catch (error) {
	if (error instanceof ApiError) {
		console.error(`API Error ${error.statusCode}: ${error.message}`)
	} else {
		console.error('Unexpected error:', error)
	}
}
```

## Performance Considerations

-   **Initial Generation**: First run may take longer due to TypeScript analysis
-   **Subsequent Runs**: Only regenerates when source files change
-   **Memory Usage**: Minimal memory footprint during runtime
-   **Build Time**: Adds minimal overhead to your build process

## Troubleshooting

### Common Issues

1. **No files generated**: Check that your controllers match the `controllerPattern`
2. **Type errors**: Ensure your `tsconfig.json` is properly configured
3. **Missing types**: Verify that all DTOs and return types are properly exported

### Debug Mode

Enable verbose logging:

```typescript
new RPCPlugin({
	outputDir: './generated/rpc',
	// Add debug logging if available
})
```

## Dependencies

-   **ts-morph**: TypeScript source code analysis
-   **ts-json-schema-generator**: JSON schema generation from TypeScript types
-   **honestjs**: Core framework integration

## Contributing

The RPC Plugin is part of the official HonestJS ecosystem. To contribute:

1. Fork the [@honestjs-plugins](https://github.com/honestjs/honestjs-plugins) repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

---

The RPC Plugin transforms your HonestJS application into a fully type-safe API with minimal configuration. It eliminates the need for manual client generation and ensures consistency between your backend and frontend code.
