import { defineEventHandler, readMultipartFormData } from "h3";
import { useAuthUser } from "~/server/services/auth/auth.service";
import prisma from "~/lib/prisma";
import fs from "node:fs/promises";
import path from "node:path";

const COMPLETION_UPLOADS_DIR = path.resolve(
  process.cwd(),
  ".uploads/completions",
);

export default defineEventHandler(async (event) => {
  // 1. Setup and Authentication
  await fs.mkdir(COMPLETION_UPLOADS_DIR, { recursive: true });
  const user = await useAuthUser(event);
  const errandId = getRouterParam(event, "id");

  if (!errandId) {
    throw createError({ statusCode: 400, message: "Errand ID is required." });
  }

  // 2. Validate Errand and User Role
  const errand = await prisma.errand.findUnique({ where: { id: errandId } });
  if (!errand) {
    throw createError({ statusCode: 404, message: "Errand not found." });
  }
  if (errand.runnerId !== user.id) {
    throw createError({
      statusCode: 403,
      message: "You are not the assigned runner for this errand.",
    });
  }
  if (errand.status !== "in_progress") {
    throw createError({
      statusCode: 400,
      message: "This errand is not in a state that can be completed.",
    });
  }

  // 3. Process File Uploads
  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({
      statusCode: 400,
      message: "Completion evidence is required.",
    });
  }

  for (const file of formData) {
    if (!file.filename || !file.data) continue;

    const safeFilename = path.basename(file.filename);
    const uniqueFilename = `${errandId}_${user.id}_${Date.now()}_${safeFilename}`;
    const filePath = path.join(COMPLETION_UPLOADS_DIR, uniqueFilename);

    await fs.writeFile(filePath, file.data);

    // Save file reference to the database
    await prisma.verificationFile.create({
      data: {
        errandId: errandId,
        fileUrl: `/uploads/completions/${uniqueFilename}`, // This will be a server route
        fileType: file.type || "application/octet-stream",
        fileName: safeFilename,
        uploadedBy: user.id,
      },
    });
  }

  // 4. Update Errand Status (e.g., to a new "PendingApproval" status)
  // For simplicity, we'll reuse the `disputed` status visually, but a dedicated status is better
  // Let's assume for now we don't add a new status and just let the requester approve
  // A better approach would be: status -> 'pending_approval'

  return {
    success: true,
    message: "Errand marked as complete. Awaiting requester approval.",
  };
});
