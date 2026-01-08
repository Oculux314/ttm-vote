import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

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

export const start = mutation({
  args: {},
  handler: async (ctx) => {
    const singleton = await ctx.db
      .query("singletons")
      .first();
    if (!singleton) {
      throw new Error("Singleton not found");
    }
    if (singleton.state === "waiting") {
      throw new Error("Cannot start from waiting state");
    }
    await ctx.db.patch(singleton._id, { state: "voting" });
  },
});

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

// MARK: Extra
// ###############################################################################################################################################################

export const getState = query({
  args: {},
  handler: async (ctx) => {
    const singleton = await ctx.db
      .query("singletons")
      .first();
    return singleton ? singleton.state : "waiting";
  },
});

export const getCurrentTopic = query({
  args: {},
  handler: async (ctx) => {
    const singleton = await ctx.db
      .query("singletons")
      .first();
    if (singleton && singleton.currentTopic) {
      const topic = await ctx.db.get(singleton.currentTopic);
      const topicContent = topic ? topic.content : null;
      const topicVotes = singleton.currentTopicVotes;
      return { content: topicContent, votes: topicVotes };
    }
    return { content: null, votes: 0 };
  },
});

export const setState = mutation({
  args: {
    newState: v.union(
      v.literal("waiting"),
      v.literal("voting"),
      v.literal("speaking"),
    ),
  },
  handler: async (ctx, args) => {
    const singleton = await ctx.db
      .query("singletons")
      .first();
    if (singleton) {
      await ctx.db.patch(singleton._id, { state: args.newState });
    } else {
      await ctx.db.insert("singletons", {
        state: args.newState,
        currentTopic: null,
        currentTopicVotes: 0,
        option1: null,
        option2: null,
        option3: null,
        option1Votes: 0,
        option2Votes: 0,
        option3Votes: 0
      });
    }
  },
});

// ###############################################################################################################################################################

// You can read data from the database via a query:
export const listNumbers = query({
  // Validators for arguments.
  args: {
    count: v.number(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const numbers = await ctx.db
      .query("numbers")
      // Ordered by _creationTime, return most recent
      .order("desc")
      .take(args.count);
    return {
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    };
  },
});

// You can write data to the database via a mutation:
export const addNumber = mutation({
  // Validators for arguments.
  args: {
    value: v.number(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    const id = await ctx.db.insert("numbers", { value: args.value });

    console.log("Added new document with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

// You can fetch data from and send data to third-party APIs via an action:
export const myAction = action({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Action implementation.
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    });
    console.log(data);

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});
