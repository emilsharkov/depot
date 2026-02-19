import { useEffect, useRef, useSyncExternalStore } from "react";
import { getSnapshot, getStorageValue, JSONSerializable, publish, setStorageValue, subscribe } from "../store";
import { isEqual } from "lodash";

export const useStorageState = <T extends JSONSerializable>(
    key: string, 
    initialValue: T,
    ...storages: Storage[]
): [T, (value: T) => void] => {
    const keyRef = useRef(key);
    if (keyRef.current !== key) {
        throw new Error(
            `Invalid use of useStorageState hook: key cannot be changed after initialization from "${keyRef.current}" to "${key}"`
        );
    }

    const storagesRef = useRef(storages);
    const storagesChanged = 
        storagesRef.current.length !== storages.length || 
        storagesRef.current.some((storage, index) => storage !== storages[index])
    if(storagesChanged) {
        throw new Error(
            `Invalid use of useStorageState hook: storages cannot be changed after initialization from "${storagesRef.current}" to "${storages}"`
        );
    }

    const snapshotRef = useRef<T>(initialValue);
    const snapshot = useSyncExternalStore(
        (listener) => subscribe(key, listener),
        () => {
            const snapshot = getSnapshot<T>(key, initialValue, ...storages);
            if(!isEqual(snapshot, snapshotRef.current)) {
                snapshotRef.current = snapshot;
            }
            return snapshotRef.current;
        }
    );

    const setValue = (nextValue: T | null): void => {
        for (const storage of storages) {
            setStorageValue(storage, key, nextValue);
        }
        publish(key);
    }

    // On initalization, if any of the storages have a value for the key, 
    // sync the rest of the storages to this existing value.
    // This is to ensure that the initial value is the same in all storages.
    useEffect(() => {
        if(snapshot == null) return;
        for (const storage of storages) {
            const storageValue = getStorageValue<T>(storage, key);
            if(!isEqual(storageValue, snapshot)) {
                setValue(snapshot);
                return;
            }
        }
    }, [])

    return [snapshot, setValue];
}