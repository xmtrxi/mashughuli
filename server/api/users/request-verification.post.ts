import { useAuthUser } from "~/server/services/auth/auth.service";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const user = await useAuthUser(event);

  if (user.primaryRole !== "runner") {
    throw createError({
      statusCode: 403,
      message: "Only runners can request verification.",
    });
  }

  const { identityDocumentUrl } = await readBody(event);

  if (!identityDocumentUrl || typeof identityDocumentUrl !== "string") {
    throw createError({
      statusCode: 400,
      message: "Identity document URL is required.",
    });
  }

  // In a real app, you would handle file upload here and get the URL from your storage service (e.g., S3, Cloudinary)

  const existingVerification = await prisma.runnerVerification.findFirst({
    where: { runnerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (
    existingVerification &&
    existingVerification.backgroundCheckStatus === "pending"
  ) {
    throw createError({
      statusCode: 409,
      message: "You already have a pending verification request.",
    });
  }

  const verification = await prisma.runnerVerification.create({
    data: {
      runnerId: user.id,
      identityDocumentUrl: identityDocumentUrl,
      backgroundCheckStatus: "pending",
    },
  });

  return { success: true, data: verification };
});
