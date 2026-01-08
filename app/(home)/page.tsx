"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TextScreen } from "@/components/TextScreen";
import { Singleton, SingletonWithContent } from "@/convex/schema";

export default function HomePage() {
  const singleton = useQuery(api.myFunctions.getSingleton);

  if (singleton?.state === "voting") {
    return <VotingScreen singleton={singleton} />;
  } else if (singleton?.state === "speaking") {
    return <SpeakingScreen singleton={singleton} />;
  }
  return <WaitingScreen />;
}

function WaitingScreen() {
  return <TextScreen>Waiting...</TextScreen>;
}

function VotingScreen({ singleton }: { singleton: SingletonWithContent }) {
  return <TextScreen>Voting...</TextScreen>;
}

function SpeakingScreen({ singleton }: { singleton: SingletonWithContent }) {
  if (!singleton.currentTopic) {
    return <WaitingScreen />;
  }

  return (
    <TextScreen>
      <p className="text-center">{singleton.currentTopicContent}</p>
      <p className="text-center text-sm mt-2">Votes: {singleton.currentTopicVotes}</p>
    </TextScreen>
  );
}
