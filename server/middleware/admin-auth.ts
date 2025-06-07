import { useAuthUser } from "~/server/services/auth/auth.service";
import type { UserRole } from "@prisma/client";

// Define routes that require admin privileges
const adminApiRoutes = ["/api/admin"];

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

  const isAdminRoute = adminApiRoutes.some((route) =>
    url.pathname.startsWith(route),
  );

  if (!isAdminRoute) {
    return;
  }

  try {
    // First, verify the user is authenticated
    const user = await useAuthUser(event);

    // Then, check if the authenticated user has the 'admin' role
    if (user.primaryRole !== ("admin" as UserRole)) {
      throw createError({
        statusCode: 403, // 403 Forbidden is more appropriate than 401 Unauthorized
        statusMessage: "Forbidden: Access is restricted to administrators.",
      });
    }

    event.context.user = user;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 401,
      statusMessage: error.statusMessage || "Unauthorized",
    });
  }
});
