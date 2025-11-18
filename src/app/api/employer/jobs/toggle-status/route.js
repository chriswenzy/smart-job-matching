// app/api/employer/jobs/toggle-status/route.js
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "EMPLOYER") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    const { jobId, isActive } = await req.json();

    // Validate jobId
    if (!jobId) {
      return Response.json({ message: "Job ID is required" }, { status: 400 });
    }

    const job = await prisma.job.findFirst({
      where: {
        id: parseInt(jobId),
        employerId: decoded.userId,
      },
    });

    if (!job) {
      return Response.json({ message: "Job not found" }, { status: 404 });
    }

    const updatedJob = await prisma.job.update({
      where: { id: parseInt(jobId) },
      data: { isActive },
    });

    return Response.json({
      message: `Job ${isActive ? "activated" : "deactivated"} successfully`,
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error toggling job status:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Optional: Export other HTTP methods
export async function GET() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}
