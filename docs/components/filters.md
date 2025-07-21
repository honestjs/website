# Filters

Exception filters provide a mechanism for handling unhandled exceptions that occur during the request-response cycle. They allow you to catch specific types of errors and send a customized response to the client.

By default, HonestJS includes a built-in global exception filter that handles standard `Error` objects and `HttpException`s from Hono. However, you can create custom filters to handle specific error cases.

## Creating an Exception Filter

An exception filter is a class that implements the `IFilter` interface. This interface has a `catch` method that receives the exception and the Hono `Context`.

```typescript
interface IFilter<T = any> {
	catch(exception: T, context: Context): void | Promise<void>
}
```

-   `exception`: The exception object that was thrown.
-   `context`: The Hono `Context` object.

The `catch` method is responsible for handling the exception and sending a response to the client.

**Example:** A custom filter for a `NotFoundException`.

```typescript
import { IFilter } from 'honestjs'
import { Context } from 'hono'
import { NotFoundException } from 'http-essentials'

export class NotFoundExceptionFilter implements IFilter<NotFoundException> {
	catch(exception: NotFoundException, context: Context) {
		if (exception instanceof NotFoundException) {
			context.status(404)
			return context.json({
				statusCode: 404,
				message: 'The requested resource was not found.',
				error: 'Not Found',
				timestamp: new Date().toISOString(),
				path: context.req.path,
			})
		}
	}
}
```

This filter specifically catches a `NotFoundException` and returns a formatted 404 response.

## Applying Filters

Filters can be applied at the global, controller, or handler level using the `@UseFilters()` decorator.

### Global Filters

Global filters are ideal for handling common exceptions across an entire application.

```typescript
const { hono } = await Application.create(AppModule, {
	components: {
		filters: [new NotFoundExceptionFilter()],
	},
})
```

### Controller- and Handler-Level Filters

You can also apply filters to a specific controller or route handler, which is useful for handling exceptions specific to a particular part of your application.

```typescript
import { Controller, Get, UseFilters } from 'honestjs'
import { CustomExceptionFilter } from './filters/custom.filter'

@Controller('/special')
@UseFilters(CustomExceptionFilter)
export class SpecialController {
	@Get()
	doSomethingSpecial() {
		// If this handler throws a CustomException, it will be caught by the CustomExceptionFilter.
	}
}
```

## How It Works

When an unhandled exception is thrown during the request lifecycle, the HonestJS exception handling mechanism takes over. It searches for a suitable filter to handle the exception, starting at the handler level, then moving to the controller level, and finally checking for global filters.

The first filter that matches the exception type is used to handle the exception. If no specific filter is found, the default global exception filter is used.

Using exception filters allows you to centralize error handling logic and provide consistent, well-formatted error responses.
