import { useCallback, useEffect, useState } from "react";

type QueryResult<T> = {
  token: string;
  data: T | null;
  error: unknown;
};

/**
 * Consulta simple para SQL034.
 * - `key` identifica hogar/mes: al cambiar, los datos anteriores dejan de
 *   mostrarse de inmediato (no se ven cifras de otro hogar mientras carga).
 * - Si `key` es null no se hace ninguna peticion (p. ej. sin hogar activo).
 * - Las respuestas de peticiones viejas se descartan.
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
    // El fetcher depende de los mismos valores que `key`.
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
