import * as React from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_LOCK_IN_STATE,
  type LockInMethod,
  type LockInState,
} from "@/src/types/lock-in";
import { isValidLockInPassword } from "@/src/utils/lock-in";

const LOCK_IN_STORAGE_KEY = "entegram.lock-in.v1";

type LockInContextValue = LockInState & {
  isHydrated: boolean;
  isLockConfigured: boolean;
  enablePasswordLock: (password: string) => boolean;
  unlockWithPassword: (password: string) => boolean;
  relock: () => void;
  replacePassword: (password: string) => boolean;
  removeLock: () => boolean;
  isProtectedFilterChange: (currentValue: boolean, nextValue: boolean) => boolean;
};

const LockInContext = React.createContext<LockInContextValue | null>(null);

function mergeStoredLockInState(value: unknown): LockInState {
  if (!value || typeof value !== "object") {
    return DEFAULT_LOCK_IN_STATE;
  }

  const candidate = value as Partial<Record<keyof LockInState, unknown>>;
  const method: LockInMethod =
    candidate.method === "password" ? "password" : null;
  const password =
    typeof candidate.password === "string" ? candidate.password : null;
  const isUnlocked =
    typeof candidate.isUnlocked === "boolean" ? candidate.isUnlocked : false;

  if (method !== "password" || !password || !isValidLockInPassword(password)) {
    return DEFAULT_LOCK_IN_STATE;
  }

  return {
    method,
    password,
    isUnlocked,
  };
}

export function LockInProvider({ children }: React.PropsWithChildren) {
  const [lockInState, setLockInState] = React.useState(DEFAULT_LOCK_IN_STATE);
  const [isHydrated, setIsHydrated] = React.useState(false);

  const isLockConfigured =
    lockInState.method === "password" && lockInState.password !== null;

  async function persistLockInState(nextState: LockInState) {
    try {
      await AsyncStorage.setItem(LOCK_IN_STORAGE_KEY, JSON.stringify(nextState));
    } catch (error) {
      console.warn("Failed to persist LockIn settings.", error);
    }
  }

  React.useEffect(() => {
    let isMounted = true;

    async function hydrateLockInState() {
      try {
        const storedState = await AsyncStorage.getItem(LOCK_IN_STORAGE_KEY);

        if (!storedState) {
          return;
        }

        const parsedState = mergeStoredLockInState(JSON.parse(storedState));

        if (isMounted) {
          setLockInState(parsedState);
        }
      } catch (error) {
        console.warn("Failed to hydrate LockIn settings.", error);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    void hydrateLockInState();

    return () => {
      isMounted = false;
    };
  }, []);

  function setAndPersist(nextState: LockInState) {
    setLockInState(nextState);
    void persistLockInState(nextState);
  }

  function enablePasswordLock(password: string) {
    if (isLockConfigured || !isValidLockInPassword(password)) {
      return false;
    }

    setAndPersist({
      method: "password",
      password,
      isUnlocked: false,
    });

    return true;
  }

  function unlockWithPassword(password: string) {
    if (
      !isLockConfigured ||
      lockInState.password !== password ||
      !isValidLockInPassword(password)
    ) {
      return false;
    }

    setAndPersist({
      ...lockInState,
      isUnlocked: true,
    });

    return true;
  }

  function relock() {
    if (!isLockConfigured) {
      return;
    }

    setAndPersist({
      ...lockInState,
      isUnlocked: false,
    });
  }

  function replacePassword(password: string) {
    if (!isLockConfigured || !lockInState.isUnlocked) {
      return false;
    }

    if (!isValidLockInPassword(password)) {
      return false;
    }

    setAndPersist({
      ...lockInState,
      password,
    });

    return true;
  }

  function removeLock() {
    if (!isLockConfigured || !lockInState.isUnlocked) {
      return false;
    }

    setAndPersist(DEFAULT_LOCK_IN_STATE);
    return true;
  }

  function isProtectedFilterChange(currentValue: boolean, nextValue: boolean) {
    return isLockConfigured && !lockInState.isUnlocked && currentValue && !nextValue;
  }

  return (
    <LockInContext
      value={{
        ...lockInState,
        isHydrated,
        isLockConfigured,
        enablePasswordLock,
        unlockWithPassword,
        relock,
        replacePassword,
        removeLock,
        isProtectedFilterChange,
      }}
    >
      {children}
    </LockInContext>
  );
}

export function useLockIn() {
  const context = React.use(LockInContext);

  if (!context) {
    throw new Error("useLockIn must be used inside a LockInProvider.");
  }

  return context;
}
