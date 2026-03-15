# Pipes

Pipes are classes that can transform or validate incoming data before it reaches the route handler. They are particularly useful for handling Data Transfer Objects (DTOs) from request bodies, parameters, or queries.

A pipe must implement the `IPipe` interface, which has a single `transform` method.

```typescript
interface IPipe<T = any> {
	transform(value: T, metadata: ArgumentMetadata): any | Promise<any>
}
```

-   `value`: The incoming data from the request.
-   `metadata`: An object containing information about the parameter being processed, such as its type and the decorator used.

## Use Cases

Pipes have two main use cases:

1.  **Transformation:** Converting data from one form to another (e.g., converting a string ID to a number).
2.  **Validation:** Checking if incoming data meets certain criteria and throwing an exception if it does not.

## Official Pipes

HonestJS provides two pipe packages:

-   **`@honestjs/pipes`** – `PrimitiveValidationPipe` for automatic coercion of path/query params to `String`, `Number`, or `Boolean`.
-   **`@honestjs/class-validator-pipe`** – `ClassValidatorPipe` for validating and transforming DTOs with class-validator and class-transformer.

### PrimitiveValidationPipe

Use for path and query parameters. When you declare `@Param('id') id: number` or `@Query('page') page: number`, the pipe transforms string values to the expected primitive type.

```bash
bun add @honestjs/pipes
```

```typescript
import { Application } from 'honestjs'
import { PrimitiveValidationPipe } from '@honestjs/pipes'

const { hono } = await Application.create(AppModule, {
	components: {
		pipes: [new PrimitiveValidationPipe()]
	}
})
```

```typescript
@Controller('/users')
export class UsersController {
	@Get('/:id')
	async findOne(@Param('id') id: number) {
		// `id` is a number here (e.g. from /users/42)
		return this.usersService.findById(id)
	}

	@Get()
	async list(@Query('page') page: number, @Query('limit') limit: number) {
		// `page` and `limit` are numbers (e.g. ?page=1&limit=10)
		return this.usersService.findAll(page, limit)
	}
}
```

### ClassValidatorPipe

Use for request bodies and other DTOs. It validates plain objects against class-validator decorators and transforms them into class instances.

```bash
bun add @honestjs/class-validator-pipe class-validator class-transformer
```

```typescript
import { Application } from 'honestjs'
import { ClassValidatorPipe } from '@honestjs/class-validator-pipe'

const { hono } = await Application.create(AppModule, {
	components: {
		pipes: [new ClassValidatorPipe()]
	}
})
```

```typescript
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class CreateUserDto {
	@IsString()
	@MinLength(2)
	name: string

	@IsEmail()
	email: string

	@IsString()
	@IsOptional()
	bio?: string
}

@Controller('/users')
export class UsersController {
	@Post()
	async create(@Body() body: CreateUserDto) {
		// `body` is validated and transformed into a CreateUserDto instance
		return this.usersService.create(body)
	}
}
```

## Creating a Custom Pipe

### Transformation Example

Here is a simple custom pipe that transforms a string value into a number. You can register it globally or with `@UsePipes()`.

```typescript
import { IPipe, ArgumentMetadata } from 'honestjs'
import { BadRequestException } from 'http-essentials'

export class ParseIntPipe implements IPipe<string> {
	transform(value: string, metadata: ArgumentMetadata): number {
		const val = parseInt(value, 10)
		if (isNaN(val)) {
			throw new BadRequestException('Validation failed: not a number')
		}
		return val
	}
}
```

### Validation Example

A custom validation pipe using class-validator and class-transformer. For production, prefer `@honestjs/class-validator-pipe` which handles edge cases and options.

```typescript
import { IPipe, ArgumentMetadata } from 'honestjs'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { BadRequestException } from 'http-essentials'

export class ValidationPipe implements IPipe {
	async transform(value: any, { metatype }: ArgumentMetadata) {
		if (!metatype || !this.toValidate(metatype)) {
			return value
		}
		const object = plainToInstance(metatype, value)
		const errors = await validate(object)
		if (errors.length > 0) {
			throw new BadRequestException('Validation failed', { details: errors })
		}
		return object
	}

	private toValidate(metatype: Function): boolean {
		const types: Function[] = [String, Boolean, Number, Array, Object]
		return !types.includes(metatype)
	}
}
```

## Applying Pipes

Pipes are applied at the global, controller, or handler level. HonestJS does not support parameter-level pipes (e.g. `@Param('id', SomePipe)`). Use global or scoped pipes instead.

### Global Pipes

Global pipes run on all parameters for all routes. Register them when creating the application.

```typescript [src/main.ts]
import { Application } from 'honestjs'
import { PrimitiveValidationPipe } from '@honestjs/pipes'
import { ClassValidatorPipe } from '@honestjs/class-validator-pipe'

const { hono } = await Application.create(AppModule, {
	components: {
		pipes: [
			new PrimitiveValidationPipe(),
			new ClassValidatorPipe()
		]
	}
})
```

### Controller and Handler Pipes

Use `@UsePipes()` to apply pipes to a controller or a specific handler.

```typescript
import { Body, Controller, Get, Param, UsePipes } from 'honestjs'
import { PrimitiveValidationPipe } from '@honestjs/pipes'

@Controller('/users')
@UsePipes(new PrimitiveValidationPipe())
export class UsersController {
	@Get('/:id')
	async findOne(@Param('id') id: number) {
		return this.usersService.findById(id)
	}
}
```

## Execution Order

When multiple pipes are applied, they are executed in the following order:

1.  Global Pipes
2.  Controller-Level Pipes
3.  Handler-Level Pipes

If multiple pipes are applied at the same level (e.g. `@UsePipes(PipeA, PipeB)`), they run in the order listed. Each pipe's output becomes the next pipe's input.

Pipes are a powerful tool for creating robust and type-safe APIs, reducing boilerplate code in route handlers.
