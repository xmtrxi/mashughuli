import { defineEventHandler, getRouterParam } from "h3";
import { useAuthUser } from "~/server/services/auth/auth.service";
import fs from "node:fs";
import path from "node:path";

const UPLOADS_DIR = path.resolve(process.cwd(), ".uploads/verifications");

export default defineEventHandler(async (event) => {
  // 1. Check if the user is an admin
  const user = await useAuthUser(event);
  if (user.primaryRole !== "admin") {
    throw createError({ statusCode: 403, message: "Access denied." });
  }

  // 2. Get the filename from the URL
  const filename = getRouterParam(event, "_");
  if (!filename) {
    throw createError({ statusCode: 400, message: "File not specified." });
  }

  // 3. Construct the full file path and ensure it's within the uploads directory
  const filePath = path.join(UPLOADS_DIR, filename);

  if (!filePath.startsWith(UPLOADS_DIR)) {
    // Security check to prevent directory traversal
    throw createError({ statusCode: 403, message: "Invalid file path." });
  }

  // 4. Check if the file exists and serve it
  try {
    await fs.promises.access(filePath);
    // Set appropriate headers and stream the file
    return sendStream(event, fs.createReadStream(filePath));
  } catch (error) {
    throw createError({ statusCode: 404, message: "File not found." });
  }
});
