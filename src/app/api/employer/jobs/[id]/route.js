// app/api/employer/jobs/[id]/route.js
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function GET(req, { params }) {
  try {
    // Await the params promise
    const { id } = await params;

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "EMPLOYER") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    // Validate job ID
    if (!id || isNaN(parseInt(id))) {
      return Response.json(
        { message: "Valid job ID is required" },
        { status: 400 }
      );
    }

    // Get specific job (only if it belongs to the employer)
    const job = await prisma.job.findFirst({
      where: {
        id: parseInt(id),
        employerId: decoded.userId,
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

    return Response.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    // Await the params promise
    const { id } = await params;

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "EMPLOYER") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    // Validate job ID
    if (!id || isNaN(parseInt(id))) {
      return Response.json(
        { message: "Valid job ID is required" },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      requirements,
      location,
      jobType,
      salaryRange,
      isActive,
    } = await req.json();

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

    // Check if job exists and belongs to employer
    const existingJob = await prisma.job.findFirst({
      where: {
        id: parseInt(id),
        employerId: decoded.userId,
      },
    });

    if (!existingJob) {
      return Response.json({ message: "Job not found" }, { status: 404 });
    }

    // Parse requirements into JSON format
    let requirementsJson = existingJob.requirements; // Keep existing if not provided
    if (requirements !== undefined) {
      if (requirements) {
        const requirementsArray = requirements
          .split("\n")
          .filter((req) => req.trim())
          .map((req) => req.replace(/^[•\-*\s]+/, "").trim())
          .filter((req) => req.length > 0);

        requirementsJson = {
          requirements: requirementsArray,
          rawText: requirements,
        };
      } else {
        requirementsJson = {};
      }
    }

    // Update job - if any significant fields change, require re-approval
    const significantChanges =
      title !== existingJob.title ||
      description !== existingJob.description ||
      JSON.stringify(requirementsJson) !==
        JSON.stringify(existingJob.requirements) ||
      jobType !== existingJob.jobType;

    const updatedJob = await prisma.job.update({
      where: { id: parseInt(id) },
      data: {
        title: title.trim(),
        description: description.trim(),
        requirements: requirementsJson,
        location: location.trim(),
        jobType,
        salaryRange: salaryRange ? salaryRange.trim() : null,
        isActive: isActive !== undefined ? isActive : existingJob.isActive,
        isApproved: significantChanges ? false : existingJob.isApproved, // Re-approval needed for significant changes
        updatedAt: new Date(),
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
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return Response.json({
      message: significantChanges
        ? "Job updated successfully and sent for re-approval"
        : "Job updated successfully",
      job: updatedJob,
      requiresReapproval: significantChanges,
    });
  } catch (error) {
    console.error("Error updating job:", error);

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

export async function DELETE(req, { params }) {
  try {
    // Await the params promise
    const { id } = await params;

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "EMPLOYER") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    // Validate job ID
    if (!id || isNaN(parseInt(id))) {
      return Response.json(
        { message: "Valid job ID is required" },
        { status: 400 }
      );
    }

    // Check if job exists and belongs to employer
    const existingJob = await prisma.job.findFirst({
      where: {
        id: parseInt(id),
        employerId: decoded.userId,
      },
    });

    if (!existingJob) {
      return Response.json({ message: "Job not found" }, { status: 404 });
    }

    // Check if job has applications
    const applicationCount = await prisma.application.count({
      where: {
        jobId: parseInt(id),
      },
    });

    if (applicationCount > 0) {
      return Response.json(
        {
          message: `Cannot delete job with ${applicationCount} application(s). Please deactivate instead.`,
        },
        { status: 400 }
      );
    }

    // Delete job
    await prisma.job.delete({
      where: { id: parseInt(id) },
    });

    return Response.json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
