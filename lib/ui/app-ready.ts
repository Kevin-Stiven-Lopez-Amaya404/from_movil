import { useSyncExternalStore } from "react";

/**
 * Señal "la app ya es visible".
 *
 * El layout raíz la marca cuando se ocultan el splash nativo y la animación
 * de bienvenida. Las pantallas la usan para no reproducir sus animaciones
 * de entrada detrás del splash, donde nadie las vería.
 */
let ready = false;
const listeners = new Set<() => void>();

export function markAppReady() {
  if (ready) return;

  ready = true;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return ready;
}

export function useAppReady() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}