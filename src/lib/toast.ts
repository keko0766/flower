"use client";

import { useSyncExternalStore } from "react";

let current: { id: number; text: string } | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function showToast(text: string) {
  current = { id: Date.now(), text };
  clearTimeout(timer);
  timer = setTimeout(() => {
    current = null;
    emit();
  }, 3000);
  emit();
}

export function useToast() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => null,
  );
}
