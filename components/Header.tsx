import { useRouter } from "next/navigation";

export function Header({ type }: { type: "speaker" | "voter" | "admin" }) {
  const router = useRouter();

  return (
    <header className="absolute w-dvw p-4 flex justify-end items-center gap-2">
      {type == "voter" && <h1 className="text-md">{"Your turn? "}</h1>}
      <button
        className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
        onClick={() => router.push(type === "voter" ? "/speaker" : "/")}
      >
        {type === "voter" ? "Start Speaking" : "Finish Speaking"}
      </button>
    </header>
  );
}
