import { User } from "@prisma/client";
import type { H3Event } from "h3";
import { useAuthUser } from "./auth/auth.service";
import prisma from "~/lib/prisma";
export const meService = async (event: H3Event) => {
  let user: Omit<User, "createdAt" | "updatedAt" | "password"> | null = null;
  try {
    user = await useAuthUser(event);
  } catch (e: any) {
    throw createError({
      statusCode: e.statusCode || 401,
      message: e.message || "Unathorized",
    });
  }

  const getUserErrands = async () => {
    try {
      return await prisma.errand.findMany({
        where: {
          requesterId: user.id,
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (e: any) {
      throw createError({
        statusCode: 500,
        message: "An error occurred!!",
      });
    }
  };

  return {
    user,

    getUserErrands,
  };
};
