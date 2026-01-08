import { ReactNode } from "react";

export function TextScreen({ children }: { children: ReactNode }) {
  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 px-8 pb-8 gap-2">
      {children}
    </main>
  );
}
