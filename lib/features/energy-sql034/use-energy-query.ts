import { useCallback, useEffect, useState } from "react";

type QueryResult<T> = {
  token: string;
  data: T | null;
  error: unknown;
};

/**
 * Simple query for SQL034.
 * - `key` identifies home/month: when it changes, previous data stops
 *   showing immediately (no figures from another home while loading).
 * - If `key` is null no request is made (e.g. no active home).
 * - Responses from old requests are discarded.
 */
export function useEnergyQuery<T>(
  key: string | null,
  fetcher: () => Promise<T>,
) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<QueryResult<T> | null>(null);
  const token = key ? `${key}#${version}` : null;

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetcher().then(
      (data) => {
        if (!cancelled) setResult({ token, data, error: null });
      },
      (error: unknown) => {
        if (!cancelled) setResult({ token, data: null, error });
      },
    );

    return () => {
      cancelled = true;
    };
    // The fetcher depends on the same values as `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  const current = result && result.token === token ? result : null;

  return {
    data: current ? current.data : null,
    error: current ? current.error : null,
    loading: Boolean(token) && !current,
    reload,
  };
}
