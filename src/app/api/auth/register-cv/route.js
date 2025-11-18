// app/api/auth/student/register-cv/route.js
import { hashPassword, generateToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { parseCV } from "@/utils/cvParser";

export async function POST(req) {
  try {
    const { email, password, fullName, phone, location, cvText } =
      await req.json();

    // Validate required fields
    if (!email || !password || !cvText) {
      return Response.json(
        {
          message: "Email, password, and CV text are required",
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

    // Parse CV and extract information
    const cvData = await parseCV(Buffer.from(cvText), "text/plain");

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
        },
      });

      // Create student profile from parsed CV data
      const studentProfile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          cvText: cvData.text,
          parsedSkills: cvData.skills,
          parsedEducation: cvData.education.join(", "),
          parsedExperience: cvData.experience,
          skills: cvData.skills,
          institution: cvData.institution,
          degree: cvData.degree,
          fieldOfStudy: cvData.fieldOfStudy,
          experience: cvData.experienceText,
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
        message: "Student profile created successfully from CV",
        token,
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CV registration error:", error);

    if (error.message.includes("Failed to parse CV")) {
      return Response.json(
        {
          message: "Failed to process CV. Please ensure it's a valid format.",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        message: "Failed to create profile from CV",
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
