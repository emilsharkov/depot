type Listener = () => void;

const listenersByKey = new Map<string, Set<Listener>>();

const unsubscribe = (key: string, listener: Listener): void => {
    const l = listenersByKey.get(key);
    if (l !== undefined) {
      l.delete(listener);
      if (l.size === 0) {
        listenersByKey.delete(key);
      }
    }
};

export const subscribe = (key: string, listener: Listener): (() => void) => {
  if (!listenersByKey.has(key)) {
    listenersByKey.set(key, new Set());
  }
  listenersByKey.get(key)?.add(listener);
  return () => unsubscribe(key, listener);
};

export const publish = (key: string) => {
  const listenersPerKey = listenersByKey.get(key);
  if (listenersPerKey !== undefined) {
    listenersPerKey.forEach((listener) => listener());
  }
};