// app/api/student/applications/apply/route.js
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { calculateMatchScore } from "@/utils/matchingAlgorithm";

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "STUDENT") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    const { jobId } = await req.json();

    // Validate required field
    if (!jobId) {
      return Response.json({ message: "Job ID is required" }, { status: 400 });
    }

    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: {
        id: parseInt(jobId),
        isApproved: true,
        isActive: true,
      },
    });

    if (!job) {
      return Response.json(
        { message: "Job not found or not available" },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_studentId: {
          jobId: parseInt(jobId),
          studentId: decoded.userId,
        },
      },
    });

    if (existingApplication) {
      return Response.json(
        { message: "Already applied to this job" },
        { status: 400 }
      );
    }

    // Get student profile for matching
    const student = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { studentProfile: true },
    });

    if (!student || !student.studentProfile) {
      return Response.json(
        { message: "Student profile not found" },
        { status: 400 }
      );
    }

    // Calculate match score
    const matchScore = await calculateMatchScore(student, job);

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId: parseInt(jobId),
        studentId: decoded.userId,
        matchScore: matchScore,
        status: "PENDING",
      },
      include: {
        job: {
          include: {
            employer: {
              include: {
                employerProfile: {
                  select: {
                    companyName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return Response.json(
      {
        message: "Application submitted successfully",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error applying for job:", error);
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
