// app/api/jobs/[id]/route.js
import { prisma } from "@/lib/prisma/prisma";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    // Validate job ID
    if (!id || isNaN(parseInt(id))) {
      return Response.json(
        { message: "Valid job ID is required" },
        { status: 400 }
      );
    }

    // const job = await prisma.job.findUnique({
    //   where: {
    //     id: parseInt(id),
    //   },
    //   include: {
    //     employer: {
    //       select: {
    //         companyName: true,
    //         email: true,
    //         employerProfile: true,
    //       },
    //     },
    //     _count: {
    //       select: {
    //         applications: true,
    //       },
    //     },
    //   },
    // });

    const job = await prisma.job.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        employer: {
          include: {
            employerProfile: {
              select: {
                companyName: true,
                industry: true,
                companySize: true,
                website: true,
                bio: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      return Response.json({ message: "Job not found" }, { status: 404 });
    }

    if (!job.isApproved || !job.isActive) {
      return Response.json({ message: "Job not available" }, { status: 404 });
    }

    return Response.json(job);
  } catch (error) {
    console.error("Error fetching job details:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Optional: Export other HTTP methods
export async function POST() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return Response.json({ message: "Method not allowed" }, { status: 405 });
}
