import { userSchema } from "~/server/schemas/auth.schema";
import { registerUser } from "~/server/services/auth/auth.service";

export default defineEventHandler(async (_event) => {
  const { data, error } = await readValidatedBody(_event, userSchema.safeParse);
  if (error) {
    console.log(error.message);
    return sendError(
      _event,
      createError({
        statusCode: 422,
        message: error.message,
      }),
    );
  }
  return await registerUser(data);
});
