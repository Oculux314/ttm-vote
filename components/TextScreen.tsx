import { ReactNode } from "react";

export function TextScreen({ children }: { children: ReactNode }) {
  return (
      <main className="h-screen w-screen flex items-center justify-center bg-slate-100 dark:bg-slate-800 px-8">
        <h1 className="text-2xl">{children}</h1>
      </main>
  );
}
