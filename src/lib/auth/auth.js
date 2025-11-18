import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      userType: user.userType,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

// Middleware for protected routes
export function requireAuth(handler) {
  return async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;
    return handler(req, res);
  };
}

// Middleware for role-based access
export function requireRole(allowedRoles) {
  return (handler) => {
    return async (req, res) => {
      const token = req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
      }

      if (!allowedRoles.includes(decoded.userType)) {
        return res.status(403).json({
          message: "Access denied. Insufficient permissions.",
        });
      }

      req.user = decoded;
      return handler(req, res);
    };
  };
}

export async function getUserById(userId) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      employerProfile: true,
    },
  });
}
