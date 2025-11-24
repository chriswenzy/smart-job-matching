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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const jobType = searchParams.get("jobType") || "";
    const location = searchParams.get("location") || "";
    const industry = searchParams.get("industry") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Build base where clause - only approved and active jobs
    const where = {
      isApproved: true,
      isActive: true,
    };

    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          employer: {
            employerProfile: {
              companyName: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    // Add job type filter
    if (jobType) {
      where.jobType = jobType;
    }

    // Add location filter
    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    // Add industry filter
    if (industry) {
      where.employer = {
        employerProfile: {
          industry: { contains: industry, mode: "insensitive" },
        },
      };
    }

    // Get student's applications to show application status
    const applications = await prisma.application.findMany({
      where: { studentId: decoded.userId },
      select: { jobId: true, status: true },
    });

    const applicationMap = new Map(
      applications.map((app) => [app.jobId, app.status])
    );

    // Get jobs with pagination
    const jobs = await prisma.job.findMany({
      where,
      include: {
        employer: {
          include: {
            employerProfile: {
              select: {
                companyName: true,
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
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.job.count({ where });

    // Get available filter options
    const [jobTypes, locations, industries] = await Promise.all([
      // Job types
      prisma.job.findMany({
        where: { isApproved: true, isActive: true },
        distinct: ["jobType"],
        select: { jobType: true },
      }),
      // Locations
      prisma.job.findMany({
        where: {
          isApproved: true,
          isActive: true,
          location: { not: null },
        },
        distinct: ["location"],
        select: { location: true },
        take: 20,
      }),
      // Industries
      prisma.employerProfile.findMany({
        where: { industry: { not: null } },
        distinct: ["industry"],
        select: { industry: true },
        take: 20,
      }),
    ]);

    // Format jobs with application status
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      jobType: job.jobType,
      salaryRange: job.salaryRange,
      requirements: job.requirements,
      isActive: job.isActive,
      isApproved: job.isApproved,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      employer: {
        id: job.employer.id,
        email: job.employer.email,
        fullName: job.employer.fullName,
        companyName: job.employer.employerProfile?.companyName,
        industry: job.employer.employerProfile?.industry,
        companySize: job.employer.employerProfile?.companySize,
        website: job.employer.employerProfile?.website,
      },
      _count: {
        applications: job._count.applications,
      },
      hasApplied: applicationMap.has(job.id),
      applicationStatus: applicationMap.get(job.id),
    }));

    return Response.json({
      jobs: formattedJobs,
      filters: {
        jobTypes: jobTypes.map((j) => j.jobType).filter(Boolean),
        locations: locations.map((l) => l.location).filter(Boolean),
        industries: industries.map((i) => i.industry).filter(Boolean),
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
