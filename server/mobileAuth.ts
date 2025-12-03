import type { RequestHandler } from "express";
import { storage } from "./storage";

/**
 * Mobile-compatible authentication for native apps
 * Bypasses Replit OAuth and uses anonymous/guest sessions
 */

// Generate a unique device ID for guest users
function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Middleware to handle both authenticated and guest users
 * For mobile apps, automatically creates a guest session
 */
export const authOrGuest: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // If user is authenticated via Replit OAuth, proceed normally
  if (req.isAuthenticated() && user?.claims?.sub) {
    return next();
  }

  // Check if this is a mobile app request
  const isMobile = req.headers['x-capacitor'] === 'true' ||
                   req.headers['user-agent']?.includes('Capacitor');

  if (isMobile) {
    // Create or retrieve guest user session
    let guestId = (req.session as any).guestId;

    if (!guestId) {
      guestId = generateGuestId();
      (req.session as any).guestId = guestId;

      // Create guest user in database
      await storage.upsertUser({
        id: guestId,
        email: `${guestId}@guest.hiitcoach.app`,
        firstName: "Guest",
        lastName: "User",
        profileImageUrl: null,
      });
    }

    // Attach guest user to request
    req.user = {
      claims: {
        sub: guestId,
        email: `${guestId}@guest.hiitcoach.app`,
        first_name: "Guest",
        last_name: "User",
      },
      isGuest: true,
    };

    return next();
  }

  // Web users without auth should be redirected
  return res.status(401).json({ message: "Unauthorized" });
};

/**
 * Optional middleware for routes that require full authentication
 * (e.g., account deletion, syncing with cloud)
 */
export const requireFullAuth: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.claims?.sub || user.isGuest) {
    return res.status(401).json({
      message: "Full authentication required",
      requiresAuth: true
    });
  }

  next();
};
