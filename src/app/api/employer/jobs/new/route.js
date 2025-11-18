// app/api/employer/jobs/new/route.js
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

    const { title, description, requirements, location, jobType, salaryRange } =
      await req.json();

    if (!title || !description || !location) {
      return Response.json(
        { message: "Title, description, and location are required" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements: requirements || {},
        location,
        jobType: jobType || "FULL_TIME",
        salaryRange,
        employerId: decoded.userId,
        isApproved: false, // Needs admin approval
        isActive: true,
      },
    });

    return Response.json(
      {
        message: "Job posted successfully and sent for admin approval",
        job,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating job:", error);
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
