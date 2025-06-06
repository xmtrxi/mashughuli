import { User } from "@prisma/client";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "~/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import type { H3Event } from "h3";
import {objectInputType, objectOutputType, Writeable, z, ZodTypeAny} from "zod";
import { userSchema } from "~/shared/schemas/auth.schema";

const runtime = useRuntimeConfig();
const jwtSecret = runtime.jwtSecret;

const generateJwtToken = (user: User) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
    },
    jwtSecret,
    { expiresIn: "7d" },
  );
};

export const loginUser = async (
  formData: {
    email: string;
    password: string;
  },
  event: H3Event,
) => {
  const user = await prisma.user.findUnique({
    where: {
      email: formData.email,
    },
  });
  if (!user) {
    throw createError({
      message: "User not found",
      statusCode: 401,
    });
  }

  const isPasswordValid = await compare(formData.password, user.password);

  if (!isPasswordValid) {
    throw createError({
      message: "Invalid Credentials",
      statusCode: 401,
    });
  }

  const token = generateJwtToken(user);

  setCookie(event, "auth_token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return {
    success: true,
    token,
    data: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
      primaryRole: user.primaryRole,
      status: user.status,
    },
  };
};

export const updateUser = async (userId: string, user: objectOutputType<{
  email: z.string;
  fullName: ZodString;
  avatarUrl: ZodOptional<ZodString>;
  phoneNumber: ZodString;
  primaryRole: ZodEnum<Writeable<[string, string]>>;
  password: ZodString;
  bio: ZodString;
  categories: ZodObject<{}, "strip", ZodTypeAny, objectOutputType<{}, ZodTypeAny, "strip">, objectInputType<{}, ZodTypeAny, "strip">>
}, ZodType<any, any, any>, "strip"> | undefined) => {
  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...user,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

export const registerUser = async (formData: z.infer<typeof userSchema>) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: formData.email,
      },
    });
    if (user) {
      throw createError({
        message: "The user already exists",
        statusCode: 409,
      });
    }
    // Hash password
    const hashedPassword = await hash(formData.password, 10);

    // Create User
    const newUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        ...formData,
        password: hashedPassword,
      },
      omit: {
        password: true,
      },
    });
    return {
      success: true,
      data: newUser,
    };
  } catch (e: any) {
    return createError({
      message: e.message || "An error occurred!!",
      statusCode: 500,
    });
  }
};

export const useAuthUser = async (_event: H3Event) => {
  try {
    const authHeader = getRequestHeader(_event, "authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized: No token provided",
      });
    }
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, jwtSecret);
    return decoded as Omit<User, "createdAt" | "updatedAt" | "password">;
  } catch (e: any) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid auth token",
    });
  }
};
