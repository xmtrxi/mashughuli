import { createErrandSchema } from "~/shared/schemas/errands.schema";
import { useAuthUser } from "~/server/services/auth/auth.service";
import { errandService } from "~/server/services/errands";

export default defineEventHandler(async (event) => {
  const { data, error } = await readValidatedBody(
    event,
    createErrandSchema.safeParse,
  );
  if (error) {
    throw createError({
      statusCode: 422,
      statusMessage: error.message,
      message: error.message,
    });
  }
  try {
    const user = await useAuthUser(event);
    const { createErrands } = errandService();
    const errand = await createErrands(data, user.id);
    return {
      success: true,
      data: errand,
    };
  } catch (e: any) {
    throw createError({
      statusCode: 401,
      statusMessage: e.statusMessage,
    });
  }
});
