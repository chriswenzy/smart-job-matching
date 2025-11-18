// app/api/auth/student/register-form/route.js
import { hashPassword, generateToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function POST(req) {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      location,
      institution,
      degree,
      fieldOfStudy,
      graduationYear,
      experience,
      bio,
      skills,
    } = await req.json();

    // Validate required fields
    if (!email || !password || !fullName) {
      return Response.json(
        {
          message: "Email, password, and full name are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return Response.json(
        {
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        {
          message: "User already exists with this email",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          userType: "STUDENT",
          fullName,
          phone,
          location,
          bio,
        },
      });

      // Create student profile from form data
      const studentProfile = await tx.studentProfile.create({
        data: {
          userId: user.id,
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

    // Generate token
    const token = generateToken(result.user);

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = result.user;

    return Response.json(
      {
        message: "Student profile created successfully",
        token,
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Form registration error:", error);
    return Response.json(
      {
        message: "Failed to create profile",
      },
      { status: 500 }
    );
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
