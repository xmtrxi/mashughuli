import { userService } from "~/server/services/users.service";

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
  const { getUserById } = userService();
  try {
    const user = await getUserById(id);
    return {
      success: true,
      data: user,
    };
  } catch (e: any) {
    return sendError(
      _event,
      createError({
        statusCode: 404,
        message: e.message,
        statusMessage: e.message,
      }),
    );
  }
});
