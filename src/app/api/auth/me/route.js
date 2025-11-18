// app/api/auth/me/route.js
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return Response.json({ message: "Invalid token" }, { status: 401 });
    }

    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return Response.json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Optional: Export other HTTP methods
export async function POST() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}
