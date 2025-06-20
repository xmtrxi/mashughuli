import { Redis } from "ioredis";

const runtimeConfig = useRuntimeConfig();

// Create a single, shared Redis instance
const redisClient = new Redis(runtimeConfig.redisUrl, {
  // Optional: Add connection options if needed
  maxRetriesPerRequest: null,
});

redisClient.on("error", (err) => console.error("[Redis Client Error]", err));
redisClient.on("connect", () =>
  console.log("[Redis Client] Connected to Redis."),
);

export default redisClient;
