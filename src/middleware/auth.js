// middleware/auth.js
import { verifyToken } from "../lib/auth";

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

export function requireRole(role) {
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

      if (decoded.userType !== role) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = decoded;
      return handler(req, res);
    };
  };
}
