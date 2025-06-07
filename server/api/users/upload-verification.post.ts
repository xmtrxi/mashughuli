import { defineEventHandler, readMultipartFormData } from "h3";
import { useAuthUser } from "~/server/services/auth/auth.service";
import prisma from "~/lib/prisma";
import fs from "node:fs/promises";
import path from "node:path";

// Define the storage path. This should be outside the public directory.
const UPLOADS_DIR = path.resolve(process.cwd(), ".uploads/verifications");

export default defineEventHandler(async (event) => {
  // 1. Ensure the uploads directory exists
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  // 2. Authenticate the user and check their role
  const user = await useAuthUser(event);
  if (user.primaryRole !== "runner") {
    throw createError({
      statusCode: 403,
      message: "Only runners can upload verification documents.",
    });
  }

  // 3. Check for an existing pending verification
  const existingPending = await prisma.runnerVerification.findFirst({
    where: { runnerId: user.id, backgroundCheckStatus: "pending" },
  });
  if (existingPending) {
    throw createError({
      statusCode: 409,
      message: "You already have a verification request pending review.",
    });
  }

  // 4. Read the multipart form data
  const formData = await readMultipartFormData(event);

  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: "No files were uploaded." });
  }

  // 5. Process and save each file
  const uploadedFiles = [];
  const verificationId = `ver_${Date.now()}`; // A temporary ID for this batch

  for (const file of formData) {
    if (!file.filename || !file.data) continue;

    // Sanitize filename to prevent directory traversal attacks
    const safeFilename = path.basename(file.filename);
    const uniqueFilename = `${user.id}_${verificationId}_${safeFilename}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);

    // Write the file to the server's local storage
    await fs.writeFile(filePath, file.data);

    uploadedFiles.push({
      fileUrl: `/uploads/verifications/${uniqueFilename}`, // This will be a server route, not a direct file path
      fileType: file.type || "application/octet-stream",
      fileName: safeFilename,
      uploadedBy: user.id,
    });
  }

  if (uploadedFiles.length === 0) {
    throw createError({
      statusCode: 400,
      message: "No valid files were processed.",
    });
  }

  // 6. Create the verification request and link the files
  const verificationRequest = await prisma.runnerVerification.create({
    data: {
      runnerId: user.id,
      backgroundCheckStatus: "pending",
      // We use the uploadedFiles data to create the linked files
      // This assumes a relation named `files` on the `RunnerVerification` model
      files: {
        create: uploadedFiles.map((file) => ({
          fileUrl: file.fileUrl,
          fileType: file.fileType,
          fileName: file.fileName,
          uploadedBy: user.id,
        })),
      },
    },
    include: {
      files: true,
    },
  });

  return {
    success: true,
    message: "Documents submitted successfully for verification.",
    data: verificationRequest,
  };
});
