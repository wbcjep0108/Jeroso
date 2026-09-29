import { useSyncExternalStore } from "react";

/*
  Shared splash state.

  - "active" is true only while the splash is on screen. Heavy WebGL backgrounds
    (halftone hero, AeroShards) read it and wait until it is false.
  - "done" becomes true once per page load, after the splash has unmounted and its
    scroll lock has been released. whenSplashDone() lets section scrolling wait for it,
    so a /#contact link never scrolls behind the splash.
*/

const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const notify = () => listeners.forEach((listener) => listener());

let active = false;
let done = false;

export function setSplashActive(value: boolean): void {
  if (active === value) return;
  active = value;
  notify();
}

export function useSplashActive(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => active,
    () => false,
  );
}

/** Called by SplashScreen after it has unmounted and restored scrolling. */
export function markSplashDone(): void {
  if (done) return;
  done = true;
  notify();
}

export function isSplashDone(): boolean {
  return done;
}

/** Runs the callback now if the splash is done, otherwise once it is. Returns an unsubscribe. */
export function whenSplashDone(callback: () => void): () => void {
  if (done) {
    callback();
    return () => {};
  }
  const listener = () => {
    if (!done) return;
    listeners.delete(listener);
    callback();
  };
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
