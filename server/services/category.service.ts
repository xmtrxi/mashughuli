import prisma from "~/lib/prisma";
import {
  createErrandCategorySchema,
  updateErrandCategorySchema,
} from "../schemas/category.schema";
import { z } from "zod";

export const categoryService = () => {
  const getCategories = async () => {
    return await prisma.errandCategory.findMany();
  };

  const createCategories = async (
    category: z.infer<typeof createErrandCategorySchema>,
  ) => {
    try {
      return await prisma.errandCategory.create({
        data: {
          ...category,
        },
      });
    } catch (e: any) {
      throw createError({
        statusCode: 500,
        statusMessage: "An error occurred!!",
      });
    }
  };
  const getCategoryById = async (id: string) => {
    try {
      return await prisma.errandCategory.findFirst({
        where: {
          id: id,
        },
      });
    } catch (e: any) {
      throw createError({
        statusCode: 500,
        statusMessage: "An error occurred!!",
      });
    }
  };

  const updateCategory = async (
    id: string,
    category: z.infer<typeof updateErrandCategorySchema>,
  ) => {
    try {
      const data = await prisma.errandCategory.update({
        where: {
          id: id,
        },
        data: {
          ...category,
        },
      });
      return data;
    } catch (e: any) {
      console.log(e);
      throw createError({
        statusCode: 500,
        statusMessage: "An error occurred!!",
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      return await prisma.errandCategory.delete({
        where: {
          id: id,
        },
      });
    } catch (e: any) {
      throw createError({
        statusCode: 404,
        statusMessage: "Errand not found",
      });
    }
  };

  return {
    getCategories,
    createCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
  };
};
