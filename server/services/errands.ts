import prisma from "~/lib/prisma";
import {
  createBidSchema,
  createErrandSchema,
  updateErrandSchema,
} from "~/shared/schemas/errands.schema";
import { z } from "zod";
import { useAuthUser } from "./auth/auth.service";
import type { H3Event } from "h3";
import { ErrandStatus } from "@prisma/client";

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
        errandItems: true,
        _count: {
          select: {
            bids: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  };
  const createErrands = async (
    errand: z.infer<typeof createErrandSchema>,
    userId: string,
  ) => {
    try {
      const { items, ...errandData } = errand;
      
      return await prisma.$transaction(async (tx) => {
        // Create the errand first
        const createdErrand = await tx.errand.create({
          data: {
            ...errandData,
            requesterId: userId,
            hasShoppingList: Boolean(items && items.length > 0),
          },
        });
        
        // Create items if provided
        if (items && items.length > 0) {
          await tx.errandItem.createMany({
            data: items.map(item => ({
              ...item,
              errandId: createdErrand.id,
            })),
          });
        }
        
        // Return the errand with items
        return await tx.errand.findUnique({
          where: { id: createdErrand.id },
          include: {
            errandItems: true,
            category: true,
            requester: {
              omit: { password: true },
            },
          },
        });
      });
    } catch (e: any) {
      console.error('Error creating errand:', e);
      throw createError({
        statusCode: 500,
        message: "An error occurred creating the errand!",
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
          errandItems: true,
          bids: {
            include: {
              runner: {
                omit: { password: true },
              },
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
      return await prisma.$transaction([
        prisma.bid.create({
          data: {
            ...bid,
            runnerId: user.id,
            estimatedCompletionTime: completionTime,
          },
        }),
        prisma.errand.update({
          where: { id: bid.errandId },
          data: { status: ErrandStatus.in_progress },
        }),
      ]);
    } catch (e: any) {
      throw createError({
        statusCode: e.statusCode ?? 500,
        message: e.message ?? "An error occurred while bidding",
      });
    }
  };

  const getErrandPayments = async (event: H3Event, errandId: string) => {
    try {
      const user = await useAuthUser(event);
      const transactions = await prisma.transaction.findMany({
        where: {
          errandId: errandId,
        },
      });
      return transactions;
    } catch (e: any) {
      throw createError({
        statusCode: e.statusCode || 500,
        message: e.message || "Error when fetching payments",
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
    getErrandPayments,
  };
};
