import type { Prisma } from "@prisma/client";

interface ApiError {
  statusCode: number;
  statusMessage?: string;
  message?: string;
  data?: unknown;
  cause?: unknown;
}
interface ApiResponse<T> {
  success: boolean;
  data: T;
  token?: string;
}
type ErrandWithRelationships = Prisma.ErrandGetPayload<{
  include: {
    category: true;
    requester: true;
    bids: {
      include: {
        runner: true;
      };
    };
    runner: true;
    address: true;
  };
}>;
type BidsWithRelationships = Prisma.BidGetPayload<{
  include: {
    runner: true;
    errand: true;
  };
}>;
export type StkCallback = {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata: {
    Item: Array<{
      Name: string;
      Value: string | number;
    }>;
  };
};

export type StkCallbackHook = {
  Body: {
    stkCallback: StkCallback;
  };
};
