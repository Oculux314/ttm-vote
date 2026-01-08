import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function HomePage() {
  const singleton = useQuery(api.myFunctions.getSingleton);

  return <h1>Welcome to Convex + Next.js!</h1>;
}
