import { Errand, Prisma } from "@prisma/client";
import prisma from "~/lib/prisma";

export const errandService = () => {
  const getErrands = async () => {
    return await prisma.errand.findMany();
  };
  const createErrands = async (errand: Omit<Errand, "id" | "createdAt">) => {
    return await prisma.errand.create({
      data: errand,
    });
  };
  const getErrandById = async (id: string) => {
    const errand = await prisma.errand.findFirst({
      where: {
        id: id,
      },
    });
    if (errand) {
      return errand;
    }
    return null;
  };
  const updateErrand = async (
    id: string,
    errand: Omit<Errand, "createdAt" | "updatedAt" | "requesterId">,
  ) => {
    const data = await prisma.errand.update({
      where: {
        id: id,
      },
      data: {
        ...errand,
        updatedAt: new Date(),
      },
    });
    return data;
  };
  const deleteErrand = async (id: string) => {
    const data = await prisma.errand.delete({
      where: {
        id: id,
      },
    });
    return data;
  };

  return {
    getErrands,
    createErrands,
    getErrandById,
    updateErrand,
    deleteErrand,
  };
};
