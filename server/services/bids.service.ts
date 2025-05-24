import prisma from "~/lib/prisma";

export const bidsService = () => {
  const getBidById = async (id: string) => {
    try {
      return await prisma.bid.findFirst({
        where: {
          id: id,
        },
        include: {
          errand: true,
          runner: true,
        },
      });
    } catch (e: any) {
      throw createError({
        statusCode: 500,
        message: e.message || "An error occurred fething the bid",
      });
    }
  };

  return {
    getBidById,
  };
};
