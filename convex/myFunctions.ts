import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

const DEFAULT_SINGLETON = {
  state: "waiting",
  currentTopic: null,
  currentTopicVotes: 0,
  option1: null,
  option2: null,
  option3: null,
  option1Votes: 0,
  option2Votes: 0,
  option3Votes: 0
} as const;

// MARK: Getting

export const getSingleton = query({
  args: {},
  handler: async (ctx) => {
    const singleton = await ctx.db
      .query("singletons")
      .first();
    return singleton ?? DEFAULT_SINGLETON;
  },
});

export const getAllTopics = query({
  args: {},
  handler: async (ctx) => {
    const topics = await ctx.db
      .query("topics")
      .collect();
    return topics;
  },
});

// MARK: Voting

export const submitVote = mutation({
  args: {
    plusOptionNumber: v.union(v.literal(1), v.literal(2), v.literal(3)),
    minusOptionNumber: v.union(v.literal(1), v.literal(2), v.literal(3), v.null()),
  },
  handler: async (ctx, args) => {
    const singleton = await ctx.db
      .query("singletons")
      .first();
    if (!singleton) {
      throw new Error("Singleton not found");
    }

    singleton.option1Votes += args.plusOptionNumber === 1 ? 1 : 0;
    singleton.option2Votes += args.plusOptionNumber === 2 ? 1 : 0;
    singleton.option3Votes += args.plusOptionNumber === 3 ? 1 : 0;

    if (args.minusOptionNumber !== null) {
      singleton.option1Votes -= args.minusOptionNumber === 1 ? 1 : 0;
      singleton.option2Votes -= args.minusOptionNumber === 2 ? 1 : 0;
      singleton.option3Votes -= args.minusOptionNumber === 3 ? 1 : 0;
    }

    await ctx.db.patch(singleton._id, {
      option1Votes: singleton.option1Votes,
      option2Votes: singleton.option2Votes,
      option3Votes: singleton.option3Votes,
    });
  },
});

// MARK: Admin

export const reset = mutation({
  args: {},
  handler: async (ctx) => {
    const singleton = await ctx.db
      .query("singletons")
      .first();
    if (singleton) {
      await ctx.db.patch(singleton._id, DEFAULT_SINGLETON);
    } else {
      await ctx.db.insert("singletons", DEFAULT_SINGLETON);
    }
    // Reset all topics to not used
    const topics = await ctx.db
      .query("topics")
      .collect();
    for (const topic of topics) {
      await ctx.db.patch(topic._id, { beenUsed: false });
    }
  },
});

export const nextVoting = mutation({
  args: {},
  handler: async (ctx) => {
    const singleton = await ctx.db
      .query("singletons")
      .first();
    if (!singleton) {
      throw new Error("Singleton not found");
    }

    await ctx.db.patch(singleton._id, {
      state: "voting",
      currentTopic: null,
      currentTopicVotes: 0,
      option1: null,
      option1Votes: 0,
      option2: null,
      option2Votes: 0,
      option3: null,
      option3Votes: 0,
    });
  },
});


export const startSpeaking = mutation({
  args: {},
  handler: async (ctx) => {
    const singleton = await ctx.db
      .query("singletons")
      .first();
    if (!singleton) {
      throw new Error("Singleton not found");
    }
    if (singleton.state !== "voting") {
      throw new Error("Cannot start speaking from non-voting state");
    }

    // Get most voted topic
    const topicVotes = [
      { topicId: singleton.option1, votes: singleton.option1Votes },
      { topicId: singleton.option2, votes: singleton.option2Votes },
      { topicId: singleton.option3, votes: singleton.option3Votes },
    ];
    topicVotes.sort((a, b) => b.votes - a.votes);
    const winningTopic = topicVotes[0];

    await ctx.db.patch(singleton._id, {
      state: "speaking",
      currentTopic: winningTopic.topicId,
      currentTopicVotes: winningTopic.votes,
    });
  },
});
