# depot

Synchronize React state with any amount of Browser `Storage` implementations across all your components.

**Supports:**
- localStorage
- sessionStorage
- urlParamStorage (url query params)
- cookieStorage
- any custom adapter of `Storage` interface

## Monorepo structure

```
depot/
├── packages/
│   ├── depot/      # The npm package
│   └── example/    # Example app showcasing the package
```

## Installation

```bash
npm install depot
```

## Usage

### Single storage

```tsx
import { StorageStateHookBuilder } from "depot";

const useLocalStorageState = new StorageStateHookBuilder()
  .addLocalStorage()
  .build();

function App() {
  const [name, setName] = useLocalStorageState("name", "guest");
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

### Multiple storages (order matters)

On initialization, we prioritize the first declared storages (in order or declaration in builder) when reading values. Then we synchronize the other storages with the highest priority storage or a default value if no storage is populated.
When writing to storages, we write to all of them.

```tsx
const useURLParamLocalStorageState = new StorageStateHookBuilder()
  .addURLParamStorage()   // ?filters=... wins
  .addLocalStorage()
  .build();

const useProductFilters = () => {
  return useURLParamLocalStorageState("filters", {
    category: "all",
    sort: "newest",
    view: "grid",
  });
}
```

### Cookies

Cookie options at build time (prefix, path, maxAge, secure, sameSite, domain):

```tsx
const usePrefs = new StorageStateHookBuilder()
  .addCookieStorage({ prefix: "app_", maxAge: 60 * 60 * 24 * 365 })
  .build();
```

### Custom Storage

```tsx
import { useStorageState } from "depot";

const [value, setValue] = useStorageState("key", "initial", localStorage, sessionStorage);
```

`key` and `storages` must be stable (no changes after mount). Values are JSON-serialized.

### Advanced: useURLParams with React Router

When using React Router, pass `setSearchParams` from `useSearchParams()` so URL updates go through the router instead of raw `history.pushState`:

```tsx
import { useSearchParams } from "react-router-dom";
import { StorageStateHookBuilder } from "depot";

const useURLParamStorageState = new StorageStateHookBuilder()
  .addURLParamStorage()
  .addLocalStorage()
  .build();

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useURLParamStorageState("filters", { sort: "newest" }, {
    urlParamStorage: { setSearchParams },
  });
  // ...
}
```

## Development

```bash
npm install
npm run build          # Build the depot package
npm run test:run       # Run tests
npm run typecheck      # Type check

# Example app (builds depot first, then starts Vite)
npm run example:dev    # http://localhost:5173
npm run example:build  # Build example for production
npm run example:preview # Preview production build
```

## Scripts

| Script | Description |
|--------|-------------|
| `build` | Build the depot package |
| `dev` | Watch mode for depot package |
| `test` / `test:run` | Run depot tests |
| `typecheck` | Type check depot |
| `example:dev` | Run example app (builds depot, then starts Vite) |
| `example:build` | Build example for production |
| `example:preview` | Preview example production build |
