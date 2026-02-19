import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { StorageStateHookBuilder } from "./StorageStateBuilder";

describe("StorageStateBuilder", () => {
  describe("build", () => {
    it("throws when no storage is added", () => {
      const builder = new StorageStateHookBuilder();
      expect(() => {
        builder.build();
      }).toThrow(/at least one storage backend is required/);
    });
  });

  describe("addLocalStorage + build", () => {
    let mockLocalStorage: Storage;

    beforeEach(() => {
      const store: Record<string, string> = {};
      mockLocalStorage = {
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
      vi.stubGlobal("localStorage", mockLocalStorage);
    });

    it("creates a hook that works with localStorage", () => {
      const useLocalStorageState = new StorageStateHookBuilder()
        .addLocalStorage()
        .build();

      const { result } = renderHook(() =>
        useLocalStorageState<string>("testKey", "initial")
      );

      expect(result.current[0]).toBe("initial");

      act(() => {
        result.current[1]("updated");
      });

      expect(result.current[0]).toBe("updated");
      expect(mockLocalStorage.getItem("testKey")).toBe(JSON.stringify("updated"));
    });
  });

  describe("custom storage + build", () => {
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

    it("creates a hook that uses custom storage", () => {
      const useCustomStorageState = new StorageStateHookBuilder()
        .addStorage(mockStorage)
        .build();

      const { result } = renderHook(() =>
        useCustomStorageState<string>("key", "default")
      );

      expect(result.current[0]).toBe("default");

      act(() => {
        result.current[1]("custom");
      });

      expect(result.current[0]).toBe("custom");
      expect(mockStorage.getItem("key")).toBe(JSON.stringify("custom"));
    });
  });

  describe("builder chain immutability (React lifecycle)", () => {
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
        clear: () => {},
        key: () => null,
        get length() {
          return Object.keys(store).length;
        },
      };
    });

    it("built hook maintains stable storage references across rerenders", () => {
      const useBuilt = new StorageStateHookBuilder()
        .addStorage(mockStorage)
        .build();

      const { result, rerender } = renderHook(() =>
        useBuilt<string>("stableKey", "initial")
      );

      act(() => {
        result.current[1]("first");
      });
      expect(result.current[0]).toBe("first");

      rerender();
      expect(result.current[0]).toBe("first");
    });
  });
});
