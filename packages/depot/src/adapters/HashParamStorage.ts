/**
 * Storage implementation that reads/writes from window.location.hash.
 * Use this when the query string is controlled by the router (e.g. Storybook)
 * or when you need to avoid conflicting with server-side routing.
 */
class HashParamStorage implements Storage {
    private getHashParams(): URLSearchParams {
        const hash = window.location.hash.slice(1);
        return new URLSearchParams(hash || "");
    }

    private setHashParams(params: URLSearchParams): void {
        const hash = params.toString();
        const url = `${window.location.pathname}${window.location.search}${hash ? `#${hash}` : ""}`;
        window.history.pushState(null, "", url);
    }

    getItem(key: string): string | null {
        return this.getHashParams().get(key) ?? null;
    }

    setItem(key: string, value: string): void {
        const params = this.getHashParams();
        params.set(key, value);
        this.setHashParams(params);
    }

    removeItem(key: string): void {
        const params = this.getHashParams();
        params.delete(key);
        this.setHashParams(params);
    }

    clear(): void {
        this.setHashParams(new URLSearchParams());
    }

    key(index: number): string | null {
        const keys = [...this.getHashParams().keys()];
        return keys[index] ?? null;
    }

    get length(): number {
        return this.getHashParams().size;
    }
}

export { HashParamStorage };
