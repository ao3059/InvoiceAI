import type { Request } from "express";

export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  role: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function getCurrentUser(req: Request): AuthUser | null {
  if (req.session?.user) {
    return req.session.user as AuthUser;
  }
  return null;
}

export function requireAuth(req: Request): AuthUser {
  const user = getCurrentUser(req);
  if (!user) {
    throw new AuthError("Unauthorized", 401);
  }
  return user;
}

export function requireAdmin(req: Request): AuthUser {
  const user = requireAuth(req);
  if (user.role !== "admin") {
    throw new AuthError("Forbidden: Admin access required", 403);
  }
  return user;
}
