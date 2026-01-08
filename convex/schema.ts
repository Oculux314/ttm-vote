import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

const schema = defineSchema({
  numbers: defineTable({ value: v.float64() }),
  singletons: defineTable({
    state: v.union(
      v.literal("waiting"),
      v.literal("voting"),
      v.literal("speaking"),
    ),
    currentTopic: v.union(v.id("topics"), v.null()),
    currentTopicVotes: v.number(),
    option1: v.union(v.id("topics"), v.null()),
    option1Votes: v.number(),
    option2: v.union(v.id("topics"), v.null()),
    option2Votes: v.number(),
    option3: v.union(v.id("topics"), v.null()),
    option3Votes: v.number(),
  }),
  topics: defineTable({
    content: v.string(),
    beenUsed: v.boolean(),
  }),
});
export default schema;

export type Singleton = Infer<typeof schema.tables.singletons.validator>;
export type SingletonWithContent = Singleton & {
  currentTopicContent: string;
  option1Content: string;
  option2Content: string;
  option3Content: string;
};
export type Topic = Infer<typeof schema.tables.topics.validator>;
