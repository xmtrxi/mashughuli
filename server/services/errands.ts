import prisma from "~/lib/prisma";
import {
  createBidSchema,
  createErrandSchema,
  updateErrandSchema,
} from "~/shared/schemas/errands.schema";
import { z } from "zod";
import { useAuthUser } from "./auth/auth.service";
import type { H3Event } from "h3";

export const errandService = () => {
  const getErrands = async () => {
    return await prisma.errand.findMany({
      include: {
        requester: {
          omit: {
            password: true,
          },
        },
        category: true,
      },
    });
  };
  const createErrands = async (
    errand: z.infer<typeof createErrandSchema>,
    userId: string,
  ) => {
    try {
      return await prisma.errand.create({
        data: {
          ...errand,
          requesterId: userId,
        },
      });
    } catch (e: any) {
      console.log(e);
      throw createError({
        statusCode: 500,
        message: "An error occurred!!",
      });
    }
  };
  const getErrandById = async (id: string) => {
    try {
      return await prisma.errand.findFirst({
        where: {
          id: id,
        },
        include: {
          requester: {
            omit: {
              password: true,
            },
          },
          category: true,
          bids: {
            include: {
              runner: true,
            },
          },
        },
      });
    } catch (e: any) {
      throw createError({
        statusCode: 404,
        statusMessage: "Errand not found",
        message: "Errand not found",
      });
    }
  };
  const updateErrand = async (
    id: string,
    errand: z.infer<typeof updateErrandSchema>,
  ) => {
    try {
      const existing = await prisma.errand.findUnique({
        where: { id },
      });

      if (!existing) {
        throw createError({
          statusCode: 404,
          message: "Errand not found",
        });
      }

      return await prisma.errand.update({
        where: {
          id: id,
        },
        data: {
          ...errand,
          updatedAt: new Date(),
        },
      });
    } catch (e: any) {
      console.log(e);
      throw createError({
        statusCode: 500,
        message: "An error occurred!!",
      });
    }
  };
  const deleteErrand = async (id: string) => {
    try {
      return await prisma.errand.delete({
        where: {
          id: id,
        },
      });
    } catch (e: any) {
      throw createError({
        statusCode: 500,
        message: "An error occurred!",
      });
    }
  };

  // One User Per Bid to avoid spamming
  const createBid = async (
    event: H3Event,
    bid: z.infer<typeof createBidSchema>,
  ) => {
    try {
      const user = await useAuthUser(event);
      const completionTime = new Date(bid.estimatedCompletionTime);
      return await prisma.bid.create({
        data: {
          ...bid,
          runnerId: user.id,
          estimatedCompletionTime: completionTime,
        },
      });
    } catch (e: any) {
      throw createError({
        statusCode: e.statusCode ?? 500,
        message: e.message ?? "An error occurred while bidding",
      });
    }
  };

  return {
    getErrands,
    createErrands,
    getErrandById,
    updateErrand,
    deleteErrand,
    createBid,
  };
};
