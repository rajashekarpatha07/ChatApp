import { asyncHandler } from "../utilities/AsyncHandler";
import { ApiError } from "../utilities/ApiError";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../interfaces/auth.interface";

const UserVerify = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
      if (!token) throw new ApiError(401, "No access token provided");

      const secret = process.env.ACCESS_TOKEN_SECRET;
      if (!secret) throw new Error("ACCESS_TOKEN_SECRET is not set");

      const decoded = jwt.verify(token, secret) as JwtPayload;
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      throw new ApiError(401, "Issue in Middleware");
    }
  }
);
export { UserVerify };
