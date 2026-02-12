import { useRef } from "react";

export interface CookieStorageOptions {
    path?: string;
    prefix?: string;
}

class CookieStorage implements Storage {
    private path: string;
    private prefix: string;

    constructor(options: CookieStorageOptions = {}) {
        this.path = options.path ?? "/";
        this.prefix = options.prefix ?? "";
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

    private setCookie(key: string, value: string): void {
        const prefixedKey = this.getPrefixedKey(key);
        document.cookie = `${encodeURIComponent(prefixedKey)}=${encodeURIComponent(value)}; path=${this.path}`;
    }

    private removeCookie(key: string): void {
        const prefixedKey = this.getPrefixedKey(key);
        document.cookie = `${encodeURIComponent(prefixedKey)}=; path=${this.path}; max-age=0`;
    }
}

const useCookieStorage = (options?: CookieStorageOptions): CookieStorage => {
    const cookieStorageRef = useRef<CookieStorage>(new CookieStorage(options));
    return cookieStorageRef.current;
}

export { CookieStorage, useCookieStorage };
