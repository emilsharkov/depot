import { JSONSerializable } from "./JSONSerializable";

const getStorageValue = <T extends JSONSerializable>(
    storage: Storage,
    key: string,
): T | null => {
    try {
        const value: string | null = storage.getItem(key);
        if (value !== null) {
            return JSON.parse(value) as T;
        }
    } catch (error) {
        console.error("Error getting storage value for key", key, "in storage", storage, error);
    }
    return null;
}

const setStorageValue = <T extends JSONSerializable>(
    storage: Storage,
    key: string,
    value: T,
): void => {
    try {
        if(value === null) {
            storage.removeItem(key);
        } else {
            storage.setItem(key, JSON.stringify(value));
        }
    } catch (error) {
        console.error("Error setting storage value for key", key, "in storage", storage, error);
    }
}

const getSnapshot = <T extends JSONSerializable>(
    key: string,
    initialValue: T,
    ...storages: Storage[]
): T => {
    for (const storage of storages) {
        const value = getStorageValue<T>(storage, key);
        if (value !== null) {
            return value;
        }
    }
    return initialValue;
}

export {
    getStorageValue,
    setStorageValue,
    getSnapshot,
}