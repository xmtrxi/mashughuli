import { User } from "@prisma/client";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "~/lib/prisma";
import { v4 as uuidv4 } from "uuid";

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

export const loginUser = async (formData: {
  email: string;
  password: string;
}) => {
  const user = await prisma.user.findUnique({
    where: {
      email: formData.email,
    },
  });
  if (!user) {
    return createError({
      message: "User not found",
      statusCode: 401,
    });
  }

  const isPasswordValid = await compare(formData.password, user.password);

  if (!isPasswordValid) {
    return createError({
      message: "Invalid Credentials",
      statusCode: 401,
    });
  }

  const token = generateJwtToken(user);

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

export const registerUser = async (
  formData: Omit<User, "id" | "createdAt" | "updatedAt">,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: formData.email,
      },
    });
    if (user) {
      return createError({
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
