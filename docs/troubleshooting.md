# Troubleshooting

This page documents known edge cases, common error messages, and their fixes. Each entry follows a
**symptom / cause / fix** format. For quick answers, see the [FAQ](./faq.md).

## Startup & Configuration

### "Strict mode: no routes were registered"

**Symptom:** Application fails to start with a strict-mode error.

**Cause:** You enabled `strict: { requireRoutes: true }` but the registered modules have no controllers with HTTP method
decorators (`@Get()`, `@Post()`, etc.).

**Fix:** Add at least one controller with a route handler, or disable strict mode if the app intentionally has no HTTP
routes (for example, a cron-only worker).

---

### No "Application startup failed" log appears

**Symptom:** The app fails during `Application.create` but you don't see structured error logs.

**Cause:** Debug logging is not enabled.

**Fix:** Enable `debug: true` (or `debug: { startup: true }`) and optionally `startupGuide: true` for actionable hints.

```typescript
const { app, hono } = await Application.create(AppModule, {
	debug: { startup: true },
	startupGuide: { verbose: true }
})
```

---

### `debug: { routes: true }` logs startup messages even with `startup: false`

**Symptom:** You see startup-category log messages ("Application registered N route(s)", "Application startup completed")
even though `debug: { startup: false }`.

**Cause:** The `routes` debug flag is coupled with startup logging internally — route registration happens during
startup, so enabling route diagnostics also enables startup-level messages.

**Fix:** This is expected behavior. If you need only per-controller route logs without startup summaries, there is
currently no way to fully suppress them when `routes: true`.

---

### Non-object options silently become `{}`

**Symptom:** Passing something other than a plain object as `HonestOptions` (for example, `null`, a string, or an array)
doesn't throw an error, but all configuration is ignored.

**Cause:** The framework replaces non-object options with `{}` silently.

**Fix:** Always pass a plain JavaScript object for `HonestOptions`.

---

## Dependency Injection

### "Cannot resolve dependency at index N... Use concrete class types"

**Symptom:** DI throws when trying to resolve a service or controller constructor.

**Cause:** The constructor parameter at the specified index is typed as an interface, a primitive, `Object`, or the type
information is missing.

**Fix:**

1. Use a concrete class type for every constructor parameter
2. Verify `emitDecoratorMetadata: true` in your `tsconfig.json`
3. Verify `import 'reflect-metadata'` appears at the top of your entry file

```typescript
// Will fail
constructor(private svc: IMyService) {}

// Works
constructor(private svc: MyService) {}
```

---

### "not decorated with @Service()"

**Symptom:** DI throws when resolving a dependency.

**Cause:** The class is used as a constructor dependency but doesn't have the `@Service()` decorator.

**Fix:** Add `@Service()` to the class and ensure it's listed in the module's `services` array.

---

### "Circular dependency detected: A -> B -> A"

**Symptom:** DI throws during service resolution.

**Cause:** Two or more services depend on each other through their constructors, forming a cycle.

**Fix:** Break the cycle by:

- Extracting shared logic into a third service
- Using a facade or mediator pattern
- Deferring heavy work out of constructors (the container resolves eagerly)

---

### "constructor metadata is missing"

**Symptom:** DI cannot read constructor parameter types.

**Cause:** `reflect-metadata` is not imported, or `emitDecoratorMetadata` is not enabled in `tsconfig.json`.

**Fix:**

1. `bun add reflect-metadata` (if not installed)
2. Add to entry file: `import 'reflect-metadata'` as the very first import
3. Ensure `tsconfig.json` has:

```json
{
	"compilerOptions": {
		"experimentalDecorators": true,
		"emitDecoratorMetadata": true
	}
}
```

---

### Service construction error fails the entire module

**Symptom:** One service throwing in its constructor prevents the whole module from registering.

**Cause:** The DI container resolves all services in a module eagerly during `registerModule`. If any constructor throws,
the module registration fails.

**Fix:** Keep service constructors lightweight. Defer heavy initialization (database connections, file I/O) to methods
called after bootstrap, or move them into plugin `beforeModulesRegistered` hooks.

---

## Routing & Versioning

### "is not decorated with @Controller()"

**Symptom:** Startup fails when registering modules.

**Cause:** A class is listed in the module's `controllers` array but doesn't have the `@Controller()` decorator.

**Fix:** Add `@Controller()` to the class, or remove it from the `controllers` array.

---

### "has no route handlers"

**Symptom:** Startup warns or fails (with `startupGuide`) about a controller.

**Cause:** The controller class has `@Controller()` but no methods decorated with `@Get()`, `@Post()`, etc.

**Fix:** Add at least one HTTP method decorator to a method in the controller.

---

### "Duplicate route detected: METHOD path (Controller.handler)"

**Symptom:** Two handlers resolve to the same HTTP method + full path.

**Cause:** After combining global prefix, version, controller route, and handler path, two handlers produce identical
routes.

**Fix:** Change the path, prefix, or version on one of the conflicting handlers.

---

### "Invalid path: expected a string..."

**Symptom:** Route registration fails with a type error.

**Cause:** A non-string value was passed as the path argument to `@Controller()` or an HTTP method decorator.

**Fix:** Ensure all route paths are strings.

---

### `VERSION_NEUTRAL` creates extra route entries {#version-neutral}

**Symptom:** `app.getRoutes()` returns more entries than expected for `VERSION_NEUTRAL` handlers.

**Cause:** `VERSION_NEUTRAL` registers the handler at multiple Hono paths: the unversioned path, and a parameterized
version path (`/:version{v[0-9]+}/...`). This means a single handler can produce 2+ `RouteInfo` entries.

**Fix:** This is expected behavior. When filtering `getRoutes()`, account for multiple entries per handler. Don't rely on
a 1:1 mapping between handlers and route entries when using `VERSION_NEUTRAL`.

---

### Multiple version array creates one route per version

**Symptom:** `@Controller('users', { version: [1, 2, 3] })` registers three separate routes.

**Cause:** The route manager loops over each version in the array and registers independently. Duplicate detection still
applies across the full route graph.

**Fix:** Plan your version arrays carefully to avoid collisions with other controllers.

---

## Parameters & Pipeline

### "Invalid parameter decorator metadata for Controller.handler"

**Symptom:** Request fails with an internal error about parameter metadata.

**Cause:** A custom parameter decorator has invalid metadata — typically the `factory` property is not a function.

**Fix:** Verify your custom decorator implementation. When using `createParamDecorator`, ensure the factory function is
valid:

```typescript
const CurrentUser = createParamDecorator('user', (_, ctx) => {
	const token = ctx.req.header('authorization')?.replace('Bearer ', '')
	return token ? decodeJWT(token) : null
})
```

---

### "Potential parameter binding mismatch" warning

**Symptom:** With `debug: { pipeline: true }`, you see a warning about parameter binding.

**Cause:** The decorator metadata indices are sparse or the maximum index exceeds the handler's actual parameter count.

**Fix:** Ensure every decorated parameter in a handler aligns with the actual method signature. The runtime still
proceeds, but the warning indicates a likely bug.

---

### Exception filter throws while handling an error

**Symptom:** You see `"Error in exception filter..."` in logs and get an unexpected JSON error response.

**Cause:** The exception filter itself threw an error during its `catch` method.

**Fix:** Keep filter logic minimal and defensive. Wrap risky operations in try/catch within the filter:

```typescript
class SafeFilter implements IFilter {
	async catch(exception: Error, context: Context) {
		try {
			return context.json({ error: exception.message }, 500)
		} catch {
			return context.json({ error: 'Internal Server Error' }, 500)
		}
	}
}
```

---

## Metadata & Application Isolation

### Post-bootstrap metadata changes don't affect running app

**Symptom:** Adding or modifying decorators/metadata after `Application.create` has no effect on route handling.

**Cause:** Each `Application.create` captures an immutable metadata snapshot at startup. The running app uses this
snapshot, not the live global `MetadataRegistry`.

**Fix:** This is by design for safety. If you need different metadata, create a new application instance. To change
routes, restart the app.

---

### Cross-test pollution with multiple `Application.create` calls

**Symptom:** Tests interfere with each other — routes or services from one test appear in another.

**Cause:** The global `MetadataRegistry` is shared across all `Application.create` calls in the same process. Decorator
side effects (from importing decorated classes) persist.

**Fix:** Call `MetadataRegistry.clear()` in `afterEach`:

```typescript
import { MetadataRegistry } from 'honestjs'

afterEach(() => {
	MetadataRegistry.clear()
})
```

---

## Plugins

### `AnonymousPlugin#N` appears in debug logs

**Symptom:** With `debug: { plugins: true }`, plugin names show as `AnonymousPlugin#1`, `AnonymousPlugin#2`, etc.

**Cause:** The plugin is an anonymous object without a `meta.name` or class constructor name.

**Fix:** Give your plugin a name via any of these methods:

```typescript
// Option 1: wrapped entry with name
plugins: [{ plugin: myPlugin, name: 'my-plugin' }]

// Option 2: meta.name on the plugin object
class MyPlugin implements IPlugin {
  meta = { name: 'my-plugin' }
}

// Option 3: use a named class (constructor name is used automatically)
class MyPlugin implements IPlugin { ... }
```

---

### RPC + ApiDocs: "no artifact at context key 'rpc.artifact'"

**Symptom:** `GET /openapi.json` returns a 500 error about a missing artifact.

**Cause:** The `ApiDocsPlugin` defaults to reading from the `rpc.artifact` context key, but:

- The `RPCPlugin` has `generateOnInit: false` and `analyze()` was never called, so no artifact was published
- Or the `RPCPlugin` is listed **after** `ApiDocsPlugin` in the plugins array

**Fix:**

1. Ensure `RPCPlugin` is listed **before** `ApiDocsPlugin` in `options.plugins`
2. If using `generateOnInit: false`, call `await rpcPlugin.analyze()` before the API docs route is hit
3. Or pass a direct `artifact` object to `ApiDocsPlugin`

---

### RPC strict mode throws on schema/route warnings

**Symptom:** `RPCPlugin` throws `"Configuration validation failed"` or transform-stage errors.

**Cause:** `mode: 'strict'` combined with `failOnSchemaError: true` or `failOnRouteAnalysisWarning: true` causes the
plugin to throw on any schema or route analysis warning.

**Fix:** Fix the underlying schema/route issues, or relax to `mode: 'best-effort'` / disable the `failOn*` flags
during development.

---

### Unsupported `artifactVersion`

**Symptom:** `ApiDocsPlugin` throws `"unsupported artifactVersion"`.

**Cause:** The artifact passed to `ApiDocsPlugin` has an `artifactVersion` other than `"1"`.

**Fix:** Use the `artifactVersion: "1"` contract. If generating artifacts manually, ensure the version field matches.

---

## CLI

### "Templates not found. Run without --offline first"

**Symptom:** `honestjs new --offline` or `honestjs list --offline` fails.

**Cause:** The template cache is empty. The CLI needs to download templates at least once before offline mode works.

**Fix:** Run `honestjs list` or `honestjs new` once with network access, then use `--offline` for subsequent runs. You
can also force a cache refresh with `--refresh-templates`.

---

### "File already exists... Use --force"

**Symptom:** `honestjs generate` refuses to create a file.

**Cause:** The target file already exists and the CLI won't overwrite by default.

**Fix:** Pass `--force` to overwrite:

```bash
honestjs g controller user --force
```

---

### "Could not find CLI package.json"

**Symptom:** CLI commands fail with a package.json resolution error.

**Cause:** The CLI can't locate its own `package.json`, usually because of an unusual installation path or broken
symlink.

**Fix:** Reinstall the CLI globally:

```bash
bun add -g @honestjs/cli
```

---

### `doctor` fails on Node.js &lt; 18

**Symptom:** `honestjs doctor` reports a runtime check failure.

**Cause:** HonestJS requires Node.js 18 or later.

**Fix:** Upgrade to Node.js 18+ or use Bun (recommended).
