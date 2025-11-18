// app/api/student/jobs/route.js
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "STUDENT") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const jobType = searchParams.get("jobType");
    const location = searchParams.get("location");
    const minSalary = searchParams.get("minSalary");
    const maxSalary = searchParams.get("maxSalary");
    const industry = searchParams.get("industry");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause - only show approved and active jobs
    const where = {
      isApproved: true,
      isActive: true,
    };

    // Add search functionality
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          employer: {
            companyName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          requirements: {
            path: "$.**", // Search in JSON requirements field
            string_contains: search,
          },
        },
      ];
    }

    // Add filters
    if (jobType) {
      where.jobType = jobType;
    }

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    if (industry) {
      where.employer = {
        employerProfile: {
          industry: {
            contains: industry,
            mode: "insensitive",
          },
        },
      };
    }

    // Salary range filtering
    if (minSalary || maxSalary) {
      where.AND = where.AND || [];

      if (minSalary) {
        where.AND.push({
          OR: [
            {
              salaryRange: {
                gte: minSalary,
              },
            },
            {
              salaryRange: null, // Include jobs without salary specified
            },
          ],
        });
      }

      if (maxSalary) {
        where.AND.push({
          OR: [
            {
              salaryRange: {
                lte: maxSalary,
              },
            },
            {
              salaryRange: null, // Include jobs without salary specified
            },
          ],
        });
      }
    }

    // Get student's existing applications to show application status
    const existingApplications = await prisma.application.findMany({
      where: {
        studentId: decoded.userId,
      },
      select: {
        jobId: true,
        status: true,
      },
    });

    const applicationMap = new Map(
      existingApplications.map((app) => [app.jobId, app.status])
    );

    const [jobs, total, filterOptions] = await Promise.all([
      // Get jobs with pagination
      prisma.job.findMany({
        where,
        include: {
          employer: {
            select: {
              companyName: true,
              email: true,
              location: true,
              employerProfile: {
                select: {
                  industry: true,
                  companySize: true,
                  website: true,
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
        skip,
        take: limit,
      }),

      // Get total count for pagination
      prisma.job.count({ where }),

      // Get filter options for frontend
      Promise.all([
        prisma.job.findMany({
          where: {
            isApproved: true,
            isActive: true,
          },
          distinct: ["jobType"],
          select: {
            jobType: true,
          },
        }),
        prisma.job.findMany({
          where: {
            isApproved: true,
            isActive: true,
            location: {
              not: null,
            },
          },
          distinct: ["location"],
          select: {
            location: true,
          },
          take: 50,
        }),
        prisma.employerProfile.findMany({
          where: {
            industry: {
              not: null,
            },
          },
          distinct: ["industry"],
          select: {
            industry: true,
          },
          take: 50,
        }),
      ]),
    ]);

    // Add application status to each job
    const jobsWithApplicationStatus = jobs.map((job) => ({
      ...job,
      hasApplied: applicationMap.has(job.id),
      applicationStatus: applicationMap.get(job.id) || null,
    }));

    return Response.json({
      jobs: jobsWithApplicationStatus,
      filters: {
        jobTypes: filterOptions[0].map((j) => j.jobType).filter(Boolean),
        locations: filterOptions[1].map((l) => l.location).filter(Boolean),
        industries: filterOptions[2].map((i) => i.industry).filter(Boolean),
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching student jobs:", error);
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
