import { useEffect, useRef } from "react";

type SetURLSearchParams = (params: URLSearchParams) => void;

const defaultSetSearchParams: SetURLSearchParams = (params) => {
    window.history.pushState(null, "", `?${params.toString()}`);
};

export interface URLParamStorageOptions {
    setSearchParams?: SetURLSearchParams;
}

class URLParamStorage implements Storage {
    private setSearchParams: SetURLSearchParams;

    constructor(options?: URLParamStorageOptions) {
        const { setSearchParams } = options ?? {};
        this.setSearchParams = setSearchParams ?? defaultSetSearchParams;
    }

    getItem(key: string): string | null {
        const value = this.getParams().get(key);
        return value ?? null;
    }

    setItem(key: string, value: string): void {
        const params = this.getParams();
        params.set(key, value);
        this.setSearchParams(params);
    }

    removeItem(key: string): void {
        const params = this.getParams();
        params.delete(key);
        this.setSearchParams(params);
    }

    clear(): void {
        this.setSearchParams(new URLSearchParams());
    }

    key(index: number): string | null {
        const keys = [...this.getParams().keys()];
        return keys[index] ?? null;
    }

    get length(): number {
        return this.getParams().size;
    }

    private getParams(): URLSearchParams {
        return new URLSearchParams(window.location.search);
    }

    public updateSetSearchParams(setSearchParams?: SetURLSearchParams): void {
        this.setSearchParams = setSearchParams ?? defaultSetSearchParams;
    }
}

const useURLParamStorage = (options?: URLParamStorageOptions): URLParamStorage => {
    const { setSearchParams } = options ?? {};
    const urlParamStorage = useRef<URLParamStorage>(new URLParamStorage(options));

    useEffect(() => {
        urlParamStorage.current.updateSetSearchParams(setSearchParams);
    }, [setSearchParams]);
    
    return urlParamStorage.current;
}

export { URLParamStorage, useURLParamStorage };