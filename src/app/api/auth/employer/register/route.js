import { generateToken, hashPassword } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function POST(req) {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      location,
      companyName,
      industry,
      companySize,
      website,
    } = await req.json();

    // Validate required fields
    if (!email || !password || !fullName || !companyName) {
      return new Response(
        JSON.stringify({
          message: "Email, password, full name, and company name are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({
          message: "User already exists with this email",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
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
          userType: "EMPLOYER",
          fullName,
          phone,
          location,
        },
      });

      // Create employer profile
      const employerProfile = await tx.employerProfile.create({
        data: {
          userId: user.id,
          companyName,
          industry,
          companySize,
          website,
        },
      });

      return { user, employerProfile };
    });

    // Generate token
    const token = generateToken(result.user);

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = result.user;

    return new Response(
      JSON.stringify({
        message: "Employer account created successfully",
        token,
        user: userWithoutPassword,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Employer registration error:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to create employer account",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Optional: Export other HTTP methods if needed
export async function GET() {
  return new Response(JSON.stringify({ message: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT() {
  return new Response(JSON.stringify({ message: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE() {
  return new Response(JSON.stringify({ message: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
