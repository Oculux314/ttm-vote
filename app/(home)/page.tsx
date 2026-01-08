"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TextScreen } from "@/components/TextScreen";
import { SingletonWithContent } from "@/convex/schema";
import { WaitingScreen } from "@/components/WaitingScreen";
import { Header } from "@/components/Header";
import { useState } from "react";
import { cn } from "@/util/cn";
import { Button } from "@/components/Button";

export default function HomePage() {
  return (
    <>
      <Header type="voter" />
      <Main />
    </>
  );
}

function Main() {
  const singleton = useQuery(api.myFunctions.getSingleton);

  if (singleton?.state === "voting") {
    return <VotingScreen singleton={singleton} />;
  } else if (singleton?.state === "speaking") {
    return <SpeakingScreenForVoter singleton={singleton} />;
  }
  return <WaitingScreen />;
}

function VotingScreen({ singleton }: { singleton: SingletonWithContent }) {
  const [chosenTopic, setChosenTopic] = useState<1 | 2 | 3 | null>(null);

  return (
    <TextScreen>
      <div className="flex flex-col gap-8 w-full max-w-120">
        <p className="text-center text-md">What should the next topic be?</p>
        <VoteButton
          topic={singleton.option1Content}
          index={1}
          selectedTopic={chosenTopic}
          setChosenTopic={setChosenTopic}
        />
        <VoteButton
          topic={singleton.option2Content}
          index={2}
          selectedTopic={chosenTopic}
          setChosenTopic={setChosenTopic}
        />
        <VoteButton
          topic={singleton.option3Content}
          index={3}
          selectedTopic={chosenTopic}
          setChosenTopic={setChosenTopic}
        />
      </div>
    </TextScreen>
  );
}

type VoteButtonProps = {
  topic: string;
  index: 1 | 2 | 3;
  selectedTopic: 1 | 2 | 3 | null;
  setChosenTopic: (index: 1 | 2 | 3) => void;
};
function VoteButton({
  topic,
  index,
  selectedTopic,
  setChosenTopic,
}: VoteButtonProps) {
  const isSelected = selectedTopic === index;
  const submitVote = useMutation(api.myFunctions.submitVote);

  const selectTopic = () => {
    setChosenTopic(index);
    submitVote({
      plusOptionNumber: index,
      minusOptionNumber: selectedTopic,
    });
  };

  return (
    <Button
      onClick={selectTopic}
      className={cn(
        "w-full px-4 py-3 rounded",
        isSelected
          ? "bg-slate-400 dark:bg-slate-500"
          : "bg-slate-200 dark:bg-slate-700",
      )}
    >
      {topic}
    </Button>
  );
}

function SpeakingScreenForVoter({
  singleton,
}: {
  singleton: SingletonWithContent;
}) {
  if (!singleton.currentTopic) {
    return <WaitingScreen />;
  }

  return (
    <TextScreen>
      <p className="text-center text-2xl">{singleton.currentTopicContent}</p>
      <p className="text-center text-sm">
        Votes: {singleton.currentTopicVotes}
      </p>
    </TextScreen>
  );
}
