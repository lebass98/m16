import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

type Serializer<T> = {
  parse: (raw: string | null) => T;
  stringify: (value: T) => string;
};

const stringSerializer: Serializer<string> = {
  parse: (raw) => raw ?? '',
  stringify: (v) => v,
};

const booleanSerializer: Serializer<boolean> = {
  parse: (raw) => raw === 'true',
  stringify: (v) => String(v),
};

const jsonSerializer = <T>(fallback: T): Serializer<T> => ({
  parse: (raw) => {
    if (raw == null) return fallback;
    try { return JSON.parse(raw) as T; } catch { return fallback; }
  },
  stringify: (v) => JSON.stringify(v),
});

/**
 * localStorage 동기화 useState.
 * 키와 fallback, 선택적 validator(가져온 값을 검증·정규화)만 넘기면 끝.
 */
export function usePersistedState<T>(
  key: string,
  fallback: T,
  options?: { validate?: (raw: T) => T; serializer?: Serializer<T> },
): [T, Dispatch<SetStateAction<T>>] {
  const serializer = options?.serializer ?? inferSerializer(fallback);
  const validate = options?.validate;

  const [state, setState] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    const parsed = serializer.parse(raw);
    return validate ? validate(parsed) : parsed;
  });

  useEffect(() => {
    localStorage.setItem(key, serializer.stringify(state));
  }, [key, state, serializer]);

  return [state, setState];
}

function inferSerializer<T>(fallback: T): Serializer<T> {
  if (typeof fallback === 'boolean') return booleanSerializer as unknown as Serializer<T>;
  if (typeof fallback === 'string') return stringSerializer as unknown as Serializer<T>;
  return jsonSerializer(fallback);
}

export { booleanSerializer, stringSerializer, jsonSerializer };
