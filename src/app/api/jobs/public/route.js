// app/api/jobs/route.js
import { prisma } from "@/lib/prisma/prisma";

export async function GET(req) {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        isApproved: true,
        isActive: true,
      },
      include: {
        employer: {
          include: {
            employerProfile: {
              select: {
                companyName: true,
                // industry: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(jobs);
  } catch (error) {
    console.error("Error fetching public jobs:", error);
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
