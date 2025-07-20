# API Reference

This document provides a comprehensive reference for all the APIs available in HonestJS.

## Table of Contents

-   [Application](#application)
-   [Decorators](#decorators)
-   [Components](#components)
-   [Interfaces](#interfaces)
-   [Types](#types)
-   [Constants](#constants)
-   [Utilities](#utilities)

## Application

### `Application`

The main application class for creating and configuring HonestJS applications.

#### `Application.create(rootModule, options?)`

Creates and initializes a new application with a root module.

```typescript
static async create(
	rootModule: Constructor,
	options?: HonestOptions
): Promise<{ app: Application; hono: Hono }>
```

**Parameters:**

-   `rootModule`: The root module class for the application
-   `options`: Optional application configuration

**Returns:** Object containing the application and Hono instances

**Example:**

```typescript
const { app, hono } = await Application.create(AppModule, {
	routing: { prefix: '/api', version: 1 },
})
```

#### `Application.getApp()`

Gets the underlying Hono instance for direct access.

```typescript
getApp(): Hono
```

**Returns:** The Hono application instance

#### `Application.getRoutes()`

Gets information about all registered routes in the application.

```typescript
getRoutes(): ReadonlyArray<RouteInfo>
```

**Returns:** Array of route information objects

#### `Application.register(moduleClass)`

Registers a module with the application.

```typescript
async register(moduleClass: Constructor): Promise<Application>
```

**Parameters:**

-   `moduleClass`: The module class to register

**Returns:** The application instance for method chaining

## Decorators

### Routing Decorators

#### `@Controller(route?, options?)`

Marks a class as a controller and defines the base route for all its endpoints.

```typescript
function Controller(route?: string, options?: ControllerOptions): ClassDecorator
```

**Parameters:**

-   `route`: Optional base route path
-   `options`: Controller configuration options

**Example:**

```typescript
@Controller('users', { version: 1 })
class UsersController {}
```

#### HTTP Method Decorators

##### `@Get(path?, options?)`

Defines a GET endpoint.

```typescript
function Get(path?: string, options?: HttpMethodOptions): MethodDecorator
```

##### `@Post(path?, options?)`

Defines a POST endpoint.

```typescript
function Post(path?: string, options?: HttpMethodOptions): MethodDecorator
```

##### `@Put(path?, options?)`

Defines a PUT endpoint.

```typescript
function Put(path?: string, options?: HttpMethodOptions): MethodDecorator
```

##### `@Delete(path?, options?)`

Defines a DELETE endpoint.

```typescript
function Delete(path?: string, options?: HttpMethodOptions): MethodDecorator
```

##### `@Patch(path?, options?)`

Defines a PATCH endpoint.

```typescript
function Patch(path?: string, options?: HttpMethodOptions): MethodDecorator
```

##### `@Options(path?, options?)`

Defines an OPTIONS endpoint.

```typescript
function Options(path?: string, options?: HttpMethodOptions): MethodDecorator
```

##### `@All(path?, options?)`

Defines an endpoint that matches all HTTP methods.

```typescript
function All(path?: string, options?: HttpMethodOptions): MethodDecorator
```

### Dependency Injection Decorators

#### `@Service()`

Marks a class as a service that can be injected as a dependency.

```typescript
function Service(): ClassDecorator
```

**Example:**

```typescript
@Service()
class UserService {}
```

#### `@Module(options)`

Defines a module that organizes controllers, services, and other modules.

```typescript
function Module(options?: ModuleOptions): ClassDecorator
```

**Parameters:**

-   `options`: Module configuration options

**Example:**

```typescript
@Module({
	controllers: [UsersController],
	services: [UserService],
	imports: [AuthModule],
})
class AppModule {}
```

### Parameter Decorators

#### `@Body(data?)`

Extracts the request body or a specific property from it.

```typescript
function Body(data?: string): ParameterDecorator
```

**Parameters:**

-   `data`: Optional property name to extract from the body

**Example:**

```typescript
@Post()
createUser(@Body() userData: CreateUserDto) {}

@Post()
createUser(@Body('name') name: string) {}
```

#### `@Param(data?)`

Extracts route parameters.

```typescript
function Param(data?: string): ParameterDecorator
```

**Parameters:**

-   `data`: Optional parameter name to extract

**Example:**

```typescript
@Get(':id')
getUser(@Param('id') id: string) {}

@Get(':id')
getUser(@Param() params: Record<string, string>) {}
```

#### `@Query(data?)`

Extracts query string parameters.

```typescript
function Query(data?: string): ParameterDecorator
```

**Parameters:**

-   `data`: Optional query parameter name to extract

**Example:**

```typescript
@Get()
getUsers(@Query('page') page?: string) {}

@Get()
getUsers(@Query() query: Record<string, string>) {}
```

#### `@Header(data?)`

Extracts HTTP headers.

```typescript
function Header(data?: string): ParameterDecorator
```

**Parameters:**

-   `data`: Optional header name to extract

**Example:**

```typescript
@Get()
getProfile(@Header('authorization') auth: string) {}

@Get()
getProfile(@Header() headers: Record<string, string>) {}
```

#### `@Req()` / `@Request()`

Injects the full request object.

```typescript
function Req(): ParameterDecorator
function Request(): ParameterDecorator
```

**Example:**

```typescript
@Get()
getInfo(@Req() req: Request) {}
```

#### `@Res()` / `@Response()`

Injects the response object.

```typescript
function Res(): ParameterDecorator
function Response(): ParameterDecorator
```

**Example:**

```typescript
@Get()
getInfo(@Res() res: Response) {}
```

#### `@Ctx()` / `@Context()`

Injects the Hono context object.

```typescript
function Ctx(): ParameterDecorator
function Context(): ParameterDecorator
```

**Example:**

```typescript
@Get()
getInfo(@Ctx() ctx: Context) {}
```

#### `@Var(data)` / `@Variable(data)`

Extracts a variable from the context.

```typescript
function Var(data: string): ParameterDecorator
function Variable(data: string): ParameterDecorator
```

**Parameters:**

-   `data`: The variable name to extract from context

**Example:**

```typescript
@Get()
getCurrentUser(@Var('user') user: User) {}
```

### Component Decorators

#### `@UseMiddleware(...middleware)`

Applies middleware to a controller or method.

```typescript
function UseMiddleware(...middleware: MiddlewareType[]): ClassDecorator | MethodDecorator
```

**Parameters:**

-   `middleware`: Array of middleware classes or instances

**Example:**

```typescript
@UseMiddleware(LoggerMiddleware, AuthMiddleware)
@Controller('users')
class UsersController {
	@UseMiddleware(RateLimitMiddleware)
	@Get()
	getUsers() {}
}
```

#### `@UseGuards(...guards)`

Applies guards to a controller or method.

```typescript
function UseGuards(...guards: GuardType[]): ClassDecorator | MethodDecorator
```

**Parameters:**

-   `guards`: Array of guard classes or instances

**Example:**

```typescript
@UseGuards(AuthGuard, RoleGuard)
@Controller('admin')
class AdminController {
	@UseGuards(AdminGuard)
	@Get('users')
	getUsers() {}
}
```

#### `@UsePipes(...pipes)`

Applies pipes to a controller or method.

```typescript
function UsePipes(...pipes: PipeType[]): ClassDecorator | MethodDecorator
```

**Parameters:**

-   `pipes`: Array of pipe classes or instances

**Example:**

```typescript
@UsePipes(ValidationPipe, TransformPipe)
@Controller('users')
class UsersController {
	@UsePipes(CustomPipe)
	@Post()
	createUser(@Body() user: UserDto) {}
}
```

#### `@UseFilters(...filters)`

Applies exception filters to a controller or method.

```typescript
function UseFilters(...filters: FilterType[]): ClassDecorator | MethodDecorator
```

**Parameters:**

-   `filters`: Array of filter classes or instances

**Example:**

```typescript
@UseFilters(HttpExceptionFilter, ValidationExceptionFilter)
@Controller('users')
class UsersController {
	@UseFilters(CustomExceptionFilter)
	@Get()
	getUsers() {}
}
```

### MVC Decorators

#### `@View(route?, options?)`

Alias for `@Controller` with MVC naming.

```typescript
function View(route?: string, options?: ControllerOptions): ClassDecorator
```

#### `@Page(path?, options?)`

Alias for `@Get` with MVC naming.

```typescript
const Page = Get
```

#### `@MvcModule(options)`

Enhanced module decorator with view support.

```typescript
function MvcModule(options?: ModuleOptions & { views?: Constructor[] }): ClassDecorator
```

## Components

### Layout Component

#### `Layout(props)`

Creates a complete HTML document with SEO optimization and modern web standards.

```typescript
function Layout(props: PropsWithChildren<SiteData>): string
```

**Parameters:**

-   `props`: Layout configuration object

**Example:**

```typescript
const html = Layout({
	title: 'My App',
	description: 'A modern web application',
	children: '<h1>Hello World</h1>',
})
```

## Interfaces

### Application Interfaces

#### `HonestOptions`

Configuration options for the HonestJS application.

```typescript
interface HonestOptions {
	container?: DiContainer
	hono?: {
		strict?: boolean
		router?: any
		getPath?: (request: Request, options?: any) => string
	}
	routing?: {
		prefix?: string
		version?: number | typeof VERSION_NEUTRAL | number[]
	}
	components?: {
		middleware?: MiddlewareType[]
		guards?: GuardType[]
		pipes?: PipeType[]
		filters?: FilterType[]
	}
	plugins?: PluginType[]
	onError?: (error: Error, context: Context) => Response | Promise<Response>
	notFound?: (context: Context) => Response | Promise<Response>
}
```

#### `ControllerOptions`

Configuration options for controllers.

```typescript
interface ControllerOptions {
	prefix?: string | null
	version?: number | null | typeof VERSION_NEUTRAL | number[]
}
```

#### `HttpMethodOptions`

Configuration options for HTTP method decorators.

```typescript
interface HttpMethodOptions {
	prefix?: string | null
	version?: number | null | typeof VERSION_NEUTRAL | number[]
}
```

#### `ModuleOptions`

Configuration options for modules.

```typescript
interface ModuleOptions {
	controllers?: Constructor[]
	services?: Constructor[]
	imports?: Constructor[]
}
```

### Component Interfaces

#### `IMiddleware`

Interface for middleware classes.

```typescript
interface IMiddleware {
	use(c: Context, next: Next): Promise<Response | void>
}
```

#### `IGuard`

Interface for guard classes.

```typescript
interface IGuard {
	canActivate(context: Context): boolean | Promise<boolean>
}
```

#### `IPipe`

Interface for pipe classes.

```typescript
interface IPipe {
	transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> | unknown
}
```

#### `IFilter`

Interface for exception filter classes.

```typescript
interface IFilter {
	catch(exception: Error, context: Context): Promise<Response | undefined> | Response | undefined
}
```

#### `IPlugin`

Interface for plugin classes.

```typescript
interface IPlugin {
	beforeModulesRegistered?: (app: Application, hono: Hono) => void | Promise<void>
	afterModulesRegistered?: (app: Application, hono: Hono) => void | Promise<void>
}
```

### Dependency Injection Interfaces

#### `DiContainer`

Interface for dependency injection containers.

```typescript
interface DiContainer {
	resolve<T>(target: Constructor<T>): T
	register<T>(target: Constructor<T>, instance: T): void
}
```

### Route Interfaces

#### `RouteDefinition`

Definition of a route.

```typescript
interface RouteDefinition {
	path: string
	method: string
	handlerName: string | symbol
	parameterMetadata: ParameterMetadata[]
	version?: number | null | typeof VERSION_NEUTRAL | number[]
	prefix?: string | null
}
```

#### `RouteInfo`

Information about a registered route.

```typescript
interface RouteInfo {
	controller: string | symbol
	handler: string | symbol
	method: string
	prefix: string
	version?: string
	route: string
	path: string
	fullPath: string
	parameters: ParameterMetadata[]
}
```

#### `ParameterMetadata`

Metadata about a parameter.

```typescript
interface ParameterMetadata {
	index: number
	name: string
	data?: any
	factory: (data: any, ctx: Context) => any
	metatype?: Constructor<unknown>
}
```

#### `ArgumentMetadata`

Metadata about an argument for pipes.

```typescript
interface ArgumentMetadata {
	type: 'body' | 'query' | 'param' | 'custom'
	metatype?: Constructor<unknown>
	data?: string
}
```

### Error Interfaces

#### `ErrorResponse`

Standard error response format.

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

### Layout Interfaces

#### `SiteData`

Configuration for the Layout component.

```typescript
interface SiteData {
	title: string
	description?: string
	image?: string
	url?: string
	locale?: string
	type?: string
	siteName?: string
	customMeta?: MetaTag[]
	scripts?: (string | ScriptOptions)[]
	stylesheets?: string[]
	favicon?: string
	twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
	csp?: string
	htmlAttributes?: HtmlAttributes
	headAttributes?: HtmlAttributes
	bodyAttributes?: HtmlAttributes
}
```

#### `MetaTag`

Custom meta tag configuration.

```typescript
interface MetaTag {
	property: string
	content: string
	name?: string
	prefix?: string
}
```

#### `HtmlAttributes`

HTML attributes configuration.

```typescript
type HtmlAttributes = Record<string, string | number | boolean>
```

## Types

### `Constructor<T>`

Type for class constructors.

```typescript
type Constructor<T = any> = new (...args: any[]) => T
```

### Component Types

#### `MiddlewareType`

Type for middleware classes or instances.

```typescript
type MiddlewareType = Constructor<IMiddleware> | IMiddleware
```

#### `GuardType`

Type for guard classes or instances.

```typescript
type GuardType = Constructor<IGuard> | IGuard
```

#### `PipeType`

Type for pipe classes or instances.

```typescript
type PipeType = Constructor<IPipe> | IPipe
```

#### `FilterType`

Type for filter classes or instances.

```typescript
type FilterType = Constructor<IFilter> | IFilter
```

#### `PluginType`

Type for plugin classes or instances.

```typescript
type PluginType = Constructor<IPlugin> | IPlugin
```

## Constants

### `VERSION_NEUTRAL`

Symbol to use when marking a route as version-neutral.

```typescript
const VERSION_NEUTRAL = Symbol('VERSION_NEUTRAL')
```

**Usage:**

```typescript
@Controller('health', { version: VERSION_NEUTRAL })
class HealthController {
	@Get('status')
	getStatus() {
		// Accessible at both /health/status and /v1/health/status
	}
}
```

## Utilities

### Helper Functions

#### `createParamDecorator(type, factory?)`

Creates a custom parameter decorator.

```typescript
function createParamDecorator<T = any>(
	type: string,
	factory?: (data: any, ctx: Context) => T
): (data?: any) => ParameterDecorator
```

**Parameters:**

-   `type`: The type identifier for the parameter
-   `factory`: Optional function to transform the parameter value

**Example:**

```typescript
export const CurrentUser = createParamDecorator('user', (_, ctx) => {
	const token = ctx.req.header('authorization')?.replace('Bearer ', '')
	return token ? decodeJWT(token) : null
})
```

#### `createHttpMethodDecorator(method)`

Creates an HTTP method decorator.

```typescript
function createHttpMethodDecorator(method: string): (path?: string, options?: HttpMethodOptions) => MethodDecorator
```

**Parameters:**

-   `method`: The HTTP method name

**Example:**

```typescript
const CustomGet = createHttpMethodDecorator('get')
```

#### `createErrorResponse(exception, context, options?)`

Creates a standardized error response.

```typescript
function createErrorResponse(
	exception: Error,
	context: Context,
	options?: {
		status?: number
		title?: string
		detail?: string
		code?: string
		additionalDetails?: Record<string, any>
	}
): { response: ErrorResponse; status: ContentfulStatusCode }
```

### Utility Functions

#### `isConstructor(val)`

Checks if a value is a constructor function.

```typescript
function isConstructor(val: unknown): boolean
```

#### `isObject(val)`

Checks if a value is an object.

```typescript
function isObject(val: unknown): val is Record<PropertyKey, unknown>
```

#### `isFunction(val)`

Checks if a value is a function.

```typescript
function isFunction(val: unknown): val is Function
```

#### `isString(val)`

Checks if a value is a string.

```typescript
function isString(val: unknown): val is string
```

#### `isNumber(val)`

Checks if a value is a number.

```typescript
function isNumber(val: unknown): val is number
```

#### `normalizePath(path?)`

Normalizes a path string.

```typescript
function normalizePath(path?: string): string
```

#### `addLeadingSlash(path?)`

Adds a leading slash to a path if it doesn't have one.

```typescript
function addLeadingSlash(path?: string): string
```

#### `stripEndSlash(path)`

Removes the trailing slash from a path.

```typescript
function stripEndSlash(path: string): string
```

This API reference provides comprehensive documentation for all the features and functionality available in HonestJS. For more detailed examples and usage patterns, refer to the individual documentation sections.
