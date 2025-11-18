// app/api/employer/profile/route.js
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

    // Get employer profile
    const employer = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        employerProfile: true,
      },
    });

    if (!employer) {
      return Response.json({ message: "Employer not found" }, { status: 404 });
    }

    return Response.json({
      ...employer,
      employerProfile: employer.employerProfile,
    });
  } catch (error) {
    console.error("Error in employer profile API:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "EMPLOYER") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    // Update employer profile
    const {
      fullName,
      phone,
      location,
      bio,
      companyName,
      industry,
      companySize,
      website,
    } = await req.json();

    const updatedEmployer = await prisma.$transaction(async (tx) => {
      // Update user
      const user = await tx.user.update({
        where: { id: decoded.userId },
        data: {
          fullName,
          phone,
          location,
          bio,
        },
      });

      // Update employer profile
      const employerProfile = await tx.employerProfile.upsert({
        where: { userId: decoded.userId },
        update: {
          companyName,
          industry,
          companySize,
          website,
        },
        create: {
          userId: decoded.userId,
          companyName,
          industry,
          companySize,
          website,
        },
      });

      return { user, employerProfile };
    });

    return Response.json({
      message: "Profile updated successfully",
      profile: updatedEmployer,
    });
  } catch (error) {
    console.error("Error in employer profile API:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Optional: Export other HTTP methods
export async function POST() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}
