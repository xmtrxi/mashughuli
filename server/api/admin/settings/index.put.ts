import prisma from "~/lib/prisma";
import { z } from "zod";

const settingsUpdateSchema = z.record(z.string(), z.string());

export default defineEventHandler(async (event) => {
  const settingsToUpdate = await readValidatedBody(
    event,
    settingsUpdateSchema.parse,
  );

  try {
    const updatePromises = Object.entries(settingsToUpdate).map(
      ([key, value]) => {
        return prisma.systemSetting.upsert({
          where: { settingKey: key },
          update: { settingValue: value },
          create: {
            settingKey: key,
            settingValue: value,
            settingDescription: `Managed for ${key}`,
          },
        });
      },
    );

    await prisma.$transaction(updatePromises);

    return { success: true, message: "Settings updated successfully." };
  } catch (error) {
    console.error("Error updating system settings:", error);
    throw createError({
      statusCode: 500,
      message: "Could not update system settings.",
    });
  }
});
