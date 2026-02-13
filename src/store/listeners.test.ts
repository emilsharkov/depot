import { describe, it, expect, vi } from "vitest";
import { subscribe, publish } from "./listeners";

describe("listeners", () => {
  describe("subscribe", () => {
    it("calls listener when publish is invoked for the same key", () => {
      const listener = vi.fn();
      subscribe("key", listener);
      publish("key");
      expect(listener).toHaveBeenCalledTimes(1);
      publish("key");
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("does not call listener when publish is invoked for different key", () => {
      const listener = vi.fn();
      subscribe("key1", listener);
      publish("key2");
      expect(listener).not.toHaveBeenCalled();
    });

    it("returns unsubscribe function that stops calling listener", () => {
      const listener = vi.fn();
      const unsubscribe = subscribe("key", listener);
      publish("key");
      expect(listener).toHaveBeenCalledTimes(1);
      unsubscribe();
      publish("key");
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("supports multiple listeners for the same key", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      subscribe("key", listener1);
      subscribe("key", listener2);
      publish("key");
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it("unsubscribing one listener does not affect others", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const unsub1 = subscribe("key", listener1);
      subscribe("key", listener2);
      unsub1();
      publish("key");
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });
});
