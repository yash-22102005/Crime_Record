import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Create the session store
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// Set up local authentication
export async function setupAuth(app: any) {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up the local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Hard-coded credentials check for Yash@1234/Yash#1234
        if (username === "Yash@1234" && password === "Yash#1234") {
          const user = {
            id: "admin-123",
            email: "admin@crms.com",
            firstName: "Yash",
            lastName: "Admin",
            role: "admin",
            profileImageUrl: null,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Try to get user from DB, if not exists, create it
          const existingUser = await storage.getUser("admin-123");
          if (!existingUser) {
            await storage.upsertUser({
              id: "admin-123",
              email: "admin@crms.com",
              firstName: "Yash",
              lastName: "Admin",
              role: "admin"
            });
          }
          
          return done(null, user);
        }
        
        return done(null, false, { message: "Invalid username or password" });
      } catch (error) {
        return done(error);
      }
    })
  );

  // Configure passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Check if user has admin role
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && (req.user as any).role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden. Admin access required." });
};