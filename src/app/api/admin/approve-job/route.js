// app/api/admin/approve-job/route.js
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "ADMIN") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    const { jobId, approve } = await req.json();

    // Validate required fields
    if (!jobId) {
      return Response.json({ message: "Job ID is required" }, { status: 400 });
    }

    if (typeof approve !== "boolean") {
      return Response.json(
        { message: "Approve must be a boolean value" },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: parseInt(jobId) },
      include: {
        employer: {
          select: {
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!job) {
      return Response.json({ message: "Job not found" }, { status: 404 });
    }

    // Update job approval status
    const updatedJob = await prisma.job.update({
      where: { id: parseInt(jobId) },
      data: { isApproved: approve },
      include: {
        employer: {
          select: {
            companyName: true,
          },
        },
      },
    });

    return Response.json(
      {
        message: `Job "${updatedJob.title}" ${
          approve ? "approved" : "rejected"
        } successfully`,
        job: updatedJob,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving job:", error);
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
