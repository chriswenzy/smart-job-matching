// app/api/employer/applications/update-status/route.js
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

    const { applicationId, status } = await req.json();

    // Validate required fields
    if (!applicationId || !status) {
      return Response.json(
        { message: "Application ID and status are required" },
        { status: 400 }
      );
    }

    // Verify the application belongs to employer's job
    const application = await prisma.application.findFirst({
      where: {
        id: parseInt(applicationId),
        job: {
          employerId: decoded.userId,
        },
      },
    });

    if (!application) {
      return Response.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    const updatedApplication = await prisma.application.update({
      where: { id: parseInt(applicationId) },
      data: { status },
      include: {
        job: {
          select: {
            title: true,
          },
        },
        student: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    return Response.json({
      message: `Application ${status.toLowerCase()} successfully`,
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
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
