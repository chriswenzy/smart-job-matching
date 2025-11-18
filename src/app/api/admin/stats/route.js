// app/api/admin/stats/route.js
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

    // Get all stats in parallel
    const [
      totalUsers,
      totalJobs,
      pendingApprovals,
      totalApplications,
      studentCount,
      employerCount,
      activeJobs,
      recentApplications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.job.count({ where: { isApproved: false } }),
      prisma.application.count(),
      prisma.user.count({ where: { userType: "STUDENT" } }),
      prisma.user.count({ where: { userType: "EMPLOYER" } }),
      prisma.job.count({ where: { isActive: true, isApproved: true } }),
      prisma.application.count({
        where: {
          appliedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return Response.json({
      totalUsers,
      totalJobs,
      pendingApprovals,
      totalApplications,
      studentCount,
      employerCount,
      activeJobs,
      recentApplications,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
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
