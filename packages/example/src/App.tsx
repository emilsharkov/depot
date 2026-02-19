import { useRef } from "react";
import {
  StorageStateHookBuilder,
  useStorageState,
  HashParamStorage,
} from "depot";

// Built hooks for each storage type
const useLocalStorageState = new StorageStateHookBuilder()
  .addLocalStorage()
  .build();
const useSessionStorageState = new StorageStateHookBuilder()
  .addSessionStorage()
  .build();
const useURLHashState = new StorageStateHookBuilder()
  .addStorage(new HashParamStorage())
  .build();
const useCookieStorageState = new StorageStateHookBuilder()
  .addCookieStorage({ prefix: "example_" })
  .build();

function StorageDemo({
  title,
  storageLabel,
  value,
  setValue,
  initialValue,
}: {
  title: string;
  storageLabel: string;
  value: string;
  setValue: (v: string) => void;
  initialValue: string;
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p style={{ color: "#666", fontSize: 14 }}>{storageLabel}</p>
      <p>
        Value: <code style={{ background: "#f0f0f0", padding: "2px 6px" }}>{value}</code>
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ padding: 8, fontSize: 14 }}
        />
        <button type="button" onClick={() => setValue(initialValue)}>
          Reset
        </button>
      </div>
    </section>
  );
}

function LocalStorageDemo() {
  const [theme, setTheme] = useLocalStorageState<string>("example-theme", "light");
  const [count, setCount] = useLocalStorageState<number>("example-count", 0);

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ marginTop: 0 }}>localStorage (multiple keys)</h2>
      <p style={{ color: "#666", fontSize: 14 }}>
        Persists across sessions and browser tabs
      </p>
      <div style={{ marginBottom: 16 }}>
        <p>Theme: <code>{theme}</code></p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setTheme("light")}>Light</button>
          <button onClick={() => setTheme("dark")}>Dark</button>
        </div>
      </div>
      <div>
        <p>Count: <code>{count}</code></p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    </section>
  );
}

function MultiStorageDemo() {
  const useMultiStorage = new StorageStateHookBuilder()
    .addLocalStorage()
    .addSessionStorage()
    .build();
  const [message, setMessage] = useMultiStorage<string>(
    "example-sync",
    "Shared across localStorage + sessionStorage"
  );

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ marginTop: 0 }}>Multi-storage sync</h2>
      <p style={{ color: "#666", fontSize: 14 }}>
        Writes to multiple storages; survives refresh and tab switch
      </p>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: 360, padding: 8, fontSize: 14 }}
      />
    </section>
  );
}

function useInMemoryStorage() {
  const ref = useRef<Storage | null>(null);
  if (!ref.current) {
    const store: Record<string, string> = {};
    ref.current = {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => { store[k] = v; },
      removeItem: (k) => { delete store[k]; },
      clear: () => Object.keys(store).forEach((k) => delete store[k]),
      key: (i) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length; },
    };
  }
  return ref.current;
}

function InMemoryDemo() {
  const storage = useInMemoryStorage();
  const [value, setValue] = useStorageState<string>(
    "in-memory-demo",
    "Ephemeral",
    storage
  );

  return (
    <StorageDemo
      title="In-memory (custom storage)"
      storageLabel="Does not persist; cleared on refresh"
      value={value}
      setValue={setValue}
      initialValue="Ephemeral"
    />
  );
}

export default function App() {
  const [local, setLocal] = useLocalStorageState("example-demo", "Hello");
  const [session, setSession] = useSessionStorageState("example-session", "Session");
  const [hash, setHash] = useURLHashState("demo", "Check URL hash");
  const [cookie, setCookie] = useCookieStorageState("demo", "Cookie value");

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h1>Depot Example</h1>
      <p>
        This app showcases the <code>depot</code> package: storage-backed React
        state with support for localStorage, sessionStorage, URL params, cookies,
        and custom storage.
      </p>

      <StorageDemo
        title="localStorage"
        storageLabel="Persists across sessions"
        value={local}
        setValue={setLocal}
        initialValue="Hello"
      />

      <StorageDemo
        title="sessionStorage"
        storageLabel="Persists until tab closes"
        value={session}
        setValue={setSession}
        initialValue="Session"
      />

      <StorageDemo
        title="URL hash"
        storageLabel="Stored in #... (shareable link)"
        value={hash}
        setValue={setHash}
        initialValue="Check URL hash"
      />

      <StorageDemo
        title="Cookie"
        storageLabel="Persists; sent with requests"
        value={cookie}
        setValue={setCookie}
        initialValue="Cookie value"
      />

      <LocalStorageDemo />
      <MultiStorageDemo />
      <InMemoryDemo />
    </div>
  );
}
