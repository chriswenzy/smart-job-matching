// app/api/employer/stats/route.js
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

    const employerId = decoded.userId;

    const [activeJobs, totalApplications, newApplications, applications] =
      await Promise.all([
        prisma.job.count({
          where: {
            employerId,
            isActive: true,
            isApproved: true,
          },
        }),
        prisma.application.count({
          where: {
            job: {
              employerId,
            },
          },
        }),
        prisma.application.count({
          where: {
            job: {
              employerId,
            },
            status: "PENDING",
          },
        }),
        prisma.application.findMany({
          where: {
            job: {
              employerId,
            },
          },
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
      activeJobs,
      totalApplications,
      newApplications,
      avgMatchRate,
    });
  } catch (error) {
    console.error("Error fetching employer stats:", error);
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
