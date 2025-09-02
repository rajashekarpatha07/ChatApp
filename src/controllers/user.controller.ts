import { ApiError } from "../utilities/ApiError";
import { ApiResponse } from "../utilities/ApiResponce";
import { asyncHandler } from "../utilities/AsyncHandler";
import { Request, Response } from "express";
import { loginuserI, registeruserI } from "../interfaces/user";
import { prisma } from "../db/ConnectionPool";
import {
  GenerateAccessToken,
  GenerateRefreshToken,
  hashpassword,
  ispasswordmatch,
} from "../utilities/auth";
import { AuthRequest } from "../interfaces/auth.interface";

const registeruser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, username }: registeruserI = req.body;

  if (!email || !password || !username) {
    throw new ApiError(400, "All fields are required");
  }

  const existinguser = await prisma.user.findUnique({ where: { email } });
  if (existinguser) throw new ApiError(409, "User already exists");

  const hashedpassword = await hashpassword(password);

  const createduser = await prisma.user.create({
    data: { email, username, password: hashedpassword },
    select: { id: true, username: true, email: true },
  });

  res.status(201).json(new ApiResponse(201, createduser, "User registered successfully"));
});

const loginuser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: loginuserI = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordValid = await ispasswordmatch(user.password, password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

  const accessToken = GenerateAccessToken(user.id);
  const refreshToken = GenerateRefreshToken(user.id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 100 * 24 * 60 * 60 * 1000,
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { id: user.id, email: user.email, username: user.username },
      "Login successful"
    )
  );
});

const logoutUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) throw new ApiError(401, "Not authenticated");

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { username: true },
  });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    message: `Logging out ${user?.username || "user"}`,
    success: true,
  });
});

export { registeruser, loginuser, logoutUser };
