import prisma from "~/lib/prisma";
import { z } from "zod";

const verificationUpdateSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  notes: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const verificationId = getRouterParam(event, "id");
  const { status, notes } = await readValidatedBody(
    event,
    verificationUpdateSchema.parse,
  );

  if (!verificationId) {
    throw createError({
      statusCode: 400,
      message: "Verification ID is required.",
    });
  }

  try {
    const updatedVerification = await prisma.runnerVerification.update({
      where: { id: verificationId },
      data: {
        backgroundCheckStatus: status,
        verificationNotes: notes,
        identityVerifiedAt: status === "verified" ? new Date() : null,
      },
    });

    // Optionally update the user's status if they are verified
    if (status === "verified") {
      await prisma.user.update({
        where: { id: updatedVerification.runnerId },
        data: { status: "active" }, // Or a specific 'verified_runner' status if you add one
      });
    }

    return { success: true, data: updatedVerification };
  } catch (error) {
    console.error("Error updating verification status:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to update verification status.",
    });
  }
});
