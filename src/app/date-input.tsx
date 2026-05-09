"use client";

import type { ComponentProps } from "react";

export function DateInput(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      type="date"
      onClick={(e) => {
        try {
          (e.currentTarget as HTMLInputElement & {
            showPicker?: () => void;
          }).showPicker?.();
        } catch {
          // Some browsers throw if the input is hidden or not focusable;
          // fall back to default behavior silently.
        }
        props.onClick?.(e);
      }}
      onFocus={(e) => {
        try {
          (e.currentTarget as HTMLInputElement & {
            showPicker?: () => void;
          }).showPicker?.();
        } catch {}
        props.onFocus?.(e);
      }}
    />
  );
}
