import { TextScreen } from "./TextScreen";

export function WaitingScreen() {
  return (
    <TextScreen>
      <p className="flex gap-0.5">
        Waiting
        <span className="flex">
          <span className="inline-block translate-y-1 animate-[bounce_0.6s_ease-in-out_infinite]">.</span>
          <span className="inline-block translate-y-1 animate-[bounce_0.6s_ease-in-out_infinite_0.1s]">.</span>
          <span className="inline-block translate-y-1 animate-[bounce_0.6s_ease-in-out_infinite_0.2s]">.</span>
        </span>
      </p>
    </TextScreen>
  );
}
