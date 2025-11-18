// app/api/auth/reset-password/route.js
import { hashPassword } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return Response.json(
        {
          message: "Token and new password are required",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        {
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return Response.json(
        {
          message: "Invalid or expired reset token",
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return Response.json(
      {
        message: "Password reset successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json(
      {
        message: "Internal server error",
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
