import { useAuthUser } from "~/server/services/auth/auth.service";
import prisma from "~/lib/prisma";
import { callB2C } from "~/server/services/mpesa/mpesa.service";

export default defineEventHandler(async (event) => {
  const user = await useAuthUser(event);
  const errandId = getRouterParam(event, "id");

  if (!errandId) {
    throw createError({ statusCode: 400, message: "Errand ID is required." });
  }

  // Use a transaction to ensure all or nothing
  const result = await prisma.$transaction(async (tx) => {
    // 1. Validate Errand and User
    const errand = await tx.errand.findUnique({
      where: { id: errandId },
      include: {
        runner: true,
        transactions: { where: { status: "completed" } },
      },
    });

    if (!errand)
      throw createError({ statusCode: 404, message: "Errand not found." });
    if (errand.requesterId !== user.id)
      throw createError({
        statusCode: 403,
        message: "Only the requester can approve completion.",
      });
    if (errand.status !== "in_progress")
      throw createError({
        statusCode: 400,
        message: "Errand is not in a state to be approved.",
      });
    if (!errand.runner || !errand.runner.phoneNumber)
      throw createError({
        statusCode: 500,
        message: "Runner information is missing for payout.",
      });

    // 2. Update Errand Status
    const updatedErrand = await tx.errand.update({
      where: { id: errandId },
      data: { status: "completed", endTime: new Date() },
    });

    // 3. Find the successful transaction to determine payout amount
    const successfulTransaction = errand.transactions[0];
    if (!successfulTransaction) {
      throw createError({
        statusCode: 500,
        message: "Cannot find successful payment for this errand.",
      });
    }

    const payoutAmount =
      successfulTransaction.amount.toNumber() -
      successfulTransaction.platformFee.toNumber();

    // 4. Initiate Payout via M-Pesa B2C
    const b2cResponse = await callB2C({
      phoneNumber: errand.runner.phoneNumber,
      amount: payoutAmount,
      remarks: `Payout for errand: ${errand.title.substring(0, 50)}`,
    });

    if (!b2cResponse) {
      // This will cause the transaction to roll back
      throw createError({
        statusCode: 500,
        message: "Payout initiation failed.",
      });
    }

    // 5. Create Payout Record
    const payout = await tx.payout.create({
      data: {
        errandId: errand.id,
        runnerId: errand.runnerId!,
        transactionId: successfulTransaction.id,
        amount: payoutAmount,
        status: "pending", // Will be updated by B2C callback
        payoutReference: b2cResponse.ConversationID,
      },
    });

    // TODO: Send emails to requester and runner about completion and payout initiation.

    return { errand: updatedErrand, payout };
  });

  return {
    success: true,
    message: "Errand approved. Payout to runner has been initiated.",
    data: result,
  };
});
