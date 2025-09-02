import { Request } from "express";

/**
 * Extends the default Express Request interface to include an optional 'user' property,
 * which will be populated by the authentication middleware.
 */
export interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}
