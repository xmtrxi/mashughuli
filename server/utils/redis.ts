import { Redis } from "ioredis";

// Create a function to initialize the Redis client only at runtime
function initializeRedisClient() {
  const redisUrl = process.env.REDIS_URL;

  // Check if the Redis URL is set
  if (!redisUrl) {
    console.error(
      "[Redis Client Error] Redis URL is not set. Skipping connection.",
    );
    return null;
  }

  const redisClient = new Redis(redisUrl);

  // Handle Redis events
  redisClient.on("connect", () => console.log("Connected to Redis."));
  redisClient.on("error", (err) =>
    console.error("Redis connection error:", err),
  );

  return redisClient;
}

// Export Redis client (initialized at runtime)
const redisClient = initializeRedisClient();

export default redisClient;
