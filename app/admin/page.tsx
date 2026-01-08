"use client";

import { Button } from "@/components/Button";
import { TextScreen } from "@/components/TextScreen";
import { WaitingScreen } from "@/components/WaitingScreen";
import { api } from "@/convex/_generated/api";
import { cn } from "@/util/cn";
import { useMutation, useQuery } from "convex/react";

export default function AdminPage() {
  const singleton = useQuery(api.myFunctions.getSingleton);
  const reset = useMutation(api.myFunctions.reset);

  if (!singleton) {
    return <WaitingScreen />;
  }

  const state = singleton.state;
  const stateColors: Record<string, string> = {
    waiting: "bg-slate-300 dark:bg-slate-600",
    voting: "bg-yellow-300 dark:bg-yellow-600",
    speaking: "bg-green-300 dark:bg-green-600",
  };

  return (
    <TextScreen>
      <Button className="absolute top-4 left-4" onClick={() => reset()}>
        Reset
      </Button>
      <p
        className={cn(
          "text-xl mb-2 rounded border py-1 px-8",
          stateColors[state],
        )}
      >
        {state}
      </p>
      <p className="my-2 text-lg text-center">{singleton.currentTopicContent || "None"}</p>
      <ol className="list-decimal flex flex-col gap-2">
        <li>
          {singleton.option1Content} ({singleton.option1Votes})
        </li>
        <li>
          {singleton.option2Content} ({singleton.option2Votes})
        </li>
        <li>
          {singleton.option3Content} ({singleton.option3Votes})
        </li>
      </ol>
      {state === "voting" ? <FinishVotingButton /> : <NextButton state={state} />}
    </TextScreen>
  );
}

function NextButton({ state }: { state: string }) {
  const nextVote = useMutation(api.myFunctions.nextVoting);
  return <Button className="mt-20 h-16 w-full text-2xl" onClick={() => nextVote()}>
    {state === "waiting" ? "Start" : "Next"}
  </Button>;
}

function FinishVotingButton() {
  const finishVoting = useMutation(api.myFunctions.startSpeaking);
  return <Button className="mt-20 h-16 w-full text-2xl" onClick={() => finishVoting()}>
    Finish Voting
  </Button>;
}
