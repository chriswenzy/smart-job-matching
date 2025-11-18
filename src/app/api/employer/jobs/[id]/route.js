// app/api/employer/jobs/[id]/route.js
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function GET(req, { params }) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "EMPLOYER") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    const { id } = params;

    // Get specific job
    const job = await prisma.job.findFirst({
      where: {
        id: parseInt(id),
        employerId: decoded.userId,
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
        applications: {
          include: {
            student: {
              include: {
                studentProfile: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      return Response.json({ message: "Job not found" }, { status: 404 });
    }

    return Response.json(job);
  } catch (error) {
    console.error("Error in employer job operations:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "EMPLOYER") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    const { id } = params;
    const { title, description, requirements, location, jobType, salaryRange } =
      await req.json();

    const job = await prisma.job.findFirst({
      where: {
        id: parseInt(id),
        employerId: decoded.userId,
      },
    });

    if (!job) {
      return Response.json({ message: "Job not found" }, { status: 404 });
    }

    const updatedJob = await prisma.job.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        requirements: requirements || {},
        location,
        jobType,
        salaryRange,
        isApproved: false, // Needs re-approval after update
      },
    });

    return Response.json({
      message: "Job updated successfully and sent for re-approval",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error in employer job operations:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "EMPLOYER") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    const { id } = params;

    const job = await prisma.job.findFirst({
      where: {
        id: parseInt(id),
        employerId: decoded.userId,
      },
    });

    if (!job) {
      return Response.json({ message: "Job not found" }, { status: 404 });
    }

    await prisma.job.delete({
      where: { id: parseInt(id) },
    });

    return Response.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error in employer job operations:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Optional: Export POST method if needed
export async function POST() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}
