import { updateUser, useAuthUser } from "~/server/services/auth/auth.service";
import { profileSchema } from "~/shared/schemas/profileData.schema";

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== "PUT") {
    return sendError(
      event,
      createError({
        status: 405,
        message: "Method Not Allowed",
      }),
    );
  }

  const authUser = await useAuthUser(event);

  if (!authUser || !authUser.id) {
    return sendError(
      event,
      createError({
        status: 401,
        message: "Unauthorized",
      }),
    );
  }

  const { data, error } = await readValidatedBody(
    event,
    profileSchema.safeParse,
  );
  if (error) {
    return sendError(
      event,
      createError({
        status: 422,
        message: error.issues.map((issue) => issue.message).join(", "),
      }),
    );
  }

  try {
    const user = await updateUser(authUser.id, data);
    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    return sendError(
      event,
      createError({
        status: 500,
        message: error.message || "Failed to update user",
      }),
    );
  }
});
