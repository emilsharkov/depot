import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CookieStorage } from "./CookieStorage";

describe("CookieStorage", () => {
  const originalDocumentCookie = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "cookie"
  )!;

  beforeEach(() => {
    let cookieStore = "";
    Object.defineProperty(document, "cookie", {
      get: () => cookieStore,
      set: (value: string) => {
        const [assignment] = value.split(";");
        const [name, ...valueParts] = assignment.split("=");
        const val = valueParts.join("=").trim();
        if (val === "" || val === "undefined") {
          cookieStore = cookieStore
            .split("; ")
            .filter((c) => !c.startsWith(name + "="))
            .join("; ");
        } else {
          cookieStore = cookieStore
            .split("; ")
            .filter((c) => !c.startsWith(name + "="))
            .concat([`${name}=${val}`])
            .join("; ");
        }
      },
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(document, "cookie", originalDocumentCookie);
  });

  describe("getItem / setItem", () => {
    it("stores and retrieves string values", () => {
      const storage = new CookieStorage();
      storage.setItem("key", "value");
      expect(storage.getItem("key")).toBe("value");
    });

    it("returns null for non-existent key", () => {
      const storage = new CookieStorage();
      expect(storage.getItem("missing")).toBeNull();
    });

    it("handles JSON string values", () => {
      const storage = new CookieStorage();
      const value = JSON.stringify({ a: 1, b: "two" });
      storage.setItem("key", value);
      expect(storage.getItem("key")).toBe(value);
    });
  });

  describe("removeItem", () => {
    it("removes existing item", () => {
      const storage = new CookieStorage();
      storage.setItem("key", "value");
      storage.removeItem("key");
      expect(storage.getItem("key")).toBeNull();
    });

    it("is idempotent for non-existent key", () => {
      const storage = new CookieStorage();
      expect(() => storage.removeItem("missing")).not.toThrow();
    });
  });

  describe("prefix option", () => {
    it("prefixes keys when prefix is set", () => {
      const storage = new CookieStorage({ prefix: "app_" });
      storage.setItem("theme", "dark");
      expect(storage.getItem("theme")).toBe("dark");
      expect(document.cookie).toContain("app_theme");
    });
  });

  describe("length and key", () => {
    it("returns correct length", () => {
      const storage = new CookieStorage();
      storage.setItem("a", "1");
      storage.setItem("b", "2");
      expect(storage.length).toBe(2);
    });

    it("key returns key at index", () => {
      const storage = new CookieStorage();
      storage.setItem("a", "1");
      storage.setItem("b", "2");
      expect(storage.key(0)).toBe("a");
      expect(storage.key(1)).toBe("b");
      expect(storage.key(2)).toBeNull();
    });
  });

  describe("clear", () => {
    it("removes all prefixed items", () => {
      const storage = new CookieStorage({ prefix: "depot_" });
      storage.setItem("a", "1");
      storage.setItem("b", "2");
      storage.clear();
      expect(storage.getItem("a")).toBeNull();
      expect(storage.getItem("b")).toBeNull();
    });
  });
});
