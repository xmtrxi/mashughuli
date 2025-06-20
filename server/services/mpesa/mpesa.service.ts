import { reSplitAlphaNumeric } from "@tanstack/vue-table";
import { Mpesa } from "daraja.js";

const app = new Mpesa(
  {
    consumerKey: process.env.MPESA_APP_CONSUMER_KEY!,
    consumerSecret: process.env.MPESA_APP_CONSUMER_SECRET!,
    initiatorPassword: process.env.MPESA_PASSKEY!,
    organizationShortCode: +process.env.MPESA_BUSINESS_SHORTCODE!,
  },
  "production",
);

const callStk = async (
  phoneNumber: string,
  amount: number,
  description: string,
  accountNumber: string,
) => {
  try {
    const phone = +`254${phoneNumber.slice(-9)}`;

    // Build the request step by step with logging
    const stkBuilder = app
      .stkPush()
      .amount(amount)
      .phoneNumber(phone)
      .description(description)
      .shortCode(process.env.MPESA_BUSINESS_SHORTCODE!)
      .accountNumber(accountNumber)
      .callbackURL(process.env.MPESA_STK_CALLBACK_URL!)
      .lipaNaMpesaPassKey(process.env.MPESA_LNM_PASSKEY!);

    const response = await stkBuilder.send();

    return response.data;
  } catch (err: any) {
    console.log("=== STK PUSH ERROR ===", err);

    return null;
  }
};
export const callB2C = async (data: {
  phone_number: string;
  reason: string;
  amount: number;
}) => {
  const phone = +`254${data.phone_number.slice(-9)}`;
  const response = await app
    .b2c()
    .amount(data.amount)
    .phoneNumber(phone)
    .occassion(data.reason)
    .resultURL(process.env.MPESA_B2C_CALLBACK_URL!)
    .shortCode(process.env.MPESA_BUSINESS_SHORTCODE!)
    .initiatorName(process.env.MPESA_INITIATOR_NAME!)
    .transactionType("BusinessPayment")
    .timeoutURL(process.env.MPESA_B2C_TIMEOUT_URL!)
    .send();

  if (!response || !response.isOkay()) {
    console.error(response);
    return null;
  }

  return response.data;
};

export const businessPayBill = async (payload: {
  amount: number;
  accountNumber: string;
  paybill: string;
}) => {
  const response = await app
    .b2b()
    .amount(payload.amount)
    .accountNumber(payload.accountNumber)
    .shortCode(process.env.MPESA_BUSINESS_SHORTCODE!)
    .resultURL(process.env.MPESA_B2B_CALLBACK_URL!)
    .timeoutURL(process.env.MPESA_B2B_TIMEOUT_URL!)
    .initiatorName(process.env.MPESA_INITIATOR_NAME!)
    .transactionType("BusinessPayBill")
    .payBill(payload.paybill)
    .send();

  if (!response || !response.isOkay()) {
    console.error(response);
    return null;
  }

  return response.data;
};
export const businessBuyGoods = async (payload: {
  amount: number;
  till: string;
  requester?: string;
}) => {
  const response = await app
    .b2b()
    .amount(payload.amount)
    .shortCode(process.env.MPESA_BUSINESS_SHORTCODE!)
    .resultURL(process.env.MPESA_B2B_CALLBACK_URL!)
    .timeoutURL(process.env.MPESA_B2B_TIMEOUT_URL!)
    .initiatorName(process.env.MPESA_INITIATOR_NAME!)
    .transactionType("BusinessBuyGoods")
    .senderType("PAYBILL")
    .tillNumber(payload.till)
    .requester(payload.requester)
    .send();

  if (!response || !response.isOkay()) {
    console.error(response);
    return null;
  }

  return response.data;
};
export const callB2B = async (data: {
  paybill?: {
    business_no: string;
    account_no: string;
  };
  till_number?: string;
  amount: number;
  requester?: string;
}) => {
  if (data.paybill) {
    return businessPayBill({
      amount: data.amount,
      accountNumber: data.paybill.account_no,
      paybill: data.paybill.business_no,
    });
  } else if (data.till_number) {
    return businessBuyGoods({
      amount: data.amount,
      till: data.till_number,
      requester: data.requester,
    });
  } else {
    throw new Error(
      "Both Paybill and Till Number cannot be empty for B2B transactions",
    );
  }
};

export const processFormPayments = async (details: {
  phoneNumber: string;
  amount: number;
  accountNumber: string;
  description: string;
}) => {
  const result = await callStk(
    details.phoneNumber,
    details.amount,
    details.description,
    details.accountNumber,
  );
  return result;
};
