// app/api/employer/jobs/route.js
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

    // Get employer's jobs
    const jobs = await prisma.job.findMany({
      where: {
        employerId: decoded.userId,
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // const jobs = await prisma.job.findMany({
    //   where: {
    //     isApproved: true,
    //     isActive: true,
    //   },
    //   include: {
    //     employer: {
    //       include: {
    //         employerProfile: {
    //           select: {
    //             companyName: true,
    //             industry: true,
    //           },
    //         },
    //       },
    //     },
    //     _count: {
    //       select: {
    //         applications: true,
    //       },
    //     },
    //   },
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    // });

    return Response.json(jobs);
  } catch (error) {
    console.error("Error in employer jobs API:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

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

    // Create new job
    const { title, description, requirements, location, jobType, salaryRange } =
      await req.json();

    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements: requirements || {},
        location,
        jobType,
        salaryRange,
        employerId: decoded.userId,
        isApproved: false, // Needs admin approval
        isActive: true,
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return Response.json(
      {
        message: "Job created successfully and sent for approval",
        job,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in employer jobs API:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Optional: Export other HTTP methods
export async function PUT() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}
