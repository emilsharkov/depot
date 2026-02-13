# depot

Synchronize React state with any amount of Browser `Storage` implementations across all your components

**Supports:**
- localStorage
- sessionStorage
- urlParamStorage (url query params)
- cookieStorage
- any custom adapter of `Storage` interface

## Installation

```bash
npm install depot
```

## Usage

### Single storage

```tsx
import { createStorageStateHookBuilder } from "depot";

const useLocalStorageState = createStorageStateHookBuilder()
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
const useURLParamLocalStorageState = createStorageStateHookBuilder()
  .addURLParamStorage()   // ?filters=... wins
  .addLocalStorage()
  .build();

const useProductFilters = () => {
  return useURLParamLocalSessionStorageState("filters", {
    category: "all",
    sort: "newest",
    view: "grid",
  });
}

function ProductList() {
  const [filters, setFilters] = useProductFilters();
  return (
    <select
      value={filters.sort}
      onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
    >
      <option value="newest">Newest</option>
      <option value="price">Price</option>
    </select>
  );
}
```

`/products?filters=...` (JSON-encoded) → URL. `/products` with no params → localStorage, then initial value.

### Cookies

Cookie options at build time (prefix, path, maxAge, secure, sameSite, domain):

```tsx
const usePrefs = createStorageStateHookBuilder()
  .addCookieStorage({ prefix: "app_", maxAge: 60 * 60 * 24 * 365 })
  .build();

const [theme, setTheme] = usePrefs("theme", "light");
```

Call-site options override build-time: `usePrefs("k", "v", { cookieStorage: { prefix: "other_" } })`.

### Custom Storage

```tsx
import { MyCustomStorage } from "depot";

const useMyState = createStorageStateHookBuilder()
  .addStorage(new MyCustomStorage())
  .build();
```

### Low-level

```tsx
import { useStorageState } from "depot";

const [value, setValue] = useStorageState("key", "initial", localStorage, sessionStorage);
```

`key` and `storages` must be stable (no changes after mount). Values are JSON-serialized.

### Advanced: useURLParams with React Router

When using React Router, pass `setSearchParams` from `useSearchParams()` so URL updates go through the router instead of raw `history.pushState`:

```tsx
import { useSearchParams } from "react-router-dom";
import { createStorageStateHookBuilder } from "depot";

const useURLParamStorageState = createStorageStateHookBuilder()
  .addURLParamStorage()
  .addLocalStorage()
  .build();

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useURLParamStorageState("filters", { sort: "newest" }, {
    urlParamStorage: { setSearchParams },
  });

  return (
    <select
      value={filters.sort}
      onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
    >
      <option value="newest">Newest</option>
      <option value="price">Price</option>
    </select>
  );
}
```

This keeps the URL in sync with React Router's history and enables features like `<Link>` navigation and `navigate()`.

## Dev

```bash
npm install && npm run build
npm run dev
npm run typecheck
npm run storybook
```
