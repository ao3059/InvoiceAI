// Authentication system that works both on Replit (Replit Auth) and external deployments
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Check if we're running on Replit
export const isReplit = !!process.env.REPL_ID;

const getOidcConfig = memoize(
  async () => {
    if (!process.env.REPL_ID) {
      throw new Error("REPL_ID not available - Replit Auth requires Replit environment");
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function provisionUserAndTenant(userId: string, email: string, firstName?: string | null, lastName?: string | null, profileImageUrl?: string | null) {
  // Upsert user
  let user = await storage.upsertUser({
    id: userId,
    email,
    firstName: firstName || null,
    lastName: lastName || null,
    profileImageUrl: profileImageUrl || null,
  });
  
  // Auto-provision tenant if user doesn't have one
  if (!user.tenantId) {
    const userName = firstName || email?.split("@")[0] || "User";
    const tenant = await storage.createTenant({
      name: `${userName}'s Company`,
    });
    
    // Update user with tenant
    await storage.updateUserTenant(user.id, tenant.id);
    
    // Create company for tenant
    await storage.createCompany({
      tenantId: tenant.id,
      name: tenant.name,
    });
    
    // Create free subscription
    const plans = await storage.getPlans();
    const freePlan = plans.find((p) => p.name === "Free");
    if (freePlan) {
      await storage.createSubscription({
        tenantId: tenant.id,
        planId: freePlan.id,
        status: "trialing",
      });
    }
    
    // Refresh user to get tenantId
    user = await storage.getUser(user.id) || user;
  }
  
  return user;
}

// Common email login handler - works in both modes
function setupEmailLogin(app: Express) {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find existing user by email
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user with auto-generated ID
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        user = await provisionUserAndTenant(userId, email, email.split("@")[0]);
      }

      // Set session userId for auth
      (req as any).session.userId = user!.id;
      
      // Save session and wait for completion before responding
      await new Promise<void>((resolve, reject) => {
        (req as any).session.save((err: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      res.json({ success: true, user });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: error.message });
    }
  });
}

// Simple email-based auth for non-Replit deployments
async function setupSimpleAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  
  // Email login
  setupEmailLogin(app);

  app.get("/api/login", (req, res) => {
    res.redirect("/auth/login");
  });

  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}

// Full Replit Auth setup
async function setupReplitAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    const claims = tokens.claims() as any;
    if (claims?.sub) {
      await provisionUserAndTenant(
        claims.sub as string,
        claims.email as string,
        claims.first_name as string | null,
        claims.last_name as string | null,
        claims.profile_image_url as string | null
      );
    }
    verified(null, user);
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Also add email login as fallback for Replit mode
  setupEmailLogin(app);

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/dashboard",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    // Clear session userId if using email login
    if ((req as any).session?.userId) {
      req.session.destroy(() => {
        res.redirect("/");
      });
    } else {
      // Use Replit Auth logout
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    }
  });
}

export async function setupAuth(app: Express) {
  if (isReplit) {
    console.log("Setting up Replit Auth (OAuth 2.0 / OIDC)");
    await setupReplitAuth(app);
  } else {
    console.log("Setting up simple email-based auth (non-Replit deployment)");
    await setupSimpleAuth(app);
  }
}

// Middleware to check authentication
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // First check for session-based auth (works in both modes)
  const sessionUserId = (req as any).session?.userId;
  if (sessionUserId) {
    return next();
  }
  
  if (isReplit) {
    // Replit Auth check
    const user = req.user as any;

    if (!req.isAuthenticated() || !user?.expires_at) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }

    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
  
  return res.status(401).json({ message: "Unauthorized" });
};
