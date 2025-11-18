// app/api/student/profile/route.js
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

    // Get student profile
    const student = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: true,
      },
    });

    if (!student) {
      return Response.json({ message: "Student not found" }, { status: 404 });
    }

    return Response.json({
      ...student,
      studentProfile: student.studentProfile,
    });
  } catch (error) {
    console.error("Error in student profile API:", error);
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
    if (!decoded || decoded.userType !== "STUDENT") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    // Update student profile
    const {
      fullName,
      phone,
      location,
      bio,
      institution,
      degree,
      fieldOfStudy,
      graduationYear,
      experience,
      skills,
    } = await req.json();

    const updatedStudent = await prisma.$transaction(async (tx) => {
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

      // Update student profile
      const studentProfile = await tx.studentProfile.upsert({
        where: { userId: decoded.userId },
        update: {
          institution,
          degree,
          fieldOfStudy,
          graduationYear: graduationYear ? parseInt(graduationYear) : null,
          experience,
          skills: skills || [],
        },
        create: {
          userId: decoded.userId,
          institution,
          degree,
          fieldOfStudy,
          graduationYear: graduationYear ? parseInt(graduationYear) : null,
          experience,
          skills: skills || [],
        },
      });

      return { user, studentProfile };
    });

    return Response.json({
      message: "Profile updated successfully",
      profile: updatedStudent,
    });
  } catch (error) {
    console.error("Error in student profile API:", error);
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
