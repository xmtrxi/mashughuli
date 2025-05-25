import { userService } from "~/server/services/users.service";

export default defineEventHandler(async () => {
  try {
    const { getUsers } = userService();
    const runners = await getUsers({
      where: {
        primaryRole: "runner",
      },
    });
    return {
      success: true,
      data: runners,
    };
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 500,
      message: e.message || "An error occurred!!",
    });
  }
});
