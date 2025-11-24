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

    // Validate required fields
    if (!title || !description || !location || !jobType) {
      return Response.json(
        { message: "Title, description, location, and job type are required" },
        { status: 400 }
      );
    }

    // Validate job type
    const validJobTypes = [
      "FULL_TIME",
      "PART_TIME",
      "INTERNSHIP",
      "CONTRACT",
      "REMOTE",
    ];
    if (!validJobTypes.includes(jobType)) {
      return Response.json({ message: "Invalid job type" }, { status: 400 });
    }

    // Parse requirements into JSON format
    let requirementsJson = {};
    if (requirements) {
      // Convert requirements text into structured JSON
      const requirementsArray = requirements
        .split("\n")
        .filter((req) => req.trim())
        .map((req) => req.replace(/^[•\-*\s]+/, "").trim())
        .filter((req) => req.length > 0);

      requirementsJson = {
        requirements: requirementsArray,
        rawText: requirements,
      };
    }

    // Create new job
    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        requirements: requirementsJson,
        location: location.trim(),
        jobType,
        salaryRange: salaryRange ? salaryRange.trim() : null,
        employerId: decoded.userId,
        isApproved: false, // Needs admin approval
        isActive: true,
        isPromoted: false,
      },
      include: {
        employer: {
          include: {
            employerProfile: {
              select: {
                companyName: true,
                industry: true,
              },
            },
          },
        },
      },
    });

    return Response.json(
      {
        message: "Job created successfully and sent for approval",
        job: {
          id: job.id,
          title: job.title,
          description: job.description,
          location: job.location,
          jobType: job.jobType,
          salaryRange: job.salaryRange,
          isActive: job.isActive,
          isApproved: job.isApproved,
          isPromoted: job.isPromoted,
          createdAt: job.createdAt,
          employer: {
            id: job.employer.id,
            email: job.employer.email,
            fullName: job.employer.fullName,
            companyName: job.employer.employerProfile?.companyName,
            industry: job.employer.employerProfile?.industry,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating job:", error);

    // Handle Prisma errors
    if (error.code === "P2002") {
      return Response.json(
        { message: "A job with similar details already exists" },
        { status: 400 }
      );
    }

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
