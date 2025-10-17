import jwt from "jsonwebtoken";
import jwksClient from "jwks-client";
import { Request, Response, NextFunction } from "express";

// Keycloak configuration
const KEYCLOAK_URL = "http://localhost:8080";
const REALM = "myrealm";
const CLIENT_ID = "edu-bridge-backend";

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
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
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
      if (decodedToken.azp !== "edu-bridge-frontend" && decodedToken.azp !== CLIENT_ID) {
        return res.status(401).json({
          error: "Invalid token",
          message: "Token not issued for this application",
          details: `Expected azp: edu-bridge-frontend or ${CLIENT_ID}, got: ${decodedToken.azp}`,
        });
      }

      // Add user info to request
      req.user = decodedToken;
      next();
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
