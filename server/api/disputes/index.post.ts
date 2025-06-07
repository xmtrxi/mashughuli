import { useAuthUser } from "~/server/services/auth/auth.service";
import prisma from "~/lib/prisma";
import { z } from "zod";

const createDisputeSchema = z.object({
  errandId: z.string().uuid(),
  reason: z.string().min(1, "Reason is required."),
  details: z.string().min(20, "Please provide more details."),
});

export default defineEventHandler(async (event) => {
  const user = await useAuthUser(event);
  const { errandId, reason, details } = await readValidatedBody(
    event,
    createDisputeSchema.parse,
  );

  const errand = await prisma.errand.findUnique({
    where: { id: errandId },
  });

  if (!errand) {
    throw createError({ statusCode: 404, message: "Errand not found." });
  }

  if (errand.requesterId !== user.id && errand.runnerId !== user.id) {
    throw createError({
      statusCode: 403,
      message: "You are not a party to this errand.",
    });
  }

  const existingDispute = await prisma.dispute.findFirst({
    where: { errandId },
  });

  if (existingDispute) {
    throw createError({
      statusCode: 409,
      message: "A dispute for this errand already exists.",
    });
  }

  const dispute = await prisma.dispute.create({
    data: {
      errandId,
      requesterId: errand.requesterId,
      runnerId: errand.runnerId!, // Should have a runner if it can be disputed
      filedBy: user.id,
      reason,
      details,
      status: "open",
    },
  });

  // Also update errand status
  await prisma.errand.update({
    where: { id: errandId },
    data: { status: "disputed" },
  });

  return { success: true, data: dispute };
});
