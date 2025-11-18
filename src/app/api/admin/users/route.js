// app/api/admin/users/route.js
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "ADMIN") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        studentProfile: true,
        employerProfile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
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
