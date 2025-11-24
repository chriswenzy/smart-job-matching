import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    // const token = req.headers.get("authorization")?.replace("Bearer ", "");
    // if (!token) {
    //   return Response.json({ message: "No token provided" }, { status: 401 });
    // }

    // const decoded = verifyToken(token);
    // if (!decoded || decoded.userType !== "STUDENT") {
    //   return Response.json({ message: "Access denied" }, { status: 403 });
    // }

    const formData = await req.formData();
    const cvFile = formData.get("cv");

    if (!cvFile) {
      return Response.json({ message: "CV file is required" }, { status: 400 });
    }

    // Validate file type - accept both PDF and text files
    const allowedTypes = ["application/pdf", "text/plain"];
    if (!allowedTypes.includes(cvFile.type)) {
      return Response.json(
        { message: "Only PDF and text files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (cvFile.size > 5 * 1024 * 1024) {
      return Response.json(
        { message: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Check if student profile exists
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: decoded.userId },
    });

    if (!studentProfile) {
      return Response.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "cv");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const fileExtension = path.extname(cvFile.name) || ".pdf";
    const fileName = `cv_${decoded.userId}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await cvFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    let extractedText = "";
    let parsedSkills = [];
    let parsedEducation = "";
    let parsedExperience = "";

    // Simple text extraction based on file type
    if (cvFile.type === "text/plain") {
      // For text files, just use the buffer as text
      extractedText = buffer.toString("utf-8");
    } else if (cvFile.type === "application/pdf") {
      // For PDF files, use a simple text extraction approach
      // This is a basic approach - for better PDF parsing, consider a cloud service
      try {
        // Simple regex to extract text from PDF (basic approach)
        const text = buffer.toString("utf-8");
        // Extract text between text markers (basic PDF text extraction)
        const textMatches = text.match(/\(([^)]+)\)/g);
        if (textMatches) {
          extractedText = textMatches
            .map(
              (match) => match.slice(1, -1) // Remove parentheses
            )
            .join(" ");
        } else {
          extractedText = "PDF content extracted (basic parsing)";
        }
      } catch (error) {
        console.error("Basic PDF parsing failed:", error);
        extractedText = "Unable to extract text from PDF";
      }
    }

    // Basic text parsing
    if (extractedText) {
      parsedSkills = extractSkillsFromText(extractedText);
      parsedEducation = extractEducationFromText(extractedText);
      parsedExperience = extractExperienceFromText(extractedText);
    }

    // Update student profile with CV info
    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: decoded.userId },
      data: {
        resumeUrl: `/uploads/cv/${fileName}`,
        cvText: extractedText,
        parsedSkills: parsedSkills,
        parsedEducation: parsedEducation,
        parsedExperience: parsedExperience,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return Response.json({
      message: "CV registered successfully",
      profile: {
        id: updatedProfile.id,
        resumeUrl: updatedProfile.resumeUrl,
        parsedSkills: updatedProfile.parsedSkills,
        parsedEducation: updatedProfile.parsedEducation,
        parsedExperience: updatedProfile.parsedExperience,
        user: updatedProfile.user,
      },
    });
  } catch (error) {
    console.error("Error registering CV:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Helper function to extract skills from text
function extractSkillsFromText(text) {
  const commonSkills = [
    "javascript",
    "python",
    "java",
    "react",
    "node.js",
    "html",
    "css",
    "sql",
    "mongodb",
    "express",
    "typescript",
    "aws",
    "docker",
    "kubernetes",
    "git",
    "rest api",
    "graphql",
    "machine learning",
    "data analysis",
    "project management",
    "communication",
    "teamwork",
    "problem solving",
    "leadership",
    "next.js",
    "vue",
    "angular",
    "php",
    "c++",
    "c#",
    "ruby",
    "swift",
    "kotlin",
    "go",
    "rust",
    "mysql",
    "postgresql",
    "redis",
    "firebase",
    "azure",
    "google cloud",
    "linux",
    "windows",
    "macos",
  ];

  const foundSkills = commonSkills.filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase())
  );

  return foundSkills.slice(0, 20); // Limit to 20 skills
}

// Helper function to extract education information
function extractEducationFromText(text) {
  const educationKeywords = [
    "university",
    "college",
    "institute",
    "bachelor",
    "master",
    "phd",
    "degree",
    "graduat",
  ];
  const lines = text.split("\n");

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (educationKeywords.some((keyword) => lowerLine.includes(keyword))) {
      return line.trim().substring(0, 200);
    }
  }

  return "Education information not found";
}

// Helper function to extract experience information
function extractExperienceFromText(text) {
  const experienceKeywords = [
    "experience",
    "worked",
    "employed",
    "job",
    "position",
    "role",
    "company",
  ];
  const lines = text.split("\n");

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (experienceKeywords.some((keyword) => lowerLine.includes(keyword))) {
      return line.trim().substring(0, 200);
    }
  }

  return "Experience information not found";
}

// GET method to retrieve current CV info
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

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: decoded.userId },
      select: {
        resumeUrl: true,
        parsedSkills: true,
        parsedEducation: true,
        parsedExperience: true,
        updatedAt: true,
      },
    });

    if (!studentProfile) {
      return Response.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    return Response.json({
      cv: studentProfile,
    });
  } catch (error) {
    console.error("Error fetching CV info:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
