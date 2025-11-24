// app/api/admin/jobs/route.js
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

    const jobs = await prisma.job.findMany({
      include: {
        employer: {
          include: {
            employerProfile: {
              select: {
                companyName: true,
                industry: true,
              },
            },
          },
        },
        applications: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
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
