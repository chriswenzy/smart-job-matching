// app/api/student/stats/route.js
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "STUDENT") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    const studentId = decoded.userId;

    const [recommendedJobs, totalApplications, interviews, applications] =
      await Promise.all([
        prisma.job.count({
          where: {
            isApproved: true,
            isActive: true,
          },
        }),
        prisma.application.count({
          where: { studentId },
        }),
        prisma.application.count({
          where: {
            studentId,
            status: "REVIEWED",
          },
        }),
        prisma.application.findMany({
          where: { studentId },
          include: {
            job: true,
          },
        }),
      ]);

    // Calculate average match score
    const avgMatchRate =
      applications.length > 0
        ? Math.round(
            applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) /
              applications.length
          )
        : 0;

    return Response.json({
      recommendedJobs,
      totalApplications,
      interviews,
      avgMatchRate,
    });
  } catch (error) {
    console.error("Error fetching student stats:", error);
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
