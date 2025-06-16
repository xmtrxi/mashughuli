import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  // Admin role is verified by middleware
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        payer: { select: { fullName: true } },
        payee: { select: { fullName: true } },
        errand: { select: { title: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: transactions };
  } catch (error) {
    console.error("Error fetching transactions for admin:", error);
    throw createError({
      statusCode: 500,
      message: "Could not fetch transactions.",
    });
  }
});
