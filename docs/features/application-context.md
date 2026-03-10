# Application context

The application context is a small, typed key-value store on the HonestJS
`Application` instance. It is available to **your entire application**-bootstrap
code, services, plugins, and any code that has access to `app`. Use it to
publish and read pipeline data by key without hard coupling between producers
and consumers.

## Honest application context vs Hono request context

Do not confuse Honest’s **application context** with Hono’s **request context**:

|                 | Honest application context                                           | Hono request context                                                      |
| --------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **What**        | Key-value store on `Application`                                     | Per-request object (request, response, env, variables)                    |
| **Scope**       | **App lifetime** - one instance for the whole application            | **Per request** - a new context for each HTTP request                     |
| **Access**      | `app.getContext()` - requires the `app` instance                     | `@Ctx()` / `@Context()` in handlers - Hono injects it per request         |
| **Typical use** | Pipeline data, build-time/config, artifact sharing between app steps | Current request/response, auth user for this request, request-scoped data |
| **Example**     | `app.getContext().set('app.config', config)`                         | `c.req.path`, `c.json(...)`, `c.set('user', user)` for this request only  |

- **Use Honest application context** when you need app-wide or startup/shared
  data (e.g. config, generated specs, artifacts) that outlives any single
  request.
- **Use Hono request context** when you need the current request, response, or
  data that is specific to one request (e.g. the logged-in user for that
  request).

## Why use it?

- **Flexible**: Any part of the app can produce or consume data. Producers and
  consumers stay decoupled; no direct dependencies between them.
- **Composable**: Multiple consumers can read the same value; multiple producers
  can write. New keys can be introduced without changing Honest core.
- **Future-proof**: New keys and types (e.g. `rpc.artifact`, `openapi.spec`,
  `graphql.schema`) don't require framework changes. You version and document
  key contracts in your app.

## API

Access the context from the application instance:

```typescript
const { app, hono } = await Application.create(AppModule);

const ctx = app.getContext();
```

The context implements a simple store:

| Method                          | Description                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `get<T>(key: string)`           | Get a value by key. Returns `T \| undefined`. Use the type parameter for type safety. |
| `set<T>(key: string, value: T)` | Set a value by key.                                                                   |
| `has(key: string)`              | Check if a key exists.                                                                |
| `delete(key: string)`           | Remove a key. Returns `true` if the key existed.                                      |
| `keys()`                        | Iterate over all keys.                                                                |

## Usage in application code

After creating the app, you can store and retrieve data from anywhere that has
the `app` reference:

```typescript
const { app, hono } = await Application.create(AppModule);

// Store build-time or config data
app.getContext().set("app.config", {
  env: process.env.NODE_ENV,
  version: "1.0.0",
});

// Later, from anywhere that has app
const config = app.getContext().get<{ env: string; version: string }>(
  "app.config",
);
```

## Key conventions

- **Namespaced keys**: Use a prefix to avoid collisions (e.g. `rpc.artifact`,
  `openapi.spec`, `graphql.schema`). Honest does not reserve or define key
  names.
- **Contracts**: The producer of a key owns its shape and version. Document the
  contract (type and meaning) in your app so consumers know what to expect.
- **Versioning**: You can version keys (e.g. `rpc.artifact.v1`) or document in
  prose; Honest core stays agnostic.

## Type safety

Values are stored as `unknown`. Callers get type safety by passing a type
argument to `get<T>(key)`:

```typescript
const data = app.getContext().get<{ id: string }>("my.key");
if (data) {
  // data is { id: string }
}
```

The runtime does not validate types; the type parameter is for TypeScript only.
