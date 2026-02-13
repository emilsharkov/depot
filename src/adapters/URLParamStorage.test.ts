import { describe, it, expect, beforeEach, vi } from "vitest";
import { URLParamStorage } from "./URLParamStorage";

describe("URLParamStorage", () => {
  const mockLocation = {
    search: "",
    href: "http://localhost/",
    origin: "http://localhost",
  };

  beforeEach(() => {
    mockLocation.search = "";
    mockLocation.href = "http://localhost/";
    vi.stubGlobal("location", mockLocation);
  });

  it("getItem returns value from URL params", () => {
    mockLocation.search = "?theme=dark";
    mockLocation.href = "http://localhost/?theme=dark";
    const storage = new URLParamStorage();
    expect(storage.getItem("theme")).toBe("dark");
  });

  it("getItem returns null for missing key", () => {
    const storage = new URLParamStorage();
    expect(storage.getItem("missing")).toBeNull();
  });

  it("setItem calls setSearchParams with updated params", () => {
    const setSearchParams = vi.fn();
    const storage = new URLParamStorage({ setSearchParams });
    storage.setItem("theme", "dark");
    expect(setSearchParams).toHaveBeenCalled();
    const params = setSearchParams.mock.calls[0][0];
    expect(params.get("theme")).toBe("dark");
  });

  it("removeItem removes key from params", () => {
    mockLocation.search = "?theme=dark";
    const setSearchParams = vi.fn();
    const storage = new URLParamStorage({ setSearchParams });
    storage.removeItem("theme");
    expect(setSearchParams).toHaveBeenCalled();
    const params = setSearchParams.mock.calls[0][0];
    expect(params.has("theme")).toBe(false);
  });

  it("clear resets params", () => {
    const setSearchParams = vi.fn();
    const storage = new URLParamStorage({ setSearchParams });
    storage.setItem("a", "1");
    storage.clear();
    expect(setSearchParams).toHaveBeenCalledWith(new URLSearchParams());
  });
});
