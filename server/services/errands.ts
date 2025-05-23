import { Errand, Prisma } from "@prisma/client";
import prisma from "~/lib/prisma";
import {
  createErrandSchema,
  updateErrandSchema,
} from "~/shared/schemas/errands.schema";
import { z } from "zod";

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
        statusMessage: "An error occurred!!",
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
          statusMessage: "Errand not found",
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
        statusMessage: "An error occurred!!",
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
        statusMessage: "An error occurred!",
      });
    }
  };

  return {
    getErrands,
    createErrands,
    getErrandById,
    updateErrand,
    deleteErrand,
  };
};
