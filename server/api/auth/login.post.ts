import { loginSchema } from "~/shared/schemas/auth.schema";
import { loginUser } from "~/server/services/auth/auth.service";

export default defineEventHandler(async (event) => {
  const { data, error } = await readValidatedBody(event, loginSchema.safeParse);
  if (error) {
    return sendError(
      event,
      createError({
        status: 422,
        message: error.message,
      }),
    );
  }
  return await loginUser(data, event);
});
