import { describe, it, expect, beforeEach, vi } from "vitest";
import { getStorageValue, setStorageValue, getSnapshot } from "./storage";

describe("storage", () => {
  let mockStorage: Storage;

  beforeEach(() => {
    const store: Record<string, string> = {};
    mockStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => Object.keys(store).forEach((k) => delete store[k]),
      key: (index: number) => Object.keys(store)[index] ?? null,
      get length() {
        return Object.keys(store).length;
      },
    };
  });

  describe("getStorageValue", () => {
    it("returns null when key does not exist", () => {
      expect(getStorageValue(mockStorage, "missing")).toBeNull();
    });

    it("parses and returns JSON-serialized values", () => {
      mockStorage.setItem("key", JSON.stringify("hello"));
      expect(getStorageValue(mockStorage, "key")).toBe("hello");

      mockStorage.setItem("key", JSON.stringify(42));
      expect(getStorageValue(mockStorage, "key")).toBe(42);

      mockStorage.setItem("key", JSON.stringify({ a: 1, b: "two" }));
      expect(getStorageValue(mockStorage, "key")).toEqual({ a: 1, b: "two" });

      mockStorage.setItem("key", JSON.stringify([1, 2, 3]));
      expect(getStorageValue(mockStorage, "key")).toEqual([1, 2, 3]);
    });

    it("returns null for invalid JSON", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mockStorage.setItem("key", "not valid json{{{");
      expect(getStorageValue(mockStorage, "key")).toBeNull();
      vi.restoreAllMocks();
    });
  });

  describe("setStorageValue", () => {
    it("stores primitive values as JSON", () => {
      setStorageValue(mockStorage, "key", "hello");
      expect(mockStorage.getItem("key")).toBe(JSON.stringify("hello"));

      setStorageValue(mockStorage, "key", 42);
      expect(mockStorage.getItem("key")).toBe("42");
    });

    it("stores objects and arrays as JSON", () => {
      setStorageValue(mockStorage, "key", { foo: "bar" });
      expect(mockStorage.getItem("key")).toBe('{"foo":"bar"}');

      setStorageValue(mockStorage, "key", [1, 2, 3]);
      expect(mockStorage.getItem("key")).toBe("[1,2,3]");
    });

    it("removes item when value is null", () => {
      mockStorage.setItem("key", "value");
      setStorageValue(mockStorage, "key", null as unknown as never);
      expect(mockStorage.getItem("key")).toBeNull();
    });
  });

  describe("getSnapshot", () => {
    it("returns initialValue when no storage has the key", () => {
      const result = getSnapshot("key", "default", mockStorage);
      expect(result).toBe("default");
    });

    it("returns value from first storage that has the key", () => {
      const storage2: Storage = {
        ...mockStorage,
        getItem: () => null,
      };
      mockStorage.setItem("key", JSON.stringify("first"));
      const result = getSnapshot("key", "default", mockStorage, storage2);
      expect(result).toBe("first");
    });

    it("prefers first storage over later ones when both have values", () => {
      const storage2: Storage = {
        ...mockStorage,
        getItem: () => JSON.stringify("second"),
      };
      mockStorage.setItem("key", JSON.stringify("first"));
      const result = getSnapshot("key", "default", mockStorage, storage2);
      expect(result).toBe("first");
    });

    it("uses second storage when first returns null", () => {
      const storage2: Storage = {
        ...mockStorage,
        getItem: (k: string) => (k === "key" ? JSON.stringify("second") : null),
      };
      const result = getSnapshot("key", "default", mockStorage, storage2);
      expect(result).toBe("second");
    });
  });
});
