import { useRouter } from "next/navigation";
import { Button } from "./Button";

export function Header({ type }: { type: "speaker" | "voter" | "admin" }) {
  const router = useRouter();

  return (
    <header className="absolute bottom-0 w-dvw p-4 flex justify-end items-center gap-2">
      {type == "voter" && <h1 className="text-md">{"Your turn? "}</h1>}
      <Button
        onClick={() => router.push(type === "voter" ? "/speaker" : "/")}
      >
        {type === "voter" ? "Start Speaking" : "Finish Speaking"}
      </Button>
    </header>
  );
}
