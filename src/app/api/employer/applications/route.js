// app/api/employer/applications/route.js
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "EMPLOYER") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    const applications = await prisma.application.findMany({
      where: {
        job: {
          employerId: decoded.userId,
        },
      },
      include: {
        job: {
          select: {
            title: true,
            location: true,
          },
        },
        student: {
          include: {
            studentProfile: true,
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    return Response.json(applications);
  } catch (error) {
    console.error("Error fetching employer applications:", error);
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
