export type LockInMethod = "password" | null;

export type LockInState = {
  method: LockInMethod;
  password: string | null;
  isUnlocked: boolean;
};

export const DEFAULT_LOCK_IN_STATE: LockInState = {
  method: null,
  password: null,
  isUnlocked: false,
};
