# Testing

HonestJS includes lightweight testing helpers to reduce setup boilerplate while keeping tests explicit.

## Available helpers

- `createTestingModule(options)` creates a dynamic module class for tests.
- `createTestApplication(options)` creates an Honest application and returns a convenience `request` helper.
- `createControllerTestApplication(options)` creates an app around one controller.
- `createServiceTestContainer(options)` creates a DI-only container harness for service tests.

## createTestingModule

Use this helper to build a module class without writing a dedicated `@Module()` file.

```typescript
import { createTestingModule } from 'honestjs'

const TestModule = createTestingModule({
	name: 'UsersTestModule',
	controllers: [UsersController],
	services: [UsersService],
	imports: [AuthModule]
})
```

## createTestApplication

Creates an app quickly and gives you `{ app, hono, request }`.

```typescript
import { createTestApplication } from 'honestjs'

const testApp = await createTestApplication({
	controllers: [UsersController],
	services: [UsersService],
	appOptions: {
		routing: { prefix: 'api', version: 1 }
	}
})

const res = await testApp.request('/api/v1/users')
```

The `request` helper supports:

- relative path strings (resolved against `http://localhost`)
- absolute URL strings
- `Request` objects

## createControllerTestApplication

Use this when you only need one controller in the test app.

```typescript
import { createControllerTestApplication } from 'honestjs'

const testApp = await createControllerTestApplication({
	controller: UsersController,
	services: [UsersService]
})

const res = await testApp.request('/users')
```

## createServiceTestContainer

Use this for fast service tests without HTTP bootstrap.

```typescript
import { createServiceTestContainer } from 'honestjs'

const harness = createServiceTestContainer({
	preload: [UsersService],
	overrides: [{ provide: UsersService, useValue: mockUsersService }]
})

const svc = harness.get(UsersService)
expect(harness.has(UsersService)).toBe(true)
```

`createServiceTestContainer` returns:

- `container`
- `get(target)`
- `register(target, instance)`
- `has(target)`
- `clear()`

## Notes

- The helpers are intentionally thin wrappers over core runtime behavior.
- They are suitable for unit and integration tests where you want low ceremony and predictable startup behavior.
