import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    // Check if user is admin
    if (!decoded || decoded.userType !== "ADMIN") {
      return Response.json(
        { message: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    const { applicationId, status } = await req.json();

    // Validate input
    if (!applicationId || !status) {
      return Response.json(
        { message: "Application ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"];

    if (!validStatuses.includes(status)) {
      return Response.json(
        { message: "Invalid status value" },
        { status: 400 }
      );
    }

    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: {
          include: {
            studentProfile: true,
          },
        },
        job: {
          include: {
            employer: {
              include: {
                employerProfile: true,
              },
            },
          },
        },
      },
    });

    if (!existingApplication) {
      return Response.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status,
      },
      include: {
        student: {
          include: {
            // Include user fields instead of studentProfile for name/email
            studentProfile: {
              select: {
                id: true,
                institution: true,
                degree: true,
                fieldOfStudy: true,
              },
            },
          },
        },
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

    // Create notification
    try {
      // Get student name from User model (not StudentProfile)
      const studentUser = await prisma.user.findUnique({
        where: { id: existingApplication.studentId },
        select: { fullName: true, email: true }, // Adjust based on your User model fields
      });

      const studentName = studentUser?.fullName || "Student";
      const companyName =
        updatedApplication.job.employer.employerProfile?.companyName ||
        "Company";

      await prisma.notification.create({
        data: {
          userId: existingApplication.studentId,
          title: "Application Status Updated",
          message: `Your application for "${
            updatedApplication.job.title
          }" at ${companyName} has been ${status.toLowerCase()}.`,
          type: "APPLICATION_UPDATE",
          relatedId: applicationId,
        },
      });
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError);
      // Don't fail the whole request if notification fails
    }

    // Get complete student info for response
    const studentUser = await prisma.user.findUnique({
      where: { id: updatedApplication.studentId },
      select: {
        id: true,
        fullName: true, // Adjust field name based on your User model
        email: true,
      },
    });

    return Response.json({
      message: "Application status updated successfully",
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        student: {
          id: updatedApplication.student.id,
          name: studentUser?.fullName || "Unknown", // From User model
          email: studentUser?.email, // From User model
          profile: {
            institution: updatedApplication.student.studentProfile?.institution,
            degree: updatedApplication.student.studentProfile?.degree,
            fieldOfStudy:
              updatedApplication.student.studentProfile?.fieldOfStudy,
          },
        },
        job: {
          id: updatedApplication.job.id,
          title: updatedApplication.job.title,
          company: updatedApplication.job.employer.employerProfile?.companyName,
        },
        updatedAt: updatedApplication.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating application status:", error);

    if (error.code === "P2025") {
      return Response.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Handle other methods
export async function GET() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}
