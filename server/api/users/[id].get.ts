import { useAuthUser } from "~/server/services/auth/auth.service";
import { userService } from "~/server/services/users.service";
import type { H3Error } from "h3";

export default defineEventHandler(async (_event) => {
  const id = getRouterParam(_event, "id");
  if (!id) {
    return sendError(
      _event,
      createError({
        statusCode: 404,
        message: "Id not provided",
      }),
    );
  }

  try {
    const authUser = await useAuthUser(_event);

    const { getUserById } = userService();
    const user = await getUserById(id);
    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    console.log(error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Internal Server Error",
    });
  }
});
