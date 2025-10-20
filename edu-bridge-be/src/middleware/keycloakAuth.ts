import jwt from "jsonwebtoken";
import jwksClient from "jwks-client";
import { Request, Response, NextFunction } from "express";
import { userService } from "../services/userService.js";

// Keycloak configuration
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "http://localhost:8080";
const REALM = process.env.KEYCLOAK_REALM || "myrealm";
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || "edu-bridge-backend";

// JWKS client for fetching public keys
const client = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxAge: 600000, // 10 minutes
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

// Interface for JWT payload
interface KeycloakToken {
  sub: string;
  iss: string;
  aud: string | string[];
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  typ: string;
  azp: string;
  session_state: string;
  acr: string;
  "allowed-origins": string[];
  realm_access: {
    roles: string[];
  };
  resource_access: {
    [key: string]: {
      roles: string[];
    };
  };
  scope: string;
  sid: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  phone_number?: string; // Optional phone number from Keycloak
  phone_number_verified?: boolean; // Optional phone verification status
}

// Function to get signing key
function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    // The key object has either publicKey or rsaPublicKey property
    const signingKey = (key as any).publicKey || (key as any).rsaPublicKey;
    callback(null, signingKey);
  });
}

// Middleware to verify JWT token
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "No token provided",
      message: "Authorization header is required",
    });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      error: "Invalid token format",
      message: "Token must be provided as Bearer token",
    });
  }

  // Verify the token
  jwt.verify(
    token,
    getKey,
    {
      // Accept tokens from both frontend and backend clients
      // audience can be 'account', 'edu-bridge-backend', or 'edu-bridge-frontend'
      issuer: `${KEYCLOAK_URL}/realms/${REALM}`,
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(401).json({
          error: "Invalid token",
          message: "Token verification failed",
          details: err.message,
        });
      }

      // Verify the token is from our frontend client
      const decodedToken = decoded as KeycloakToken;
      if (
        decodedToken.azp !== "edu-bridge-frontend" &&
        decodedToken.azp !== CLIENT_ID
      ) {
        return res.status(401).json({
          error: "Invalid token",
          message: "Token not issued for this application",
          details: `Expected azp: edu-bridge-frontend or ${CLIENT_ID}, got: ${decodedToken.azp}`,
        });
      }

      // Upsert user in database (create or update)
      // Extract name parts from the full name if available
      const fullName = decodedToken.name || '';
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts.length > 0 ? nameParts[0] : null;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : null;

      const userData = {
        id: decodedToken.sub,
        username: decodedToken.preferred_username || null,
        firstName: firstName,
        lastName: lastName,
        email: decodedToken.email || null,
        phone: decodedToken.phone_number || null,
      };

      console.log("Upserting user with data:", userData);

      userService
        .upsertUserFromToken(userData)
        .then((user) => {
          console.log("User upserted successfully:", user);
          // Add user info to request
          req.user = decodedToken;
          next();
        })
        .catch((error) => {
          console.error("Error upserting user:", error);
          // Still allow the request to proceed even if user upsert fails
          // This prevents authentication from failing due to database issues
          req.user = decodedToken;
          next();
        });
    }
  );
};

// Middleware to check if user has specific role
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    const userRoles = req.user.realm_access?.roles || [];

    if (!userRoles.includes(role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Role '${role}' is required`,
        userRoles,
      });
    }

    next();
  };
};

// Middleware to check if user has any of the specified roles
export const requireAnyRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated",
      });
    }

    const userRoles = req.user.realm_access?.roles || [];
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        error: "Forbidden",
        message: `One of the following roles is required: ${roles.join(", ")}`,
        userRoles,
      });
    }

    next();
  };
};

// Utility function to get user info from token
export const getUserInfo = (req: Request): KeycloakToken | null => {
  return req.user || null;
};

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: KeycloakToken;
    }
  }
}
