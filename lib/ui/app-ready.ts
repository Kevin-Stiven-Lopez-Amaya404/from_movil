import { useSyncExternalStore } from "react";

/**
 * "The app is visible" signal.
 *
 * The root layout sets it when the native splash and the welcome animation
 * are hidden. Screens use it so they do not play their entrance animations
 * behind the splash, where nobody would see them.
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