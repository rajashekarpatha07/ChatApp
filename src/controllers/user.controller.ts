import { ApiError } from "../utilities/ApiError";
import { ApiResponse } from "../utilities/ApiResponce";
import { asyncHandler } from "../utilities/AsyncHandler";
import { Request, Response } from "express";
import { loginuserI, registeruserI } from "../interfaces/user";
import { prisma } from "../db/ConnectionPool";
import { hashpassword } from "../utilities/auth";
import { RowDataPacket } from "mysql2";

const registeruser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, username }: registeruserI = req.body;

  if (!email || !password || !username) {
    throw new ApiError(401, "All fields are required");
  }

  const existinguser = await prisma.user.findUnique({ where: { email } });

  if (existinguser) {
    throw new ApiError(401, "This user Already Exists");
  }

  const hashedpassword = await hashpassword(password);

  const createduser = await prisma.user.create({
    data: { email, username, password: hashedpassword }, select:{id: true, username:true, email:true}
  });
   console.log("new user created ", createduser)
  res.status(201).json(new ApiResponse(201,createduser, "New user created"))
});


export {
    registeruser
}