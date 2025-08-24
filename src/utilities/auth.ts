import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const hashpassword = async(plainpassword:string):Promise<string>=>{
    return bcrypt.hash(plainpassword, 10)
}

const ispasswordmatch = async(hashedpassword:string, plainpassword:string ):Promise<boolean>=>{
    return await bcrypt.compare(plainpassword, hashedpassword)
}

const GenerateAccessToken = (userId: string): string => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error("ACCESS_TOKEN_SECRET is not set");
  return jwt.sign({ id: userId }, secret, { expiresIn: "15m" });
};

const GenerateRefreshToken = (userId: string): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error("REFRESH_TOKEN_SECRET is not set");
  return jwt.sign({ id: userId }, secret, { expiresIn: "100d" });
};

export const options = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
};

export {
  hashpassword,
  ispasswordmatch,
  GenerateAccessToken,
  GenerateRefreshToken,
};