import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  // Admin role checked by middleware
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { settingKey: "asc" },
    });

    // Convert array to a key-value object for easier use on the frontend
    const settingsObj = settings.reduce(
      (acc, setting) => {
        acc[setting.settingKey] = setting.settingValue;
        return acc;
      },
      {} as Record<string, string | null>,
    );

    return { success: true, data: settingsObj };
  } catch (error) {
    console.error("Error fetching system settings:", error);
    throw createError({
      statusCode: 500,
      message: "Could not fetch system settings.",
    });
  }
});
