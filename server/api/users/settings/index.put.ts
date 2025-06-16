import { useAuthUser } from "~/server/services/auth/auth.service";
import prisma from "~/lib/prisma";
import { z } from "zod";

const settingsUpdateSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  newBidAlert: z.boolean().optional(),
  messageAlert: z.boolean().optional(),
  errandUpdateAlert: z.boolean().optional(),
  paymentAlert: z.boolean().optional(),
  reviewAlert: z.boolean().optional(),
  marketingCommunications: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const user = await useAuthUser(event);
  const body = await readValidatedBody(event, settingsUpdateSchema.parse);

  try {
    const updatedSettings = await prisma.notificationSettings.update({
      where: { userId: user.id },
      data: body,
    });
    return { success: true, data: updatedSettings };
  } catch (error) {
    console.error("Error updating user settings:", error);
    throw createError({
      statusCode: 500,
      message: "Could not update settings.",
    });
  }
});
