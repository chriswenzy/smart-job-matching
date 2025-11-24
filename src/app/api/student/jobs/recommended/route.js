// app/api/student/jobs/recommended/route.js
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { calculateStudentJobMatches } from "@/utils/matchingAlgorithm";

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
    const limit = parseInt(searchParams.get("limit") || "10");

    let matches;
    try {
      matches = await calculateStudentJobMatches(decoded.userId);
    } catch (matchingError) {
      console.error("Matching algorithm error:", matchingError);
      // Fallback to recent approved jobs if matching fails
      matches = await getFallbackJobs(decoded.userId, limit);
    }

    // Ensure matches is an array
    if (!Array.isArray(matches)) {
      console.warn("Matching algorithm didn't return an array, using fallback");
      matches = await getFallbackJobs(decoded.userId, limit);
    }

    // Get student's applications to show application status
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

    // Format the response consistently
    const formattedMatches = matches.slice(0, limit).map((match) => {
      // Handle both object format (from matching algorithm) and direct job format (from fallback)
      const job = match.job || match;
      const matchScore = match.matchScore || match.score || 0;
      const isFallback = match.isFallback || false;

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        jobType: job.jobType,
        salaryRange: job.salaryRange,
        isActive: job.isActive,
        isApproved: job.isApproved,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        employer: {
          id: job.employer?.id,
          email: job.employer?.email,
          fullName: job.employer?.fullName,
          companyName:
            job.employer?.employerProfile?.companyName ||
            job.employer?.companyName,
          industry: job.employer?.employerProfile?.industry,
          companySize: job.employer?.employerProfile?.companySize,
        },
        _count: job._count || { applications: 0 },
        matchScore: Math.round(matchScore),
        hasApplied: applicationMap.has(job.id),
        applicationStatus: applicationMap.get(job.id) || null,
        isFallback: isFallback,
      };
    });

    return Response.json({
      jobs: formattedMatches,
      total: formattedMatches.length,
      isFallback: formattedMatches.some((job) => job.isFallback),
      message: formattedMatches.some((job) => job.isFallback)
        ? "Showing recent jobs (personalized recommendations temporarily unavailable)"
        : "Personalized job recommendations based on your profile",
    });
  } catch (error) {
    console.error("Error fetching recommended jobs:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Fallback function to get recent jobs if matching fails
async function getFallbackJobs(studentId, limit = 10) {
  try {
    const recentJobs = await prisma.job.findMany({
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
                industry: true,
                companySize: true,
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
      take: limit,
    });

    // Convert to match format with 0 score
    return recentJobs.map((job) => ({
      job,
      matchScore: 0,
      isFallback: true,
    }));
  } catch (error) {
    console.error("Error fetching fallback jobs:", error);
    return [];
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
