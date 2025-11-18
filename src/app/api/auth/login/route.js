import { generateToken, verifyPassword } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        employerProfile: true,
      },
    });

    if (!user) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = generateToken(user);
    const { passwordHash, ...userWithoutPassword } = user;

    return Response.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { message: "Internal server error during login" },
      { status: 500 }
    );
  }
}
