import type { Meta, StoryObj } from "@storybook/react";
import { useRef } from "react";
import { useStorageState } from "./useStorageState";
import { StorageStateHookBuilder } from "./StorageStateBuilder";

// Module-level mock storage so it persists across re-renders
const createMockStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => Object.keys(store).forEach((k) => delete store[k]),
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
};

const mockStorageInstances = new Map<string, Storage>();
const getMockStorage = (id: string): Storage => {
  if (!mockStorageInstances.has(id)) {
    mockStorageInstances.set(id, createMockStorage() as unknown as Storage);
  }
  return mockStorageInstances.get(id)!;
};

// Demo component that uses useStorageState with a mock storage
function StorageStateDemo({
  storageKey,
  initialValue,
  storageLabel,
  storageId,
}: {
  storageKey: string;
  initialValue: string;
  storageLabel?: string;
  storageId?: string;
}) {
  const id = storageId ?? storageKey;
  const storageRef = useRef<Storage | null>(null);
  if (!storageRef.current) {
    storageRef.current = getMockStorage(id);
  }

  const [value, setValue] = useStorageState(storageKey, initialValue, storageRef.current);

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <p>
        <strong>Key:</strong> {storageKey}
        {storageLabel && (
          <>
            {" "}
            <span style={{ color: "#666" }}>({storageLabel})</span>
          </>
        )}
      </p>
      <p>
        <strong>Value:</strong>{" "}
        <code style={{ background: "#f0f0f0", padding: "2px 6px" }}>
          {value}
        </code>
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ padding: 8, fontSize: 14, marginRight: 8 }}
      />
      <button
        type="button"
        onClick={() => setValue(initialValue)}
        style={{ padding: 8, fontSize: 14 }}
      >
        Reset to initial
      </button>
    </div>
  );
}

// Demo for built hook with localStorage
const useLocalStorageState = new StorageStateHookBuilder()
  .addLocalStorage()
  .build();

function LocalStorageDemo() {
  const [theme, setTheme] = useLocalStorageState("storybook-theme", "light");
  const [count, setCount] = useLocalStorageState("storybook-count", 0);

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h3>Theme (localStorage)</h3>
      <p>
        Value: <code>{theme}</code>
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTheme("light")}>Light</button>
        <button onClick={() => setTheme("dark")}>Dark</button>
        <button onClick={() => setTheme("system")}>System</button>
      </div>

      <h3>Count (localStorage)</h3>
      <p>
        Value: <code>{count}</code>
      </p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Demo for built hook with multiple storages
const useMultiStorageState = new StorageStateHookBuilder()
  .addLocalStorage()
  .addSessionStorage()
  .build();

function MultiStorageDemo() {
  const [message, setMessage] = useMultiStorageState(
    "storybook-message",
    "Shared across localStorage + sessionStorage"
  );

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h3>Multi-storage sync (localStorage + sessionStorage)</h3>
      <p>
        Persists across tabs (localStorage) and survives refresh (sessionStorage).
      </p>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: 400, padding: 8, fontSize: 14 }}
      />
    </div>
  );
}

const meta: Meta = {
  title: "Hooks/useStorageState",
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <StorageStateDemo
      storageKey="basic-demo"
      initialValue="Hello"
      storageId="basic-mock"
    />
  ),
};

export const WithInitialValue: Story = {
  render: () => (
    <StorageStateDemo
      storageKey="initial-demo"
      initialValue="Default text"
      storageLabel="mock storage"
      storageId="initial-mock"
    />
  ),
};

export const LocalStorage: Story = {
  render: () => <LocalStorageDemo />,
};

export const MultiStorage: Story = {
  render: () => <MultiStorageDemo />,
};
