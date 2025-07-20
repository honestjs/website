# Dependency Injection in HonestJS

HonestJS includes a simple and effective dependency injection (DI) container that manages the instantiation of your classes and their dependencies. This allows you to write loosely coupled, testable, and maintainable code.

## Core Concepts

The DI system is built around a few key concepts:

-   **Providers:** These are classes that can be "provided" by the DI container. In HonestJS, the most common providers are **Services**, but any class decorated with `@Service()` can be a provider.
-   **Consumers:** These are classes that consume providers. **Controllers** are the most common consumers.
-   **Injection:** This is the process of providing an instance of a dependency to a consumer. HonestJS primarily uses **constructor injection**.
-   **Container:** The DI container manages the lifecycle of all providers and handles dependency resolution.

## Services

Services are the primary candidates for dependency injection. They are typically used to encapsulate business logic, data access, or other concerns. To define a service, use the `@Service()` decorator.

**Example:**

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

The `@Service()` decorator marks the `AppService` class as a provider that can be managed by the DI container.

## Constructor Injection

To inject a service into a controller (or another service), you simply declare it as a parameter in the consumer's constructor.

**Example:**

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

When the `AppController` is instantiated, the DI container will:

1. See that `AppController` has a dependency on `AppService`.
2. Look for an existing instance of `AppService`.
3. If no instance exists, it will create a new one.
4. It will then pass the `AppService` instance to the `AppController` constructor.

## How it Works

HonestJS's DI container maintains a map of class constructors to their instances. When a class is resolved:

-   If an instance already exists in the container (i.e., it's a singleton), it's returned immediately.
-   If not, the container inspects the constructor's parameter types using `reflect-metadata`.
-   It then recursively resolves each dependency.
-   Finally, it creates a new instance of the class with the resolved dependencies and stores it for future use.

## Service Registration

Services are automatically registered when you use the `@Service()` decorator. However, you can also register them explicitly in your modules:

```typescript
import { Module } from 'honestjs'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { DatabaseService } from './database.service'

@Module({
	controllers: [UsersController],
	services: [UsersService, DatabaseService],
})
class UsersModule {}
```

## Complex Dependency Chains

The DI container can handle complex dependency chains automatically:

```typescript
import { Service } from 'honestjs'

@Service()
class DatabaseService {
	connect() {
		console.log('Database connected')
	}
}

@Service()
class LoggerService {
	log(message: string) {
		console.log(`[LOG] ${message}`)
	}
}

@Service()
class UserRepository {
	constructor(private readonly database: DatabaseService, private readonly logger: LoggerService) {}

	findAll() {
		this.logger.log('Finding all users')
		this.database.connect()
		return ['user1', 'user2']
	}
}

@Service()
class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	getUsers() {
		return this.userRepository.findAll()
	}
}

@Controller('users')
class UsersController {
	constructor(private readonly userService: UserService) {}

	@Get()
	getUsers() {
		return this.userService.getUsers()
	}
}
```

In this example, when `UsersController` is instantiated, the container will:

1. Resolve `UserService`
2. Resolve `UserRepository` (dependency of `UserService`)
3. Resolve `DatabaseService` and `LoggerService` (dependencies of `UserRepository`)
4. Create all instances in the correct order
5. Inject them into their respective constructors

## Custom Container

You can provide a custom DI container if you need special functionality:

```typescript
import type { DiContainer } from 'honestjs'
import type { Constructor } from 'honestjs'

class CustomContainer implements DiContainer {
	private instances = new Map<Constructor, any>()

	resolve<T>(target: Constructor<T>): T {
		if (this.instances.has(target)) {
			return this.instances.get(target)
		}

		// Custom resolution logic
		const instance = new target()
		this.instances.set(target, instance)
		return instance
	}

	register<T>(target: Constructor<T>, instance: T): void {
		this.instances.set(target, instance)
	}
}

const { app, hono } = await Application.create(AppModule, {
	container: new CustomContainer(),
})
```

## Service Lifecycle

### Singleton Scope

By default, all registered providers are singletons. This means that the same instance of a service is shared across the entire application:

```typescript
@Service()
class CounterService {
	private count = 0

	increment() {
		return ++this.count
	}

	getCount() {
		return this.count
	}
}

@Controller('counter1')
class CounterController1 {
	constructor(private counter: CounterService) {}

	@Get('increment')
	increment() {
		return { count: this.counter.increment() }
	}
}

@Controller('counter2')
class CounterController2 {
	constructor(private counter: CounterService) {}

	@Get('count')
	getCount() {
		return { count: this.counter.getCount() }
	}
}
```

In this example, both controllers share the same `CounterService` instance, so the count will be shared between them.

## Error Handling

### Circular Dependencies

The container can detect and throw an error for circular dependencies:

```typescript
@Service()
class ServiceA {
	constructor(private serviceB: ServiceB) {}
}

@Service()
class ServiceB {
	constructor(private serviceA: ServiceA) {} // This will throw an error
}
```

Error message: `Circular dependency detected: ServiceA -> ServiceB -> ServiceA`

### Missing Dependencies

If a dependency cannot be resolved, the container will throw a clear error:

```typescript
@Controller('users')
class UsersController {
	constructor(private userService: UserService) {} // Error if UserService is not registered
}
```

## Best Practices

### 1. Use Constructor Injection

Prefer constructor injection over property injection:

```typescript
// ✅ Good
@Controller('users')
class UsersController {
	constructor(private readonly userService: UserService) {}
}

// ❌ Avoid
@Controller('users')
class UsersController {
	@Inject()
	private userService: UserService
}
```

### 2. Keep Services Focused

Each service should have a single responsibility:

```typescript
// ✅ Good - Single responsibility
@Service()
class UserService {
	async findById(id: string) {
		// User-specific logic
	}
}

@Service()
class EmailService {
	async sendEmail(to: string, subject: string) {
		// Email-specific logic
	}
}

// ❌ Avoid - Multiple responsibilities
@Service()
class UserService {
	async findById(id: string) {
		// User logic
	}

	async sendEmail(to: string, subject: string) {
		// Email logic - should be in EmailService
	}
}
```

### 3. Use Interfaces for Better Testability

Define interfaces for your services to make them easier to test:

```typescript
interface IUserService {
	findById(id: string): Promise<User>
	create(user: CreateUserDto): Promise<User>
}

@Service()
class UserService implements IUserService {
	async findById(id: string): Promise<User> {
		// Implementation
	}

	async create(user: CreateUserDto): Promise<User> {
		// Implementation
	}
}

@Controller('users')
class UsersController {
	constructor(private readonly userService: IUserService) {}
}
```

### 4. Avoid Circular Dependencies

Design your services to avoid circular references:

```typescript
// ✅ Good - No circular dependency
@Service()
class UserService {
	async findById(id: string) {
		// User logic
	}
}

@Service()
class PostService {
	constructor(private userService: UserService) {}

	async findByUserId(userId: string) {
		// Post logic that uses UserService
	}
}

// ❌ Avoid - Circular dependency
@Service()
class UserService {
	constructor(private postService: PostService) {}
}

@Service()
class PostService {
	constructor(private userService: UserService) {}
}
```

### 5. Use Module Organization

Organize your services into logical modules:

::: code-group

```typescript [modules/users/users.module.ts]
@Module({
	controllers: [UsersController],
	services: [UserService, UserRepository],
})
class UsersModule {}
```

```typescript [modules/posts/posts.module.ts]
@Module({
	controllers: [PostsController],
	services: [PostService, PostRepository],
})
class PostsModule {}
```

```typescript [app.module.ts]
@Module({
	imports: [UsersModule, PostsModule],
	services: [DatabaseService, LoggerService],
})
class AppModule {}
```

:::

## Type Limitations

The DI system relies on TypeScript's `emitDecoratorMetadata` feature, which uses `reflect-metadata`. This works well for classes, but it has a limitation: you cannot inject a dependency using an interface as a type hint, because interfaces do not exist at runtime.

```typescript
// ❌ This won't work
@Controller('users')
class UsersController {
	constructor(private userService: IUserService) {} // Interface not available at runtime
}

// ✅ This works
@Controller('users')
class UsersController {
	constructor(private userService: UserService) {} // Class is available at runtime
}
```

By following these principles, you can build robust and well-structured applications with clear separation of concerns and excellent testability.
