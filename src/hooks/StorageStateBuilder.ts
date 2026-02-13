import { useRef } from "react";
import {
    CookieStorage,
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
    | { type: "urlParams" }
    | { type: "cookie"; options?: CookieStorageOptions }
    | { type: "localStorage" }
    | { type: "sessionStorage" }
    | { type: "custom"; storage: Storage }

class StorageStateHookBuilder<TOptions extends StorageStateOptionsBase = {}> {
    private descriptors: StorageDescriptor[] = [];

    addURLParamStorage(): StorageStateHookBuilder<
        TOptions & { urlParamStorage?: URLParamStorageOptions }
    > {
        this.descriptors.push({ type: "urlParams" });
        return this as StorageStateHookBuilder<
            TOptions & { urlParamStorage?: URLParamStorageOptions }
        >;
    }

    addCookieStorage(
        options?: CookieStorageOptions
    ): StorageStateHookBuilder<
        TOptions & { cookieStorage?: CookieStorageOptions }
    > {
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
                        return useURLParamStorage(options?.urlParamStorage);
                    case "cookie":
                        const cookieStorageRef = useRef<CookieStorage>(
                            new CookieStorage(options?.cookieStorage ?? d.options)
                        );
                        return cookieStorageRef.current;
                    case "localStorage":
                        return localStorage;
                    case "sessionStorage":
                        return sessionStorage;
                    case "custom":
                        const customStorageRef = useRef<Storage>(d.storage);
                        return customStorageRef.current;
                }
            });

            return useStorageState(key, initialValue, ...storages);
        };
    }
}

const createStorageStateHookBuilder = new StorageStateHookBuilder();

export { createStorageStateHookBuilder, StorageStateHookBuilder };