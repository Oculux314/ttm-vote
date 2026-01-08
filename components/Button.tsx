import { cn } from "@/util/cn";
import { ReactNode } from "react";

export function Button({
  className,
  children,
  ...rest
}: {
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
}) {
  return (
    <button
      className={cn(
        "bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 active:bg-slate-400 dark:active:bg-slate-500 cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
