import { User } from "@prisma/client";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "~/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import type { H3Event } from "h3";
import { z, ZodString, ZodOptional, ZodEnum, ZodObject, ZodType } from "zod";
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
      primaryRole: user.primaryRole,
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

export const updateUser = async (
  userId: string,
  user: Partial<User> | undefined,
) => {
  try {
    if (!user) {
      console.log("Undefined user");
      return;
    }
    await prisma.user.update({
      where: {
        id: userId,
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
    const cookie = getCookie(_event, "auth_token");

    if ((!authHeader || !authHeader.startsWith("Bearer ")) && !cookie) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized: No token provided",
      });
    }
    let token: string;
    if (authHeader) {
      token = authHeader.split(" ")[1];
    } else {
      token = cookie;
    }

    const decoded = jwt.verify(token, jwtSecret);
    if (typeof decoded !== "object" || decoded === null) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid token format",
      });
    }
    return decoded as Omit<User, "createdAt" | "updatedAt" | "password">;
  } catch (e: any) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid auth token",
    });
  }
};
