// app/api/auth/register/route.js
import { hashPassword, generateToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function POST(req) {
  try {
    const { email, password, userType, fullName, phone, location } =
      await req.json();

    // Validate required fields
    if (!email || !password || !userType) {
      return Response.json(
        {
          message: "Email, password, and user type are required",
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

    // Validate user type
    if (!["STUDENT", "EMPLOYER", "ADMIN"].includes(userType)) {
      return Response.json({ message: "Invalid user type" }, { status: 400 });
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

    // Create user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          userType,
          fullName,
          phone,
          location,
        },
      });

      // Create profile based on user type
      if (userType === "STUDENT") {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
          },
        });
      } else if (userType === "EMPLOYER") {
        await tx.employerProfile.create({
          data: {
            userId: user.id,
          },
        });
      }

      return user;
    });

    // Generate token
    const token = generateToken(result);

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = result;

    return Response.json(
      {
        message: "User registered successfully",
        token,
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      {
        message: "Internal server error during registration",
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
