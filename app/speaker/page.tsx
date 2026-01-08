"use client";

import { Header } from "@/components/Header";
import { TextScreen } from "@/components/TextScreen";
import { WaitingScreen } from "@/components/WaitingScreen";
import { api } from "@/convex/_generated/api";
import { SingletonWithContent } from "@/convex/schema";
import { useQuery } from "convex/react";

export default function SpeakerPage() {
  return (
    <>
      <Header type="speaker" />
      <Main />
    </>
  );
}

function Main() {
  const singleton = useQuery(api.myFunctions.getSingleton);

  if (singleton?.state === "speaking") {
    return <SpeakingScreenForSpeaker singleton={singleton} />;
  }
  return <WaitingScreen />;
}

function SpeakingScreenForSpeaker({ singleton }: { singleton: SingletonWithContent }) {
  if (!singleton.currentTopic) {
    return <WaitingScreen />;
  }

  return (
    <TextScreen>
      <p className="text-center text-2xl">{singleton.currentTopicContent}</p>
    </TextScreen>
  );
}
