"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TextScreen } from "@/components/TextScreen";
import { SingletonWithContent } from "@/convex/schema";
import { WaitingScreen } from "@/components/WaitingScreen";
import { Header } from "@/components/Header";

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
  return <TextScreen>Voting...</TextScreen>;
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
      <p className="text-center">{singleton.currentTopicContent}</p>
      <p className="text-center text-sm mt-2">
        Votes: {singleton.currentTopicVotes}
      </p>
    </TextScreen>
  );
}
