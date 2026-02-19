import { useRef } from "react";

export type SameSite = "strict" | "lax" | "none";

export interface CookieStorageOptions {
    /** Cookie path. Default: "/" */
    path?: string;
    /** Key prefix for namespacing. Default: "" */
    prefix?: string;
    /** Cookie domain (e.g. ".example.com" for subdomains). Default: current host */
    domain?: string;
    /** Max age in seconds. Takes precedence over expires. */
    maxAge?: number;
    /** Expiration: Date, or number of days from now. Ignored if maxAge is set. */
    expires?: Date | number;
    /** Only send over HTTPS. Default: false */
    secure?: boolean;
    /** CSRF protection. "none" requires secure. Default: "lax" */
    sameSite?: SameSite;
}

const DEFAULT_PATH = "/";
const DEFAULT_PREFIX = "";

class CookieStorage implements Storage {
    private path: string;
    private prefix: string;
    private domain: string | undefined;
    private maxAge: number | undefined;
    private expires: Date | number | undefined;
    private secure: boolean;
    private sameSite: SameSite;

    constructor(options: CookieStorageOptions = {}) {
        this.path = options.path ?? DEFAULT_PATH;
        this.prefix = options.prefix ?? DEFAULT_PREFIX;
        this.domain = options.domain;
        this.maxAge = options.maxAge;
        this.expires = options.expires;
        this.secure = options.secure ?? false;
        this.sameSite = options.sameSite ?? "lax";
    }

    getItem(key: string): string | null {
        const prefixedKey = this.getPrefixedKey(key);
        return this.parseCookies().get(prefixedKey) ?? null;
    }

    setItem(key: string, value: string): void {
        this.setCookie(key, value);
    }

    removeItem(key: string): void {
        this.removeCookie(key);
    }

    clear(): void {
        const cookies = this.parseCookies();
        for (const key of cookies.keys()) {
            const rawKey = this.prefix ? key.slice(this.prefix.length) : key;
            this.removeCookie(rawKey);
        }
    }

    key(index: number): string | null {
        const cookies = this.parseCookies();
        const keys = [...cookies.keys()].map((k) =>
            this.prefix ? k.slice(this.prefix.length) : k,
        );
        return keys[index] ?? null;
    }

    get length(): number {
        return this.parseCookies().size;
    }

    private parseCookies(): Map<string, string> {
        const cookies = document.cookie.split("; ");
        const result = new Map<string, string>();
        for (const cookie of cookies) {
            const eqIndex = cookie.indexOf("=");
            if (eqIndex === -1) continue;
            const key = decodeURIComponent(cookie.slice(0, eqIndex).trim());
            const value = decodeURIComponent(cookie.slice(eqIndex + 1));
            if (this.prefix === "" || key.startsWith(this.prefix)) {
                result.set(key, value);
            }
        }
        return result;
    }

    private getPrefixedKey(key: string): string {
        return this.prefix + key;
    }

    private buildCookieAttributes(): string[] {
        const parts: string[] = [`path=${this.path}`];

        if (this.maxAge !== undefined) {
            parts.push(`max-age=${this.maxAge}`);
        } else if (this.expires !== undefined) {
            const date =
                typeof this.expires === "number"
                    ? new Date(Date.now() + this.expires * 24 * 60 * 60 * 1000)
                    : this.expires;
            parts.push(`expires=${date.toUTCString()}`);
        }

        if (this.domain !== undefined) {
            parts.push(`domain=${this.domain}`);
        }
        if (this.secure) {
            parts.push("secure");
        }
        if (this.sameSite) {
            parts.push(`samesite=${this.sameSite}`);
        }

        return parts;
    }

    private setCookie(key: string, value: string): void {
        const prefixedKey = this.getPrefixedKey(key);
        const attrs = this.buildCookieAttributes();
        document.cookie = `${encodeURIComponent(prefixedKey)}=${encodeURIComponent(value)}; ${attrs.join("; ")}`;
    }

    private removeCookie(key: string): void {
        const prefixedKey = this.getPrefixedKey(key);
        const attrs: string[] = [`path=${this.path}`, "max-age=0"];
        if (this.domain !== undefined) {
            attrs.push(`domain=${this.domain}`);
        }
        document.cookie = `${encodeURIComponent(prefixedKey)}=; ${attrs.join("; ")}`;
    }
}

export { CookieStorage };
