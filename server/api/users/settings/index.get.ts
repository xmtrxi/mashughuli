import { useAuthUser } from "~/server/services/auth/auth.service";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const user = await useAuthUser(event);

  try {
    const settings = await prisma.notificationSettings.findUnique({
      where: { userId: user.id },
    });

    // If no settings exist, create them with default values
    if (!settings) {
      const defaultSettings = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
        },
      });
      return { success: true, data: defaultSettings };
    }

    return { success: true, data: settings };
  } catch (error) {
    console.error("Error fetching user settings:", error);
    throw createError({ statusCode: 500, message: "Could not load settings." });
  }
});
