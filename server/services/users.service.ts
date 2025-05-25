import { Prisma } from "@prisma/client";
import prisma from "~/lib/prisma";

export const userService = () => {
  const getUsers = async (args?: Prisma.UserFindManyArgs) => {
    return await prisma.user.findMany({
      omit: {
        password: true,
      },
      ...args,
    });
  };
  const getUserById = async (id: string) => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id: id,
        },
      });
      if (user) return user;
      return null;
    } catch (e: any) {
      throw Error("User not Found");
    }
  };

  return {
    getUsers,
    getUserById,
  };
};
