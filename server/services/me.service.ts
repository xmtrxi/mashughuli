import { Errand, Prisma, User } from "@prisma/client";
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

  const getUserErrands = async (args?: Prisma.ErrandFindManyArgs) => {
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
        ...args,
      });
    } catch (e: any) {
      throw createError({
        statusCode: 500,
        message: "An error occurred!!",
      });
    }
  };

  const getDashboardData = async () => {
    const errands = await getUserErrands();

    const counts = errands.reduce(
      (counts, errand) => {
        const price = parseFloat(errand.finalPrice?.toString() ?? "0");
        counts.amountSpent += isNaN(price) ? 0 : price;
        counts[`${errand.status}`] = (counts[errand.status] || 0) + 1;

        return counts;
      },
      {
        amountSpent: 0,
        open: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
      },
    );
    return [
      {
        title: "Total Errands",
        description: "Total Errands",
        icon: "mdi:work",
        count: errands.length,
      },
      {
        title: "Total Amount Spent",
        description: "Total Amount Spent",
        icon: "mdi:dollar",
        count: "Ksh " + counts.amountSpent,
      },
      {
        title: "Total Open Errands",
        description: "Total Open Errands",
        icon: "mdi:work",
        count: counts.open,
      },
      {
        title: "Total In Progress Errands",
        description: "Total In Progress Errands",
        icon: "mdi:work",
        count: counts.in_progress,
      },
      {
        title: "Total Completed Errands",
        description: "Total Completed Errands",
        icon: "mdi:work",
        count: counts.completed,
      },
      {
        title: "Total cancelled Errands",
        description: "Total cancelled Errands",
        icon: "mdi:work",
        count: counts.cancelled,
      },
      {
        title: "Total Open Errands",
        description: "Total Open Errands",
        icon: "mdi:work",
        count: counts.open,
      },
    ];
  };

  return {
    user,

    getUserErrands,
    getDashboardData,
  };
};
