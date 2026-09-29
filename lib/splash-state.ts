import { useSyncExternalStore } from "react";

/*
  Shared splash state: "active" is true only while the splash is on screen.
  Heavy WebGL backgrounds (halftone hero, AeroShards) read it and wait until it
  is false, so they never compete with the splash for the GPU.
*/

const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

let active = false;

export function setSplashActive(value: boolean): void {
  if (active === value) return;
  active = value;
  listeners.forEach((listener) => listener());
}

export function useSplashActive(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => active,
    () => false,
  );
}
