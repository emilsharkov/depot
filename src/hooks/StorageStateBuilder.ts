import {
    useCookieStorage,
    useURLParamStorage,
} from "../adapters";
import type { CookieStorageOptions, URLParamStorageOptions } from "../adapters";
import { JSONSerializable } from "../store";
import { useStorageState } from "./useStorageState";

export type StorageStateOptionsBase = {
    urlParamStorage?: URLParamStorageOptions;
    cookieStorage?: CookieStorageOptions;
};

type StorageDescriptor =
    | { type: "urlParams"; options?: URLParamStorageOptions }
    | { type: "cookie"; options?: CookieStorageOptions }
    | { type: "localStorage" }
    | { type: "sessionStorage" }
    | { type: "custom"; storage: Storage }

class StorageStateHookBuilder<TOptions extends StorageStateOptionsBase = {}> {
    private descriptors: StorageDescriptor[] = [];

    addURLParamStorage(
        options?: URLParamStorageOptions
    ): StorageStateHookBuilder<TOptions & { urlParamStorage?: URLParamStorageOptions }> {
        this.descriptors.push({ type: "urlParams", options });
        return this as StorageStateHookBuilder<
            TOptions & { urlParamStorage?: URLParamStorageOptions }
        >;
    }

    addCookieStorage(
        options?: CookieStorageOptions
    ): StorageStateHookBuilder<TOptions & { cookieStorage?: CookieStorageOptions }> {
        this.descriptors.push({ type: "cookie", options });
        return this as StorageStateHookBuilder<
            TOptions & { cookieStorage?: CookieStorageOptions }
        >;
    }

    addLocalStorage(): StorageStateHookBuilder<TOptions> {
        this.descriptors.push({ type: "localStorage" });
        return this as StorageStateHookBuilder<TOptions>;
    }

    addSessionStorage(): StorageStateHookBuilder<TOptions> {
        this.descriptors.push({ type: "sessionStorage" });
        return this as StorageStateHookBuilder<TOptions>;
    }

    addStorage(storage: Storage): StorageStateHookBuilder<TOptions> {
        this.descriptors.push({ type: "custom", storage });
        return this as StorageStateHookBuilder<TOptions>;
    }

    build(): <T extends JSONSerializable>(
        key: string,
        initialValue: T,
        options?: TOptions
    ) => [T, (value: T) => void] {
        const descriptors = [...this.descriptors];

        if (descriptors.length === 0) {
            throw new Error(
                "StorageStateHookBuilder: at least one storage backend is required"
            );
        }

        return function useBuiltStorageState<T extends JSONSerializable>(
            key: string,
            initialValue: T,
            options?: TOptions
        ): [T, (value: T) => void] {
            const storages: Storage[] = descriptors.map((d) => {
                switch (d.type) {
                    case "urlParams":
                        return useURLParamStorage(
                            options?.urlParamStorage ?? d.options
                        );
                    case "cookie":
                        return useCookieStorage(
                            options?.cookieStorage ?? d.options
                        );
                    case "localStorage":
                        return localStorage;
                    case "sessionStorage":
                        return sessionStorage;
                    case "custom":
                        return d.storage;
                }
            });

            return useStorageState(key, initialValue, ...storages);
        };
    }
}

const createStorageStateHookBuilder = (): StorageStateHookBuilder =>
    new StorageStateHookBuilder();

const useLocalStorageState = createStorageStateHookBuilder()
    .addLocalStorage()
    .build();

const useURLParamLocalSessionStorageState = createStorageStateHookBuilder()
    .addURLParamStorage()
    .addLocalStorage()
    .addSessionStorage()
    .build();

const useCookieURLParamLocalSessionStorageState = createStorageStateHookBuilder()
    .addCookieStorage()
    .addURLParamStorage()
    .addLocalStorage()
    .addSessionStorage()
    .build();

const urlParamStorage = useURLParamStorage();
const useCustomStorageState = createStorageStateHookBuilder()
    .addStorage(urlParamStorage)
    .build();

export { createStorageStateHookBuilder, StorageStateHookBuilder };